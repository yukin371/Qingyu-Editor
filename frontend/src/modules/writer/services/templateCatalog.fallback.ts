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

export interface TemplateCatalogFallbackSection {
  id: string
  title: string
  summary: string
  bullets: string[]
}

export interface TemplateCatalogFallbackEntry extends CreativeWorkflowTemplate {
  category: string
  templateType: string
  recommendedLabel: string
  characters: TemplateCatalogFallbackSection[]
  settings: TemplateCatalogFallbackSection[]
  projectCategory: string
  volumeTitle: string
  openingLine: string
}

const TEMPLATE_CATALOG_FALLBACKS: TemplateCatalogFallbackEntry[] = [
  {
    id: 'comeback',
    name: '逆袭打脸',
    tagline: '先压抑，再转折，第三章必须先兑现一次。',
    category: '爽感反击',
    templateType: '整套开局模板',
    recommendedLabel: '适合前三章强兑现',
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
    characters: [
      {
        id: 'hero',
        title: '被低估的主角',
        summary: '开局先让读者看到主角暂时被压制，但真正底牌不能立刻打完。',
        bullets: ['有明确被误判场景', '第一次亮牌只露一角', '第三章前完成一次正面反击'],
      },
      {
        id: 'rival',
        title: '高压反派',
        summary: '反派要在前两章持续制造羞辱感，确保第三章反击足够痛快。',
        bullets: ['嘴脸清晰', '权势或资源压制明显', '第一次败退后仍能抬升更大冲突'],
      },
    ],
    settings: [
      {
        id: 'stakes',
        title: '压制场与反转场',
        summary: '把开局空间拆成“受辱现场”“少数人见证反转”“小范围兑现”三段。',
        bullets: ['场景层级逐步抬升', '信息差服务反转', '兑现后留下更高战场'],
      },
    ],
    projectCategory: '赘婿',
    volumeTitle: '逆袭开局骨架',
    openingLine: '先压抑，再反击，把第一次打脸做成作者与读者的共同呼吸点。',
  },
  {
    id: 'power-up',
    name: '升级碾压',
    tagline: '先见困境，再给金手指，第三章必须见第一次碾压。',
    category: '升级成长',
    templateType: '成长型开局模板',
    recommendedLabel: '适合系统 / 玄幻 / 异界',
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
    characters: [
      {
        id: 'hero',
        title: '潜力主角',
        summary: '主角开局先被规则束缚，但要让读者提前看见潜力差。',
        bullets: ['困境真实', '优势有代价', '第三章起世界对主角产生新认知'],
      },
      {
        id: 'mentor',
        title: '规则见证者',
        summary: '可以是导师、系统、宿敌，用来解释规则与抬高突破门槛。',
        bullets: ['帮助读者读懂世界', '推动主角试错', '见证首次突破'],
      },
    ],
    settings: [
      {
        id: 'rules',
        title: '世界规则与外挂代价',
        summary: '世界观先立后破，金手指必须绑定清晰成本。',
        bullets: ['第一章立规矩', '第二章给钥匙', '第三章打穿一层不公'],
      },
    ],
    projectCategory: '玄幻',
    volumeTitle: '成长起步骨架',
    openingLine: '先交代规则，再让优势生效，第一次碾压必须成为世界承认主角的节点。',
  },
  {
    id: 'mystery',
    name: '求知解谜',
    tagline: '异常先出现，规则尽早亮，第三章要看到第一次破局。',
    category: '规则悬疑',
    templateType: '解谜型开局模板',
    recommendedLabel: '适合悬疑 / 规则怪谈',
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
    characters: [
      {
        id: 'solver',
        title: '破局视角者',
        summary: '负责把异常感、试错成本和推理过程串起来。',
        bullets: ['注意力敏锐', '会被规则惩罚', '第一次破局依赖前文线索'],
      },
      {
        id: 'foil',
        title: '试错代价承受者',
        summary: '通过旁人误判或牺牲，让规则的风险变成可感知事实。',
        bullets: ['信息不对称', '错误选择带来损失', '反衬主角的推理价值'],
      },
    ],
    settings: [
      {
        id: 'rules',
        title: '异常空间与禁忌',
        summary: '规则必须具体，且至少能给出一轮可验证的真伪反馈。',
        bullets: ['异常可视化', '线索能复盘', '破局后抛出更大谜团'],
      },
    ],
    projectCategory: '悬疑',
    volumeTitle: '异常引线骨架',
    openingLine: '异常和规则代价要尽早出现，第一次破局必须可回溯。',
  },
  {
    id: 'building',
    name: '建设养成',
    tagline: '先看烂摊子，再给资源杠杆，第三章要看到第一份成果。',
    category: '建设经营',
    templateType: '经营型开局模板',
    recommendedLabel: '适合种田 / 领主 / 家族',
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
    characters: [
      {
        id: 'builder',
        title: '经营者主角',
        summary: '要清楚知道自己接手的是怎样的资源黑洞，以及准备如何撬动第一轮杠杆。',
        bullets: ['困境可量化', '资源链看得见', '成果会带来下一轮扩张目标'],
      },
      {
        id: 'ally',
        title: '关键资源位',
        summary: '可以是人才、系统或关键地缘资源，用来让建设成果提前落地。',
        bullets: ['不是万能外挂', '必须立刻接入当前困局', '推动正反馈形成'],
      },
    ],
    settings: [
      {
        id: 'territory',
        title: '资源盘点与扩张线',
        summary: '把烂摊子、资源入口和第一轮建设回报拆成连续推进的清单。',
        bullets: ['压力来自现实缺口', '资源入口及时落地', '第一份成果触发更大需求'],
      },
    ],
    projectCategory: '种田',
    volumeTitle: '建设起盘骨架',
    openingLine: '先把烂摊子量化，再让第一轮建设成果可被角色和环境共同看见。',
  },
  {
    id: 'emotion',
    name: '情感共鸣',
    tagline: '先让人心疼，再让关系介入，第三章要看到第一次改变。',
    category: '情感羁绊',
    templateType: '关系型开局模板',
    recommendedLabel: '适合言情 / 救赎 / 群像',
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
    characters: [
      {
        id: 'lead',
        title: '带伤主角',
        summary: '主角需要先暴露孤独、遗憾或创伤，让关系推进有明确情绪支点。',
        bullets: ['痛点具体', '不急着自愈', '变化必须因关系触发'],
      },
      {
        id: 'anchor',
        title: '关系锚点',
        summary: '这个人物要带来辨识度、冲突和新的生存方式，而不只是安慰。',
        bullets: ['登场有侵入性', '推进是双向的', '靠近伴随风险'],
      },
    ],
    settings: [
      {
        id: 'emotion',
        title: '情绪场与关系代价',
        summary: '每次靠近都要改变角色选择，并带出新的心理或现实成本。',
        bullets: ['第一章建立共感', '第二章闯入关系对象', '第三章让主角做出不同选择'],
      },
    ],
    projectCategory: '言情',
    volumeTitle: '关系升温骨架',
    openingLine: '先让读者心疼，再让关键关系介入，第三章必须看到一次实质改变。',
  },
]

