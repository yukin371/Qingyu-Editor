import type { ChatContextSnippet } from '@/modules/writer/components/editor/ai/types'
import type { WriterDocumentToolEntry } from '@/modules/writer/types/document-tools'
import {
  detectWriterPromptIntent,
  type AIApplyMode,
  type WriterPromptIntent,
} from '@/modules/writer/types/workflow'
import { documentToolsService } from './documentTools.service'

export interface WriterDocumentAgentContext {
  projectId?: string
  currentDocumentId?: string | null
  currentDocumentTitle?: string | null
  currentSourceText?: string | null
  selectedContext?: ChatContextSnippet | null
}

export interface WriterResolvedDocumentTarget {
  status: 'ready' | 'unresolved'
  sourceText?: string
  targetKind?: 'current_document' | 'selection' | 'revision' | 'resolved_document'
  targetDocumentId?: string
  targetDocumentTitle?: string
  applyModeHint?: AIApplyMode
  useSelectionContext?: boolean
  requestLabel?: string
  assistantMessage?: string
  candidates?: WriterDocumentTargetCandidate[]
}

export interface WriterDocumentTargetCandidate {
  documentId: string
  documentTitle: string
  reason?: string
}

export type WriterEditorRoute =
  | 'chat'
  | 'analysis'
  | 'single_document_edit'
  | 'search_then_edit'
  | 'plan_only'

export type WriterEditorMutationMode =
  | 'none'
  | 'single_document_diff'
  | 'multi_document_plan'
  | 'chapter_create_plan'

export interface WriterEditorContextPacket {
  kind:
    | 'current_document'
    | 'selection'
    | 'revision_candidate'
    | 'resolved_document'
    | 'search_hit'
    | 'workflow_summary'
  documentId?: string
  documentTitle?: string
  excerpt?: string
  reason?: string
}

export interface WriterEditorPlan {
  route: WriterEditorRoute
  mutationMode: WriterEditorMutationMode
  intent: WriterPromptIntent | null
  target: WriterResolvedDocumentTarget
  retrievals: WriterEditorContextPacket[]
  requiresConfirmation: boolean
  userVisibleSummary: string
}

const CURRENT_DOCUMENT_PATTERNS = [
  /当前章节/,
  /当前这章/,
  /本章/,
  /整章/,
  /这一章/,
  /这一章节/,
  /全文/,
]

const PREVIOUS_DOCUMENT_PATTERNS = [/上一章/, /前一章/, /上一节/, /前一节/]
const NEXT_DOCUMENT_PATTERNS = [/下一章/, /后一章/, /下一节/, /后一节/]
const MUTATION_PATTERNS = [
  /新增/,
  /增加/,
  /添加/,
  /补充/,
  /补强/,
  /补一段/,
  /加一段/,
  /增强/,
  /强化/,
  /删除/,
  /删掉/,
  /去掉/,
  /移除/,
  /改/,
  /修改/,
  /改写/,
  /重写/,
  /润色/,
  /调整/,
  /扩写/,
  /扩充/,
  /续写/,
]
const ANALYSIS_PATTERNS = [
  /查找/,
  /搜索/,
  /找出/,
  /找到/,
  /审查/,
  /审校/,
  /校对/,
  /总结/,
  /摘要/,
  /概括/,
  /分析/,
  /检查/,
]
const MULTI_DOCUMENT_PATTERNS = [
  /所有章节/,
  /全部章节/,
  /每一章/,
  /每章/,
  /多章/,
  /这几章/,
  /几章都/,
  /前[一二两三四五六七八九十0-9]+章/,
  /后[一二两三四五六七八九十0-9]+章/,
  /第[一二两三四五六七八九十0-9]+[到至-]第?[一二两三四五六七八九十0-9]+章/,
  /所有提到/,
  /全部提到/,
]
const CHAPTER_CREATE_PATTERNS = [
  /新增一章/,
  /新建一章/,
  /创建一章/,
  /增加一章/,
  /加一章/,
  /新增章节/,
  /新建章节/,
  /创建章节/,
  /(?:新增|新建|创建).{0,12}章/,
]
const SEARCH_PATTERNS = [
  /找到提到(.+?)的章节/,
  /找到出现(.+?)的章节/,
  /找到包含(.+?)的章节/,
  /所有提到(.+?)的章节/,
  /全部提到(.+?)的章节/,
  /搜索(.+?)的章节/,
  /查找(.+?)的章节/,
]

function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function includesAnyPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

