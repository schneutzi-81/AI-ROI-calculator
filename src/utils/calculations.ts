import type {
  AIModel,
  CompanyAssumptions,
  UseCase,
  MCPServer,
  UseCaseResults,
  OverallResults,
  YearCashFlow,
} from '../types';

// ─── Per-Use-Case Calculation ─────────────────────────────────────────────────

export function calculateUseCaseROI(
  useCase: UseCase,
  company: CompanyAssumptions,
  models: AIModel[],
  mcpServers: MCPServer[],
  horizonYears: number = 3,
): UseCaseResults {
  const a = useCase.assumptions;
  const model = models.find((m) => m.id === a.modelId) ?? models[0];

  const workingDaysPerYear = 250;
  const annualInteractions =
    a.numberOfUsers * a.usageFrequencyPerUserPerDay * workingDaysPerYear;

  // ── Benefits ──
  const hourlyLaborCost =
    (company.averageAnnualSalary * company.overheadMultiplier) /
    company.workingHoursPerYear;

  // Time saved by users (who still interact but faster)
  const annualTimeSavingsHours =
    (annualInteractions * a.minutesSavedPerInteraction) / 60;
  const annualTimeSavingsUSD = annualTimeSavingsHours * hourlyLaborCost;

  // Automation savings: tasks fully handled by AI (no human needed)
  const hoursPerInteractionWithoutAI =
    a.minutesSavedPerInteraction > 0 ? a.minutesSavedPerInteraction / 60 : 0;
  const annualAutomationSavingsUSD =
    annualInteractions *
    a.automationRate *
    hoursPerInteractionWithoutAI *
    hourlyLaborCost;

  const totalAnnualBenefitUSD =
    annualTimeSavingsUSD + annualAutomationSavingsUSD;

  // ── AI Costs ──
  const inputCost =
    ((a.avgInputTokensPerInteraction * annualInteractions) / 1000) *
    (model?.inputCostPer1kTokens ?? 0);
  const outputCost =
    ((a.avgOutputTokensPerInteraction * annualInteractions) / 1000) *
    (model?.outputCostPer1kTokens ?? 0);
  const annualAICostUSD = inputCost + outputCost;

  // ── MCP Costs ──
  const associatedMCP = mcpServers.filter(
    (s) => s.enabled && s.associatedUseCaseIds.includes(useCase.id),
  );
  const annualMCPCostUSD = associatedMCP.reduce(
    (sum, s) => sum + s.estimatedMonthlyCallVolume * s.costPerCallUSD * 12,
    0,
  );

  const totalAnnualCostUSD =
    annualAICostUSD + annualMCPCostUSD + a.annualMaintenanceCost;

  const netAnnualBenefitUSD = totalAnnualBenefitUSD - totalAnnualCostUSD;
  const implementationCostUSD = a.implementationCostOneTime;

  const roiPercentage =
    implementationCostUSD > 0
      ? ((netAnnualBenefitUSD - implementationCostUSD) /
          implementationCostUSD) *
        100
      : netAnnualBenefitUSD > 0
        ? Infinity
        : 0;

  const paybackPeriodMonths =
    netAnnualBenefitUSD > 0
      ? (implementationCostUSD / netAnnualBenefitUSD) * 12
      : Infinity;

  // ── Cash Flows ──
  const cashFlows: YearCashFlow[] = [];
  let cumulative = -implementationCostUSD;

  for (let year = 1; year <= Math.max(horizonYears, 5); year++) {
    // Ramp-up in implementation year
    const rampFactor =
      year === 1 && a.implementationMonths > 0
        ? 1 - a.implementationMonths / 12
        : 1;
    const benefit = totalAnnualBenefitUSD * rampFactor;
    const cost =
      year === 1
        ? implementationCostUSD + totalAnnualCostUSD * rampFactor
        : totalAnnualCostUSD;
    const net = benefit - cost;
    cumulative += net + (year === 1 ? implementationCostUSD : 0); // net after implementation was already deducted
    cashFlows.push({ year, benefit, cost, net, cumulativeNet: cumulative });
  }

  const npv = (years: number, rate: number) => {
    let n = -implementationCostUSD;
    for (let y = 1; y <= years; y++) {
      const cf = cashFlows[y - 1];
      if (cf) n += cf.net / Math.pow(1 + rate, y);
    }
    return n;
  };

  const breakEvenYear =
    cashFlows.findIndex((cf) => cf.cumulativeNet >= 0) + 1;

  return {
    useCaseId: useCase.id,
    useCaseName: useCase.name,
    annualTimeSavingsHours,
    annualTimeSavingsUSD,
    annualAutomationSavingsUSD,
    totalAnnualBenefitUSD,
    annualAICostUSD,
    annualMCPCostUSD,
    annualMaintenanceCostUSD: a.annualMaintenanceCost,
    totalAnnualCostUSD,
    implementationCostUSD,
    netAnnualBenefitUSD,
    roiPercentage,
    paybackPeriodMonths,
    npv3Year: npv(3, company.discountRate),
    npv5Year: npv(5, company.discountRate),
    breakEvenYear: breakEvenYear === 0 ? -1 : breakEvenYear,
    cashFlows,
  };
}

