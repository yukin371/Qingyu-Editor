import storage from '@/utils/storage'

export type CreativeWorkflowTemplateId =
  | 'comeback'
  | 'power-up'
  | 'mystery'
  | 'building'
  | 'emotion'

export interface GoldenChapterPlan {
  chapterNumber: 1 | 2 | 3
  title: string
  summary: string
  hook: string
  payoff: string
}

export interface CreativeWorkflowTemplate {
  id: CreativeWorkflowTemplateId
  name: string
  tagline: string
  applicableTo: string[]
  emotionCurve: string
  payoffFocus: string[]
  defaultAudience: string[]
  defaultPromises: string[]
  defaultPaceContract: string
  blueprintHints: string[]
  goldenChapterSeeds: GoldenChapterPlan[]
}

export interface InspirationGateResult {
  status: 'ready' | 'blocked'
  missing: string[]
  nextActions: string[]
  completedFields: {
    hasPrimaryGenre: boolean
    hasTargetAudience: boolean
    hasCorePromises: boolean
    hasPaceContract: boolean
  }
}

export interface CreativeWorkflowRecord {
  version: 1
  projectId: string
  templateId: CreativeWorkflowTemplateId | null
  pitchLine: string
  targetAudience: string[]
  corePromises: string[]
  paceContract: string
  goldenChapters: GoldenChapterPlan[]
  gate: InspirationGateResult
  createdAt: string
  updatedAt: string
}

type CreativeWorkflowPatch = Partial<
  Pick<
    CreativeWorkflowRecord,
    'pitchLine' | 'targetAudience' | 'corePromises' | 'paceContract' | 'goldenChapters'
  >
> & {
  templateId?: CreativeWorkflowTemplateId | null
}

const CREATIVE_WORKFLOW_STORAGE_PREFIX = 'writer_creative_workflow_v1_'

