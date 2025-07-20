import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const integration = searchParams.get('integration');
    const triggerType = searchParams.get('triggerType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build where clause
    const where: Prisma.WorkflowWhereInput = {};
    
    // Text search across multiple fields (SQLite case-insensitive search)
    if (query) {
      const searchQuery = query.toLowerCase();
      where.OR = [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { searchText: { contains: searchQuery } },
        { tags: { contains: searchQuery } },
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      where.category = category;
    }
    
    // Integration filter
    if (integration && integration !== 'all') {
      where.integrations = {
        contains: integration.toLowerCase()
      };
    }
    
    // Trigger type filter
    if (triggerType && triggerType !== 'all') {
      where.triggerType = triggerType as any;
    }
    
    // Build orderBy clause
    const orderBy: Prisma.WorkflowOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder as 'asc' | 'desc';
    } else if (sortBy === 'nodeCount') {
      orderBy.nodeCount = sortOrder as 'asc' | 'desc';
    } else if (sortBy === 'category') {
      orderBy.category = sortOrder as 'asc' | 'desc';
    } else {
      orderBy.name = 'asc';
    }
    
    // Execute queries
    const [workflows, totalCount] = await Promise.all([
      prisma.workflow.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          triggerType: true,
          nodeCount: true,
          active: true,
          tags: true,
          integrations: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.workflow.count({ where }),
    ]);
    
    // Parse integrations JSON for each workflow
    const processedWorkflows = workflows.map(workflow => ({
      ...workflow,
      integrations: workflow.integrations ? JSON.parse(workflow.integrations) : [],
      tags: workflow.tags ? workflow.tags.split(',').filter(Boolean) : [],
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: {
        workflows: processedWorkflows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          query,
          category,
          integration,
          triggerType,
        },
      },
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search workflows',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
