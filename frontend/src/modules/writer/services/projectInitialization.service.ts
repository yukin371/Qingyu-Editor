import { requestWriterAI } from '@/modules/ai/api'
import {
  buildWriterInternalSkillPrompt,
} from '@/modules/writer/config/writerAIPromptPresets'
import {
  createDefaultWriterProjectBrief,
  type WriterProjectBrief,
} from './writerProjectBrief.service'
import {
  buildWriterUserPreferenceSummaryLines,
  type WriterUserPreferenceMemory,
} from './writerUserPreferenceMemory.service'
import type { CreativeWorkflowTemplateId, GoldenChapterPlan } from './templateCatalog.fallback'
import { getCreativeWorkflowTemplate } from './creativeWorkflow.service'

export type WriterProjectInitializationEntryMode =
  | 'idea'
  | 'genre'
  | 'protagonist'
  | 'world'
  | 'template'
  | 'blank'

export interface WriterProjectInitializationDraft {
  entryMode: WriterProjectInitializationEntryMode
  rawInput: string
  templateId?: CreativeWorkflowTemplateId | string
  answers: Record<string, string>
  selectedCandidateId?: string
  status: 'drafting' | 'ready' | 'confirmed'
}

export interface WriterProjectInitializationCandidate {
  id: string
  label: string
  positioning: string
  protagonistCore?: string
  worldRules: string[]
  readerPromise: string[]
  styleGuide: string[]
  constraints: string[]
  avoid: string[]
  goldenChapters: GoldenChapterPlan[]
}

export interface WriterProjectInitializationRequest {
  projectId?: string
  entryMode: WriterProjectInitializationEntryMode
  rawInput: string
  templateId?: CreativeWorkflowTemplateId | string
  answers?: Record<string, string>
  userPreference?: WriterUserPreferenceMemory | null
}

export interface WriterProjectInitializationResult {
  brief: WriterProjectBrief
  candidates: WriterProjectInitializationCandidate[]
  suggestedAssets: Array<{
    type: 'character' | 'location' | 'item' | 'organization' | 'concept'
    name: string
    summary?: string
  }>
  goldenChapters: GoldenChapterPlan[]
  rawMessage: string
}

const DEFAULT_GOLDEN_CHAPTERS: GoldenChapterPlan[] = [
  {
    chapterNumber: 1,
    title: '第一章',
    summary: '建立主角处境、核心压力和读者期待。',
    hook: '抛出必须继续读下去的问题。',
    payoff: '让读者理解这本书会交付什么体验。',
  },
  {
    chapterNumber: 2,
    title: '第二章',
    summary: '加压，逼主角做出第一个关键选择。',
    hook: '让选择带来更高代价或更大机会。',
    payoff: '强化主角行动逻辑。',
  },
  {
    chapterNumber: 3,
    title: '第三章',
    summary: '完成第一次小兑现，并打开下一层目标。',
    hook: '兑现后出现更大的压力。',
    payoff: '给读者第一次明确收益。',
  },
]

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeText(item)).filter(Boolean)
}

