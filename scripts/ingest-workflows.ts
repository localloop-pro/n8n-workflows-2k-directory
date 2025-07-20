import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Concurrency control (10 files at a time)
const limit = pLimit(10);

// Types for workflow data
type TriggerType = 'WEBHOOK' | 'SCHEDULED' | 'MANUAL' | 'COMPLEX';
type Complexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX';

async function main() {
  try {
    console.log('Starting workflow ingestion...');
    
    // 1. Load categorization data
    const searchCategories = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../context/search_categories.json'), 'utf-8')
    );

    // 2. Get all workflow files
    const workflowFiles = await glob(path.join(__dirname, '../../workflows/*.json'));
    const totalFiles = workflowFiles.length;
    console.log(`Found ${totalFiles} workflow files to process`);
    
    if (totalFiles === 0) {
      throw new Error('No workflow files found! Verify path: ../workflows/*.json');
    }

    // 3. Process files in batches
    let processed = 0;
    const batchSize = 100;
    
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = workflowFiles.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1}/${Math.ceil(totalFiles/batchSize)}`);

      await Promise.all(batch.map(filePath => 
        limit(() => processSingleFile(filePath, searchCategories))
      ));
      
      processed += batch.length;
      console.log(`Progress: ${processed}/${totalFiles} (${Math.round(processed/totalFiles*100)}%)`);
    }

    console.log('✅ Workflow ingestion completed successfully!');
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function processSingleFile(filePath: string, searchCategories: any) {
  try {
    const fileName = path.basename(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const workflow = JSON.parse(fileContent);
    
    // Extract key data
    const categoryData = searchCategories.find((item: any) => item.filename === fileName);
    const category = categoryData?.category || 'Business Process Automation';
    const integrations = extractIntegrations(workflow.nodes);
    const triggerType = detectTriggerType(workflow.nodes);
    const complexity = detectComplexity(workflow.nodes);
    
    // Prepare database record
    const record = {
      id: fileName,
      name: workflow.name || fileName.replace(/_/g, ' ').replace('.json', ''),
      description: workflow.description || '',
      category,
      triggerType,
      nodeCount: workflow.nodes?.length || 0,
      active: Boolean(workflow.active),
      tags: (workflow.tags || []).join(','),
      integrations: JSON.stringify(integrations),
      workflowData: JSON.stringify(workflow),
      searchText: generateSearchText(workflow, integrations),
    };

    // Upsert record
    await prisma.workflow.upsert({
      where: { id: fileName },
      update: record,
      create: record,
    });

    // Process integrations
    for (const integrationName of integrations) {
      await prisma.integration.upsert({
        where: { name: integrationName },
        update: {
          usageCount: {
            increment: 1
          }
        },
        create: {
          name: integrationName,
          displayName: integrationName,
          category: getIntegrationCategory(integrationName),
          usageCount: 1,
        }
      });
    }
    
    return fileName;
  } catch (error) {
    console.error(`⚠️ Failed to process ${filePath}:`, error);
    return null;
  }
}

// Helper functions
function extractIntegrations(nodes: any[]): string[] {
  const integrations = new Set<string>();
  nodes?.forEach(node => {
    if (node.type && node.type.includes('.')) {
      const parts = node.type.split('.');
      if (parts.length > 1) {
        const service = parts[parts.length - 1];
        if (service && service !== 'start' && service !== 'set') {
          integrations.add(service);
        }
      }
    }
  });
  return Array.from(integrations);
}

function detectTriggerType(nodes: any[]): TriggerType {
  if (!nodes?.length) return 'MANUAL';
  
  const firstNode = nodes[0];
  if (firstNode?.type?.includes('schedule') || firstNode?.type?.includes('cron')) return 'SCHEDULED';
  if (firstNode?.type?.includes('webhook')) return 'WEBHOOK';
  if (nodes.length > 10) return 'COMPLEX';
  return 'MANUAL';
}

function detectComplexity(nodes: any[]): Complexity {
  if (!nodes?.length) return 'SIMPLE';
  if (nodes.length > 15) return 'COMPLEX';
  if (nodes.length > 5) return 'MEDIUM';
  return 'SIMPLE';
}

function generateSearchText(workflow: any, integrations: string[]): string {
  const searchParts = [
    workflow.name || '',
    workflow.description || '',
    integrations.join(' '),
    (workflow.tags || []).join(' '),
  ];
  
  // Add node names and parameters for deeper search
  if (workflow.nodes) {
    workflow.nodes.forEach((node: any) => {
      if (node.name) searchParts.push(node.name);
      if (node.parameters) {
        // Extract searchable text from parameters
        const paramText = JSON.stringify(node.parameters)
          .replace(/[{}",]/g, ' ')
          .replace(/\s+/g, ' ');
        searchParts.push(paramText);
      }
    });
  }
  
  return searchParts.join(' ').toLowerCase().trim();
}

function getIntegrationCategory(integrationName: string): string {
  const categoryMap: Record<string, string> = {
    'telegram': 'Communication & Messaging',
    'slack': 'Communication & Messaging',
    'discord': 'Communication & Messaging',
    'gmail': 'Communication & Messaging',
    'googlesheets': 'Data Processing & Analysis',
    'airtable': 'Data Processing & Analysis',
    'notion': 'Project Management',
    'trello': 'Project Management',
    'asana': 'Project Management',
    'github': 'Technical Infrastructure & DevOps',
    'gitlab': 'Technical Infrastructure & DevOps',
    'shopify': 'E-commerce & Retail',
    'stripe': 'Financial & Accounting',
    'paypal': 'Financial & Accounting',
    'hubspot': 'CRM & Sales',
    'salesforce': 'CRM & Sales',
    'pipedrive': 'CRM & Sales',
    'mailchimp': 'Marketing & Advertising Automation',
    'sendgrid': 'Marketing & Advertising Automation',
    'twitter': 'Social Media Management',
    'linkedin': 'Social Media Management',
    'facebook': 'Social Media Management',
    'youtube': 'Creative Content & Video Automation',
    'wordpress': 'Creative Content & Video Automation',
    'dropbox': 'Cloud Storage & File Management',
    'googledrive': 'Cloud Storage & File Management',
    'awss3': 'Cloud Storage & File Management',
    'http': 'Web Scraping & Data Extraction',
    'webhook': 'Technical Infrastructure & DevOps',
    'openai': 'AI Agent Development',
    'anthropic': 'AI Agent Development',
  };

  const lowerName = integrationName.toLowerCase();
  return categoryMap[lowerName] || 'Business Process Automation';
}

// Execute
main()
  .catch(e => console.error('Fatal error:', e))
  .finally(() => process.exit(0));
