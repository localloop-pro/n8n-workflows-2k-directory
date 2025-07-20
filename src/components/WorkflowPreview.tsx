'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkflowNode, WorkflowConnection } from '@/types/workflow';

interface ExecutionStep {
  node: WorkflowNode;
  status: 'pending' | 'running' | 'success' | 'error';
  output: any;
  duration: number;
  error?: string;
}

interface WorkflowPreviewProps {
  workflow: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection;
  };
}

export default function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [mermaidDiagram, setMermaidDiagram] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [mermaidRendered, setMermaidRendered] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    const initMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({
          startOnLoad: true,
          theme: 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });
      } catch (error) {
        console.error('Failed to load Mermaid:', error);
      }
    };
    
    initMermaid();
  }, []);

  // Generate and render Mermaid diagram
  useEffect(() => {
    if (workflow.nodes.length > 0 && mermaidRendered) {
      const diagram = generateMermaidDiagram(workflow, executionSteps);
      setMermaidDiagram(diagram);
      
      // Render the diagram
      const renderDiagram = async () => {
        try {
          const mermaid = await import('mermaid');
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
            const { svg } = await mermaid.default.render('workflow-diagram', diagram);
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Failed to render Mermaid diagram:', error);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '<div class="text-red-500 p-4">Failed to render diagram</div>';
          }
        }
      };
      
      renderDiagram();
    }
  }, [workflow, executionSteps, mermaidRendered]);

  // Set mermaid as ready after initialization
  useEffect(() => {
    const timer = setTimeout(() => setMermaidRendered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const runPreview = async () => {
    setIsRunning(true);
    setExecutionSteps([]);

    // Initialize execution steps
    const steps: ExecutionStep[] = workflow.nodes.map((node) => ({
      node,
      status: 'pending',
      output: null,
      duration: 0,
    }));

    setExecutionSteps([...steps]);

    // Simulate execution step by step
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      steps[i].status = 'running';
      setExecutionSteps([...steps]);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate errors for certain nodes (optional)
      if (showErrors && Math.random() < 0.2) {
        steps[i].status = 'error';
        steps[i].error = generateMockError(steps[i].node);
      } else {
        steps[i].status = 'success';
        steps[i].output = generateMockData(steps[i].node);
      }

      steps[i].duration = Math.random() * 300 + 100;
      setExecutionSteps([...steps]);
    }

    setIsRunning(false);
  };

  const clearPreview = () => {
    setExecutionSteps([]);
    setMermaidDiagram('');
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
    }
  };

  const downloadReport = () => {
    const report = generatePreviewReport(executionSteps);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-preview-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={runPreview}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Running...
            </>
          ) : (
            <>
              ▶️ Run Preview
            </>
          )}
        </button>

        <button
          onClick={clearPreview}
          disabled={isRunning || executionSteps.length === 0}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          🗑️ Clear
        </button>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showErrors}
            onChange={(e) => setShowErrors(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Simulate Errors</span>
        </label>

        {executionSteps.length > 0 && (
          <button
            onClick={downloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            📥 Download Report
          </button>
        )}
      </div>

      {/* Execution Results */}
      {executionSteps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mermaid Diagram */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-bold mb-3 text-gray-800">Execution Flow</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="text-xs overflow-x-auto">{mermaidDiagram}</pre>
            </div>
          </div>

          {/* Step Details */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-bold mb-3 text-gray-800">Step Details</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executionSteps.map((step, index) => (
                <StepDetail key={index} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {executionSteps.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold mb-3 text-gray-800">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {executionSteps.length}
              </div>
              <div className="text-gray-600">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {executionSteps.filter(s => s.status === 'success').length}
              </div>
              <div className="text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {executionSteps.filter(s => s.status === 'error').length}
              </div>
              <div className="text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(executionSteps.reduce((sum, s) => sum + s.duration, 0))}ms
              </div>
              <div className="text-gray-600">Total Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step Detail Component
function StepDetail({ step, index }: { step: ExecutionStep; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {index + 1}
          </span>
          <span className={`text-lg ${getStatusColor(step.status)}`}>
            {getStatusIcon(step.status)}
          </span>
          <span className="font-medium text-gray-800">
            {step.node.name || step.node.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {step.duration}ms
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {step.error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-sm font-medium text-red-800">Error:</div>
              <div className="text-sm text-red-700">{step.error}</div>
            </div>
          )}
          
          {step.output && (
            <div className="bg-gray-50 border rounded p-2">
              <div className="text-sm font-medium text-gray-800 mb-1">Output:</div>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Functions
function generateMermaidDiagram(workflow: any, executionSteps: ExecutionStep[]) {
  const nodes = workflow.nodes.map((node: any, index: number) => {
    const step = executionSteps[index];
    let color = '#e5e7eb'; // default gray
    
    if (step) {
      switch (step.status) {
        case 'success': color = '#10b981'; break; // green
        case 'error': color = '#ef4444'; break; // red
        case 'running': color = '#3b82f6'; break; // blue
      }
    }

    return `  ${index}["${node.name || node.type}"]:::${step?.status || 'pending'}`;
  });

  const connections = workflow.connections ? 
    Object.entries(workflow.connections).map(([source, targets]: [string, any]) => {
      if (Array.isArray(targets)) {
        return targets.map((target: any) => 
          `  ${source} --> ${target.node}`
        ).join('\n');
      }
      return `  ${source} --> ${targets.node}`;
    }).join('\n') : '';

  return `graph TD
${nodes.join('\n')}
${connections}

classDef pending fill:#e5e7eb,stroke:#6b7280,stroke-width:2px
classDef running fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
classDef success fill:#d1fae5,stroke:#10b981,stroke-width:2px
classDef error fill:#fee2e2,stroke:#ef4444,stroke-width:2px`;
}

function generateMockData(node: WorkflowNode) {
  const nodeType = node.type?.toLowerCase() || '';
  
  // Sample data templates for different node types
  const templates: { [key: string]: any } = {
    'http': {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { message: 'Success', data: { id: 123, name: 'Sample Item' } }
    },
    'gmail': {
      messages: [
        {
          id: 'msg_123',
          subject: 'Test Email',
          from: 'sender@example.com',
          body: 'This is a test email body'
        }
      ]
    },
    'slack': {
      channel: '#general',
      message: 'Test message sent successfully',
      timestamp: new Date().toISOString()
    },
    'googlesheets': {
      rows: [
        ['ID', 'Name', 'Email'],
        ['1', 'John Doe', 'john@example.com'],
        ['2', 'Jane Smith', 'jane@example.com']
      ]
    },
    'airtable': {
      records: [
        { id: 'rec123', fields: { Name: 'Sample Record', Status: 'Active' } }
      ]
    },
    'webhook': {
      payload: { event: 'test', data: { id: 456, action: 'created' } },
      headers: { 'x-signature': 'abc123' }
    }
  };

  // Find matching template or return generic data
  for (const [key, template] of Object.entries(templates)) {
    if (nodeType.includes(key)) {
      return template;
    }
  }

  // Generic template
  return {
    success: true,
    data: { id: Math.floor(Math.random() * 1000), timestamp: new Date().toISOString() },
    metadata: { nodeType: node.type, processedAt: new Date().toISOString() }
  };
}

function generateMockError(node: WorkflowNode) {
  const errors = [
    'API rate limit exceeded',
    'Invalid authentication credentials',
    'Network timeout',
    'Data validation failed',
    'Service temporarily unavailable',
    'Invalid input format',
    'Permission denied'
  ];
  
  return errors[Math.floor(Math.random() * errors.length)];
}

function generatePreviewReport(executionSteps: ExecutionStep[]) {
  const timestamp = new Date().toISOString();
  const summary = {
    totalSteps: executionSteps.length,
    successful: executionSteps.filter(s => s.status === 'success').length,
    errors: executionSteps.filter(s => s.status === 'error').length,
    totalDuration: executionSteps.reduce((sum, s) => sum + s.duration, 0)
  };

  let report = `Workflow Preview Report
Generated: ${timestamp}
=====================================

Summary:
- Total Steps: ${summary.totalSteps}
- Successful: ${summary.successful}
- Errors: ${summary.errors}
- Total Duration: ${summary.totalDuration}ms

Execution Details:
`;

  executionSteps.forEach((step, index) => {
    report += `\n${index + 1}. ${step.node.name || step.node.type}
   Status: ${step.status}
   Duration: ${step.duration}ms`;
    
    if (step.error) {
      report += `\n   Error: ${step.error}`;
    }
    
    if (step.output) {
      report += `\n   Output: ${JSON.stringify(step.output, null, 2)}`;
    }
  });

  return report;
} 