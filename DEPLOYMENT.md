# 🚀 Coolify Deployment Guide

This guide will help you deploy the n8n Workflows Directory to your Coolify hosting environment.

## 📋 Prerequisites

- Coolify instance running
- Git repository with this code
- Domain name (optional but recommended)

## 🛠️ Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository contains all the deployment files:
- ✅ `Dockerfile` - Container configuration
- ✅ `next.config.ts` - Next.js production config
- ✅ `prisma/schema.prisma` - Database schema (PostgreSQL)
- ✅ `scripts/deploy-setup.sh` - Deployment automation
- ✅ `.env.production` - Environment template

### 2. Create Services in Coolify

#### A. Create PostgreSQL Database
1. Go to your Coolify dashboard
2. Click "New Resource" → "Database" → "PostgreSQL"
3. Configure:
   - **Name**: `n8n-workflows-db`
   - **Database Name**: `n8n_workflows`
   - **Username**: `n8n_user`
   - **Password**: Generate a strong password
4. Deploy the database
5. **Save the connection details** - you'll need them for the app

#### B. Create the Application
1. Click "New Resource" → "Application"
2. Connect your Git repository
3. Configure:
   - **Name**: `n8n-workflows-directory`
   - **Build Pack**: Docker
   - **Port**: `3000`
   - **Dockerfile**: `Dockerfile` (should auto-detect)

### 3. Configure Environment Variables

In your Coolify application settings, add these environment variables:

```bash
# Database (use your PostgreSQL connection details)
DATABASE_URL=postgresql://n8n_user:your_password@n8n-workflows-db:5432/n8n_workflows

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://aiflows.localloop.ai
PORT=3000

# Optional
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=info
```

**Important**: Replace the DATABASE_URL with your actual PostgreSQL connection string from step 2A.

### 4. Deploy the Application

1. Click "Deploy" in your Coolify application
2. Monitor the build logs for any errors
3. The deployment process will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Seed the database with workflow data
   - Build the Next.js application
   - Start the production server

### 5. Post-Deployment Setup

#### A. Verify Database Migration
Check the logs to ensure:
- ✅ Database tables were created
- ✅ Workflow data was seeded successfully
- ✅ Application started without errors

#### B. Configure Domain (Optional)
1. In Coolify, go to your application settings
2. Add your custom domain
3. Enable SSL certificate (Let's Encrypt)

#### C. Test the Application
Visit your deployed application and verify:
- ✅ Homepage loads with workflow grid
- ✅ Search and filtering work
- ✅ Workflow details modal opens
- ✅ Statistics page loads
- ✅ All 2,053+ workflows are accessible

## 🔧 Troubleshooting

### Common Issues

#### Build Fails
- Check that all dependencies are in `package.json`
- Verify Dockerfile syntax
- Check build logs for specific errors

#### Database Connection Issues
- Verify DATABASE_URL format
- Ensure PostgreSQL service is running
- Check network connectivity between services

#### Application Won't Start
- Check PORT environment variable (should be 3000)
- Verify all required environment variables are set
- Check application logs for startup errors

#### Missing Workflow Data
- Check if the seed script ran successfully
- Verify workflow JSON files are in the repository
- Check database for populated tables

### Debug Commands

If you need to debug, you can run these commands in the container:

```bash
# Check database connection
npx prisma db pull

# Re-run migrations
npx prisma migrate deploy

# Re-seed data
npm run seed

# Check application status
npm run build
```

## 📊 Performance Optimization

### For Large Datasets (2,053+ workflows)

1. **Database Indexing**: Already configured in Prisma schema
2. **Connection Pooling**: PostgreSQL handles this automatically
3. **Caching**: Consider adding Redis for frequently accessed data
4. **CDN**: Use Coolify's built-in CDN for static assets

### Monitoring

Monitor these metrics:
- Response times for API endpoints
- Database query performance
- Memory usage
- Error rates

## 🔄 Updates and Maintenance

### Updating the Application
1. Push changes to your Git repository
2. Coolify will auto-deploy (if enabled) or manually trigger deployment
3. Database migrations will run automatically

### Backup Strategy
- Coolify automatically backs up PostgreSQL databases
- Consider exporting workflow data periodically
- Keep your Git repository as the source of truth

## 🎯 Production Checklist

Before going live:
- [ ] Database is properly configured and accessible
- [ ] All environment variables are set
- [ ] SSL certificate is configured
- [ ] Domain is pointing to your Coolify instance
- [ ] All 2,053+ workflows are loaded and searchable
- [ ] Search and filtering functionality works
- [ ] Statistics dashboard displays correct data
- [ ] Error handling works gracefully
- [ ] Performance is acceptable under load

## 🆘 Support

If you encounter issues:
1. Check Coolify logs for detailed error messages
2. Verify all configuration steps were followed
3. Test locally with production environment variables
4. Check the GitHub repository for updates

---

**🎉 Congratulations!** Your n8n Workflows Directory should now be live and accessible to users worldwide!
