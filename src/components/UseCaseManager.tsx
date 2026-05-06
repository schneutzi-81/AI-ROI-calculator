import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, FormField, NumberInput, Select, Badge, Toggle } from './ui';
import {
  calculateUseCaseROI,
  formatCurrency,
  formatPercent,
  formatMonths,
} from '../utils/calculations';
import type {
  UseCase,
  AIModel,
  CompanyAssumptions,
  MCPServer,
  UseCaseCategory,
} from '../types';

const CATEGORIES: UseCaseCategory[] = [
  'Customer Service',
  'Document Processing',
  'Code Assistance',
  'HR & Employee Support',
  'Sales & Marketing',
  'Data Analysis',
  'Content Creation',
  'Process Automation',
  'Other',
];

const CATEGORY_COLORS: Record<UseCaseCategory, 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple'> = {
  'Customer Service': 'blue',
  'Document Processing': 'orange',
  'Code Assistance': 'purple',
  'HR & Employee Support': 'green',
  'Sales & Marketing': 'red',
  'Data Analysis': 'blue',
  'Content Creation': 'orange',
  'Process Automation': 'green',
  'Other': 'gray',
};

interface UseCaseCardProps {
  useCase: UseCase;
  models: AIModel[];
  company: CompanyAssumptions;
  mcpServers: MCPServer[];
  onUpdate: (uc: UseCase) => void;
  onRemove: (id: string) => void;
}

