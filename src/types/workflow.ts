export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: 'WEBHOOK' | 'SCHEDULED' | 'MANUAL' | 'COMPLEX';
  nodeCount: number;
  active: boolean;
  tags: string[];
  integrations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowsResponse {
  success: boolean;
  data: {
    workflows: Workflow[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      query: string;
      category: string | null;
      integration: string | null;
      triggerType: string | null;
    };
  };
}

export interface Category {
  name: string;
  count: number;
}

export interface Integration {
  name: string;
  displayName: string;
  category: string;
  usageCount: number;
}

export interface Stats {
  overview: {
    totalWorkflows: number;
    totalIntegrations: number;
    totalCategories: number;
    avgNodesPerWorkflow: number;
  };
  triggerTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topIntegrations: Integration[];
  complexity: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

// Add these interfaces if they don't exist
export interface WorkflowConnection {
  [key: string]: {
    node: string;
    type: string;
  }[];
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, unknown>;
}
