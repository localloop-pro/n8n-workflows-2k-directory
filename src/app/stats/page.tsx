import StatsDashboard from '@/components/StatsDashboard';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Workflow Analytics
          </h1>
          <p className="text-gray-600">
            Insights and statistics from the n8n workflows directory
          </p>
        </div>
        
        <StatsDashboard />
      </div>
    </div>
  );
}
