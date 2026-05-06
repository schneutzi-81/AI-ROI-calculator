import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import { Card, MetricCard } from './ui';
import {
  formatCurrency,
  formatPercent,
  formatMonths,
} from '../utils/calculations';
import type { OverallResults, CompanyAssumptions } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Props {
  results: OverallResults;
  company: CompanyAssumptions;
  onTabChange: (tab: 'usecases' | 'company' | 'models') => void;
}

export function Dashboard({ results, company, onTabChange }: Props) {
  const {
    totalImplementationCost,
    totalAnnualBenefit,
    totalAnnualCost,
    totalNetAnnualBenefit,
    overallROIPercentage,
    overallPaybackMonths,
    overall3YearNPV,
    overall5YearNPV,
    useCaseResults,
    cashFlows,
  } = results;

  const activeUseCases = useCaseResults.filter((r) => r.totalAnnualBenefitUSD > 0 || r.implementationCostUSD > 0);

  // Cash flow chart data
  const cashFlowData = cashFlows.map((cf) => ({
    name: `Y${cf.year}`,
    Benefit: Math.round(cf.benefit),
    Cost: Math.round(cf.cost),
    'Net Benefit': Math.round(cf.net),
    'Cumulative Net': Math.round(cf.cumulativeNet),
  }));

  // Use case comparison bar chart
  const ucCompareData = activeUseCases.map((r) => ({
    name: r.useCaseName.length > 20 ? r.useCaseName.slice(0, 18) + '…' : r.useCaseName,
    'Annual Benefit': Math.round(r.totalAnnualBenefitUSD),
    'Annual Cost': Math.round(r.totalAnnualCostUSD),
    'Net Benefit': Math.round(r.netAnnualBenefitUSD),
  }));

  // Pie: benefit breakdown
  const benefitBreakdown = activeUseCases.map((r, i) => ({
    name: r.useCaseName,
    value: Math.max(0, Math.round(r.totalAnnualBenefitUSD)),
    fill: COLORS[i % COLORS.length],
  }));

  const noData = activeUseCases.length === 0;

  const formatYAxis = (v: number | string) =>
    formatCurrency(typeof v === 'number' ? v : 0, company.currency, true);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">ROI Dashboard</h1>
        <p className="page-desc">
          {company.companyName} · {company.planningHorizonYears}-year planning
          horizon · Discount rate {(company.discountRate * 100).toFixed(0)}%
        </p>
      </div>

      {noData && (
        <Card className="empty-dashboard">
          <div className="empty-icon">📊</div>
          <h3>No active use cases</h3>
          <p>
            Enable some use cases on the{' '}
            <button
              className="link-btn"
              onClick={() => onTabChange('usecases')}
            >
              Use Cases
            </button>{' '}
            page to see your ROI dashboard.
          </p>
        </Card>
      )}

      {!noData && (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <MetricCard
              label="Total Annual Benefit"
              value={formatCurrency(totalAnnualBenefit, company.currency, true)}
              subValue="Productivity + automation savings"
              positive={totalAnnualBenefit > 0}
              icon={<TrendingUp size={20} />}
              large
            />
            <MetricCard
              label="Total Annual Cost"
              value={formatCurrency(totalAnnualCost, company.currency, true)}
              subValue="AI tokens + maintenance + MCP"
              negative={totalAnnualCost > 0}
              icon={<DollarSign size={20} />}
              large
            />
            <MetricCard
              label="Net Annual Benefit"
              value={formatCurrency(
                totalNetAnnualBenefit,
                company.currency,
                true,
              )}
              subValue="Benefit minus ongoing costs"
              positive={totalNetAnnualBenefit > 0}
              negative={totalNetAnnualBenefit < 0}
              icon={<BarChart2 size={20} />}
              large
            />
            <MetricCard
              label="Implementation Cost"
              value={formatCurrency(
                totalImplementationCost,
                company.currency,
                true,
              )}
              subValue="One-time investment"
              icon={<DollarSign size={20} />}
              large
            />
          </div>

          <div className="metrics-grid metrics-grid-4">
            <MetricCard
              label="Overall ROI"
              value={formatPercent(overallROIPercentage)}
              positive={overallROIPercentage > 0}
              negative={overallROIPercentage < 0}
            />
            <MetricCard
              label="Payback Period"
              value={formatMonths(overallPaybackMonths)}
              positive={overallPaybackMonths < 18}
            />
            <MetricCard
              label="3-Year NPV"
              value={formatCurrency(overall3YearNPV, company.currency, true)}
              positive={overall3YearNPV > 0}
              negative={overall3YearNPV < 0}
            />
            <MetricCard
              label="5-Year NPV"
              value={formatCurrency(overall5YearNPV, company.currency, true)}
              positive={overall5YearNPV > 0}
              negative={overall5YearNPV < 0}
            />
          </div>

          {/* Charts row 1 */}
          <div className="charts-grid">
            <Card title="Cumulative Cash Flow (5 Years)">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) =>
                      formatCurrency(typeof v === "number" ? v : 0, company.currency)
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Benefit"
                    stackId="1"
                    stroke="#10b981"
                    fill="#d1fae5"
                  />
                  <Area
                    type="monotone"
                    dataKey="Cost"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#fee2e2"
                  />
                  <Area
                    type="monotone"
                    dataKey="Cumulative Net"
                    stroke="#3b82f6"
                    fill="#eff6ff"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Use Case Annual Comparison">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ucCompareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) =>
                      formatCurrency(typeof v === "number" ? v : 0, company.currency)
                    }
                  />
                  <Legend />
                  <Bar dataKey="Annual Benefit" fill="#10b981" radius={[3,3,0,0]} />
                  <Bar dataKey="Annual Cost" fill="#ef4444" radius={[3,3,0,0]} />
                  <Bar dataKey="Net Benefit" fill="#3b82f6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts row 2 */}
          {benefitBreakdown.some((b) => b.value > 0) && (
            <div className="charts-grid">
              <Card title="Annual Benefit by Use Case">
                <div className="pie-container">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={benefitBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          name && percent != null
                            ? `${name.slice(0, 15)}: ${(percent * 100).toFixed(0)}%`
                            : ''
                        }
                        labelLine={false}
                      >
                        {benefitBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) =>
                          formatCurrency(typeof v === "number" ? v : 0, company.currency)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Use Case ROI Scorecard">
                <div className="scorecard-table-wrapper">
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Use Case</th>
                        <th>Annual Benefit</th>
                        <th>Annual Cost</th>
                        <th>Impl. Cost</th>
                        <th>ROI</th>
                        <th>Payback</th>
                        <th>3Y NPV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {useCaseResults.map((r) => (
                        <tr key={r.useCaseId}>
                          <td>{r.useCaseName}</td>
                          <td className="text-green">
                            {formatCurrency(
                              r.totalAnnualBenefitUSD,
                              company.currency,
                              true,
                            )}
                          </td>
                          <td className="text-red">
                            {formatCurrency(
                              r.totalAnnualCostUSD,
                              company.currency,
                              true,
                            )}
                          </td>
                          <td>
                            {formatCurrency(
                              r.implementationCostUSD,
                              company.currency,
                              true,
                            )}
                          </td>
                          <td
                            className={
                              r.roiPercentage >= 0 ? 'text-green' : 'text-red'
                            }
                          >
                            {formatPercent(r.roiPercentage)}
                          </td>
                          <td>{formatMonths(r.paybackPeriodMonths)}</td>
                          <td
                            className={
                              r.npv3Year >= 0 ? 'text-green' : 'text-red'
                            }
                          >
                            {formatCurrency(
                              r.npv3Year,
                              company.currency,
                              true,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Net benefit cash flow bar chart */}
          <Card title="Annual Net Benefit – Year by Year">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) =>
                    formatCurrency(typeof v === "number" ? v : 0, company.currency)
                  }
                />
                <Bar
                  dataKey="Net Benefit"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
