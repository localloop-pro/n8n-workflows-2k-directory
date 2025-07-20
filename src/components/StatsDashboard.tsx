'use client';

import { useState, useEffect } from 'react';
import { Stats } from '@/types/workflow';

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error('API returned error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm sm:text-base">Failed to load statistics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats.overview.totalWorkflows.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium">Total Workflows</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.overview.totalIntegrations}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium">Integrations</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats.overview.totalCategories}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium">Categories</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {stats.overview.avgNodesPerWorkflow}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium">Avg Nodes</div>
          </div>
        </div>
      </div>

      {/* Trigger Types */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Trigger Types</h3>
        <div className="space-y-3">
          {stats.triggerTypes.map((trigger) => (
            <div key={trigger.type} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base sm:text-lg flex-shrink-0">
                  {trigger.type === 'WEBHOOK' ? '🔗' : 
                   trigger.type === 'SCHEDULED' ? '⏰' : 
                   trigger.type === 'MANUAL' ? '▶️' : '🔄'}
                </span>
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{trigger.type}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${trigger.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 w-8 sm:w-12 text-right font-medium">
                  {trigger.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        <div className="space-y-3">
          {stats.topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-gray-500 w-4 flex-shrink-0">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{category.name}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  {category.count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600">
                  ({category.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Integrations */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Integrations</h3>
        <div className="space-y-3">
          {stats.topIntegrations.slice(0, 10).map((integration, index) => (
            <div key={integration.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-gray-500 w-4 flex-shrink-0">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{integration.displayName}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  {integration.usageCount.toLocaleString()} uses
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complexity Distribution */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Complexity Distribution</h3>
        <div className="space-y-3">
          {stats.complexity.map((comp) => (
            <div key={comp.level} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  comp.level === 'SIMPLE' ? 'bg-green-100 text-green-800 border-green-200' :
                  comp.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {comp.level}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      comp.level === 'SIMPLE' ? 'bg-green-500' :
                      comp.level === 'MEDIUM' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${comp.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 w-8 sm:w-12 text-right font-medium">
                  {comp.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
