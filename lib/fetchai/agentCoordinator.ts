/**
 * Agent Coordinator
 * Manages and coordinates multiple autonomous agents
 */

import {
  ContentOptimizationAgent,
  WorkflowAutomationAgent,
  QualityAssuranceAgent,
  TrendAnalysisAgent,
  createAgents,
  type AgentSuggestion,
  type ContentAnalysis,
} from './agents';

export interface CoordinatorConfig {
  autoOptimize: boolean;
  autoAnalyze: boolean;
  enableTrends: boolean;
  enableWorkflows: boolean;
}

export interface AgentTask {
  id: string;
  agentType: 'optimization' | 'automation' | 'quality' | 'trends';
  action: string;
  params: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class AgentCoordinator {
  private config: CoordinatorConfig;
  private agents: {
    optimization: ContentOptimizationAgent;
    automation: WorkflowAutomationAgent;
    quality: QualityAssuranceAgent;
    trends: TrendAnalysisAgent;
  };
  private tasks: Map<string, AgentTask> = new Map();
  private taskQueue: AgentTask[] = [];
  private isProcessing = false;

  constructor(config: CoordinatorConfig) {
    this.config = config;
    this.agents = createAgents(true);
  }

  /**
   * Process content generation request with agent assistance
   */
  async processContentGeneration(params: {
    prompt: string;
    contentType: 'video' | 'image';
    model: string;
    aspectRatio?: string;
  }): Promise<{
    prompt: string;
    optimized: boolean;
    suggestions: AgentSuggestion[];
    trendScore?: number;
  }> {
    const suggestions: AgentSuggestion[] = [];
    let finalPrompt = params.prompt;
    let optimized = false;

    // Step 1: Optimize prompt if enabled
    if (this.config.autoOptimize) {
      const optimization = await this.agents.optimization.optimizePrompt(
        params.prompt,
        params.contentType
      );
      
      if (optimization.optimized !== params.prompt) {
        finalPrompt = optimization.optimized;
        optimized = true;
        
        suggestions.push({
          id: Date.now().toString(),
          agentType: 'optimization',
          suggestion: `Optimized: ${optimization.improvements.join(', ')}`,
          confidence: 0.85,
          metadata: { improvements: optimization.improvements },
          timestamp: new Date(),
        });
      }
    }

    // Step 2: Check trend alignment if enabled
    let trendScore: number | undefined;
    if (this.config.enableTrends) {
      const trendAnalysis = await this.agents.trends.analyzeTrendAlignment(finalPrompt);
      trendScore = trendAnalysis.score;
      
      if (trendAnalysis.recommendations.length > 0) {
        suggestions.push({
          id: (Date.now() + 1).toString(),
          agentType: 'trends',
          suggestion: `Trend recommendations: ${trendAnalysis.recommendations.join(', ')}`,
          confidence: trendAnalysis.score,
          metadata: { recommendations: trendAnalysis.recommendations },
          timestamp: new Date(),
        });
      }
    }

    return {
      prompt: finalPrompt,
      optimized,
      suggestions,
      trendScore,
    };
  }

  /**
   * Analyze generated content
   */
  async analyzeGeneratedContent(params: {
    contentId: string;
    contentType: 'video' | 'image';
    prompt: string;
    url?: string;
  }): Promise<ContentAnalysis | null> {
    if (!this.config.autoAnalyze) {
      return null;
    }

    try {
      const analysis = await this.agents.quality.analyzeContent(params);
      
      // Create suggestion based on analysis
      if (analysis.score < 0.7 && analysis.improvements.length > 0) {
        const taskId = this.createTask({
          agentType: 'quality',
          action: 'suggest-improvements',
          params: {
            contentId: params.contentId,
            improvements: analysis.improvements,
          },
        });
      }

      return analysis;
    } catch (error) {
      console.error('Content analysis error:', error);
      return null;
    }
  }

  /**
   * Create automated workflow
   */
  async createAutomatedWorkflow(params: {
    name: string;
    prompts: string[];
    contentType: 'video' | 'image';
    settings: Record<string, any>;
  }): Promise<string | null> {
    if (!this.config.enableWorkflows) {
      throw new Error('Workflows are disabled');
    }

    try {
      // Optimize all prompts if auto-optimize is enabled
      let prompts = params.prompts;
      if (this.config.autoOptimize) {
        prompts = await Promise.all(
          params.prompts.map(async (prompt) => {
            const result = await this.agents.optimization.optimizePrompt(
              prompt,
              params.contentType
            );
            return result.optimized;
          })
        );
      }

      const workflowId = await this.agents.automation.createWorkflow({
        ...params,
        prompts,
      });

      return workflowId;
    } catch (error) {
      console.error('Workflow creation error:', error);
      return null;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId: string): Promise<boolean> {
    if (!this.config.enableWorkflows) {
      return false;
    }

    try {
      await this.agents.automation.executeWorkflow(workflowId);
      return true;
    } catch (error) {
      console.error('Workflow execution error:', error);
      return false;
    }
  }

  /**
   * Get trending suggestions
   */
  async getTrendingSuggestions(category?: string): Promise<string[]> {
    if (!this.config.enableTrends) {
      return [];
    }

    return await this.agents.trends.getTrendingSuggestions(category);
  }

  /**
   * Create a task for agents to process
   */
  createTask(params: {
    agentType: 'optimization' | 'automation' | 'quality' | 'trends';
    action: string;
    params: any;
  }): string {
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentType: params.agentType,
      action: params.action,
      params: params.params,
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processTaskQueue();
    }

    return task.id;
  }

  /**
   * Process task queue
   */
  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      task.status = 'running';
      this.tasks.set(task.id, task);

      try {
        let result: any;

        switch (task.agentType) {
          case 'optimization':
            result = await this.processOptimizationTask(task);
            break;
          case 'automation':
            result = await this.processAutomationTask(task);
            break;
          case 'quality':
            result = await this.processQualityTask(task);
            break;
          case 'trends':
            result = await this.processTrendsTask(task);
            break;
        }

        task.status = 'completed';
        task.result = result;
        task.completedAt = new Date();
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.completedAt = new Date();
      }

      this.tasks.set(task.id, task);
    }

    this.isProcessing = false;
  }

  private async processOptimizationTask(task: AgentTask): Promise<any> {
    // Process optimization tasks
    return {};
  }

  private async processAutomationTask(task: AgentTask): Promise<any> {
    // Process automation tasks
    return {};
  }

  private async processQualityTask(task: AgentTask): Promise<any> {
    // Process quality tasks
    return {};
  }

  private async processTrendsTask(task: AgentTask): Promise<any> {
    // Process trends tasks
    return {};
  }

  /**
   * Get task status
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).filter(
      task => task.status === 'pending' || task.status === 'running'
    );
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CoordinatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): CoordinatorConfig {
    return { ...this.config };
  }

  /**
   * Get agents
   */
  getAgents() {
    return this.agents;
  }

  /**
   * Clear all tasks
   */
  clearTasks(): void {
    this.tasks.clear();
    this.taskQueue = [];
  }
}

/**
 * Create global agent coordinator instance
 */
let globalCoordinator: AgentCoordinator | null = null;

export function getAgentCoordinator(config?: CoordinatorConfig): AgentCoordinator {
  if (!globalCoordinator) {
    globalCoordinator = new AgentCoordinator(
      config || {
        autoOptimize: true,
        autoAnalyze: true,
        enableTrends: true,
        enableWorkflows: true,
      }
    );
  }
  return globalCoordinator;
}

export function resetAgentCoordinator(): void {
  globalCoordinator = null;
}