function cloneGoldenChapterSeed(seed: GoldenChapterPlan): GoldenChapterPlan {
  return { ...seed }
}

function cloneTemplateSection(section: TemplateCatalogFallbackSection): TemplateCatalogFallbackSection {
  return {
    ...section,
    bullets: [...section.bullets],
  }
}

function cloneTemplateCatalogFallback(
  template: TemplateCatalogFallbackEntry,
): TemplateCatalogFallbackEntry {
  return {
    ...template,
    applicableTo: [...template.applicableTo],
    payoffFocus: [...template.payoffFocus],
    defaultAudience: [...template.defaultAudience],
    defaultPromises: [...template.defaultPromises],
    blueprintHints: [...template.blueprintHints],
    goldenChapterSeeds: template.goldenChapterSeeds.map(cloneGoldenChapterSeed),
    characters: template.characters.map(cloneTemplateSection),
    settings: template.settings.map(cloneTemplateSection),
  }
}

function cloneCreativeWorkflowTemplate(
  template: TemplateCatalogFallbackEntry,
): CreativeWorkflowTemplate {
  const cloned = cloneTemplateCatalogFallback(template)
  return {
    id: cloned.id,
    name: cloned.name,
    tagline: cloned.tagline,
    applicableTo: cloned.applicableTo,
    emotionCurve: cloned.emotionCurve,
    payoffFocus: cloned.payoffFocus,
    defaultAudience: cloned.defaultAudience,
    defaultPromises: cloned.defaultPromises,
    defaultPaceContract: cloned.defaultPaceContract,
    blueprintHints: cloned.blueprintHints,
    goldenChapterSeeds: cloned.goldenChapterSeeds,
  }
}

export function listCreativeWorkflowFallbackTemplates(): CreativeWorkflowTemplate[] {
  return TEMPLATE_CATALOG_FALLBACKS.map(cloneCreativeWorkflowTemplate)
}

export function getCreativeWorkflowFallbackTemplate(
  templateId: CreativeWorkflowTemplateId | null | undefined,
): CreativeWorkflowTemplate | null {
  if (!templateId) {
    return null
  }

  const template = TEMPLATE_CATALOG_FALLBACKS.find((item) => item.id === templateId)
  return template ? cloneCreativeWorkflowTemplate(template) : null
}

export function listTemplateCatalogFallbacks(): TemplateCatalogFallbackEntry[] {
  return TEMPLATE_CATALOG_FALLBACKS.map(cloneTemplateCatalogFallback)
}

export function getTemplateCatalogFallback(
  templateId: CreativeWorkflowTemplateId | null | undefined,
): TemplateCatalogFallbackEntry | null {
  if (!templateId) {
    return null
  }

  const template = TEMPLATE_CATALOG_FALLBACKS.find((item) => item.id === templateId)
  return template ? cloneTemplateCatalogFallback(template) : null
}