function hasMutationSemantics(text: string, intent: WriterPromptIntent | null): boolean {
  return intent?.kind === 'edit' || includesAnyPattern(text, MUTATION_PATTERNS)
}

function hasAnalysisSemantics(text: string, intent: WriterPromptIntent | null): boolean {
  return intent?.kind === 'analysis' || includesAnyPattern(text, ANALYSIS_PATTERNS)
}

function isMultiDocumentRequest(text: string): boolean {
  return includesAnyPattern(text, MULTI_DOCUMENT_PATTERNS)
}

function isChapterCreateRequest(text: string): boolean {
  return includesAnyPattern(text, CHAPTER_CREATE_PATTERNS)
}

function extractQuotedDocumentRef(text: string): string | null {
  const match = text.match(/《([^》]+)》|“([^”]+)”|"([^"]+)"/)
  const value = match?.[1] || match?.[2] || match?.[3] || ''
  return value.trim() || null
}

function extractChapterNumberRef(text: string): string | null {
  const match = text.match(/第\s*([0-9零一二三四五六七八九十百千两]+)\s*[章节回]/)
  return match?.[0]?.replace(/\s+/g, '') || null
}

function extractSearchQuery(text: string): string | null {
  for (const pattern of SEARCH_PATTERNS) {
    const match = text.match(pattern)
    const value = match?.[1]?.trim()
    if (value) {
      return value
    }
  }
  return null
}

function describeDocument(documentId?: string | null, documentTitle?: string | null): string {
  const title = documentTitle?.trim()
  if (title) {
    return `《${title}》`
  }
  return documentId?.trim() || '目标章节'
}

function getExplicitDocumentRef(text: string): string | null {
  return extractQuotedDocumentRef(text) || extractChapterNumberRef(text)
}

function buildUnresolvedPlanTarget(requestLabel: string): WriterResolvedDocumentTarget {
  return {
    status: 'unresolved',
    requestLabel,
  }
}

function buildContextPacketFromTarget(
  target: WriterResolvedDocumentTarget,
  text: string,
): WriterEditorContextPacket | null {
  if (target.status !== 'ready') {
    return null
  }

  const excerpt = target.sourceText?.slice(0, 240)
  if (target.targetKind === 'selection') {
    return {
      kind: 'selection',
      excerpt,
      reason: '用户当前选区',
    }
  }

  if (target.targetKind === 'revision') {
    return {
      kind: 'revision_candidate',
      excerpt,
      reason: '当前候选稿继续修改',
    }
  }

  if (target.targetKind === 'resolved_document') {
    return {
      kind: extractSearchQuery(text) ? 'search_hit' : 'resolved_document',
      documentId: target.targetDocumentId,
      documentTitle: target.targetDocumentTitle,
      excerpt,
      reason: extractSearchQuery(text) ? '跨章节搜索唯一命中' : target.requestLabel,
    }
  }

  return {
    kind: 'current_document',
    documentId: target.targetDocumentId,
    documentTitle: target.targetDocumentTitle,
    excerpt,
    reason: '当前章节全文',
  }
}

function buildRetrievalsFromTarget(
  target: WriterResolvedDocumentTarget,
  text: string,
): WriterEditorContextPacket[] {
  if (target.candidates?.length) {
    return target.candidates.map((candidate) => ({
      kind: extractSearchQuery(text) ? 'search_hit' : 'resolved_document',
      documentId: candidate.documentId,
      documentTitle: candidate.documentTitle,
      reason: candidate.reason,
    }))
  }

  const packet = buildContextPacketFromTarget(target, text)
  return packet ? [packet] : []
}

function scoreDocumentRefMatch(document: WriterDocumentToolEntry, normalizedRef: string): number {
  const title = document.title.trim().toLowerCase()
  const id = document.documentId.trim().toLowerCase()
  if (!normalizedRef) return -1
  if (title === normalizedRef || id === normalizedRef) return 100
  if (title.includes(normalizedRef)) return 80
  if (normalizedRef.includes(title) && title) return 70
  if (id.includes(normalizedRef)) return 60
  return -1
}

function findCurrentDocumentIndex(
  documents: WriterDocumentToolEntry[],
  currentDocumentId?: string | null,
): number {
  if (!currentDocumentId?.trim()) return -1
  return documents.findIndex((item) => item.documentId === currentDocumentId)
}

function formatCandidateDocuments(documents: WriterDocumentToolEntry[]): string {
  return documents
    .slice(0, 5)
    .map((item) => `- ${describeDocument(item.documentId, item.title)}（${item.documentId}）`)
    .join('\n')
}

