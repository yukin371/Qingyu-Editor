import type { WriterAIPlan, WriterAIRoute } from '../utils/writerAIContext'

export type WriterAIPromptGroup = 'write' | 'review' | 'organize'
export type WriterAIMinimalWorkflow = 'chat' | 'write' | 'review' | 'organize' | 'explain_tool'
export type WriterAIWritingSkillId =
  | 'commercial_loop'
  | 'literary_texture'
  | 'pacing_boost'
  | 'character_depth'
  | 'setting_consistency'
export type WriterAIToolHintId =
  | 'structure_stage'
  | 'scene_stage'
  | 'assets'
  | 'character_graph'
  | 'timeline'
  | 'story_branch'

export interface WriterAIPromptPreset {
  id: string
  icon: string
  label: string
  group: WriterAIPromptGroup
  description: string
  prompt: string
}

export interface WriterAIAgentWorkflowPreset {
  id: WriterAIMinimalWorkflow
  label: string
  route: WriterAIRoute
  systemPrompt: string
  outputFormat: string
  toolInstruction: string
}

export interface WriterAIWritingSkillPreset {
  id: WriterAIWritingSkillId
  label: string
  description: string
  prompt: string
  recommended: boolean
}

export interface WriterAIToolHintPreset {
  id: WriterAIToolHintId
  label: string
  canHelp: string
  whenToUse: string
  contextHint: string
}

export const WRITER_AI_AGENT_WORKFLOWS = {
  chat: {
    label: '问答',
    route: 'chat',
    systemPrompt: '你是写作工作区里的极简助手，只回答当前问题，不主动改正文。',
    outputFormat: '输出短答案；如果需要修改正文，只给出建议并提示用户改用写作动作。',
    toolInstruction: '只使用可见上下文证据，不假装读取了未提供的章节、资产或工具详情。',
  },
  write: {
    label: '写作',
    route: 'single_document_edit',
    systemPrompt: '你是小说写作协作者，负责生成可审阅的正文候选，不拥有落盘权限。',
    outputFormat: '只输出可进入 diff 的正文候选；不要附加解释、标题或修改说明。',
    toolInstruction: '遵守当前章节、选区、场景节拍和资产摘要；不要批量改多章。',
  },
  review: {
    label: '回审',
    route: 'analysis',
    systemPrompt: '你是连载编辑，只做质量回审和风险提示，不改正文。',
    outputFormat: '按“必须修 / 建议修 / 可不修”输出，优先指出影响读者体验的问题。',
    toolInstruction: '结合当前节拍、资产和结构摘要判断，不把工具摘要当成事实全集。',
  },
  organize: {
    label: '整理',
    route: 'asset_assist',
    systemPrompt: '你是写作资料整理助手，只产出候选清单和任务卡，不静默改资产。',
    outputFormat: '输出候选项、原因和建议动作；需要创建/删除时必须标记为待确认。',
    toolInstruction: '只消费资产简表与工具摘要，不展开全量设定集或全书全文。',
  },
  explain_tool: {
    label: '工具说明',
    route: 'chat',
    systemPrompt: '你是工具使用引导助手，用最短路径解释当前工具能帮作者做什么。',
    outputFormat: '输出 1-3 条具体建议，避免教程式长文。',
    toolInstruction: '优先说明何时该用、现在能做什么、需要给 AI 哪些摘要。',
  },
} satisfies Record<WriterAIMinimalWorkflow, Omit<WriterAIAgentWorkflowPreset, 'id'>>

export const WRITER_AI_WRITING_SKILLS = {
  commercial_loop: {
    label: '商业爽文',
    description: '压迫、期待、兑现、升级、钩子',
    prompt:
      '优先保证商业阅读循环：明确压迫或欲望，制造期待，给出可感知兑现，再留下下一章钩子。高效不等于粗糙，避免水章和无意义解释。',
    recommended: true,
  },
  literary_texture: {
    label: '文学质感',
    description: '更准确的语言、意象和留白',
    prompt:
      '提升语言准确度、意象连续性和情绪余味。不要堆砌辞藻；每个描写都应服务人物、主题或氛围。',
    recommended: true,
  },
  pacing_boost: {
    label: '节奏强化',
    description: '压缩解释，强化行动和转折',
    prompt:
      '检查并强化节奏：减少重复解释，增加行动、选择、阻力和转折，让每段文字推动人物状态或读者期待变化。',
    recommended: true,
  },
  character_depth: {
    label: '人物强化',
    description: '欲望、恐惧、选择和关系',
    prompt:
      '让人物行为来自欲望、恐惧、关系压力和内在矛盾。不要让角色只为剧情服务；关键选择要反映人物底色。',
    recommended: true,
  },
  setting_consistency: {
    label: '设定一致',
    description: '规则、资产和前后文不打架',
    prompt:
      '优先检查世界规则、资产状态、人物关系和时间顺序是否自洽。发现冲突时只提出风险与修正候选，不擅自改设定。',
    recommended: false,
  },
} satisfies Record<WriterAIWritingSkillId, Omit<WriterAIWritingSkillPreset, 'id'>>