function UseCaseCard({
  useCase,
  models,
  company,
  mcpServers,
  onUpdate,
  onRemove,
}: UseCaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(useCase);

  const results = calculateUseCaseROI(useCase, company, models, mcpServers);
  const draftResults = editing
    ? calculateUseCaseROI(draft, company, models, mcpServers)
    : results;

  const modelOptions = models.map((m) => ({ value: m.id, label: m.name }));

  const updateAssumption = (
    key: keyof typeof draft.assumptions,
    value: number | string,
  ) => {
    setDraft({
      ...draft,
      assumptions: { ...draft.assumptions, [key]: value },
    });
  };

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(useCase);
    setEditing(false);
  };

  const activeModel = models.find(
    (m) => m.id === useCase.assumptions.modelId,
  );

  return (
    <div className={`usecase-card ${!useCase.enabled ? 'usecase-disabled' : ''}`}>
      <div className="usecase-header">
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="usecase-title-area">
          <Badge color={CATEGORY_COLORS[useCase.category]}>
            {useCase.category}
          </Badge>
          <h3 className="usecase-name">{useCase.name}</h3>
          <span className="usecase-desc-inline">{useCase.description}</span>
        </div>
        <div className="usecase-metrics">
          <div className="uc-metric">
            <span className="uc-metric-label">Annual Benefit</span>
            <span className={`uc-metric-value ${useCase.enabled ? 'text-green' : ''}`}>
              {formatCurrency(results.totalAnnualBenefitUSD, company.currency, true)}
            </span>
          </div>
          <div className="uc-metric">
            <span className="uc-metric-label">Annual Cost</span>
            <span className="uc-metric-value text-red">
              {formatCurrency(results.totalAnnualCostUSD, company.currency, true)}
            </span>
          </div>
          <div className="uc-metric">
            <span className="uc-metric-label">ROI</span>
            <span
              className={`uc-metric-value ${results.roiPercentage >= 0 ? 'text-green' : 'text-red'}`}
            >
              {formatPercent(results.roiPercentage)}
            </span>
          </div>
          <div className="uc-metric">
            <span className="uc-metric-label">Payback</span>
            <span className="uc-metric-value">
              {formatMonths(results.paybackPeriodMonths)}
            </span>
          </div>
        </div>
        <div className="usecase-actions">
          <Toggle
            checked={useCase.enabled}
            onChange={(v) => onUpdate({ ...useCase, enabled: v })}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setEditing(true);
              setExpanded(true);
            }}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onRemove(useCase.id)}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="usecase-body">
          {editing ? (
            <>
              <div className="edit-section">
                <h4 className="edit-section-title">Basic Info</h4>
                <div className="form-grid form-grid-3">
                  <FormField label="Use Case Name">
                    <input
                      className="form-input"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Category">
                    <Select
                      value={draft.category}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          category: v as UseCaseCategory,
                        })
                      }
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  </FormField>
                  <FormField label="Description">
                    <input
                      className="form-input"
                      value={draft.description}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                    />
                  </FormField>
                </div>
              </div>

              <div className="edit-section">
                <h4 className="edit-section-title">Usage Assumptions</h4>
                <div className="form-grid form-grid-3">
                  <FormField
                    label="Number of Users"
                    hint="Employees or end-users who will use this AI feature."
                  >
                    <NumberInput
                      value={draft.assumptions.numberOfUsers}
                      onChange={(v) => updateAssumption('numberOfUsers', v)}
                      min={1}
                      step={1}
                      suffix="users"
                    />
                  </FormField>
                  <FormField
                    label="Interactions per User per Day"
                    hint="How many times does each user interact with the AI daily?"
                  >
                    <NumberInput
                      value={draft.assumptions.usageFrequencyPerUserPerDay}
                      onChange={(v) =>
                        updateAssumption('usageFrequencyPerUserPerDay', v)
                      }
                      min={0}
                      step={1}
                      suffix="/user/day"
                    />
                  </FormField>
                  <FormField
                    label="Minutes Saved per Interaction"
                    hint="Average time saved for the user on each AI-assisted task."
                  >
                    <NumberInput
                      value={draft.assumptions.minutesSavedPerInteraction}
                      onChange={(v) =>
                        updateAssumption('minutesSavedPerInteraction', v)
                      }
                      min={0}
                      step={1}
                      suffix="min"
                    />
                  </FormField>
                  <FormField
                    label="Automation Rate"
                    hint="Percentage of interactions fully automated (no human review needed)."
                  >
                    <NumberInput
                      value={Math.round(
                        draft.assumptions.automationRate * 100,
                      )}
                      onChange={(v) =>
                        updateAssumption('automationRate', v / 100)
                      }
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                  </FormField>
                  <FormField
                    label="Implementation Months"
                    hint="How long to build and roll out this use case."
                  >
                    <NumberInput
                      value={draft.assumptions.implementationMonths}
                      onChange={(v) =>
                        updateAssumption('implementationMonths', v)
                      }
                      min={0}
                      max={24}
                      step={1}
                      suffix="months"
                    />
                  </FormField>
                </div>
              </div>

              <div className="edit-section">
                <h4 className="edit-section-title">AI Model & Token Usage</h4>
                <div className="form-grid form-grid-3">
                  <FormField label="AI Model">
                    <Select
                      value={draft.assumptions.modelId}
                      onChange={(v) => updateAssumption('modelId', v)}
                      options={modelOptions}
                    />
                  </FormField>
                  <FormField
                    label="Avg Input Tokens / Interaction"
                    hint="Prompt + context tokens sent to the model."
                  >
                    <NumberInput
                      value={draft.assumptions.avgInputTokensPerInteraction}
                      onChange={(v) =>
                        updateAssumption('avgInputTokensPerInteraction', v)
                      }
                      min={0}
                      step={100}
                      suffix="tokens"
                    />
                  </FormField>
                  <FormField
                    label="Avg Output Tokens / Interaction"
                    hint="Completion tokens generated by the model."
                  >
                    <NumberInput
                      value={draft.assumptions.avgOutputTokensPerInteraction}
                      onChange={(v) =>
                        updateAssumption('avgOutputTokensPerInteraction', v)
                      }
                      min={0}
                      step={100}
                      suffix="tokens"
                    />
                  </FormField>
                </div>
              </div>

              <div className="edit-section">
                <h4 className="edit-section-title">Costs</h4>
                <div className="form-grid form-grid-3">
                  <FormField
                    label="One-Time Implementation Cost"
                    hint="Development, integration, and initial setup costs."
                  >
                    <NumberInput
                      value={draft.assumptions.implementationCostOneTime}
                      onChange={(v) =>
                        updateAssumption('implementationCostOneTime', v)
                      }
                      min={0}
                      step={5000}
                      prefix="$"
                    />
                  </FormField>
                  <FormField
                    label="Annual Maintenance Cost"
                    hint="Ongoing support, updates, and infrastructure (excluding AI tokens)."
                  >
                    <NumberInput
                      value={draft.assumptions.annualMaintenanceCost}
                      onChange={(v) =>
                        updateAssumption('annualMaintenanceCost', v)
                      }
                      min={0}
                      step={1000}
                      prefix="$"
                    />
                  </FormField>
                </div>
              </div>

              {/* Live preview */}
              <div className="live-preview">
                <h4 className="edit-section-title">Live Preview</h4>
                <div className="preview-metrics">
                  <div className="preview-metric">
                    <span>Annual Benefit</span>
                    <strong className="text-green">
                      {formatCurrency(
                        draftResults.totalAnnualBenefitUSD,
                        company.currency,
                      )}
                    </strong>
                  </div>
                  <div className="preview-metric">
                    <span>Annual AI Cost</span>
                    <strong className="text-red">
                      {formatCurrency(
                        draftResults.annualAICostUSD,
                        company.currency,
                      )}
                    </strong>
                  </div>
                  <div className="preview-metric">
                    <span>ROI</span>
                    <strong>
                      {formatPercent(draftResults.roiPercentage)}
                    </strong>
                  </div>
                  <div className="preview-metric">
                    <span>3-Year NPV</span>
                    <strong
                      className={
                        draftResults.npv3Year >= 0 ? 'text-green' : 'text-red'
                      }
                    >
                      {formatCurrency(draftResults.npv3Year, company.currency)}
                    </strong>
                  </div>
                  <div className="preview-metric">
                    <span>Payback Period</span>
                    <strong>
                      {formatMonths(draftResults.paybackPeriodMonths)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={save}>
                  <X size={14} style={{ transform: 'rotate(45deg)' }} /> Save
                  Changes
                </button>
                <button className="btn btn-ghost" onClick={cancel}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="usecase-detail-view">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4 className="detail-section-title">Usage Assumptions</h4>
                  <dl className="detail-list">
                    <dt>Users</dt>
                    <dd>{useCase.assumptions.numberOfUsers}</dd>
                    <dt>Frequency</dt>
                    <dd>
                      {useCase.assumptions.usageFrequencyPerUserPerDay}/user/day
                    </dd>
                    <dt>Time saved</dt>
                    <dd>
                      {useCase.assumptions.minutesSavedPerInteraction} min/interaction
                    </dd>
                    <dt>Automation rate</dt>
                    <dd>
                      {(useCase.assumptions.automationRate * 100).toFixed(0)}%
                    </dd>
                    <dt>AI Model</dt>
                    <dd>{activeModel?.name ?? useCase.assumptions.modelId}</dd>
                  </dl>
                </div>
                <div className="detail-section">
                  <h4 className="detail-section-title">Financial Results</h4>
                  <dl className="detail-list">
                    <dt>Annual time savings</dt>
                    <dd className="text-green">
                      {formatCurrency(
                        results.annualTimeSavingsUSD,
                        company.currency,
                      )}
                    </dd>
                    <dt>Annual automation savings</dt>
                    <dd className="text-green">
                      {formatCurrency(
                        results.annualAutomationSavingsUSD,
                        company.currency,
                      )}
                    </dd>
                    <dt>Annual AI cost</dt>
                    <dd className="text-red">
                      {formatCurrency(
                        results.annualAICostUSD,
                        company.currency,
                      )}
                    </dd>
                    <dt>Implementation cost</dt>
                    <dd className="text-red">
                      {formatCurrency(
                        results.implementationCostUSD,
                        company.currency,
                      )}
                    </dd>
                    <dt>3-Year NPV</dt>
                    <dd
                      className={
                        results.npv3Year >= 0 ? 'text-green' : 'text-red'
                      }
                    >
                      {formatCurrency(results.npv3Year, company.currency)}
                    </dd>
                  </dl>
                </div>
                <div className="detail-section">
                  <h4 className="detail-section-title">Cash Flow (Years 1–5)</h4>
                  <table className="cashflow-table">
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
                      {results.cashFlows.slice(0, 5).map((cf) => (
                        <tr key={cf.year}>
                          <td>Y{cf.year}</td>
                          <td className="text-green">
                            {formatCurrency(cf.benefit, company.currency, true)}
                          </td>
                          <td className="text-red">
                            {formatCurrency(cf.cost, company.currency, true)}
                          </td>
                          <td
                            className={
                              cf.net >= 0 ? 'text-green' : 'text-red'
                            }
                          >
                            {formatCurrency(cf.net, company.currency, true)}
                          </td>
                          <td
                            className={
                              cf.cumulativeNet >= 0 ? 'text-green' : 'text-red'
                            }
                          >
                            {formatCurrency(
                              cf.cumulativeNet,
                              company.currency,
                              true,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  useCases: UseCase[];
  models: AIModel[];
  company: CompanyAssumptions;
  mcpServers: MCPServer[];
  onUpdate: (uc: UseCase) => void;
  onAdd: (uc: UseCase) => void;
  onRemove: (id: string) => void;
}

const NEW_USE_CASE_TEMPLATE: Omit<UseCase, 'id'> = {
  name: '',
  category: 'Other',
  description: '',
  enabled: true,
  assumptions: {
    numberOfUsers: 10,
    usageFrequencyPerUserPerDay: 5,
    minutesSavedPerInteraction: 10,
    automationRate: 0.1,
    avgInputTokensPerInteraction: 500,
    avgOutputTokensPerInteraction: 300,
    modelId: 'gpt-4o-mini',
    implementationCostOneTime: 25000,
    annualMaintenanceCost: 5000,
    implementationMonths: 2,
  },
};

export function UseCaseManager({
  useCases,
  models,
  company,
  mcpServers,
  onUpdate,
  onAdd,
  onRemove,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newUC, setNewUC] = useState<Omit<UseCase, 'id'>>(NEW_USE_CASE_TEMPLATE);

  const handleAdd = () => {
    onAdd({ ...newUC, id: `uc-${Date.now()}` });
    setNewUC(NEW_USE_CASE_TEMPLATE);
    setShowAdd(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Use Cases</h1>
        <p className="page-desc">
          Define individual AI use cases. Each use case has its own set of
          assumptions, cost drivers, and ROI metrics — like separate sheets in
          an Excel workbook.
        </p>
      </div>

      <div className="usecase-toolbar">
        <span className="toolbar-count">
          {useCases.filter((uc) => uc.enabled).length} active /{' '}
          {useCases.length} total
        </span>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} /> Add Use Case
        </button>
      </div>

      {useCases.length === 0 && (
        <Card className="empty-state">
          <p>No use cases yet. Add one to get started.</p>
        </Card>
      )}

      <div className="usecase-list">
        {useCases.map((uc) => (
          <UseCaseCard
            key={uc.id}
            useCase={uc}
            models={models}
            company={company}
            mcpServers={mcpServers}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {showAdd && (
        <Card title="Add New Use Case" className="add-form mt-4">
          <div className="form-grid form-grid-3">
            <FormField label="Use Case Name">
              <input
                className="form-input"
                value={newUC.name}
                onChange={(e) => setNewUC({ ...newUC, name: e.target.value })}
                placeholder="e.g., Invoice Processing"
              />
            </FormField>
            <FormField label="Category">
              <Select
                value={newUC.category}
                onChange={(v) =>
                  setNewUC({ ...newUC, category: v as UseCaseCategory })
                }
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Description">
              <input
                className="form-input"
                value={newUC.description}
                onChange={(e) =>
                  setNewUC({ ...newUC, description: e.target.value })
                }
                placeholder="Brief description of the use case"
              />
            </FormField>
          </div>
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!newUC.name}
            >
              Create Use Case
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowAdd(false);
                setNewUC(NEW_USE_CASE_TEMPLATE);
              }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
