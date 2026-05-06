import { FileDown } from 'lucide-react';
import { Card } from './ui';
import {
  formatCurrency,
  formatPercent,
  formatMonths,
} from '../utils/calculations';
import type {
  OverallResults,
  CompanyAssumptions,
  AIModel,
  MCPServer,
} from '../types';

interface Props {
  results: OverallResults;
  company: CompanyAssumptions;
  models: AIModel[];
  mcpServers: MCPServer[];
}

export function Report({ results, company, models, mcpServers }: Props) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => window.print();

  const cur = (v: number, compact = false) =>
    formatCurrency(v, company.currency, compact);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Executive Report</h1>
        <p className="page-desc">
          Printable summary of your AI ROI analysis for {company.companyName}.
        </p>
        <button className="btn btn-primary" onClick={handlePrint}>
          <FileDown size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="report-body" id="printable-report">
        {/* Cover */}
        <Card className="report-cover">
          <div className="report-cover-content">
            <div className="report-logo">✦</div>
            <h1 className="report-main-title">AI ROI Business Case</h1>
            <h2 className="report-company">{company.companyName}</h2>
            <p className="report-date">Prepared {today}</p>
            <div className="report-highlight">
              <div className="highlight-item">
                <span className="highlight-label">3-Year NPV</span>
                <span
                  className={`highlight-value ${results.overall3YearNPV >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {cur(results.overall3YearNPV, true)}
                </span>
              </div>
              <div className="highlight-item">
                <span className="highlight-label">Overall ROI</span>
                <span
                  className={`highlight-value ${results.overallROIPercentage >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {formatPercent(results.overallROIPercentage)}
                </span>
              </div>
              <div className="highlight-item">
                <span className="highlight-label">Payback Period</span>
                <span className="highlight-value">
                  {formatMonths(results.overallPaybackMonths)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        <Card title="Executive Summary">
          <table className="report-table">
            <tbody>
              <tr>
                <td>Total Implementation Investment</td>
                <td className="text-right">
                  {cur(results.totalImplementationCost)}
                </td>
              </tr>
              <tr>
                <td>Total Annual Benefit</td>
                <td className="text-right text-green">
                  {cur(results.totalAnnualBenefit)}
                </td>
              </tr>
              <tr>
                <td>Total Annual Ongoing Cost</td>
                <td className="text-right text-red">
                  {cur(results.totalAnnualCost)}
                </td>
              </tr>
              <tr className="row-bold">
                <td>Net Annual Benefit</td>
                <td
                  className={`text-right ${results.totalNetAnnualBenefit >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {cur(results.totalNetAnnualBenefit)}
                </td>
              </tr>
              <tr>
                <td>Overall ROI</td>
                <td
                  className={`text-right ${results.overallROIPercentage >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {formatPercent(results.overallROIPercentage)}
                </td>
              </tr>
              <tr>
                <td>Payback Period</td>
                <td className="text-right">
                  {formatMonths(results.overallPaybackMonths)}
                </td>
              </tr>
              <tr>
                <td>3-Year NPV ({(company.discountRate * 100).toFixed(0)}% discount)</td>
                <td
                  className={`text-right ${results.overall3YearNPV >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {cur(results.overall3YearNPV)}
                </td>
              </tr>
              <tr>
                <td>5-Year NPV ({(company.discountRate * 100).toFixed(0)}% discount)</td>
                <td
                  className={`text-right ${results.overall5YearNPV >= 0 ? 'text-green' : 'text-red'}`}
                >
                  {cur(results.overall5YearNPV)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Assumptions */}
        <Card title="Company Assumptions">
          <table className="report-table">
            <tbody>
              <tr>
                <td>Average Annual Salary</td>
                <td className="text-right">
                  {cur(company.averageAnnualSalary)}
                </td>
              </tr>
              <tr>
                <td>Working Hours / Year</td>
                <td className="text-right">
                  {company.workingHoursPerYear} hrs
                </td>
              </tr>
              <tr>
                <td>Overhead Multiplier</td>
                <td className="text-right">{company.overheadMultiplier}×</td>
              </tr>
              <tr>
                <td>Effective Hourly Rate</td>
                <td className="text-right">
                  {cur(
                    (company.averageAnnualSalary *
                      company.overheadMultiplier) /
                      company.workingHoursPerYear,
                  )}
                  /hr
                </td>
              </tr>
              <tr>
                <td>Discount Rate</td>
                <td className="text-right">
                  {(company.discountRate * 100).toFixed(0)}%
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Per-use-case results */}
        {results.useCaseResults.map((r) => (
          <Card key={r.useCaseId} title={r.useCaseName}>
            <div className="uc-report-grid">
              <table className="report-table">
                <thead>
                  <tr>
                    <th colSpan={2}>Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Time savings (hours/year)</td>
                    <td className="text-right">
                      {r.annualTimeSavingsHours.toFixed(0)} hrs
                    </td>
                  </tr>
                  <tr>
                    <td>Time savings (value)</td>
                    <td className="text-right text-green">
                      {cur(r.annualTimeSavingsUSD)}
                    </td>
                  </tr>
                  <tr>
                    <td>Automation savings</td>
                    <td className="text-right text-green">
                      {cur(r.annualAutomationSavingsUSD)}
                    </td>
                  </tr>
                  <tr className="row-bold">
                    <td>Total Annual Benefit</td>
                    <td className="text-right text-green">
                      {cur(r.totalAnnualBenefitUSD)}
                    </td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th colSpan={2}>Costs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Implementation (one-time)</td>
                    <td className="text-right text-red">
                      {cur(r.implementationCostUSD)}
                    </td>
                  </tr>
                  <tr>
                    <td>Annual AI token cost</td>
                    <td className="text-right text-red">
                      {cur(r.annualAICostUSD)}
                    </td>
                  </tr>
                  <tr>
                    <td>Annual MCP cost</td>
                    <td className="text-right text-red">
                      {cur(r.annualMCPCostUSD)}
                    </td>
                  </tr>
                  <tr>
                    <td>Annual maintenance cost</td>
                    <td className="text-right text-red">
                      {cur(r.annualMaintenanceCostUSD)}
                    </td>
                  </tr>
                  <tr className="row-bold">
                    <td>Total Annual Cost</td>
                    <td className="text-right text-red">
                      {cur(r.totalAnnualCostUSD)}
                    </td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th colSpan={2}>ROI Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Net Annual Benefit</td>
                    <td
                      className={`text-right ${r.netAnnualBenefitUSD >= 0 ? 'text-green' : 'text-red'}`}
                    >
                      {cur(r.netAnnualBenefitUSD)}
                    </td>
                  </tr>
                  <tr>
                    <td>ROI</td>
                    <td
                      className={`text-right ${r.roiPercentage >= 0 ? 'text-green' : 'text-red'}`}
                    >
                      {formatPercent(r.roiPercentage)}
                    </td>
                  </tr>
                  <tr>
                    <td>Payback Period</td>
                    <td className="text-right">
                      {formatMonths(r.paybackPeriodMonths)}
                    </td>
                  </tr>
                  <tr>
                    <td>3-Year NPV</td>
                    <td
                      className={`text-right ${r.npv3Year >= 0 ? 'text-green' : 'text-red'}`}
                    >
                      {cur(r.npv3Year)}
                    </td>
                  </tr>
                  <tr>
                    <td>5-Year NPV</td>
                    <td
                      className={`text-right ${r.npv5Year >= 0 ? 'text-green' : 'text-red'}`}
                    >
                      {cur(r.npv5Year)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Benefit</th>
                    <th>Cost</th>
                    <th>Net</th>
                    <th>Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {r.cashFlows.slice(0, 5).map((cf) => (
                    <tr key={cf.year}>
                      <td>Y{cf.year}</td>
                      <td className="text-green">{cur(cf.benefit, true)}</td>
                      <td className="text-red">{cur(cf.cost, true)}</td>
                      <td
                        className={cf.net >= 0 ? 'text-green' : 'text-red'}
                      >
                        {cur(cf.net, true)}
                      </td>
                      <td
                        className={
                          cf.cumulativeNet >= 0 ? 'text-green' : 'text-red'
                        }
                      >
                        {cur(cf.cumulativeNet, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

        {/* AI Model & MCP summary */}
        <Card title="AI Models Used">
          <table className="report-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Input $/1k tokens</th>
                <th>Output $/1k tokens</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.provider}</td>
                  <td>${m.inputCostPer1kTokens}</td>
                  <td>${m.outputCostPer1kTokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {mcpServers.length > 0 && (
          <Card title="MCP Server Connections">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Annual Cost</th>
                </tr>
              </thead>
              <tbody>
                {mcpServers.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.type}</td>
                    <td>{s.enabled ? '✅ Active' : '⭕ Inactive'}</td>
                    <td>
                      {cur(
                        s.estimatedMonthlyCallVolume * s.costPerCallUSD * 12,
                        true,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <div className="report-disclaimer">
          <strong>Disclaimer:</strong> All figures are estimates based on the
          assumptions provided. Actual savings and costs may vary. AI token
          prices are based on Azure OpenAI public pricing as of May 2025 and
          are subject to change. This report is not financial advice.
        </div>
      </div>
    </div>
  );
}
