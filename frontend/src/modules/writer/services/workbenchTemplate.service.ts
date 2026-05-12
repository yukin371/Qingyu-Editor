import { createDocument } from '../api/document'
import { projectApi } from '../api/project'
import { updateDocumentContent } from '../api/editor'
import { isWailsWriterAvailable, wailsWriterBridge } from '../data-bridge/wails'
import {
  saveCreativeWorkflow,
  type CreativeWorkflowTemplateId,
} from './creativeWorkflow.service'
import {
  getTemplateCatalogFallback,
  listTemplateCatalogFallbacks,
  type TemplateCatalogFallbackEntry,
} from './templateCatalog.fallback'
import { DocumentType } from '../types/document'
import { buildEditorContentFromPlainText } from '../utils/editorContent'
import type {
  CreateProjectFromTemplateInput,
  TemplateCatalogItem,
  TemplateDetailPayload,
} from '../types/workbench'

type RemoteTemplateSource = TemplateCatalogFallbackEntry

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

function mapTemplateToCatalogItem(template: TemplateCatalogFallbackEntry): TemplateCatalogItem {
  return {
    id: template.id,
    name: template.name,
    tagline: template.tagline,
    category: template.category,
    templateType: template.templateType,
    applicableTo: [...template.applicableTo],
    emotionCurve: template.emotionCurve,
    recommendedLabel: template.recommendedLabel,
  }
}

function mapRemoteTemplateDetail(template: RemoteTemplateSource): TemplateDetailPayload {
  return {
    id: template.id,
    name: template.name,
    tagline: template.tagline,
    category: template.category,
    templateType: template.templateType,
    applicableTo: [...template.applicableTo],
    recommendedLabel: template.recommendedLabel,
    emotionCurve: template.emotionCurve,
    payoffFocus: [...(template.payoffFocus || [])],
    previewTabs: {
      outline: template.goldenChapterSeeds.map((chapter) => ({
        order: chapter.chapterNumber,
        title: chapter.title,
        summary: chapter.summary,
        hook: chapter.hook,
        payoff: chapter.payoff,
      })),
      characters: template.characters.map((section) => ({
        ...section,
        bullets: [...section.bullets],
      })),
      settings: template.settings.map((section) => ({
        ...section,
        bullets: [...section.bullets],
      })),
    },
    seed: {
      projectCategory: template.projectCategory,
      volumeTitle: template.volumeTitle,
      openingLine: template.openingLine,
    },
  }
}

export async function listWorkbenchTemplateCategories(): Promise<Array<{
  id: string
  label: string
  count: number
}>> {
  const templates = await listWorkbenchTemplates()
  const counts = new Map<string, number>()
  for (const template of templates) {
    const category = template.category
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  return [
    { id: 'all', label: '全部模板', count: templates.length },
    ...Array.from(counts.entries()).map(([label, count]) => ({ id: label, label, count })),
  ]
}

export async function listWorkbenchTemplates(): Promise<TemplateCatalogItem[]> {
  if (isWailsWriterAvailable()) {
    try {
      const templates = (await wailsWriterBridge.template.list()) as RemoteTemplateSource[]
      return templates.map(mapTemplateToCatalogItem)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[workbenchTemplateService] list from Wails failed, fallback to static data:', error)
      }
    }
  }
  return listTemplateCatalogFallbacks().map(mapTemplateToCatalogItem)
}

export async function getWorkbenchTemplateDetail(
  templateId: CreativeWorkflowTemplateId,
): Promise<TemplateDetailPayload | null> {
  if (isWailsWriterAvailable()) {
    try {
      const template = (await wailsWriterBridge.template.getDetail(templateId)) as RemoteTemplateSource
      return mapRemoteTemplateDetail(template)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[workbenchTemplateService] detail from Wails failed, fallback to static data:', error)
      }
    }
  }
  const template = getTemplateCatalogFallback(templateId)
  if (!template) {
    return null
  }
  return mapRemoteTemplateDetail(template)
}

export async function createProjectFromTemplate(
  input: CreateProjectFromTemplateInput,
): Promise<{ projectId: string; chapterId?: string }> {
  const detail = await getWorkbenchTemplateDetail(input.templateId)
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

  await saveCreativeWorkflow(projectId, { templateId: detail.id })

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
