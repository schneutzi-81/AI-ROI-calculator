// ─── Company Assumptions ──────────────────────────────────────────────────────

export interface CompanyAssumptions {
  companyName: string;
  currency: string;
  averageAnnualSalary: number; // USD
  workingHoursPerYear: number;
  overheadMultiplier: number; // e.g., 1.3 = 30% overhead on top of salary
  discountRate: number; // for NPV calculation, e.g., 0.10 = 10%
  planningHorizonYears: number; // 1-5 years
}

// ─── AI Model ─────────────────────────────────────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  inputCostPer1kTokens: number; // USD per 1000 input tokens
  outputCostPer1kTokens: number; // USD per 1000 output tokens
  contextWindowTokens: number;
  description: string;
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

export type UseCaseCategory =
  | 'Customer Service'
  | 'Document Processing'
  | 'Code Assistance'
  | 'HR & Employee Support'
  | 'Sales & Marketing'
  | 'Data Analysis'
  | 'Content Creation'
  | 'Process Automation'
  | 'Other';

export interface UseCaseAssumptions {
  // Who uses it
  numberOfUsers: number;
  usageFrequencyPerUserPerDay: number; // interactions per user per day

  // Time savings
  minutesSavedPerInteraction: number; // how many minutes saved per AI interaction
  automationRate: number; // 0-1, portion of tasks fully automated (no human needed)

  // AI usage per interaction
  avgInputTokensPerInteraction: number;
  avgOutputTokensPerInteraction: number;
  modelId: string;

  // Implementation
  implementationCostOneTime: number; // USD, one-time
  annualMaintenanceCost: number; // USD/year
  implementationMonths: number; // how many months to implement
}

export interface UseCase {
  id: string;
  name: string;
  category: UseCaseCategory;
  description: string;
  assumptions: UseCaseAssumptions;
  enabled: boolean;
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

export type MCPServerType =
  | 'database'
  | 'erp'
  | 'crm'
  | 'document-store'
  | 'api'
  | 'custom';

export interface MCPServer {
  id: string;
  name: string;
  type: MCPServerType;
  description: string;
  endpoint: string;
  authType: 'none' | 'api-key' | 'oauth2' | 'basic';
  enabled: boolean;
  estimatedMonthlyCallVolume: number;
  costPerCallUSD: number;
  associatedUseCaseIds: string[];
}

// ─── Calculated Results ───────────────────────────────────────────────────────

export interface UseCaseResults {
  useCaseId: string;
  useCaseName: string;

  // Benefits
  annualTimeSavingsHours: number;
  annualTimeSavingsUSD: number;
  annualAutomationSavingsUSD: number;
  totalAnnualBenefitUSD: number;

  // Costs
  annualAICostUSD: number;
  annualMCPCostUSD: number;
  annualMaintenanceCostUSD: number;
  totalAnnualCostUSD: number;
  implementationCostUSD: number;

  // ROI Metrics
  netAnnualBenefitUSD: number;
  roiPercentage: number;
  paybackPeriodMonths: number;
  npv3Year: number;
  npv5Year: number;
  breakEvenYear: number;

  // Per-year cash flows
  cashFlows: YearCashFlow[];
}

export interface YearCashFlow {
  year: number;
  benefit: number;
  cost: number;
  net: number;
  cumulativeNet: number;
}

export interface OverallResults {
  totalImplementationCost: number;
  totalAnnualBenefit: number;
  totalAnnualCost: number;
  totalNetAnnualBenefit: number;
  overallROIPercentage: number;
  overallPaybackMonths: number;
  overall3YearNPV: number;
  overall5YearNPV: number;
  useCaseResults: UseCaseResults[];
  cashFlows: YearCashFlow[];
}

// ─── App State ────────────────────────────────────────────────────────────────

export type AppTab =
  | 'dashboard'
  | 'company'
  | 'models'
  | 'usecases'
  | 'mcp'
  | 'report';

export interface AppState {
  activeTab: AppTab;
  companyAssumptions: CompanyAssumptions;
  models: AIModel[];
  useCases: UseCase[];
  mcpServers: MCPServer[];
}
