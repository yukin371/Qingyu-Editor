/**
 * AI Assistant Type Definitions
 */

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export type AIToolType = 'chat' | 'continue' | 'polish' | 'expand' | 'rewrite' | 'story-generate'

export interface AIGenerateRequest {
  projectId?: string
  currentText?: string
  prompt?: string
  continueLength?: number
  type?: 'continue' | 'rewrite' | 'polish' | 'expand'
}

export interface AIGenerateResponse {
  generated_text?: string
  rewritten_text?: string
  polished_text?: string
  expanded_text?: string
  usage?: TokenUsage
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface AIConfig {
  continueLength: number
  polishStyle: 'literary' | 'concise' | 'formal'
  expandLevel: 'brief' | 'moderate' | 'detailed'
  rewriteMode: 'meaning' | 'style'
}

export interface AIHistory {
  id: string
  tool: AIToolType
  input: string
  output: string
  timestamp: number
  projectId?: string
  usage?: TokenUsage
}

export interface AIState {
  chatHistory: ChatMessage[]
  isProcessing: boolean
  lastResult: string
  sidebarVisible: boolean
  currentTool: AIToolType
  config: AIConfig
  history: AIHistory[]
  error: string | null
  selectedText: string
}

export interface AIToolConfig {
  continue: {
    length: 100 | 200 | 500
  }
  polish: {
    style: 'literary' | 'concise' | 'formal'
    instructions: string
  }
  expand: {
    targetLength: number
    detailLevel: 'brief' | 'moderate' | 'detailed'
    instructions: string
  }
  rewrite: {
    mode: 'polish' | 'simplify' | 'formal' | 'casual'
    instructions: string
  }
}

export type AIToolConfigType = keyof AIToolConfig

export interface AIContextMenuPosition {
  x: number
  y: number
  visible: boolean
}


