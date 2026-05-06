import { useState, useCallback } from 'react';
import type { AppTab, CompanyAssumptions, AIModel, UseCase, MCPServer } from '../types';
import {
  DEFAULT_COMPANY,
  DEFAULT_MODELS,
  DEFAULT_USE_CASES,
  DEFAULT_MCP_SERVERS,
} from '../data/defaults';

export function useAppState() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [company, setCompany] = useState<CompanyAssumptions>(DEFAULT_COMPANY);
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [useCases, setUseCases] = useState<UseCase[]>(DEFAULT_USE_CASES);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(DEFAULT_MCP_SERVERS);

  const updateCompany = useCallback(
    (updates: Partial<CompanyAssumptions>) =>
      setCompany((prev) => ({ ...prev, ...updates })),
    [],
  );

  const updateModel = useCallback((updated: AIModel) => {
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const addModel = useCallback((model: AIModel) => {
    setModels((prev) => [...prev, model]);
  }, []);

  const removeModel = useCallback((id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateUseCase = useCallback((updated: UseCase) => {
    setUseCases((prev) =>
      prev.map((uc) => (uc.id === updated.id ? updated : uc)),
    );
  }, []);

  const addUseCase = useCallback((uc: UseCase) => {
    setUseCases((prev) => [...prev, uc]);
  }, []);

  const removeUseCase = useCallback((id: string) => {
    setUseCases((prev) => prev.filter((uc) => uc.id !== id));
  }, []);

  const updateMCPServer = useCallback((updated: MCPServer) => {
    setMcpServers((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  }, []);

  const addMCPServer = useCallback((server: MCPServer) => {
    setMcpServers((prev) => [...prev, server]);
  }, []);

  const removeMCPServer = useCallback((id: string) => {
    setMcpServers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
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
  };
}