function toDocumentCandidates(
  documents: WriterDocumentToolEntry[],
  getReason?: (document: WriterDocumentToolEntry) => string | undefined,
): WriterDocumentTargetCandidate[] {
  return documents.slice(0, 5).map((document) => ({
    documentId: document.documentId,
    documentTitle: document.title,
    reason: getReason?.(document),
  }))
}

async function readResolvedDocument(document: WriterDocumentToolEntry) {
  const result = await documentToolsService.readDocument(document.documentId)
  return {
    sourceText: result.lines.map((line) => line.text).join('\n'),
    targetDocumentId: document.documentId,
    targetDocumentTitle: document.title,
    requestLabel: `${describeDocument(document.documentId, document.title)} 全文`,
  }
}

async function resolveDocumentById(
  documentId: string,
  context: WriterDocumentAgentContext,
): Promise<WriterResolvedDocumentTarget> {
  if (!context.projectId?.trim()) {
    return {
      status: 'unresolved',
      assistantMessage: '当前项目上下文缺失，无法读取目标章节。',
    }
  }

  const documents = (await documentToolsService.listDocuments(context.projectId)).documents
  const target = documents.find((item) => item.documentId === documentId)
  if (!target) {
    return {
      status: 'unresolved',
      assistantMessage: `没有找到 documentId 为“${documentId}”的章节。`,
    }
  }

  const resolved = await readResolvedDocument(target)
  return {
    status: 'ready',
    targetKind: 'resolved_document',
    ...resolved,
  }
}

async function resolveRelativeDocument(
  text: string,
  context: WriterDocumentAgentContext,
): Promise<WriterResolvedDocumentTarget | null> {
  const isPrevious = includesAnyPattern(text, PREVIOUS_DOCUMENT_PATTERNS)
  const isNext = includesAnyPattern(text, NEXT_DOCUMENT_PATTERNS)
  if (!isPrevious && !isNext) {
    return null
  }

  if (!context.projectId?.trim()) {
    return {
      status: 'unresolved',
      assistantMessage: '当前项目上下文缺失，无法解析上一章/下一章。',
    }
  }

  const documents = (await documentToolsService.listDocuments(context.projectId)).documents
  const currentIndex = findCurrentDocumentIndex(documents, context.currentDocumentId)
  if (currentIndex < 0) {
    return {
      status: 'unresolved',
      assistantMessage: '当前未定位到章节，无法解析上一章/下一章。',
    }
  }

  const nextIndex = isPrevious ? currentIndex - 1 : currentIndex + 1
  const target = documents[nextIndex]
  if (!target) {
    return {
      status: 'unresolved',
      assistantMessage: isPrevious
        ? '当前章节已经是第一章，无法定位上一章。'
        : '当前章节已经是最后一章，无法定位下一章。',
    }
  }

  const resolved = await readResolvedDocument(target)
  return {
    status: 'ready',
    targetKind: 'resolved_document',
    ...resolved,
  }
}

async function resolveExplicitDocument(
  text: string,
  context: WriterDocumentAgentContext,
): Promise<WriterResolvedDocumentTarget | null> {
  const explicitRef = getExplicitDocumentRef(text)
  if (!explicitRef || !context.projectId?.trim()) {
    return null
  }

  const documents = (await documentToolsService.listDocuments(context.projectId)).documents
  const normalizedRef = explicitRef.trim().toLowerCase()
  const matches = documents
    .map((document) => ({
      document,
      score: scoreDocumentRefMatch(document, normalizedRef),
    }))
    .filter((item) => item.score >= 0)
    .sort((left, right) => right.score - left.score)

  if (matches.length === 0) {
    return {
      status: 'unresolved',
      assistantMessage: `没有找到与“${explicitRef}”匹配的章节。`,
    }
  }

  if (matches.length > 1 && matches[0].score === matches[1].score) {
    return {
      status: 'unresolved',
      requestLabel: `章节引用“${explicitRef}”`,
      assistantMessage: [
        `“${explicitRef}”匹配到多个章节，请改得更具体：`,
        formatCandidateDocuments(matches.map((item) => item.document)),
      ].join('\n'),
      candidates: toDocumentCandidates(matches.map((item) => item.document)),
    }
  }

  const resolved = await readResolvedDocument(matches[0].document)
  return {
    status: 'ready',
    targetKind: 'resolved_document',
    ...resolved,
  }
}

