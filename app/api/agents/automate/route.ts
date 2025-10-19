import { NextResponse } from "next/server";

// Simple in-memory storage for workflows (in production, use a database)
const workflows = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const { action, workflowId, name, prompts, contentType, settings } = await req.json();

    if (action === 'create') {
      // Create new workflow
      if (!name || !prompts || !contentType) {
        return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400 }
        );
      }

      const newWorkflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const workflow = {
        id: newWorkflowId,
        name,
        prompts,
        contentType,
        settings: settings || {},
        status: 'pending',
        progress: 0,
        results: [],
        createdAt: new Date().toISOString(),
      };

      workflows.set(newWorkflowId, workflow);

      console.log('Workflow created:', {
        workflowId: newWorkflowId,
        name,
        promptCount: prompts.length,
      });

      return NextResponse.json({
        workflowId: newWorkflowId,
        ...workflow,
        success: true,
      });
    }

    if (action === 'execute') {
      // Execute workflow
      if (!workflowId) {
        return NextResponse.json(
          { error: "Missing workflow ID" },
          { status: 400 }
        );
      }

      const workflow = workflows.get(workflowId);
      if (!workflow) {
        return NextResponse.json(
          { error: "Workflow not found" },
          { status: 404 }
        );
      }

      // Update status to running
      workflow.status = 'running';
      workflows.set(workflowId, workflow);

      // In a real implementation, this would trigger actual generation
      // For now, we'll simulate it
      console.log('Workflow execution started:', workflowId);

      return NextResponse.json({
        success: true,
        workflowId,
        message: 'Workflow execution started',
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in workflow automation:', error);
    return NextResponse.json(
      {
        error: 'Workflow operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      // Return all workflows
      const allWorkflows = Array.from(workflows.values());
      return NextResponse.json({ workflows: allWorkflows });
    }

    // Return specific workflow status
    const workflow = workflows.get(workflowId);
    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get workflow status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

