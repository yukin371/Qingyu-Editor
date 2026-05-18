import type { AIDomainToolRegistry } from '@/modules/ai/types/agent'

export const WRITER_AI_TOOL_REGISTRY_ID = 'writer'

export function createWriterAIToolRegistry(): AIDomainToolRegistry {
  return {
    domainId: WRITER_AI_TOOL_REGISTRY_ID,
    label: '写作工具',
    tools: [
      {
        id: 'writer.read_project_brief',
        label: '读取作品 Brief',
        description: '读取项目定位、读者承诺、主题、主角核心、世界规则和硬约束。',
        safety: 'read_only',
        outputHint: '返回项目级摘要，不返回章节正文。',
      },
      {
        id: 'writer.read_user_preference',
        label: '读取用户写作偏好',
        description: '读取跨项目的题材、风格、节奏、钩子强度和回审严格度偏好。',
        safety: 'read_only',
        outputHint: '只返回用户偏好，不返回任何项目事实。',
      },
      {
        id: 'writer.read_current_document',
        label: '读取当前章节',
        description: '读取当前章节标题、正文和选区，作为写作或回审的主要上下文。',
        safety: 'read_only',
      },
      {
        id: 'writer.search_documents',
        label: '搜索章节',
        description: '按章节标题、正文片段或资产引用定位候选章节。',
        safety: 'candidate_only',
        outputHint: '多命中必须返回候选，不自动切章或批量修改。',
      },
      {
        id: 'writer.read_context_summary',
        label: '读取写作摘要',
        description: '读取大纲、当前场景/节拍、资产、时间线、分支等简化摘要。',
        safety: 'read_only',
        outputHint: '只返回摘要投影，不返回深工具全量数据。',
      },
      {
        id: 'writer.create_initialization_draft',
        label: '生成项目初始化候选',
        description: '基于作者想法生成作品定位、黄金三章骨架和建议资产候选。',
        safety: 'candidate_only',
        outputHint: '不能生成正文，不能静默创建章节或资产。',
      },
      {
        id: 'writer.build_apply_payload',
        label: '生成正文 diff 候选',
        description: '把写作结果转换为编辑器可审阅的正文 diff payload。',
        safety: 'requires_confirmation',
        outputHint: '所有正文修改必须由编辑器 inline diff 确认。',
      },
      {
        id: 'writer.organize_asset_candidates',
        label: '整理资产候选',
        description: '从正文 @资产、章节引用和资产简表中整理待确认资产变化。',
        safety: 'candidate_only',
        outputHint: '全局资产创建必须确认；局部资产只由系统自动检出。',
      },
    ],
  }
}
