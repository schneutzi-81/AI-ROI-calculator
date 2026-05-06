import { Card, FormField, NumberInput, Select } from './ui';
import type { CompanyAssumptions } from '../types';

interface Props {
  company: CompanyAssumptions;
  onChange: (updates: Partial<CompanyAssumptions>) => void;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'CHF', label: 'CHF – Swiss Franc' },
];

export function CompanyAssumptionsPanel({ company, onChange }: Props) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Company Assumptions</h1>
        <p className="page-desc">
          Set your company's baseline figures. These apply to all use case
          calculations.
        </p>
      </div>

      <div className="grid-2">
        <Card title="General" subtitle="Company-wide settings">
          <div className="form-grid">
            <FormField label="Company Name">
              <input
                type="text"
                className="form-input"
                value={company.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                placeholder="My Company"
              />
            </FormField>

            <FormField label="Reporting Currency">
              <Select
                value={company.currency}
                onChange={(v) => onChange({ currency: v })}
                options={CURRENCY_OPTIONS}
              />
            </FormField>

            <FormField
              label="Planning Horizon"
              hint="Years used for NPV and cumulative cash flow projections."
            >
              <NumberInput
                value={company.planningHorizonYears}
                onChange={(v) => onChange({ planningHorizonYears: v })}
                min={1}
                max={10}
                step={1}
                suffix="years"
              />
            </FormField>

            <FormField
              label="Discount Rate (WACC)"
              hint="Used for NPV calculation. Typically 8–12%."
            >
              <NumberInput
                value={Math.round(company.discountRate * 100)}
                onChange={(v) => onChange({ discountRate: v / 100 })}
                min={0}
                max={50}
                step={1}
                suffix="%"
              />
            </FormField>
          </div>
        </Card>

        <Card title="Labour Cost" subtitle="Used to value time savings">
          <div className="form-grid">
            <FormField
              label="Average Annual Salary"
              hint="Blended average across all employees impacted by AI."
            >
              <NumberInput
                value={company.averageAnnualSalary}
                onChange={(v) => onChange({ averageAnnualSalary: v })}
                min={0}
                step={1000}
                prefix={company.currency === 'USD' ? '$' : company.currency}
              />
            </FormField>

            <FormField
              label="Working Hours per Year"
              hint="Typically 1,750–1,950 hours for a full-time employee."
            >
              <NumberInput
                value={company.workingHoursPerYear}
                onChange={(v) => onChange({ workingHoursPerYear: v })}
                min={1000}
                max={3000}
                step={50}
                suffix="hrs/yr"
              />
            </FormField>

            <FormField
              label="Overhead Multiplier"
              hint="Accounts for benefits, facilities, and equipment (e.g., 1.3 = 30% overhead)."
            >
              <NumberInput
                value={company.overheadMultiplier}
                onChange={(v) => onChange({ overheadMultiplier: v })}
                min={1}
                max={3}
                step={0.05}
                suffix="×"
              />
            </FormField>

            <div className="derived-value">
              <span className="derived-label">Effective Hourly Cost</span>
              <span className="derived-number">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: company.currency,
                  maximumFractionDigits: 2,
                }).format(
                  (company.averageAnnualSalary * company.overheadMultiplier) /
                    company.workingHoursPerYear,
                )}
                /hr
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