export const WRITER_AI_TOOL_HINTS = {
  structure_stage: {
    label: '结构舞台',
    canHelp: '把大纲、章节、当前节拍和附近章节压缩成全局写作位置。',
    whenToUse: '当作者不知道下一章承担什么功能，或长篇章节定位混乱时使用。',
    contextHint: '给 AI 当前章节、绑定大纲、当前节拍、附近章节窗口和问题摘要即可。',
  },
  scene_stage: {
    label: '当前场景',
    canHelp: '把当前几章的剧情承诺、完成条件和下一拍牵引压缩成写作约束。',
    whenToUse: '当章节切换后仍要保持同一段剧情推进，或需要检查本拍是否兑现时使用。',
    contextHint: '给 AI 当前拍、覆盖章节、目标、冲突、完成条件、下一拍和在场资产。',
  },
  assets: {
    label: '设定资产',
    canHelp: '让 AI 理解角色、地点、物件、组织、概念的最小事实。',
    whenToUse: '当章节出现新 @资产、设定变化、关系变化或一致性风险时使用。',
    contextHint: '只给资产简表、引用范围、未解析候选和最近证据，不给全量详情。',
  },
  character_graph: {
    label: '关系图谱',
    canHelp: '让 AI 看见人物/组织关系和关系变化压力。',
    whenToUse: '当人物动机、阵营、背叛、同盟或情感线变复杂时使用。',
    contextHint: '给当前章节相关节点、关系边、未确认关系和少量证据。',
  },
  timeline: {
    label: '时间线',
    canHelp: '帮助 AI 检查事件顺序、因果和时间跨度。',
    whenToUse: '当倒叙、多线并行、时间跳跃或伏笔兑现容易混乱时使用。',
    contextHint: '给当前窗口事件、前后相邻事件和冲突点，不给全量时间线。',
  },
  story_branch: {
    label: '故事分支',
    canHelp: '帮助 AI 理解互动叙事的路线、选择、条件和汇合。',
    whenToUse: '只在视觉小说、互动小说、多结局或游戏叙事中使用。',
    contextHint: '给当前路线、附近节点、选择条件和汇合/结局目标。',
  },
} satisfies Record<WriterAIToolHintId, Omit<WriterAIToolHintPreset, 'id'>>

export const WRITER_AI_PROMPT_PRESETS = {
  continue: {
    label: '续写一段',
    icon: 'Pencil',
    group: 'write',
    description: '沿着当前章节继续推进',
    prompt: '请根据当前内容续写一段话，保持当前视角、人物语气和章节节奏。',
  },
  scene: {
    label: '补场景',
    icon: 'Picture',
    group: 'write',
    description: '补动作、环境和过渡',
    prompt:
      '请在当前章节合适位置补一段场景描写，重点补动作、环境、心理或过渡，不改变核心剧情走向。',
  },
  polish: {
    label: '润色文字',
    icon: 'Sparkles',
    group: 'write',
    description: '只优化表达和节奏',
    prompt: '请帮我润色当前内容，只优化语言流畅度、节奏和画面感，不改变事实与剧情。',
  },
  chapterReview: {
    label: '审本章',
    icon: 'DocumentChecked',
    group: 'review',
    description: '检查目标、爽点、钩子',
    prompt:
      '请作为连载编辑回审当前章节，按“必须修 / 建议修 / 可不修”输出，重点检查本章目标是否兑现、情绪曲线是否过平、爽点或读者收益是否明确、主角是否主动、章末钩子是否足够。',
  },
  recentReview: {
    label: '审近5章',
    icon: 'TrendCharts',
    group: 'review',
    description: '看连续节奏和兑现',
    prompt:
      '请回审最近5章的连载节奏，如果上下文不足就基于当前可见摘要说明不足。重点检查压抑-反击-收益循环、连续解释或水章、读者期待是否兑现、角色关系是否推进。',
  },
  taskCard: {
    label: '任务卡',
    icon: 'DocumentText',
    group: 'organize',
    description: '生成本章写前约束',
    prompt:
      '请根据当前章节和已有上下文生成轻量本章任务卡，只输出：目标、情绪功能、读者收益、主角行动、冲突、章末钩子、资产变更。',
  },
  assets: {
    label: '整理资产',
    icon: 'Collection',
    group: 'organize',
    description: '沉淀角色/设定变化',
    prompt:
      '请根据当前章节和资产简表，整理本章出现或变化的角色、地点、物品、组织、概念。只做候选清单和风险提示，不自动删除、合并或改名资产。',
  },
} satisfies Record<string, Omit<WriterAIPromptPreset, 'id'>>

export type WriterAIPromptPresetId = keyof typeof WRITER_AI_PROMPT_PRESETS

