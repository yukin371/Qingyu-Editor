import { createDocument } from '../api/document'
import { projectApi } from '../api/project'
import { updateDocumentContent } from '../api/editor'
import {
  getCreativeWorkflowTemplate,
  listCreativeWorkflowTemplates,
  saveCreativeWorkflow,
  type CreativeWorkflowTemplate,
  type CreativeWorkflowTemplateId,
} from './creativeWorkflow.service'
import { DocumentType } from '../types/document'
import { buildEditorContentFromPlainText } from '../utils/editorContent'
import type {
  CreateProjectFromTemplateInput,
  TemplateCatalogItem,
  TemplateDetailPayload,
  TemplateDetailSection,
} from '../types/workbench'

type TemplateBlueprint = {
  category: string
  templateType: string
  recommendedLabel: string
  volumeTitle: string
  openingLine: string
  characters: TemplateDetailSection[]
  settings: TemplateDetailSection[]
}

const TEMPLATE_BLUEPRINTS: Record<CreativeWorkflowTemplateId, TemplateBlueprint> = {
  comeback: {
    category: '爽感反击',
    templateType: '整套开局模板',
    recommendedLabel: '适合前三章强兑现',
    volumeTitle: '逆袭开局骨架',
    openingLine: '先压抑，再反击，把第一次打脸做成作者与读者的共同呼吸点。',
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
  },
  'power-up': {
    category: '升级成长',
    templateType: '成长型开局模板',
    recommendedLabel: '适合系统 / 玄幻 / 异界',
    volumeTitle: '成长起步骨架',
    openingLine: '先交代规则，再让优势生效，第一次碾压必须成为世界承认主角的节点。',
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
  },
  mystery: {
    category: '规则悬疑',
    templateType: '解谜型开局模板',
    recommendedLabel: '适合悬疑 / 规则怪谈',
    volumeTitle: '异常引线骨架',
    openingLine: '异常和规则代价要尽早出现，第一次破局必须可回溯。',
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
  },
  building: {
    category: '建设经营',
    templateType: '经营型开局模板',
    recommendedLabel: '适合种田 / 领主 / 家族',
    volumeTitle: '建设起盘骨架',
    openingLine: '先把烂摊子量化，再让第一轮建设成果可被角色和环境共同看见。',
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
  },
  emotion: {
    category: '情感羁绊',
    templateType: '关系型开局模板',
    recommendedLabel: '适合言情 / 救赎 / 群像',
    volumeTitle: '关系升温骨架',
    openingLine: '先让读者心疼，再让关键关系介入，第三章必须看到一次实质改变。',
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
  },
}

function buildTemplateChapterDraft(
  templateName: string,
  chapter: TemplateDetailPayload['previewTabs']['outline'][number],
): string {
  return buildEditorContentFromPlainText(
    [
      `【模板开局：${templateName}】`,
      `本章目标：${chapter.summary}`,
      `推进钩子：${chapter.hook}`,
      `兑现点：${chapter.payoff}`,
      '',
      '待写正文：',
    ].join('\n\n'),
  )
}

function getTemplateBlueprint(templateId: CreativeWorkflowTemplateId): TemplateBlueprint {
  return TEMPLATE_BLUEPRINTS[templateId]
}

function mapTemplateToCatalogItem(template: CreativeWorkflowTemplate): TemplateCatalogItem {
  const blueprint = getTemplateBlueprint(template.id)
  return {
    id: template.id,
    name: template.name,
    tagline: template.tagline,
    category: blueprint.category,
    templateType: blueprint.templateType,
    applicableTo: [...template.applicableTo],
    emotionCurve: template.emotionCurve,
    recommendedLabel: blueprint.recommendedLabel,
  }
}

export function listWorkbenchTemplateCategories(): Array<{
  id: string
  label: string
  count: number
}> {
  const counts = new Map<string, number>()
  for (const template of listCreativeWorkflowTemplates()) {
    const category = getTemplateBlueprint(template.id).category
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  return [
    { id: 'all', label: '全部模板', count: listCreativeWorkflowTemplates().length },
    ...Array.from(counts.entries()).map(([label, count]) => ({ id: label, label, count })),
  ]
}

export function listWorkbenchTemplates(): TemplateCatalogItem[] {
  return listCreativeWorkflowTemplates().map(mapTemplateToCatalogItem)
}

export function getWorkbenchTemplateDetail(
  templateId: CreativeWorkflowTemplateId,
): TemplateDetailPayload | null {
  const template = getCreativeWorkflowTemplate(templateId)
  if (!template) {
    return null
  }

  const blueprint = getTemplateBlueprint(template.id)

  return {
    id: template.id,
    name: template.name,
    tagline: template.tagline,
    category: blueprint.category,
    templateType: blueprint.templateType,
    applicableTo: [...template.applicableTo],
    recommendedLabel: blueprint.recommendedLabel,
    emotionCurve: template.emotionCurve,
    payoffFocus: [...template.payoffFocus],
    previewTabs: {
      outline: template.goldenChapterSeeds.map((chapter) => ({
        order: chapter.chapterNumber,
        title: chapter.title,
        summary: chapter.summary,
        hook: chapter.hook,
        payoff: chapter.payoff,
      })),
      characters: blueprint.characters.map((section) => ({
        ...section,
        bullets: [...section.bullets],
      })),
      settings: blueprint.settings.map((section) => ({
        ...section,
        bullets: [...section.bullets],
      })),
    },
    seed: {
      projectCategory: template.applicableTo[0] || blueprint.category,
      volumeTitle: blueprint.volumeTitle,
      openingLine: blueprint.openingLine,
    },
  }
}

export async function createProjectFromTemplate(
  input: CreateProjectFromTemplateInput,
): Promise<{ projectId: string; chapterId?: string }> {
  const detail = getWorkbenchTemplateDetail(input.templateId)
  if (!detail) {
    throw new Error('模板不存在，无法创建项目')
  }

  const created = (await projectApi.create({
    title: input.title,
    summary: input.summary || detail.tagline,
    category: detail.seed.projectCategory,
    visibility: input.visibility,
  })) as { id?: string; projectId?: string }

  const projectId = created.id || created.projectId
  if (!projectId) {
    throw new Error('项目创建成功但未返回项目 ID')
  }

  saveCreativeWorkflow(projectId, { templateId: detail.id })

  const volume = await createDocument(projectId, {
    projectId,
    title: detail.seed.volumeTitle,
    type: DocumentType.VOLUME,
    order: 0,
  })

  let firstChapterId = ''
  for (const [index, chapter] of detail.previewTabs.outline.entries()) {
    const createdChapter = await createDocument(projectId, {
      projectId,
      parentId: volume.id,
      title: chapter.title,
      type: DocumentType.CHAPTER,
      order: index,
    })

    if (!firstChapterId) {
      firstChapterId = createdChapter.id
    }

    await updateDocumentContent(createdChapter.id, buildTemplateChapterDraft(detail.name, chapter))
  }

  return {
    projectId,
    chapterId: firstChapterId || undefined,
  }
}
