import type { RouteLocationRaw } from 'vue-router'
import type { Visibility } from '../types/project'
import type { CreativeWorkflowTemplateId } from '../services/creativeWorkflow.service'

export interface WorkbenchQuickAction {
  id: 'create' | 'import' | 'templates' | 'continue'
  label: string
  description: string
  icon: string
  emphasis: 'primary' | 'secondary'
}

export interface WorkbenchRecentProjectCard {
  id: string
  title: string
  summary: string
  status: string
  statusLabel: string
  category: string
  totalWords: number
  chapterCount: number
  updatedAt: string
  lastChapterId?: string
  lastChapterTitle?: string
  continueTarget: RouteLocationRaw
}

export interface TemplateCatalogItem {
  id: CreativeWorkflowTemplateId
  name: string
  tagline: string
  category: string
  templateType: string
  applicableTo: string[]
  emotionCurve: string
  recommendedLabel: string
}

export interface TemplateDetailSection {
  id: string
  title: string
  summary: string
  bullets: string[]
}

export interface TemplateDetailOutlineNode {
  order: number
  title: string
  summary: string
  hook: string
  payoff: string
}

export interface TemplateDetailPayload {
  id: CreativeWorkflowTemplateId
  name: string
  tagline: string
  category: string
  templateType: string
  applicableTo: string[]
  recommendedLabel: string
  emotionCurve: string
  payoffFocus: string[]
  previewTabs: {
    outline: TemplateDetailOutlineNode[]
    characters: TemplateDetailSection[]
    settings: TemplateDetailSection[]
  }
  seed: {
    projectCategory: string
    volumeTitle: string
    openingLine: string
  }
}

export interface CreateProjectFromTemplateInput {
  templateId: CreativeWorkflowTemplateId
  title: string
  summary?: string
  visibility?: Visibility
}
