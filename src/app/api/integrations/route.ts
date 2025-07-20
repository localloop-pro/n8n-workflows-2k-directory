import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const sortBy = searchParams.get('sortBy') || 'usageCount';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'usageCount') {
      orderBy.usageCount = sortOrder;
    } else {
      orderBy.usageCount = 'desc';
    }
    
    // Get integrations
    const integrations = await prisma.integration.findMany({
      orderBy,
      take: limit,
      select: {
        name: true,
        displayName: true,
        category: true,
        usageCount: true,
      },
    });
    
    // Get total count
    const totalCount = await prisma.integration.count();
    
    return NextResponse.json({
      success: true,
      data: {
        integrations,
        totalCount,
      },
    });
    
  } catch (error) {
    console.error('Integrations API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
