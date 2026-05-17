export type CreativeFlowStageId = 'inspiration' | 'foundation' | 'blueprint' | 'drafting' | 'review'

export type CreativeFlowAction =
  | { type: 'right-tool'; tool: 'ai' | 'assets' | 'harness' | 'proofread' | 'inspiration' }
  | { type: 'overlay'; tool: 'structure' | 'relations' | 'timeline' | 'branches' | 'assets' }
  | { type: 'bottom-panel'; panel: 'scene' }
  | { type: 'add-doc' }

export interface CreativeFlowStage {
  id: CreativeFlowStageId
  order: number
  title: string
  shortTitle: string
  subtitle: string
  intent: string
  primaryActionLabel: string
  primaryAction: CreativeFlowAction
  tasks: string[]
  outputs: string[]
  handoff: string
}

export const creativeFlowStages: CreativeFlowStage[] = [
  {
    id: 'inspiration',
    order: 1,
    title: '灵感捕捉',
    shortTitle: '灵感',
    subtitle: '把模糊想法收成创作方向',
    intent: '把原始念头拆成可验证的题材坐标、读者承诺、开篇钩子和可持续日更循环。',
    primaryActionLabel: '打开灵感池',
    primaryAction: { type: 'right-tool', tool: 'inspiration' },
    tasks: ['灵感原点', '题材坐标', '读者承诺', '开篇钩子', '日更循环'],
    outputs: ['定位声明', '对标与禁区', '黄金三章锚点'],
    handoff: '交给地基阶段，作为角色欲望、世界法则和冲突来源。',
  },
  {
    id: 'foundation',
    order: 2,
    title: '地基构建',
    shortTitle: '地基',
    subtitle: '建立角色、世界和关系底座',
    intent: '先确认核心角色、势力、地点、物件和世界规则，再进入大纲推演。',
    primaryActionLabel: '打开关系图谱',
    primaryAction: { type: 'overlay', tool: 'relations' },
    tasks: ['主角欲望', '核心反力', '世界规则', '关键资产', '关系张力'],
    outputs: ['角色底盘', '世界规则卡', '初始关系网'],
    handoff: '交给蓝图阶段，作为章节冲突、伏笔和高潮安排的事实来源。',
  },
  {
    id: 'blueprint',
    order: 3,
    title: '蓝图绘制',
    shortTitle: '蓝图',
    subtitle: '规划卷、幕、章节、伏笔和节奏',
    intent: '把创作方向和故事资产变成可施工的卷纲、章纲、伏笔链与爽点密度。',
    primaryActionLabel: '打开结构舞台',
    primaryAction: { type: 'overlay', tool: 'structure' },
    tasks: ['卷级目标', '章节区段', '黄金三章', '伏笔埋收', '爽点密度'],
    outputs: ['卷 / 幕结构', '章节区段图', '伏笔计划表'],
    handoff: '交给逐章施工阶段，成为当前章节目标、上下文和 AI handoff 输入。',
  },
  {
    id: 'drafting',
    order: 4,
    title: '逐章施工',
    shortTitle: '施工',
    subtitle: '按章写正文并沉淀资产',
    intent: '围绕当前章节写作、自动保存、AI diff、快照、实体沉淀和章节末检查。',
    primaryActionLabel: '新建章节',
    primaryAction: { type: 'add-doc' },
    tasks: ['本章目标', '正文冲刺', 'AI diff', '实体标记', '章末检查'],
    outputs: ['成文章节', '章节快照', '实体与节奏记录'],
    handoff: '交给复盘阶段，形成章节、卷或完本级的经验反馈。',
  },
  {
    id: 'review',
    order: 5,
    title: '复盘成长',
    shortTitle: '复盘',
    subtitle: '对照计划、版本和建议沉淀方法',
    intent: '检查伏笔回收、角色成长、计划偏差、AI 修改记录和下一轮改进建议。',
    primaryActionLabel: '打开审查',
    primaryAction: { type: 'right-tool', tool: 'harness' },
    tasks: ['章节回审', '卷级节奏', '伏笔兑现', '版本回看', '方法沉淀'],
    outputs: ['复盘报告', '问题清单', '下一轮改进项'],
    handoff: '回到工作台，成为下个项目或下一卷的创作方法资产。',
  },
]

export function getCreativeFlowStage(id: CreativeFlowStageId): CreativeFlowStage {
  return creativeFlowStages.find((stage) => stage.id === id) || creativeFlowStages[3]
}