// ─── Overall Calculation ──────────────────────────────────────────────────────

export function calculateOverallROI(
  company: CompanyAssumptions,
  models: AIModel[],
  useCases: UseCase[],
  mcpServers: MCPServer[],
): OverallResults {
  const activeUseCases = useCases.filter((uc) => uc.enabled);
  const useCaseResults = activeUseCases.map((uc) =>
    calculateUseCaseROI(uc, company, models, mcpServers, company.planningHorizonYears),
  );

  const totalImplementationCost = useCaseResults.reduce(
    (s, r) => s + r.implementationCostUSD,
    0,
  );
  const totalAnnualBenefit = useCaseResults.reduce(
    (s, r) => s + r.totalAnnualBenefitUSD,
    0,
  );
  const totalAnnualCost = useCaseResults.reduce(
    (s, r) => s + r.totalAnnualCostUSD,
    0,
  );
  const totalNetAnnualBenefit = totalAnnualBenefit - totalAnnualCost;

  const overallROIPercentage =
    totalImplementationCost > 0
      ? ((totalNetAnnualBenefit - totalImplementationCost) /
          totalImplementationCost) *
        100
      : 0;

  const overallPaybackMonths =
    totalNetAnnualBenefit > 0
      ? (totalImplementationCost / totalNetAnnualBenefit) * 12
      : Infinity;

  // Aggregate cash flows
  const maxYears = 5;
  const cashFlows: YearCashFlow[] = [];
  let cumulative = -totalImplementationCost;
  for (let year = 1; year <= maxYears; year++) {
    const benefit = useCaseResults.reduce(
      (s, r) => s + (r.cashFlows[year - 1]?.benefit ?? 0),
      0,
    );
    const cost = useCaseResults.reduce(
      (s, r) => s + (r.cashFlows[year - 1]?.cost ?? 0),
      0,
    );
    const net = benefit - cost;
    cumulative += net + (year === 1 ? totalImplementationCost : 0);
    cashFlows.push({ year, benefit, cost, net, cumulativeNet: cumulative });
  }

  const npvCalc = (years: number) => {
    let n = -totalImplementationCost;
    for (let y = 1; y <= years; y++) {
      const cf = cashFlows[y - 1];
      if (cf) n += cf.net / Math.pow(1 + company.discountRate, y);
    }
    return n;
  };

  return {
    totalImplementationCost,
    totalAnnualBenefit,
    totalAnnualCost,
    totalNetAnnualBenefit,
    overallROIPercentage,
    overallPaybackMonths,
    overall3YearNPV: npvCalc(3),
    overall5YearNPV: npvCalc(5),
    useCaseResults,
    cashFlows,
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  compact: boolean = false,
): string {
  if (!isFinite(value)) return '∞';
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(value);
  }
  if (compact && Math.abs(value) >= 1_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  if (!isFinite(value)) return '∞%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatMonths(months: number): string {
  if (!isFinite(months)) return 'Never';
  if (months <= 0) return 'Immediate';
  if (months < 12) return `${months.toFixed(1)} mo`;
  return `${(months / 12).toFixed(1)} yr`;
}