export function listWriterAIPromptPresets(): WriterAIPromptPreset[] {
  return Object.entries(WRITER_AI_PROMPT_PRESETS).map(([id, preset]) => ({
    id,
    ...preset,
  }))
}

export function getWriterAIPromptPreset(id: string): WriterAIPromptPreset | null {
  const preset = WRITER_AI_PROMPT_PRESETS[id as WriterAIPromptPresetId]
  return preset ? { id, ...preset } : null
}

export function getWriterAIPromptText(id: string): string {
  return getWriterAIPromptPreset(id)?.prompt || '请提供帮助'
}

export function listWriterAIAgentWorkflows(): WriterAIAgentWorkflowPreset[] {
  return Object.entries(WRITER_AI_AGENT_WORKFLOWS).map(([id, workflow]) => ({
    id: id as WriterAIMinimalWorkflow,
    ...workflow,
  }))
}

export function getWriterAIAgentWorkflow(
  id: WriterAIMinimalWorkflow,
): WriterAIAgentWorkflowPreset {
  return {
    id,
    ...WRITER_AI_AGENT_WORKFLOWS[id],
  }
}

export function listWriterAIWritingSkills(options?: {
  recommendedOnly?: boolean
}): WriterAIWritingSkillPreset[] {
  return Object.entries(WRITER_AI_WRITING_SKILLS)
    .map(([id, skill]) => ({
      id: id as WriterAIWritingSkillId,
      ...skill,
    }))
    .filter((skill) => !options?.recommendedOnly || skill.recommended)
}

export function getWriterAIWritingSkill(
  id: string | null | undefined,
): WriterAIWritingSkillPreset | null {
  const skill = id ? WRITER_AI_WRITING_SKILLS[id as WriterAIWritingSkillId] : null
  return skill ? { id: id as WriterAIWritingSkillId, ...skill } : null
}

export function listWriterAIToolHints(): WriterAIToolHintPreset[] {
  return Object.entries(WRITER_AI_TOOL_HINTS).map(([id, hint]) => ({
    id: id as WriterAIToolHintId,
    ...hint,
  }))
}

export function getWriterAIToolHint(id: string | null | undefined): WriterAIToolHintPreset | null {
  const hint = id ? WRITER_AI_TOOL_HINTS[id as WriterAIToolHintId] : null
  return hint ? { id: id as WriterAIToolHintId, ...hint } : null
}

export function getWriterAIToolHintText(id: string | null | undefined): string {
  const hint = getWriterAIToolHint(id)
  if (!hint) return ''
  return `${hint.label}：${hint.canHelp} 使用时机：${hint.whenToUse} 上下文：${hint.contextHint}`
}

export function inferWriterAIWorkflow(plan: Pick<WriterAIPlan, 'route' | 'mutationMode' | 'intent'>): WriterAIMinimalWorkflow {
  if (plan.mutationMode === 'single_document_diff') return 'write'
  if (plan.route === 'asset_assist') return 'organize'
  if (plan.route === 'analysis') return 'review'
  if (plan.route === 'plan_only') return 'organize'
  return 'chat'
}

export function inferWriterAIWritingSkillId(
  plan: Pick<WriterAIPlan, 'route' | 'mutationMode' | 'intent'>,
): WriterAIWritingSkillId | null {
  if (plan.route === 'analysis') {
    return plan.intent?.action === 'proofread' ? 'setting_consistency' : null
  }

  if (plan.mutationMode !== 'single_document_diff') {
    return null
  }

  if (plan.intent?.action === 'continue' || plan.intent?.action === 'expand') {
    return 'pacing_boost'
  }

  if (plan.intent?.action === 'proofread') {
    return 'setting_consistency'
  }

  if (plan.intent?.action === 'summarize') {
    return 'setting_consistency'
  }

  return 'literary_texture'
}

export function buildWriterAIAgentPrompt(options: {
  workflow: WriterAIMinimalWorkflow
  skillId?: string | null
  toolHintIds?: Array<string | null | undefined>
}): string {
  const workflow = getWriterAIAgentWorkflow(options.workflow)
  const skill = getWriterAIWritingSkill(options.skillId)
  const toolHints = (options.toolHintIds || [])
    .map((id) => getWriterAIToolHint(id))
    .filter((hint): hint is WriterAIToolHintPreset => Boolean(hint))

  return [
    `极简 Agent：${workflow.label}`,
    workflow.systemPrompt,
    `输出格式：${workflow.outputFormat}`,
    `工具约束：${workflow.toolInstruction}`,
    skill ? `写作 Skill：${skill.label}。${skill.prompt}` : '',
    toolHints.length > 0
      ? [
          '工具提示：',
          ...toolHints.map(
            (hint) => `- ${hint.label}：${hint.canHelp}；使用时机：${hint.whenToUse}`,
          ),
        ].join('\n')
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}
