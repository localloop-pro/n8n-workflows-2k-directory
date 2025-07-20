import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all unique categories with workflow counts
    const categories = await prisma.workflow.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });
    
    // Format the response
    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.id,
    }));
    
    // Add "All" option at the beginning
    const allCount = await prisma.workflow.count();
    const result = [
      { name: 'All', count: allCount },
      ...formattedCategories,
    ];
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
