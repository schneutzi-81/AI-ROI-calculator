import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card, FormField, NumberInput, Badge } from './ui';
import type { AIModel } from '../types';

interface Props {
  models: AIModel[];
  onUpdate: (model: AIModel) => void;
  onAdd: (model: AIModel) => void;
  onRemove: (id: string) => void;
}

const EMPTY_MODEL: Omit<AIModel, 'id'> = {
  name: '',
  provider: 'Azure OpenAI',
  inputCostPer1kTokens: 0.005,
  outputCostPer1kTokens: 0.015,
  contextWindowTokens: 128000,
  description: '',
};

function ModelRow({
  model,
  onUpdate,
  onRemove,
  canRemove,
}: {
  model: AIModel;
  onUpdate: (m: AIModel) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(model);

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(model);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="model-row model-row-editing">
        <div className="form-grid form-grid-4">
          <FormField label="Name">
            <input
              className="form-input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </FormField>
          <FormField label="Provider">
            <input
              className="form-input"
              value={draft.provider}
              onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
            />
          </FormField>
          <FormField label="Input cost / 1k tokens">
            <NumberInput
              value={draft.inputCostPer1kTokens}
              onChange={(v) => setDraft({ ...draft, inputCostPer1kTokens: v })}
              step={0.0001}
              min={0}
              prefix="$"
            />
          </FormField>
          <FormField label="Output cost / 1k tokens">
            <NumberInput
              value={draft.outputCostPer1kTokens}
              onChange={(v) => setDraft({ ...draft, outputCostPer1kTokens: v })}
              step={0.0001}
              min={0}
              prefix="$"
            />
          </FormField>
          <FormField label="Context window">
            <NumberInput
              value={draft.contextWindowTokens}
              onChange={(v) => setDraft({ ...draft, contextWindowTokens: v })}
              step={1000}
              min={0}
              suffix="tokens"
            />
          </FormField>
          <FormField label="Description" hint=" ">
            <input
              className="form-input"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </FormField>
        </div>
        <div className="row-actions">
          <button className="btn btn-primary btn-sm" onClick={save}>
            <Check size={14} /> Save
          </button>
          <button className="btn btn-ghost btn-sm" onClick={cancel}>
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="model-row">
      <div className="model-info">
        <div className="model-name">{model.name}</div>
        <Badge color="blue">{model.provider}</Badge>
        <span className="model-desc">{model.description}</span>
      </div>
      <div className="model-costs">
        <div className="cost-item">
          <span className="cost-label">Input</span>
          <span className="cost-value">${model.inputCostPer1kTokens}/1k</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">Output</span>
          <span className="cost-value">${model.outputCostPer1kTokens}/1k</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">Context</span>
          <span className="cost-value">
            {(model.contextWindowTokens / 1000).toFixed(0)}k tokens
          </span>
        </div>
      </div>
      <div className="row-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setEditing(true)}
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        {canRemove && (
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onRemove(model.id)}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ModelConfig({ models, onUpdate, onAdd, onRemove }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModel, setNewModel] = useState<Omit<AIModel, 'id'>>(EMPTY_MODEL);

  const handleAdd = () => {
    onAdd({
      ...newModel,
      id: `custom-${Date.now()}`,
    });
    setNewModel(EMPTY_MODEL);
    setShowAddForm(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">AI Model Configuration</h1>
        <p className="page-desc">
          Configure Azure OpenAI and other AI models with their token pricing.
          These rates are used to calculate per-use-case AI costs.
        </p>
      </div>

      <Card>
        <div className="card-toolbar">
          <span className="card-toolbar-label">
            {models.length} models configured
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} /> Add Custom Model
          </button>
        </div>

        <div className="model-list">
          {models.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              onUpdate={onUpdate}
              onRemove={onRemove}
              canRemove={!['gpt-4o', 'gpt-4o-mini', 'gpt-35-turbo'].includes(
                model.id,
              )}
            />
          ))}
        </div>

        {showAddForm && (
          <div className="add-form">
            <h4 className="add-form-title">Add Custom Model</h4>
            <div className="form-grid form-grid-3">
              <FormField label="Model Name">
                <input
                  className="form-input"
                  value={newModel.name}
                  onChange={(e) =>
                    setNewModel({ ...newModel, name: e.target.value })
                  }
                  placeholder="e.g., My Custom Model"
                />
              </FormField>
              <FormField label="Provider">
                <input
                  className="form-input"
                  value={newModel.provider}
                  onChange={(e) =>
                    setNewModel({ ...newModel, provider: e.target.value })
                  }
                  placeholder="e.g., Azure OpenAI"
                />
              </FormField>
              <FormField label="Input cost / 1k tokens">
                <NumberInput
                  value={newModel.inputCostPer1kTokens}
                  onChange={(v) =>
                    setNewModel({ ...newModel, inputCostPer1kTokens: v })
                  }
                  step={0.0001}
                  min={0}
                  prefix="$"
                />
              </FormField>
              <FormField label="Output cost / 1k tokens">
                <NumberInput
                  value={newModel.outputCostPer1kTokens}
                  onChange={(v) =>
                    setNewModel({ ...newModel, outputCostPer1kTokens: v })
                  }
                  step={0.0001}
                  min={0}
                  prefix="$"
                />
              </FormField>
              <FormField label="Context window">
                <NumberInput
                  value={newModel.contextWindowTokens}
                  onChange={(v) =>
                    setNewModel({ ...newModel, contextWindowTokens: v })
                  }
                  step={1000}
                  min={0}
                  suffix="tokens"
                />
              </FormField>
              <FormField label="Description">
                <input
                  className="form-input"
                  value={newModel.description}
                  onChange={(e) =>
                    setNewModel({ ...newModel, description: e.target.value })
                  }
                  placeholder="Brief description"
                />
              </FormField>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={!newModel.name}
              >
                Add Model
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setNewModel(EMPTY_MODEL);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Azure OpenAI Pricing Reference"
        subtitle="Current approximate prices (May 2025). Always verify with the Azure pricing calculator."
        className="mt-4"
      >
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Input (per 1M tokens)</th>
              <th>Output (per 1M tokens)</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GPT-4o</td>
              <td>$5.00</td>
              <td>$15.00</td>
              <td>Complex reasoning, multimodal</td>
            </tr>
            <tr>
              <td>GPT-4o mini</td>
              <td>$0.15</td>
              <td>$0.60</td>
              <td>High-volume, cost-sensitive tasks</td>
            </tr>
            <tr>
              <td>GPT-4 Turbo</td>
              <td>$10.00</td>
              <td>$30.00</td>
              <td>High-quality with long context</td>
            </tr>
            <tr>
              <td>GPT-3.5 Turbo</td>
              <td>$0.50</td>
              <td>$1.50</td>
              <td>Simple tasks, legacy integrations</td>
            </tr>
            <tr>
              <td>Phi-3 Mini</td>
              <td>$0.13</td>
              <td>$0.13</td>
              <td>On-premise / edge / SLM tasks</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
