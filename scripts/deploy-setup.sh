#!/bin/bash

# Deployment Setup Script for Coolify
# This script prepares the application for production deployment

set -e

echo "🚀 Setting up n8n Workflows Directory for production deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 2. Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# 3. Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# 4. Seed the database with workflow data
echo "🌱 Seeding database with workflow data..."
npm run seed

# 5. Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Deployment setup complete!"
echo ""
echo "📋 Next steps for Coolify:"
echo "1. Create a new service in Coolify"
echo "2. Connect your Git repository"
echo "3. Set up PostgreSQL database"
echo "4. Configure environment variables:"
echo "   - DATABASE_URL (from PostgreSQL service)"
echo "   - NEXT_PUBLIC_APP_URL (your domain)"
echo "   - NODE_ENV=production"
echo "5. Deploy!"
