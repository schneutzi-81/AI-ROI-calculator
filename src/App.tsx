import { useMemo } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CompanyAssumptionsPanel } from './components/CompanyAssumptions';
import { ModelConfig } from './components/ModelConfig';
import { UseCaseManager } from './components/UseCaseManager';
import { MCPServerConfig } from './components/MCPServerConfig';
import { Report } from './components/Report';
import { useAppState } from './hooks/useAppState';
import { calculateOverallROI } from './utils/calculations';
import type { AppTab } from './types';
import './styles.css';

function App() {
  const {
    activeTab,
    setActiveTab,
    company,
    updateCompany,
    models,
    updateModel,
    addModel,
    removeModel,
    useCases,
    updateUseCase,
    addUseCase,
    removeUseCase,
    mcpServers,
    updateMCPServer,
    addMCPServer,
    removeMCPServer,
  } = useAppState();

  const results = useMemo(
    () =>
      calculateOverallROI(
        company,
        models,
        useCases.filter((uc) => uc.enabled),
        mcpServers,
      ),
    [company, models, useCases, mcpServers],
  );

  return (
    <div className="app-layout">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard
            results={results}
            company={company}
            onTabChange={(tab) => setActiveTab(tab as AppTab)}
          />
        )}
        {activeTab === 'company' && (
          <CompanyAssumptionsPanel
            company={company}
            onChange={updateCompany}
          />
        )}
        {activeTab === 'models' && (
          <ModelConfig
            models={models}
            onUpdate={updateModel}
            onAdd={addModel}
            onRemove={removeModel}
          />
        )}
        {activeTab === 'usecases' && (
          <UseCaseManager
            useCases={useCases}
            models={models}
            company={company}
            mcpServers={mcpServers}
            onUpdate={updateUseCase}
            onAdd={addUseCase}
            onRemove={removeUseCase}
          />
        )}
        {activeTab === 'mcp' && (
          <MCPServerConfig
            mcpServers={mcpServers}
            useCases={useCases}
            onUpdate={updateMCPServer}
            onAdd={addMCPServer}
            onRemove={removeMCPServer}
          />
        )}
        {activeTab === 'report' && (
          <Report
            results={results}
            company={company}
            models={models}
            mcpServers={mcpServers}
          />
        )}
      </main>
    </div>
  );
}

export default App;
