import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Link, Unlink } from 'lucide-react';
import { Card, FormField, NumberInput, Select, Badge, Toggle } from './ui';
import type { MCPServer, MCPServerType, UseCase } from '../types';

const SERVER_TYPE_OPTIONS: { value: MCPServerType; label: string }[] = [
  { value: 'database', label: 'Database (SQL/NoSQL)' },
  { value: 'erp', label: 'ERP System (SAP, Oracle)' },
  { value: 'crm', label: 'CRM (Salesforce, Dynamics)' },
  { value: 'document-store', label: 'Document Store (SharePoint)' },
  { value: 'api', label: 'REST / SOAP API' },
  { value: 'custom', label: 'Custom / Other' },
];

const TYPE_ICONS: Record<MCPServerType, string> = {
  database: '🗄️',
  erp: '🏭',
  crm: '👤',
  'document-store': '📁',
  api: '🔌',
  custom: '⚙️',
};

const AUTH_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'api-key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'basic', label: 'Basic Auth' },
];

interface MCPServerCardProps {
  server: MCPServer;
  useCases: UseCase[];
  onUpdate: (s: MCPServer) => void;
  onRemove: (id: string) => void;
}

function MCPServerCard({
  server,
  useCases,
  onUpdate,
  onRemove,
}: MCPServerCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(server);

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(server);
    setEditing(false);
  };

  const toggleUseCaseAssociation = (ucId: string) => {
    const current = draft.associatedUseCaseIds;
    const next = current.includes(ucId)
      ? current.filter((id) => id !== ucId)
      : [...current, ucId];
    setDraft({ ...draft, associatedUseCaseIds: next });
  };

  const annualCost =
    server.estimatedMonthlyCallVolume * server.costPerCallUSD * 12;

  return (
    <div className={`mcp-card ${!server.enabled ? 'mcp-disabled' : ''}`}>
      <div className="mcp-header">
        <span className="mcp-type-icon">{TYPE_ICONS[server.type]}</span>
        <div className="mcp-info">
          <h3 className="mcp-name">{server.name}</h3>
          <Badge color="gray">{server.type}</Badge>
          <span className="mcp-endpoint">{server.endpoint || 'No endpoint configured'}</span>
        </div>
        <div className="mcp-meta">
          <div className="mcp-stat">
            <span>~${annualCost.toFixed(0)}/yr</span>
          </div>
          <div className="mcp-stat">
            <Badge color={server.authType === 'none' ? 'gray' : 'blue'}>
              {server.authType}
            </Badge>
          </div>
        </div>
        <div className="mcp-actions">
          <Toggle
            checked={server.enabled}
            onChange={(v) => onUpdate({ ...server, enabled: v })}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditing(!editing)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onRemove(server.id)}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="mcp-edit-body">
          <div className="form-grid form-grid-3">
            <FormField label="Server Name">
              <input
                className="form-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </FormField>
            <FormField label="Type">
              <Select
                value={draft.type}
                onChange={(v) =>
                  setDraft({ ...draft, type: v as MCPServerType })
                }
                options={SERVER_TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Auth Type">
              <Select
                value={draft.authType}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    authType: v as MCPServer['authType'],
                  })
                }
                options={AUTH_OPTIONS}
              />
            </FormField>
            <FormField
              label="Endpoint URL"
              hint="MCP server connection string or URL."
            >
              <input
                className="form-input"
                value={draft.endpoint}
                onChange={(e) =>
                  setDraft({ ...draft, endpoint: e.target.value })
                }
                placeholder="mcp://server-host:5000"
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
            <FormField
              label="Monthly Call Volume"
              hint="Estimated number of MCP calls per month."
            >
              <NumberInput
                value={draft.estimatedMonthlyCallVolume}
                onChange={(v) =>
                  setDraft({ ...draft, estimatedMonthlyCallVolume: v })
                }
                min={0}
                step={100}
                suffix="calls/mo"
              />
            </FormField>
            <FormField
              label="Cost per Call"
              hint="Infrastructure/licensing cost per MCP server call."
            >
              <NumberInput
                value={draft.costPerCallUSD}
                onChange={(v) => setDraft({ ...draft, costPerCallUSD: v })}
                min={0}
                step={0.001}
                prefix="$"
              />
            </FormField>
          </div>

          {useCases.length > 0 && (
            <div className="association-section">
              <h4 className="association-title">
                Link to Use Cases
              </h4>
              <div className="association-list">
                {useCases.map((uc) => {
                  const linked = draft.associatedUseCaseIds.includes(uc.id);
                  return (
                    <button
                      key={uc.id}
                      className={`association-chip ${linked ? 'association-chip-active' : ''}`}
                      onClick={() => toggleUseCaseAssociation(uc.id)}
                    >
                      {linked ? <Link size={12} /> : <Unlink size={12} />}
                      {uc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" onClick={save}>
              <Check size={14} /> Save
            </button>
            <button className="btn btn-ghost" onClick={cancel}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {!editing && server.description && (
        <p className="mcp-description">{server.description}</p>
      )}

      {!editing && server.associatedUseCaseIds.length > 0 && (
        <div className="mcp-linked-ucs">
          {server.associatedUseCaseIds.map((ucId) => {
            const uc = useCases.find((u) => u.id === ucId);
            return uc ? (
              <span key={ucId} className="linked-uc-chip">
                <Link size={10} /> {uc.name}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

interface Props {
  mcpServers: MCPServer[];
  useCases: UseCase[];
  onUpdate: (s: MCPServer) => void;
  onAdd: (s: MCPServer) => void;
  onRemove: (id: string) => void;
}

const EMPTY_SERVER: Omit<MCPServer, 'id'> = {
  name: '',
  type: 'api',
  description: '',
  endpoint: '',
  authType: 'api-key',
  enabled: false,
  estimatedMonthlyCallVolume: 1000,
  costPerCallUSD: 0.001,
  associatedUseCaseIds: [],
};

export function MCPServerConfig({
  mcpServers,
  useCases,
  onUpdate,
  onAdd,
  onRemove,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newServer, setNewServer] = useState<Omit<MCPServer, 'id'>>(EMPTY_SERVER);

  const handleAdd = () => {
    onAdd({ ...newServer, id: `mcp-${Date.now()}` });
    setNewServer(EMPTY_SERVER);
    setShowAdd(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">MCP Server Connections</h1>
        <p className="page-desc">
          Model Context Protocol (MCP) servers connect AI to on-premise and
          cloud systems — databases, ERPs, CRMs, and document stores. Configure
          server costs and link them to use cases for accurate cost modelling.
        </p>
      </div>

      <Card
        title="What is MCP?"
        subtitle="Model Context Protocol — connecting AI to your enterprise data"
        className="info-card"
      >
        <div className="mcp-explainer">
          <div className="explainer-item">
            <span className="explainer-icon">🔗</span>
            <div>
              <strong>Secure connectivity</strong>
              <p>
                MCP servers act as secure bridges between Azure OpenAI and
                on-premise systems, avoiding direct data exposure.
              </p>
            </div>
          </div>
          <div className="explainer-item">
            <span className="explainer-icon">🏭</span>
            <div>
              <strong>On-premise & cloud</strong>
              <p>
                Connect to SAP, Oracle, Salesforce, SharePoint, SQL Server, or
                any custom REST API through standardised MCP connectors.
              </p>
            </div>
          </div>
          <div className="explainer-item">
            <span className="explainer-icon">💰</span>
            <div>
              <strong>Cost transparency</strong>
              <p>
                Each MCP server adds infrastructure costs. Model call volumes
                and per-call costs to include them in your ROI calculation.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mcp-toolbar">
        <span className="toolbar-count">
          {mcpServers.filter((s) => s.enabled).length} active /{' '}
          {mcpServers.length} total
        </span>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add MCP Server
        </button>
      </div>

      <div className="mcp-list">
        {mcpServers.map((server) => (
          <MCPServerCard
            key={server.id}
            server={server}
            useCases={useCases}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {showAdd && (
        <Card title="Add MCP Server" className="add-form mt-4">
          <div className="form-grid form-grid-3">
            <FormField label="Server Name">
              <input
                className="form-input"
                value={newServer.name}
                onChange={(e) =>
                  setNewServer({ ...newServer, name: e.target.value })
                }
                placeholder="e.g., SAP S/4HANA"
              />
            </FormField>
            <FormField label="Type">
              <Select
                value={newServer.type}
                onChange={(v) =>
                  setNewServer({ ...newServer, type: v as MCPServerType })
                }
                options={SERVER_TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Endpoint">
              <input
                className="form-input"
                value={newServer.endpoint}
                onChange={(e) =>
                  setNewServer({ ...newServer, endpoint: e.target.value })
                }
                placeholder="mcp://host:port"
              />
            </FormField>
          </div>
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!newServer.name}
            >
              Add Server
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowAdd(false);
                setNewServer(EMPTY_SERVER);
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