const creativeWorkflowTemplates: CreativeWorkflowTemplate[] = [
  {
    id: 'comeback',
    name: '逆袭打脸',
    tagline: '先压抑，再转折，第三章必须先兑现一次。',
    applicableTo: ['赘婿', '战神', '神医', '神豪', '鉴宝逆袭'],
    emotionCurve: '压抑 → 转折 → 爆发',
    payoffFocus: ['身份反转', '实力碾压', '财富碾压'],
    defaultAudience: ['喜欢高压反转', '期待明确爽点兑现'],
    defaultPromises: ['主角不会一直吃瘪', '前三章必须建立反击节奏'],
    defaultPaceContract: '前 3000 字完成羞辱建压，第三章必须出现首次打脸兑现。',
    blueprintHints: ['尽快立反派嘴脸', '第三章后埋更大阶层冲突', '兑现后保留下一轮更高目标'],
    goldenChapterSeeds: [
      {
        chapterNumber: 1,
        title: '屈辱现场',
        summary: '先建立主角被轻视、被误判或被压制的局面。',
        hook: '让读者看到主角明明有底牌，却暂时无法出手的理由。',
        payoff: '埋下身份/能力反转信号，但不提前完全揭牌。',
      },
      {
        chapterNumber: 2,
        title: '身份初显',
        summary: '让主角的真实身份、资源或能力第一次被少数人看见。',
        hook: '制造旁观者与反派的信息差，拉高期待。',
        payoff: '给出明确转折，让读者相信反击已经开始。',
      },
      {
        chapterNumber: 3,
        title: '首次打脸',
        summary: '在小范围内完成一次直接兑现，让压制关系翻面。',
        hook: '兑现后留下更高层级敌人或更大误会。',
        payoff: '完成第一次爽点交付，同时抬升后续战场。',
      },
    ],
  },
  {
    id: 'power-up',
    name: '升级碾压',
    tagline: '先见困境，再给金手指，第三章必须见第一次碾压。',
    applicableTo: ['玄幻', '仙侠', '系统文', '游戏异界', '凡人流'],
    emotionCurve: '认知设定 → 获得优势 → 碾压不公',
    payoffFocus: ['实力展示', '跨级突破', '世界观扩张'],
    defaultAudience: ['喜欢成长曲线', '接受设定驱动推进'],
    defaultPromises: ['成长有因果', '前三章必须看到金手指生效'],
    defaultPaceContract: '第一章建立困境和规则，第二章给能力入口，第三章完成首次跨级压制。',
    blueprintHints: ['先立世界规则再破局', '金手指代价要写清', '第一次胜利同时打开更大地图'],
    goldenChapterSeeds: [
      {
        chapterNumber: 1,
        title: '困境闪光',
        summary: '在既有规则下让主角显出不同常人的一点火花。',
        hook: '提示主角具备被世界低估的潜力或特殊感知。',
        payoff: '让读者先相信主角值得投资，而不是空降天命。',
      },
      {
        chapterNumber: 2,
        title: '金手指就位',
        summary: '明确触发条件与代价，让外挂不显得凭空降临。',
        hook: '把能力和当前危机绑在一起，逼主角立刻使用。',
        payoff: '完成从“可能逆袭”到“已经拥有工具”的转折。',
      },
      {
        chapterNumber: 3,
        title: '第一次碾压',
        summary: '安排一次短平快的压制，让优势被外部世界承认。',
        hook: '胜利后顺手揭示更高一层目标或敌人。',
        payoff: '兑现升级型作品的第一针强刺激。',
      },
    ],
  },
  {
    id: 'mystery',
    name: '求知解谜',
    tagline: '异常先出现，规则尽早亮，第三章要看到第一次破局。',
    applicableTo: ['悬疑', '无限流', '规则怪谈', '灵异', '盗墓'],
    emotionCurve: '困惑好奇 → 获取线索 → 初见真相曙光',
    payoffFocus: ['智力破局', '规则揭示', '谜团推进'],
    defaultAudience: ['喜欢规则推演', '在意信息伏笔回收'],
    defaultPromises: ['线索可复盘', '前三章必须给出第一次有效解'],
    defaultPaceContract: '开篇 2000 字内亮异常和规则代价，第三章结尾必须完成首轮破局。',
    blueprintHints: ['规则不要一次说完', '每章至少有一条新线索', '破局要基于前文已给信息'],
    goldenChapterSeeds: [
      {
        chapterNumber: 1,
        title: '踏入异常',
        summary: '主角进入失常空间、诡异规则或谜团现场。',
        hook: '异常必须具体可感，让读者立刻意识到危险并想知道规则。',
        payoff: '建立第一层规则或禁忌，但不要解释全部真相。',
      },
      {
        chapterNumber: 2,
        title: '危险试错',
        summary: '让主角或他人触发错误选项，换来惩罚和更关键的线索。',
        hook: '用损失换信息，让规则的代价真实存在。',
        payoff: '读者获得可以一起推理的关键信息。',
      },
      {
        chapterNumber: 3,
        title: '第一次破局',
        summary: '主角利用前文线索完成首轮小范围破局。',
        hook: '破局后立刻暴露更大的谜团或更危险的下一层。',
        payoff: '兑现智力型爽点，建立读者对作者控局能力的信任。',
      },
    ],
  },
  {
    id: 'building',
    name: '建设养成',
    tagline: '先看烂摊子，再给资源杠杆，第三章要看到第一份成果。',
    applicableTo: ['种田', '基建', '领主', '家族', '经营'],
    emotionCurve: '看到困局 → 获得工具 → 初见建设成果',
    payoffFocus: ['资源获取', '建设成果', '正向循环'],
    defaultAudience: ['喜欢经营闭环', '接受慢热但要持续增益'],
    defaultPromises: ['资源增长看得见', '前三章必须出现第一轮建设回报'],
    defaultPaceContract: '第一章明确资源缺口，第二章引入核心工具或资源，第三章交付第一份建设成果。',
    blueprintHints: ['把困局量化', '核心资源链尽早成形', '成果要引出下一轮扩张空间'],
    goldenChapterSeeds: [
      {
        chapterNumber: 1,
        title: '绝境领地',
        summary: '交代主角接手的是怎样一个具体烂摊子。',
        hook: '用资源清单、民心或地理困境快速建立压力。',
        payoff: '让读者清楚后续建设成功到底会有多爽。',
      },
      {
        chapterNumber: 2,
        title: '核心优势出现',
        summary: '给出系统、技术、人才或资源入口，明确可持续优势。',
        hook: '优势必须马上能投入当前困局，而不是空悬设定。',
        payoff: '完成“无计可施”到“有办法试一次”的转折。',
      },
      {
        chapterNumber: 3,
        title: '第一份成果',
        summary: '交付第一轮建设回报，让角色和环境产生肉眼可见变化。',
        hook: '成果后立刻出现更大的扩建需求或竞争者。',
        payoff: '兑现经营养成的第一轮正反馈。',
      },
    ],
  },
  {
    id: 'emotion',
    name: '情感共鸣',
    tagline: '先让人心疼，再让关系介入，第三章要看到第一次改变。',
    applicableTo: ['言情', '救赎', '群像羁绊', '电竞群像', '兄弟情'],
    emotionCurve: '孤独/遗憾 → 特殊的人出现 → 因对方看见新可能',
    payoffFocus: ['关系推进', '情感共鸣', '人格魅力'],
    defaultAudience: ['重视角色关系', '在意情绪起伏和互动张力'],
    defaultPromises: ['角色关系持续升温', '前三章必须让关系线有一次实质推进'],
    defaultPaceContract: '第一章建立孤独/遗憾，第二章让关键关系闯入，第三章给出因关系而发生的第一次改变。',
    blueprintHints: ['冲突源头要情绪化而非纯信息', '关系推进要有双向作用', '每次靠近都伴随新的风险'],
    goldenChapterSeeds: [
      {
        chapterNumber: 1,
        title: '展示孤独',
        summary: '让主角的遗憾、创伤或现实困境先被读者看见。',
        hook: '用一个能刺痛人的具体场景建立情绪共感。',
        payoff: '不急着解决问题，先让读者愿意陪主角走下去。',
      },
      {
        chapterNumber: 2,
        title: '闯入者登场',
        summary: '让能改变主角状态的人闯进来，打乱原本节奏。',
        hook: '关系对象的出现必须带着强烈辨识度和新问题。',
        payoff: '建立情感线的吸引力和冲突源。',
      },
      {
        chapterNumber: 3,
        title: '第一次改变',
        summary: '主角因为对方做出一个以前不会做的选择。',
        hook: '改变后立刻暴露关系代价，避免甜得太轻。',
        payoff: '兑现关系推进，让读者感知人物真的动了。',
      },
    ],
  },
]

