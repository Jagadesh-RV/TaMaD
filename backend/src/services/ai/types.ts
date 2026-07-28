export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'ollama';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  readonly type: AIProviderType;
  complete(req: AICompletionRequest): Promise<AICompletionResponse>;
  completeStream?(req: AICompletionRequest): AsyncIterable<string>;
  isAvailable(): boolean;
}

export interface ParsedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  estimatedTime?: number;
  subtasks: { title: string; completed?: boolean }[];
}

export interface ProjectPlan {
  name: string;
  description: string;
  milestones: {
    name: string;
    description: string;
    dueDate?: string;
  }[];
  tasks: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    milestone?: string;
    estimatedTime?: number;
  }[];
  dependencies: { from: string; to: string }[];
  risks: { description: string; severity: 'low' | 'medium' | 'high'; mitigation: string }[];
  timeline: { phase: string; startDate: string; endDate: string }[];
}

export interface DailyPlan {
  date: string;
  morningPlan: string[];
  priorityTasks: { title: string; reason: string }[];
  focusSchedule: { startTime: string; endTime: string; task: string; breakAfter: boolean }[];
  endOfDayReview: { questions: string[] }[];
  tips: string[];
}

export interface WorkspaceContext {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    urgent: number;
    recent: { title: string; status: string; priority: string; dueDate?: Date }[];
  };
  projects: {
    total: number;
    active: number;
    items: { name: string; status: string; progress?: number }[];
  };
  goals: {
    total: number;
    completed: number;
    items: { title: string; progress: number; status: string }[];
  };
  habits: {
    total: number;
    active: number;
    items: { name: string; streak: number; frequency: string }[];
  };
  notes: { total: number; recent: string[] };
  documents: { total: number; recent: string[] };
}

export const AI_PROVIDER_CONFIGS: Record<AIProviderType, AIProviderConfig> = {
  gemini: {
    type: 'gemini',
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxTokens: 4096,
  },
  openai: {
    type: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4096,
  },
  claude: {
    type: 'claude',
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 4096,
  },
  ollama: {
    type: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: 'llama3.2',
    temperature: 0.3,
    maxTokens: 4096,
  },
};
