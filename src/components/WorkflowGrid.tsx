'use client';

import { useState, useEffect, useCallback } from 'react';
import { Workflow, WorkflowsResponse } from '@/types/workflow';
import WorkflowCard from './WorkflowCard';
import SearchFilters from './SearchFilters';
import WorkflowDetail from './WorkflowDetail';

export default function WorkflowGrid() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    query: '',
    category: 'all',
    integration: 'all',
    triggerType: 'all',
  });

  // Fetch workflows with current filters and pagination
  const fetchWorkflows = useCallback(async (page = 1, resetResults = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to params
      if (filters.query) params.append('q', filters.query);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.integration !== 'all') params.append('integration', filters.integration);
      if (filters.triggerType !== 'all') params.append('triggerType', filters.triggerType);

      const response = await fetch(`/api/workflows?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data: WorkflowsResponse = await response.json();
      
      if (data.success) {
        if (resetResults || page === 1) {
          setWorkflows(data.data.workflows);
        } else {
          // Append for infinite scroll
          setWorkflows(prev => [...prev, ...data.data.workflows]);
        }
        setPagination(data.data.pagination);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Fetch workflows when filters change
  useEffect(() => {
    fetchWorkflows(1, true);
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchWorkflows(1, true);
  }, []);

  // Load more workflows
  const loadMore = () => {
    if (pagination.hasNextPage && !isLoading) {
      fetchWorkflows(pagination.page + 1, false);
    }
  };

  // Handle workflow card click
  const handleWorkflowClick = (workflow: Workflow) => {
    setSelectedWorkflowId(workflow.id);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              n8n Workflows Directory
            </h1>
            <p className="text-gray-600 text-sm">
              Discover and explore {pagination.totalCount.toLocaleString()} automation workflows
            </p>
          </div>
          
          {/* Mobile Filters */}
          <SearchFilters 
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
          
          {/* Mobile Content */}
          <div className="p-4">
            {/* Results Summary */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                {isLoading && workflows.length === 0 ? (
                  'Loading workflows...'
                ) : error ? (
                  <span className="text-red-600">Error: {error}</span>
                ) : (
                  <>
                    Showing {workflows.length} of {pagination.totalCount.toLocaleString()} workflows
                    {(filters.query || filters.category !== 'all' || filters.integration !== 'all' || filters.triggerType !== 'all') && (
                      <span className="ml-2 text-blue-600">
                        (filtered)
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value="name">Name</option>
                  <option value="nodeCount">Complexity</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          {/* Desktop Sidebar Filters */}
          <div className="w-80 flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200">
            <SearchFilters 
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Desktop Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Desktop Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  n8n Workflows Directory
                </h1>
                <p className="text-gray-600">
                  Discover and explore {pagination.totalCount.toLocaleString()} automation workflows
                </p>
              </div>

              {/* Desktop Results Summary */}
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isLoading && workflows.length === 0 ? (
                    'Loading workflows...'
                  ) : error ? (
                    <span className="text-red-600">Error: {error}</span>
                  ) : (
                    <>
                      Showing {workflows.length} of {pagination.totalCount.toLocaleString()} workflows
                      {(filters.query || filters.category !== 'all' || filters.integration !== 'all' || filters.triggerType !== 'all') && (
                        <span className="ml-2 text-blue-600">
                          (filtered)
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                    <option value="name">Name</option>
                    <option value="nodeCount">Complexity</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <span className="text-red-700">Failed to load workflows: {error}</span>
                  </div>
                  <button 
                    onClick={() => fetchWorkflows(1, true)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Workflows Grid - Desktop */}
              {workflows.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
                    {workflows.map((workflow) => (
                      <WorkflowCard
                        key={workflow.id}
                        workflow={workflow}
                        onClick={() => handleWorkflowClick(workflow)}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {pagination.hasNextPage && (
                    <div className="flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More
                            <span className="text-blue-200">
                              ({pagination.totalCount - workflows.length} remaining)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : !isLoading && !error ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No workflows found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={() => setFilters({
                      query: '',
                      category: 'all',
                      integration: 'all',
                      triggerType: 'all',
                    })}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : null}

              {/* Loading State for Initial Load - Desktop */}
              {isLoading && workflows.length === 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="flex gap-2 mb-3">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="lg:hidden px-4 pb-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">Failed to load workflows: {error}</span>
              </div>
              <button 
                onClick={() => fetchWorkflows(1, true)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Workflows Grid - Mobile */}
          {workflows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onClick={() => handleWorkflowClick(workflow)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {pagination.hasNextPage && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <span className="text-blue-200 hidden sm:inline">
                          ({pagination.totalCount - workflows.length} remaining)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : !isLoading && !error ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                No workflows found
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => setFilters({
                  query: '',
                  category: 'all',
                  integration: 'all',
                  triggerType: 'all',
                })}
                className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base"
              >
                Clear all filters
              </button>
            </div>
          ) : null}

          {/* Loading State for Initial Load - Mobile */}
          {isLoading && workflows.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex gap-2 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflowId && (
        <WorkflowDetail
          workflowId={selectedWorkflowId}
          onClose={() => setSelectedWorkflowId(null)}
        />
      )}
    </>
  );
}