function nowIso(): string {
  return new Date().toISOString()
}

function getStorageKey(projectId: string): string {
  return `${CREATIVE_WORKFLOW_STORAGE_PREFIX}${projectId || 'global'}`
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return []
  }

  const seen = new Set<string>()
  return input
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false
      }
      seen.add(item)
      return true
    })
}

function normalizeGoldenChapterPlan(
  input: Partial<GoldenChapterPlan> | undefined,
  fallback: GoldenChapterPlan,
): GoldenChapterPlan {
  return {
    chapterNumber: fallback.chapterNumber,
    title: typeof input?.title === 'string' ? input.title.trim() : fallback.title,
    summary: typeof input?.summary === 'string' ? input.summary.trim() : fallback.summary,
    hook: typeof input?.hook === 'string' ? input.hook.trim() : fallback.hook,
    payoff: typeof input?.payoff === 'string' ? input.payoff.trim() : fallback.payoff,
  }
}

function createBlankGoldenChapters(): GoldenChapterPlan[] {
  return [1, 2, 3].map((chapterNumber) => ({
    chapterNumber: chapterNumber as 1 | 2 | 3,
    title: `第${chapterNumber}章目标`,
    summary: '',
    hook: '',
    payoff: '',
  }))
}

export function listCreativeWorkflowTemplates(): CreativeWorkflowTemplate[] {
  return creativeWorkflowTemplates.map((template) => ({
    ...template,
    applicableTo: [...template.applicableTo],
    payoffFocus: [...template.payoffFocus],
    defaultAudience: [...template.defaultAudience],
    defaultPromises: [...template.defaultPromises],
    blueprintHints: [...template.blueprintHints],
    goldenChapterSeeds: template.goldenChapterSeeds.map((seed) => ({ ...seed })),
  }))
}

export function getCreativeWorkflowTemplate(
  templateId: CreativeWorkflowTemplateId | null | undefined,
): CreativeWorkflowTemplate | null {
  if (!templateId) {
    return null
  }

  return creativeWorkflowTemplates.find((template) => template.id === templateId) ?? null
}

export function buildInspirationGate(record: Pick<
  CreativeWorkflowRecord,
  'templateId' | 'targetAudience' | 'corePromises' | 'paceContract'
>): InspirationGateResult {
  const completedFields = {
    hasPrimaryGenre: Boolean(record.templateId),
    hasTargetAudience: record.targetAudience.length > 0,
    hasCorePromises: record.corePromises.length > 0,
    hasPaceContract: record.paceContract.trim().length > 0,
  }

  const missing: string[] = []
  if (!completedFields.hasPrimaryGenre) {
    missing.push('选择题材模板')
  }
  if (!completedFields.hasTargetAudience) {
    missing.push('补充目标读者')
  }
  if (!completedFields.hasCorePromises) {
    missing.push('补充核心卖点承诺')
  }
  if (!completedFields.hasPaceContract) {
    missing.push('补充节奏合约')
  }

  const nextActions = missing.map((item) => `完成：${item}`)

  return {
    status: missing.length === 0 ? 'ready' : 'blocked',
    missing,
    nextActions,
    completedFields,
  }
}

