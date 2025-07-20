# 🚀 n8n Workflows Directory

A comprehensive, searchable directory of 2,053+ n8n automation workflows with advanced filtering, categorization, and analytics.

## ✨ Features

- **🔍 Advanced Search**: Full-text search across workflow names, descriptions, and content
- **📊 Smart Filtering**: Filter by categories, integrations, trigger types, and complexity
- **📈 Analytics Dashboard**: Comprehensive statistics and usage insights
- **🎯 Workflow Details**: Detailed view with JSON export and download capabilities
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **⚡ High Performance**: Optimized for large datasets with efficient pagination

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Search**: Fuse.js for fuzzy search capabilities
- **Deployment**: Docker, Coolify hosting platform

## 📊 Dataset

- **2,053+ Workflows**: Complete collection of n8n automation workflows
- **487 Integrations**: Comprehensive integration coverage
- **15 Categories**: Organized workflow categorization
- **Real-time Stats**: Live analytics and usage metrics

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone <your-repo-url>
cd n8n-workflows-directory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with workflow data
npm run seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Coolify deployment instructions.

## 📁 Project Structure

```
n8n-workflows-directory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── stats/             # Analytics page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── WorkflowGrid.tsx   # Main workflow display
│   │   ├── WorkflowCard.tsx   # Individual workflow cards
│   │   ├── WorkflowDetail.tsx # Workflow detail modal
│   │   ├── SearchFilters.tsx  # Search and filter UI
│   │   └── StatsDashboard.tsx # Analytics dashboard
│   ├── lib/                   # Utilities and database
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema and migrations
├── scripts/                   # Data ingestion and deployment
├── workflows/                 # Source workflow JSON files (2,053+)
├── context/                   # Categorization data
├── Dockerfile                 # Container configuration
└── DEPLOYMENT.md             # Deployment guide
```

## 🔧 API Endpoints

- `GET /api/workflows` - List workflows with search and filtering
- `GET /api/workflows/[id]` - Get specific workflow details
- `GET /api/categories` - List all categories with counts
- `GET /api/integrations` - List all integrations with usage stats
- `GET /api/stats` - Get comprehensive analytics data

## 🎯 Key Components

### WorkflowGrid
Main component displaying workflows in a responsive grid with search, filtering, and pagination.

### SearchFilters
Advanced filtering sidebar with category, integration, and trigger type filters.

### WorkflowDetail
Modal component showing detailed workflow information with JSON viewing and download capabilities.

### StatsDashboard
Analytics dashboard with charts and metrics about workflow usage and distribution.

## 📊 Database Schema

- **Workflows**: Core workflow data with metadata and search optimization
- **Integrations**: Integration definitions with usage statistics
- **Categories**: Hierarchical category system
- **SearchIndex**: Optimized search content for fast queries

## 🚀 Deployment Ready

The application is fully configured for production deployment:

- ✅ Docker containerization
- ✅ PostgreSQL production database
- ✅ Environment configuration
- ✅ Build optimization
- ✅ Coolify hosting support

## 📈 Performance

- **Fast Search**: Optimized database queries with proper indexing
- **Efficient Pagination**: Load workflows on-demand
- **Responsive UI**: Smooth interactions even with large datasets
- **Optimized Build**: Production-ready with code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) or check the application logs for detailed error information.

---

**Built with ❤️ for the n8n community**
