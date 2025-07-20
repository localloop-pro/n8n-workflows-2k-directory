'use client';

import { useState, useEffect } from 'react';
import { Workflow } from '@/types/workflow';
import IntegrationIcon from './IntegrationIcon';
import WorkflowPreview from './WorkflowPreview';

interface WorkflowDetailProps {
  workflowId: string;
  onClose: () => void;
}

export default function WorkflowDetail({ workflowId, onClose }: WorkflowDetailProps) {
  const [workflow, setWorkflow] = useState<Workflow & { workflowData?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workflow');
        }
        const data = await response.json();
        if (data.success) {
          setWorkflow(data.data);
        } else {
          throw new Error('API returned error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-red-600">Error</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-red-700 text-sm sm:text-base">Failed to load workflow: {error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const getComplexityColor = (nodeCount: number) => {
    if (nodeCount <= 5) return 'bg-green-100 text-green-800';
    if (nodeCount <= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getComplexityLabel = (nodeCount: number) => {
    if (nodeCount <= 5) return 'SIMPLE';
    if (nodeCount <= 15) return 'MEDIUM';
    return 'COMPLEX';
  };

  const getTriggerTypeIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'WEBHOOK': return '🔗';
      case 'SCHEDULED': return '⏰';
      case 'MANUAL': return '▶️';
      case 'COMPLEX': return '🔄';
      default: return '⚙️';
    }
  };

  const getTriggerTypeColor = (triggerType: string) => {
    switch (triggerType) {
      case 'WEBHOOK': return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED': return 'bg-purple-100 text-purple-800';
      case 'MANUAL': return 'bg-gray-100 text-gray-800';
      case 'COMPLEX': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Transform workflow data for preview component
  const getPreviewWorkflowData = () => {
    if (!workflow.workflowData) return { nodes: [], connections: {} };
    
    try {
      const data = workflow.workflowData;
      return {
        nodes: data.nodes || [],
        connections: data.connections || {}
      };
    } catch (error) {
      console.error('Error parsing workflow data for preview:', error);
      return { nodes: [], connections: {} };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 pr-2 break-words">{workflow.name}</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{workflow.description || 'No description available'}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTriggerTypeColor(workflow.triggerType)}`}>
                  <span>{getTriggerTypeIcon(workflow.triggerType)}</span>
                  <span className="hidden sm:inline">{workflow.triggerType}</span>
                </span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getComplexityColor(workflow.nodeCount)}`}>
                  {getComplexityLabel(workflow.nodeCount)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium">
                  <span>📊</span>
                  <span>{workflow.nodeCount} nodes</span>
                </span>
                {workflow.active && (
                  <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs sm:text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Active</span>
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <span className="inline-block px-2 sm:px-3 py-1 bg-blue-50 text-blue-800 text-xs sm:text-sm rounded-md font-medium border border-blue-200">
                  {workflow.category}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl ml-2 sm:ml-4 flex-shrink-0 font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="sm:hidden">📋</span>
              <span className="hidden sm:inline">📋 Details</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="sm:hidden">▶️</span>
              <span className="hidden sm:inline">▶️ Run Preview</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'details' && (
            <>
              {/* Integrations */}
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Integrations ({workflow.integrations.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {workflow.integrations.map((integration, index) => (
                    <div key={`${integration}-${index}`} className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <IntegrationIcon name={integration} size="sm" />
                      <span className="text-xs sm:text-sm font-medium text-gray-800">{integration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {workflow.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Tags ({workflow.tags.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag, index) => (
                      <span 
                        key={`${tag}-${index}`}
                        className="inline-block px-2 sm:px-3 py-1 bg-blue-50 text-blue-800 text-xs sm:text-sm rounded-md border border-blue-200 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow JSON */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Workflow Configuration</h3>
                  <button
                    onClick={() => setShowJson(!showJson)}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm font-medium"
                  >
                    {showJson ? 'Hide JSON' : 'Show JSON'}
                  </button>
                </div>
                
                {showJson && workflow.workflowData && (
                  <div className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96">
                    <pre className="text-xs sm:text-sm">
                      {JSON.stringify(workflow.workflowData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
                <div className="bg-gray-50 p-2 sm:p-3 rounded border">
                  <strong className="text-gray-900">Created:</strong> {new Date(workflow.createdAt).toLocaleDateString()}
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded border">
                  <strong className="text-gray-900">Updated:</strong> {new Date(workflow.updatedAt).toLocaleDateString()}
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded border">
                  <strong className="text-gray-900">Workflow ID:</strong> <span className="break-all">{workflow.id}</span>
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded border">
                  <strong className="text-gray-900">Status:</strong> {workflow.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🔮 Workflow Execution Preview</h3>
                <p className="text-blue-800 text-sm">
                  Test this workflow execution without actually running it. The preview will simulate each node's behavior 
                  and show you the expected data flow, timing, and potential issues.
                </p>
              </div>
              
              <WorkflowPreview workflow={getPreviewWorkflowData()} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            {activeTab === 'details' && (
              <button
                onClick={() => {
                  if (workflow.workflowData) {
                    const blob = new Blob([JSON.stringify(workflow.workflowData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${workflow.name}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm font-medium"
              >
                📥 Download JSON
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs sm:text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