function createDefaultCreativeWorkflow(projectId: string): CreativeWorkflowRecord {
  const createdAt = nowIso()
  const record: CreativeWorkflowRecord = {
    version: 1,
    projectId,
    templateId: null,
    pitchLine: '',
    targetAudience: [],
    corePromises: [],
    paceContract: '',
    goldenChapters: createBlankGoldenChapters(),
    gate: {
      status: 'blocked',
      missing: [],
      nextActions: [],
      completedFields: {
        hasPrimaryGenre: false,
        hasTargetAudience: false,
        hasCorePromises: false,
        hasPaceContract: false,
      },
    },
    createdAt,
    updatedAt: createdAt,
  }

  record.gate = buildInspirationGate(record)
  return record
}

function normalizeCreativeWorkflowRecord(
  projectId: string,
  raw: Partial<CreativeWorkflowRecord> | null | undefined,
): CreativeWorkflowRecord {
  const template = getCreativeWorkflowTemplate(raw?.templateId)
  const fallbackChapters = template?.goldenChapterSeeds ?? createBlankGoldenChapters()
  const record: CreativeWorkflowRecord = {
    version: 1,
    projectId,
    templateId: template?.id ?? null,
    pitchLine: typeof raw?.pitchLine === 'string' ? raw.pitchLine.trim() : '',
    targetAudience: normalizeStringArray(raw?.targetAudience),
    corePromises: normalizeStringArray(raw?.corePromises),
    paceContract: typeof raw?.paceContract === 'string' ? raw.paceContract.trim() : '',
    goldenChapters: fallbackChapters.map((chapter, index) =>
      normalizeGoldenChapterPlan(raw?.goldenChapters?.[index], chapter),
    ),
    gate: {
      status: 'blocked',
      missing: [],
      nextActions: [],
      completedFields: {
        hasPrimaryGenre: false,
        hasTargetAudience: false,
        hasCorePromises: false,
        hasPaceContract: false,
      },
    },
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : nowIso(),
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : nowIso(),
  }
  record.gate = buildInspirationGate(record)
  return record
}

export function loadCreativeWorkflow(projectId: string): CreativeWorkflowRecord {
  const normalizedProjectId = projectId || 'global'
  const saved = storage.get<CreativeWorkflowRecord | null>(getStorageKey(normalizedProjectId), null)
  return saved
    ? normalizeCreativeWorkflowRecord(normalizedProjectId, saved)
    : createDefaultCreativeWorkflow(normalizedProjectId)
}

export function saveCreativeWorkflow(
  projectId: string,
  patch: CreativeWorkflowPatch,
): CreativeWorkflowRecord {
  const normalizedProjectId = projectId || 'global'
  const current = loadCreativeWorkflow(normalizedProjectId)

  let nextTemplateId = current.templateId
  let nextTargetAudience = current.targetAudience
  let nextCorePromises = current.corePromises
  let nextPaceContract = current.paceContract
  let nextGoldenChapters = current.goldenChapters

  if (patch.templateId !== undefined) {
    nextTemplateId = patch.templateId
    const template = getCreativeWorkflowTemplate(patch.templateId)
    if (template) {
      nextTargetAudience = [...template.defaultAudience]
      nextCorePromises = [...template.defaultPromises]
      nextPaceContract = template.defaultPaceContract
      nextGoldenChapters = template.goldenChapterSeeds.map((seed) => ({ ...seed }))
    } else {
      nextGoldenChapters = createBlankGoldenChapters()
    }
  }

  if (patch.targetAudience !== undefined) {
    nextTargetAudience = normalizeStringArray(patch.targetAudience)
  }
  if (patch.corePromises !== undefined) {
    nextCorePromises = normalizeStringArray(patch.corePromises)
  }
  if (patch.paceContract !== undefined) {
    nextPaceContract = patch.paceContract.trim()
  }
  if (patch.goldenChapters !== undefined) {
    const fallback = getCreativeWorkflowTemplate(nextTemplateId)?.goldenChapterSeeds ?? createBlankGoldenChapters()
    nextGoldenChapters = fallback.map((chapter, index) =>
      normalizeGoldenChapterPlan(patch.goldenChapters?.[index], chapter),
    )
  }

  const nextRecord = normalizeCreativeWorkflowRecord(normalizedProjectId, {
    ...current,
    pitchLine: patch.pitchLine !== undefined ? patch.pitchLine.trim() : current.pitchLine,
    templateId: nextTemplateId,
    targetAudience: nextTargetAudience,
    corePromises: nextCorePromises,
    paceContract: nextPaceContract,
    goldenChapters: nextGoldenChapters,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  })

  storage.set(getStorageKey(normalizedProjectId), nextRecord)
  return nextRecord
}

export function removeCreativeWorkflow(projectId: string): void {
  storage.remove(getStorageKey(projectId || 'global'))
}