async function resolveSearchDocument(
  text: string,
  context: WriterDocumentAgentContext,
): Promise<WriterResolvedDocumentTarget | null> {
  const query = extractSearchQuery(text)
  if (!query || !context.projectId?.trim()) {
    return null
  }

  const documents = (await documentToolsService.listDocuments(context.projectId)).documents
  const matches: Array<{
    document: WriterDocumentToolEntry
    totalMatches: number
  }> = []

  for (const document of documents) {
    const result = await documentToolsService.searchDocument({
      documentId: document.documentId,
      query,
      contextLines: 0,
    })
    if (result.totalMatches > 0) {
      matches.push({
        document,
        totalMatches: result.totalMatches,
      })
    }
  }

  if (matches.length === 0) {
    return {
      status: 'unresolved',
      assistantMessage: `没有找到包含“${query}”的章节。`,
    }
  }

  if (matches.length > 1) {
    return {
      status: 'unresolved',
      requestLabel: `搜索“${query}”`,
      assistantMessage: [
        `“${query}”命中了多个章节，请指定目标章节：`,
        formatCandidateDocuments(matches.map((item) => item.document)),
      ].join('\n'),
      candidates: toDocumentCandidates(
        matches.map((item) => item.document),
        (document) => {
          const matched = matches.find((item) => item.document.documentId === document.documentId)
          return matched ? `命中 ${matched.totalMatches} 处“${query}”` : undefined
        },
      ),
    }
  }

  const resolved = await readResolvedDocument(matches[0].document)
  return {
    status: 'ready',
    targetKind: 'resolved_document',
    ...resolved,
  }
}

export function shouldForceCurrentDocumentTarget(text: string): boolean {
  return includesAnyPattern(text, CURRENT_DOCUMENT_PATTERNS)
}

export async function resolveWriterDocumentTarget(
  text: string,
  context: WriterDocumentAgentContext,
): Promise<WriterResolvedDocumentTarget> {
  const normalizedText = normalizeInput(text)

  const relativeTarget = await resolveRelativeDocument(normalizedText, context)
  if (relativeTarget) {
    return relativeTarget
  }

  const explicitTarget = await resolveExplicitDocument(normalizedText, context)
  if (explicitTarget) {
    return explicitTarget
  }

  const searchedTarget = await resolveSearchDocument(normalizedText, context)
  if (searchedTarget) {
    return searchedTarget
  }

  if (shouldForceCurrentDocumentTarget(normalizedText)) {
    const sourceText = context.currentSourceText?.trim() || ''
    if (!sourceText) {
      return {
        status: 'unresolved',
        assistantMessage: '当前章节正文为空，无法直接编辑整章内容。',
      }
    }
    return {
      status: 'ready',
      targetKind: 'current_document',
      sourceText,
      requestLabel: `${describeDocument(context.currentDocumentId, context.currentDocumentTitle)} 全文`,
    }
  }

  const selectedContext = context.selectedContext
  if (selectedContext?.text.trim()) {
    if (selectedContext.kind === 'revision') {
      return {
        status: 'ready',
        targetKind: 'revision',
        sourceText: selectedContext.text.trim(),
        applyModeHint: selectedContext.applyMode || 'replace_document',
        requestLabel: '当前候选稿',
      }
    }

    return {
      status: 'ready',
      targetKind: 'selection',
      sourceText: selectedContext.text.trim(),
      useSelectionContext: true,
      requestLabel: '当前选中片段',
    }
  }

  const currentSourceText = context.currentSourceText?.trim() || ''
  if (currentSourceText) {
    return {
      status: 'ready',
      targetKind: 'current_document',
      sourceText: currentSourceText,
      requestLabel: `${describeDocument(context.currentDocumentId, context.currentDocumentTitle)} 全文`,
    }
  }

  return {
    status: 'unresolved',
    assistantMessage: '当前没有可编辑的正文上下文，请先打开目标章节或选中需要修改的内容。',
  }
}

