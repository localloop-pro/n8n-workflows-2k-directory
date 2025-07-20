import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }
    
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const processedWorkflow = {
      ...workflow,
      integrations: workflow.integrations ? JSON.parse(workflow.integrations) : [],
      tags: workflow.tags ? workflow.tags.split(',').filter(Boolean) : [],
      workflowData: workflow.workflowData ? JSON.parse(workflow.workflowData) : null,
    };
    
    return NextResponse.json({
      success: true,
      data: processedWorkflow,
    });
    
  } catch (error) {
    console.error('Get workflow API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
