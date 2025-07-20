import { Workflow } from '@/types/workflow';
import IntegrationIcon from './IntegrationIcon';

interface WorkflowCardProps {
  workflow: Workflow;
  onClick?: () => void;
}

export default function WorkflowCard({ workflow, onClick }: WorkflowCardProps) {
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

  return (
    <div 
      className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer bg-white min-h-[280px] flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 flex-1 mr-2 leading-tight">
          {workflow.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${getComplexityColor(workflow.nodeCount)}`}>
          {getComplexityLabel(workflow.nodeCount)}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm line-clamp-2 mb-3 min-h-[2.5rem] flex-grow">
        {workflow.description || 'No description available'}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 text-xs">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${getTriggerTypeColor(workflow.triggerType)}`}>
          <span>{getTriggerTypeIcon(workflow.triggerType)}</span>
          <span className="hidden sm:inline">{workflow.triggerType}</span>
        </span>
        <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
          <span>📊</span>
          <span>{workflow.nodeCount} nodes</span>
        </span>
        {workflow.active && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Active</span>
          </span>
        )}
      </div>

      {/* Category */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md font-medium">
          {workflow.category}
        </span>
      </div>

      {/* Integrations */}
      <div className="flex flex-wrap gap-1 mb-3">
        {workflow.integrations.slice(0, 6).map((integration, index) => (
          <IntegrationIcon key={`${integration}-${index}`} name={integration} size="sm" />
        ))}
        {workflow.integrations.length > 6 && (
          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300">
            +{workflow.integrations.length - 6}
          </div>
        )}
      </div>

      {/* Tags */}
      {workflow.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {workflow.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={`${tag}-${index}`}
              className="inline-block px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200 font-medium"
            >
              #{tag}
            </span>
          ))}
          {workflow.tags.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200 font-medium">
              +{workflow.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