export function buildPlanSummary(plan: WriterEditorPlan): string {
  if (plan.mutationMode === 'chapter_create_plan') {
    return '计划：识别为新增章节请求。当前只生成章节创建计划，不直接创建节点或写入正文。'
  }

  if (plan.mutationMode === 'multi_document_plan') {
    const candidateCount = plan.target.candidates?.length || plan.retrievals.length
    return candidateCount > 0
      ? `计划：识别为多章节请求，已整理 ${candidateCount} 个候选章节。当前只返回逐章计划，不自动应用多章 diff。`
      : '计划：识别为多章节请求。当前只返回逐章计划，不自动应用多章 diff。'
  }

  if (plan.route === 'search_then_edit') {
    const label =
      plan.target.requestLabel ||
      describeDocument(plan.target.targetDocumentId, plan.target.targetDocumentTitle)
    return `计划：先完成跨章节查找，再对${label}生成单章 diff。`
  }

  if (plan.route === 'single_document_edit') {
    const label =
      plan.target.requestLabel ||
      describeDocument(plan.target.targetDocumentId, plan.target.targetDocumentTitle)
    return `计划：对${label}生成单章 diff，交由正文编辑器确认。`
  }

  if (plan.route === 'analysis') {
    const label =
      plan.target.requestLabel ||
      describeDocument(plan.target.targetDocumentId, plan.target.targetDocumentTitle)
    return `计划：仅分析${label}，不生成正文 diff。`
  }

  return '计划：按普通对话处理，不读取或修改章节正文。'
}

export async function planWriterEditorRequest(
  text: string,
  context: WriterDocumentAgentContext,
): Promise<WriterEditorPlan> {
  const normalizedText = normalizeInput(text)
  const intent = detectWriterPromptIntent(normalizedText)
  const hasMutation = hasMutationSemantics(normalizedText, intent)
  const hasAnalysis = hasAnalysisSemantics(normalizedText, intent)
  const searchQuery = extractSearchQuery(normalizedText)

  if (isChapterCreateRequest(normalizedText)) {
    const basePlan: WriterEditorPlan = {
      route: 'plan_only',
      mutationMode: 'chapter_create_plan',
      intent,
      target: buildUnresolvedPlanTarget('新章节创建计划'),
      retrievals: [],
      requiresConfirmation: true,
      userVisibleSummary: '',
    }
    return {
      ...basePlan,
      userVisibleSummary: buildPlanSummary(basePlan),
    }
  }

  if (isMultiDocumentRequest(normalizedText)) {
    const target = searchQuery
      ? await resolveWriterDocumentTarget(normalizedText, context)
      : buildUnresolvedPlanTarget('多章节计划')
    const basePlan: WriterEditorPlan = {
      route: 'plan_only',
      mutationMode: 'multi_document_plan',
      intent,
      target,
      retrievals: buildRetrievalsFromTarget(target, normalizedText),
      requiresConfirmation: true,
      userVisibleSummary: '',
    }
    return {
      ...basePlan,
      userVisibleSummary: buildPlanSummary(basePlan),
    }
  }

  if (!hasMutation && !hasAnalysis && !searchQuery) {
    const basePlan: WriterEditorPlan = {
      route: 'chat',
      mutationMode: 'none',
      intent,
      target: buildUnresolvedPlanTarget('普通对话'),
      retrievals: [],
      requiresConfirmation: false,
      userVisibleSummary: '',
    }
    return {
      ...basePlan,
      userVisibleSummary: buildPlanSummary(basePlan),
    }
  }

  const target = await resolveWriterDocumentTarget(normalizedText, context)
  const retrievals = buildRetrievalsFromTarget(target, normalizedText)

  if (target.status !== 'ready') {
    const basePlan: WriterEditorPlan = {
      route: hasMutation || target.candidates?.length ? 'plan_only' : 'analysis',
      mutationMode: target.candidates?.length ? 'multi_document_plan' : 'none',
      intent,
      target,
      retrievals,
      requiresConfirmation: true,
      userVisibleSummary: '',
    }
    return {
      ...basePlan,
      userVisibleSummary: buildPlanSummary(basePlan),
    }
  }

  if (hasMutation) {
    const basePlan: WriterEditorPlan = {
      route: searchQuery ? 'search_then_edit' : 'single_document_edit',
      mutationMode: 'single_document_diff',
      intent,
      target,
      retrievals,
      requiresConfirmation: false,
      userVisibleSummary: '',
    }
    return {
      ...basePlan,
      userVisibleSummary: buildPlanSummary(basePlan),
    }
  }

  const basePlan: WriterEditorPlan = {
    route: 'analysis',
    mutationMode: 'none',
    intent,
    target,
    retrievals,
    requiresConfirmation: false,
    userVisibleSummary: '',
  }
  return {
    ...basePlan,
    userVisibleSummary: buildPlanSummary(basePlan),
  }
}

export const writerDocumentAgentService = {
  resolveTarget: resolveWriterDocumentTarget,
  resolveTargetById: resolveDocumentById,
  shouldForceCurrentDocumentTarget,
  planWriterEditorRequest,
  buildPlanSummary,
}
