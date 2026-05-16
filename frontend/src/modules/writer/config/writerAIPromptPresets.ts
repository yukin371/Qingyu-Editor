export type WriterAIPromptGroup = 'write' | 'review' | 'organize'

export interface WriterAIPromptPreset {
  id: string
  icon: string
  label: string
  group: WriterAIPromptGroup
  description: string
  prompt: string
}

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
