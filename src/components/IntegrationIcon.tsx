interface IntegrationIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function IntegrationIcon({ name, size = 'sm' }: IntegrationIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  // Integration icon mapping with colors
  const integrationConfig: Record<string, { icon: string; color: string; bg: string }> = {
    // Communication & Messaging
    telegram: { icon: '📱', color: 'text-blue-700', bg: 'bg-blue-100' },
    slack: { icon: '💬', color: 'text-purple-700', bg: 'bg-purple-100' },
    discord: { icon: '🎮', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    gmail: { icon: '📧', color: 'text-red-700', bg: 'bg-red-100' },
    
    // Data & Sheets
    googlesheets: { icon: '📊', color: 'text-green-700', bg: 'bg-green-100' },
    airtable: { icon: '🗃️', color: 'text-orange-700', bg: 'bg-orange-100' },
    notion: { icon: '📝', color: 'text-gray-700', bg: 'bg-gray-100' },
    
    // Development
    github: { icon: '🐙', color: 'text-gray-800', bg: 'bg-gray-100' },
    gitlab: { icon: '🦊', color: 'text-orange-700', bg: 'bg-orange-100' },
    webhook: { icon: '🔗', color: 'text-blue-700', bg: 'bg-blue-100' },
    http: { icon: '🌐', color: 'text-blue-700', bg: 'bg-blue-100' },
    httprequest: { icon: '🌐', color: 'text-blue-700', bg: 'bg-blue-100' },
    
    // E-commerce
    shopify: { icon: '🛍️', color: 'text-green-700', bg: 'bg-green-100' },
    stripe: { icon: '💳', color: 'text-blue-700', bg: 'bg-blue-100' },
    
    // CRM & Sales
    hubspot: { icon: '🎯', color: 'text-orange-700', bg: 'bg-orange-100' },
    salesforce: { icon: '☁️', color: 'text-blue-700', bg: 'bg-blue-100' },
    pipedrive: { icon: '📈', color: 'text-green-700', bg: 'bg-green-100' },
    
    // Social Media
    twitter: { icon: '🐦', color: 'text-blue-700', bg: 'bg-blue-100' },
    linkedin: { icon: '💼', color: 'text-blue-700', bg: 'bg-blue-100' },
    facebook: { icon: '📘', color: 'text-blue-700', bg: 'bg-blue-100' },
    
    // Cloud Storage
    dropbox: { icon: '📦', color: 'text-blue-700', bg: 'bg-blue-100' },
    googledrive: { icon: '💾', color: 'text-blue-700', bg: 'bg-blue-100' },
    awss3: { icon: '☁️', color: 'text-orange-700', bg: 'bg-orange-100' },
    
    // AI & Automation
    openai: { icon: '🤖', color: 'text-green-700', bg: 'bg-green-100' },
    lmchatopenai: { icon: '🤖', color: 'text-green-700', bg: 'bg-green-100' },
    anthropic: { icon: '🧠', color: 'text-purple-700', bg: 'bg-purple-100' },
    
    // n8n specific
    manualtrigger: { icon: '▶️', color: 'text-gray-700', bg: 'bg-gray-100' },
    scheduletrigger: { icon: '⏰', color: 'text-blue-700', bg: 'bg-blue-100' },
    stickynote: { icon: '📌', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    code: { icon: '💻', color: 'text-gray-700', bg: 'bg-gray-100' },
    if: { icon: '🔀', color: 'text-purple-700', bg: 'bg-purple-100' },
    merge: { icon: '🔗', color: 'text-blue-700', bg: 'bg-blue-100' },
    agent: { icon: '🤖', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  };

  const config = integrationConfig[name.toLowerCase()] || {
    icon: '⚙️',
    color: 'text-gray-600',
    bg: 'bg-gray-100'
  };

  return (
    <div 
      className={`
        inline-flex items-center justify-center rounded-full
        ${config.bg} ${config.color} ${sizeClasses[size]}
        font-medium border border-gray-200
      `}
      title={name}
    >
      <span className="text-center leading-none">
        {config.icon}
      </span>
    </div>
  );
}