function normalizeGoldenChapters(value: unknown, fallback: GoldenChapterPlan[]): GoldenChapterPlan[] {
  if (!Array.isArray(value) || value.length === 0) return fallback
  return fallback.map((fallbackChapter, index) => {
    const raw = value[index] as Record<string, unknown> | undefined
    return {
      chapterNumber: fallbackChapter.chapterNumber,
      title: normalizeText(raw?.title) || fallbackChapter.title,
      summary: normalizeText(raw?.summary) || fallbackChapter.summary,
      hook: normalizeText(raw?.hook) || fallbackChapter.hook,
      payoff: normalizeText(raw?.payoff) || fallbackChapter.payoff,
    }
  })
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenced?.[1]?.trim() || trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

function buildInitializationPrompt(request: WriterProjectInitializationRequest): string {
  const template = getCreativeWorkflowTemplate(request.templateId as CreativeWorkflowTemplateId)
  const answers = Object.entries(request.answers || {})
    .map(([key, value]) => `${key}：${value}`)
    .join('\n')
  const userPreferenceLines = buildWriterUserPreferenceSummaryLines(request.userPreference)
  const skillPrompt = buildWriterInternalSkillPrompt([
    'project_positioning',
    'genre_contract',
    'audience_promise',
    'character_foundation',
    'world_rules',
    'golden_three_chapters',
  ])

  return [
    '请作为小说项目初始化助手，帮助作者从当前想法生成可确认的项目骨架草案。',
    '核心原则：人给方向，AI 补结构；所有内容都是候选，不能写正文，不能替作者做最终决定。',
    '请只返回 JSON，不要 Markdown，不要额外解释。',
    'JSON schema:',
    '{',
    '  "brief": {',
    '    "premise": "作品一句话",',
    '    "targetAudience": "目标读者",',
    '    "readerPromise": ["阅读承诺"],',
    '    "styleGuide": ["风格约束"],',
    '    "themeQuestion": "主题问题",',
    '    "protagonistCore": "主角核心",',
    '    "worldRules": ["世界规则"],',
    '    "constraints": ["硬约束"],',
    '    "avoid": ["避免项"]',
    '  },',
    '  "candidates": [',
    '    {',
    '      "label": "方向名",',
    '      "positioning": "方向说明",',
    '      "protagonistCore": "主角核心",',
    '      "worldRules": ["规则"],',
    '      "readerPromise": ["承诺"],',
    '      "styleGuide": ["风格"],',
    '      "constraints": ["约束"],',
    '      "avoid": ["避免"],',
    '      "goldenChapters": [{"title":"标题","summary":"目标","hook":"钩子","payoff":"兑现"}]',
    '    }',
    '  ],',
    '  "suggestedAssets": [{"type":"character","name":"名称","summary":"摘要"}]',
    '}',
    '约束：candidates 生成 2-3 套；goldenChapters 只生成前三章骨架，正文必须为空；资产只是候选。',
    `起点类型：${request.entryMode}`,
    request.rawInput.trim() ? `作者输入：${request.rawInput.trim()}` : '作者输入：暂缺，请给出可选择方向。',
    template
      ? [
          `模板：${template.name}`,
          `模板读者承诺：${template.defaultPromises.join(' / ')}`,
          `模板节奏合约：${template.defaultPaceContract}`,
          `模板质量约束：${template.commercialMechanism.qualityConstraints.join(' / ')}`,
        ].join('\n')
      : '',
    answers ? `作者补充：\n${answers}` : '',
    userPreferenceLines.length ? `用户长期偏好：\n${userPreferenceLines.join('\n')}` : '',
    skillPrompt,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function buildFallbackResult(
  request: WriterProjectInitializationRequest,
  rawMessage: string,
): WriterProjectInitializationResult {
  const template = getCreativeWorkflowTemplate(request.templateId as CreativeWorkflowTemplateId)
  const goldenChapters = template?.goldenChapterSeeds || DEFAULT_GOLDEN_CHAPTERS
  const premise = request.rawInput.trim() || template?.tagline || '一个等待作者确认的故事想法'
  const brief = {
    ...createDefaultWriterProjectBrief(request.projectId || 'initialization-draft'),
    premise,
    genreTemplateId: template?.id || request.templateId,
    targetAudience: template?.defaultAudience.slice(0, 2).join(' / '),
    readerPromise: template?.defaultPromises || [],
    styleGuide: request.userPreference?.stylePreference || [],
    worldRules: template?.blueprintHints || [],
    constraints: template?.commercialMechanism.qualityConstraints || [],
    avoid: request.userPreference?.avoid || [],
  }

  return {
    brief,
    candidates: [
      {
        id: 'candidate-1',
        label: template ? `${template.name}方向` : '基础方向',
        positioning: premise,
        protagonistCore: template?.commercialMechanism.protagonistArchetype,
        worldRules: brief.worldRules,
        readerPromise: brief.readerPromise,
        styleGuide: brief.styleGuide,
        constraints: brief.constraints,
        avoid: brief.avoid,
        goldenChapters,
      },
    ],
    suggestedAssets: [],
    goldenChapters,
    rawMessage,
  }
}

function normalizeCandidate(
  value: unknown,
  index: number,
  fallbackChapters: GoldenChapterPlan[],
): WriterProjectInitializationCandidate | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const label = normalizeText(record.label) || `方向 ${index + 1}`
  const positioning = normalizeText(record.positioning)
  if (!positioning && !label) return null

  return {
    id: `candidate-${index + 1}`,
    label,
    positioning,
    protagonistCore: normalizeText(record.protagonistCore) || undefined,
    worldRules: normalizeStringArray(record.worldRules),
    readerPromise: normalizeStringArray(record.readerPromise),
    styleGuide: normalizeStringArray(record.styleGuide),
    constraints: normalizeStringArray(record.constraints),
    avoid: normalizeStringArray(record.avoid),
    goldenChapters: normalizeGoldenChapters(record.goldenChapters, fallbackChapters),
  }
}

function normalizeResultFromMessage(
  request: WriterProjectInitializationRequest,
  rawMessage: string,
): WriterProjectInitializationResult {
  const parsed = extractJsonObject(rawMessage)
  if (!parsed) return buildFallbackResult(request, rawMessage)

  const template = getCreativeWorkflowTemplate(request.templateId as CreativeWorkflowTemplateId)
  const fallbackChapters = template?.goldenChapterSeeds || DEFAULT_GOLDEN_CHAPTERS
  const rawBrief = (parsed.brief || {}) as Record<string, unknown>
  const goldenChapters = normalizeGoldenChapters(rawBrief.goldenChapters, fallbackChapters)
  const brief: WriterProjectBrief = {
    ...createDefaultWriterProjectBrief(request.projectId || 'initialization-draft'),
    premise: normalizeText(rawBrief.premise) || request.rawInput.trim(),
    genreTemplateId: template?.id || request.templateId,
    targetAudience: normalizeText(rawBrief.targetAudience) || undefined,
    readerPromise: normalizeStringArray(rawBrief.readerPromise),
    styleGuide: normalizeStringArray(rawBrief.styleGuide),
    themeQuestion: normalizeText(rawBrief.themeQuestion) || undefined,
    protagonistCore: normalizeText(rawBrief.protagonistCore) || undefined,
    worldRules: normalizeStringArray(rawBrief.worldRules),
    constraints: normalizeStringArray(rawBrief.constraints),
    avoid: normalizeStringArray(rawBrief.avoid),
  }

  const candidates = Array.isArray(parsed.candidates)
    ? parsed.candidates
        .map((item, index) => normalizeCandidate(item, index, fallbackChapters))
        .filter((item): item is WriterProjectInitializationCandidate => Boolean(item))
    : []

  const suggestedAssets: WriterProjectInitializationResult['suggestedAssets'] = Array.isArray(
    parsed.suggestedAssets,
  )
    ? parsed.suggestedAssets.reduce<WriterProjectInitializationResult['suggestedAssets']>(
        (acc, item) => {
          const record = item as Record<string, unknown>
          const type = normalizeText(record.type)
          const name = normalizeText(record.name)
          if (!name || !['character', 'location', 'item', 'organization', 'concept'].includes(type)) {
            return acc
          }
          acc.push({
            type: type as 'character' | 'location' | 'item' | 'organization' | 'concept',
            name,
            summary: normalizeText(record.summary) || undefined,
          })
          return acc
        },
        [],
      )
    : []

  return {
    brief,
    candidates: candidates.length ? candidates : buildFallbackResult(request, rawMessage).candidates,
    suggestedAssets,
    goldenChapters: candidates[0]?.goldenChapters || goldenChapters,
    rawMessage,
  }
}

export async function generateWriterProjectInitialization(
  request: WriterProjectInitializationRequest,
): Promise<WriterProjectInitializationResult> {
  const prompt = buildInitializationPrompt(request)
  const result = await requestWriterAI({
    route: 'plan_only',
    mutationMode: 'none',
    target: {
      kind: 'current_document',
      label: '项目初始化草案',
    },
    context: {
      projectId: request.projectId || 'initialization-draft',
      currentDocument: {
        sourceText: request.rawInput,
      },
      userPreference: request.userPreference || undefined,
      assets: [],
      workflowSummary: [],
      evidence: [],
      budget: {
        maxChars: Math.min(prompt.length, 6000),
        truncated: prompt.length > 6000,
      },
    },
    workflow: 'organize',
    toolHintIds: ['structure_stage', 'scene_stage', 'assets'],
    requiresConfirmation: true,
    userVisibleSummary: prompt,
  })

  return normalizeResultFromMessage(request, result.message)
}

export function buildWriterProjectInitializationPromptForTest(
  request: WriterProjectInitializationRequest,
): string {
  return buildInitializationPrompt(request)
}
