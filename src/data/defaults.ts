import type { AIModel, UseCase, MCPServer, CompanyAssumptions } from '../types';

export const DEFAULT_COMPANY: CompanyAssumptions = {
  companyName: 'My Company',
  currency: 'USD',
  averageAnnualSalary: 75000,
  workingHoursPerYear: 1750,
  overheadMultiplier: 1.3,
  discountRate: 0.1,
  planningHorizonYears: 3,
};

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'Azure OpenAI',
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.015,
    contextWindowTokens: 128000,
    description:
      'Most capable multimodal model. Best for complex reasoning and analysis.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'Azure OpenAI',
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
    contextWindowTokens: 128000,
    description:
      'Fast and cost-efficient. Great for high-volume, simpler tasks.',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'Azure OpenAI',
    inputCostPer1kTokens: 0.01,
    outputCostPer1kTokens: 0.03,
    contextWindowTokens: 128000,
    description: 'High intelligence with 128k context. Strong reasoning.',
  },
  {
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'Azure OpenAI',
    inputCostPer1kTokens: 0.0005,
    outputCostPer1kTokens: 0.0015,
    contextWindowTokens: 16385,
    description: 'Fast and affordable for straightforward tasks.',
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'Azure AI',
    inputCostPer1kTokens: 0.00013,
    outputCostPer1kTokens: 0.00013,
    contextWindowTokens: 128000,
    description: 'Small but capable model. Ideal for on-premise/edge deployment.',
  },
  {
    id: 'phi-3-medium',
    name: 'Phi-3 Medium',
    provider: 'Azure AI',
    inputCostPer1kTokens: 0.00017,
    outputCostPer1kTokens: 0.00017,
    contextWindowTokens: 128000,
    description: 'Balanced performance and cost for enterprise tasks.',
  },
  {
    id: 'ada-embedding',
    name: 'text-embedding-ada-002',
    provider: 'Azure OpenAI',
    inputCostPer1kTokens: 0.0001,
    outputCostPer1kTokens: 0,
    contextWindowTokens: 8191,
    description: 'Embeddings for semantic search and RAG pipelines.',
  },
];

export const DEFAULT_USE_CASES: UseCase[] = [
  {
    id: 'uc-1',
    name: 'Customer Service Chatbot',
    category: 'Customer Service',
    description:
      'AI-powered first-line support that handles common customer inquiries, reducing ticket volume and improving response times.',
    enabled: true,
    assumptions: {
      numberOfUsers: 5,
      usageFrequencyPerUserPerDay: 40,
      minutesSavedPerInteraction: 8,
      automationRate: 0.4,
      avgInputTokensPerInteraction: 500,
      avgOutputTokensPerInteraction: 300,
      modelId: 'gpt-4o-mini',
      implementationCostOneTime: 50000,
      annualMaintenanceCost: 12000,
      implementationMonths: 3,
    },
  },
  {
    id: 'uc-2',
    name: 'Document Summarization',
    category: 'Document Processing',
    description:
      'Automatically summarize contracts, reports, and emails so employees spend less time reading and more time acting.',
    enabled: true,
    assumptions: {
      numberOfUsers: 30,
      usageFrequencyPerUserPerDay: 5,
      minutesSavedPerInteraction: 15,
      automationRate: 0.1,
      avgInputTokensPerInteraction: 2000,
      avgOutputTokensPerInteraction: 400,
      modelId: 'gpt-4o',
      implementationCostOneTime: 35000,
      annualMaintenanceCost: 8000,
      implementationMonths: 2,
    },
  },
  {
    id: 'uc-3',
    name: 'Developer Code Assistance',
    category: 'Code Assistance',
    description:
      'In-IDE AI coding assistant that helps developers write, review and debug code faster.',
    enabled: false,
    assumptions: {
      numberOfUsers: 20,
      usageFrequencyPerUserPerDay: 20,
      minutesSavedPerInteraction: 5,
      automationRate: 0.05,
      avgInputTokensPerInteraction: 800,
      avgOutputTokensPerInteraction: 600,
      modelId: 'gpt-4o',
      implementationCostOneTime: 20000,
      annualMaintenanceCost: 5000,
      implementationMonths: 1,
    },
  },
];

export const DEFAULT_MCP_SERVERS: MCPServer[] = [
  {
    id: 'mcp-1',
    name: 'SAP ERP Connector',
    type: 'erp',
    description:
      'Connects AI to SAP ERP for real-time data retrieval and process automation.',
    endpoint: 'mcp://sap-erp-server:5000',
    authType: 'oauth2',
    enabled: false,
    estimatedMonthlyCallVolume: 10000,
    costPerCallUSD: 0.002,
    associatedUseCaseIds: ['uc-1'],
  },
  {
    id: 'mcp-2',
    name: 'SharePoint Document Store',
    type: 'document-store',
    description: 'Access and index enterprise documents from SharePoint Online.',
    endpoint: 'mcp://sharepoint-connector:5001',
    authType: 'oauth2',
    enabled: false,
    estimatedMonthlyCallVolume: 5000,
    costPerCallUSD: 0.001,
    associatedUseCaseIds: ['uc-2'],
  },
  {
    id: 'mcp-3',
    name: 'Azure SQL Database',
    type: 'database',
    description:
      'Natural language to SQL for querying business databases.',
    endpoint: 'mcp://azure-sql-server:5002',
    authType: 'api-key',
    enabled: false,
    estimatedMonthlyCallVolume: 3000,
    costPerCallUSD: 0.001,
    associatedUseCaseIds: [],
  },
];
