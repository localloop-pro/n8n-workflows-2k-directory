import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get basic counts
    const [
      totalWorkflows,
      totalIntegrations,
      totalCategories,
      triggerTypeStats,
      topCategories,
      topIntegrations,
      avgNodesPerWorkflow,
    ] = await Promise.all([
      // Total workflows
      prisma.workflow.count(),
      
      // Total integrations
      prisma.integration.count(),
      
      // Total categories
      prisma.workflow.groupBy({
        by: ['category'],
        _count: { id: true },
      }).then(result => result.length),
      
      // Trigger type distribution
      prisma.workflow.groupBy({
        by: ['triggerType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      
      // Top 5 categories
      prisma.workflow.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      
      // Top 10 integrations
      prisma.integration.findMany({
        orderBy: { usageCount: 'desc' },
        take: 10,
        select: {
          name: true,
          displayName: true,
          usageCount: true,
          category: true,
        },
      }),
      
      // Average nodes per workflow
      prisma.workflow.aggregate({
        _avg: { nodeCount: true },
      }),
    ]);
    
    // Calculate complexity distribution based on node count
    const [simpleWorkflows, mediumWorkflows, complexWorkflows] = await Promise.all([
      prisma.workflow.count({ where: { nodeCount: { lte: 5 } } }),
      prisma.workflow.count({ where: { nodeCount: { gt: 5, lte: 15 } } }),
      prisma.workflow.count({ where: { nodeCount: { gt: 15 } } }),
    ]);
    
    // Format the response
    const stats = {
      overview: {
        totalWorkflows,
        totalIntegrations,
        totalCategories,
        avgNodesPerWorkflow: Math.round(avgNodesPerWorkflow._avg.nodeCount || 0),
      },
      triggerTypes: triggerTypeStats.map(stat => ({
        type: stat.triggerType,
        count: stat._count.id,
        percentage: Math.round((stat._count.id / totalWorkflows) * 100),
      })),
      topCategories: topCategories.map(cat => ({
        name: cat.category,
        count: cat._count.id,
        percentage: Math.round((cat._count.id / totalWorkflows) * 100),
      })),
      topIntegrations,
      complexity: [
        {
          level: 'SIMPLE',
          count: simpleWorkflows,
          percentage: Math.round((simpleWorkflows / totalWorkflows) * 100),
        },
        {
          level: 'MEDIUM',
          count: mediumWorkflows,
          percentage: Math.round((mediumWorkflows / totalWorkflows) * 100),
        },
        {
          level: 'COMPLEX',
          count: complexWorkflows,
          percentage: Math.round((complexWorkflows / totalWorkflows) * 100),
        },
      ],
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
