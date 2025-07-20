'use client';

import { useState, useEffect } from 'react';
import { Category, Integration } from '@/types/workflow';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    query: string;
    category: string;
    integration: string;
    triggerType: string;
  }) => void;
  isLoading?: boolean;
}

export default function SearchFilters({ onFiltersChange, isLoading }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState('all');
  const [selectedTriggerType, setSelectedTriggerType] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch categories and integrations
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, integrationsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/integrations?limit=50')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data);
        }

        if (integrationsRes.ok) {
          const integrationsData = await integrationsRes.json();
          setIntegrations(integrationsData.data.integrations);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      query,
      category: selectedCategory,
      integration: selectedIntegration,
      triggerType: selectedTriggerType,
    });
  }, [query, selectedCategory, selectedIntegration, selectedTriggerType, onFiltersChange]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedIntegration('all');
    setSelectedTriggerType('all');
  };

  const hasActiveFilters = query || selectedCategory !== 'all' || selectedIntegration !== 'all' || selectedTriggerType !== 'all';

  const triggerTypes = [
    { value: 'all', label: 'All Triggers', icon: '🔄' },
    { value: 'WEBHOOK', label: 'Webhook', icon: '🔗' },
    { value: 'SCHEDULED', label: 'Scheduled', icon: '⏰' },
    { value: 'MANUAL', label: 'Manual', icon: '▶️' },
    { value: 'COMPLEX', label: 'Complex', icon: '🔄' },
  ];

  return (
    <div className="bg-white border-r border-gray-200 h-full">
      {/* Mobile Toggle */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900">Filters</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Filters Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Workflows
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active filters</span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Trigger Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <div className="space-y-1">
              {triggerTypes.map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="triggerType"
                    value={type.value}
                    checked={selectedTriggerType === type.value}
                    onChange={(e) => setSelectedTriggerType(e.target.value)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900"
              disabled={isLoading}
            >
              {categories.map((category) => (
                <option key={category.name} value={category.name === 'All' ? 'all' : category.name} className="bg-white text-gray-900">
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Integration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Integration
            </label>
            <select
              value={selectedIntegration}
              onChange={(e) => setSelectedIntegration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900"
              disabled={isLoading}
            >
              <option value="all" className="bg-white text-gray-900">All Integrations</option>
              {integrations.map((integration) => (
                <option key={integration.name} value={integration.name} className="bg-white text-gray-900">
                  {integration.displayName} ({integration.usageCount})
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
