import { defineStore } from 'pinia'
import { ref } from 'vue'
import { documentApi } from '../api/document'
import type { Document, CreateDocumentRequest } from '../types/document'

export const useDocumentStore = defineStore('writer-document', () => {
  // State
  const tree = ref<Document[]>([])
  const flatDocs = ref<Document[]>([]) // 扁平列表，用于搜索
  const currentDocMeta = ref<Document | null>(null) // 仅元数据
  const loading = ref(false)

  // Actions
  async function loadTree(projectId: string) {
    loading.value = true
    try {
      const response: any = await documentApi.getTree(projectId)
      // 后端返回 { projectId, documents } 或直接返回 documents 数组
      if (response && Array.isArray(response.documents)) {
        // 递归转换文档树，将 documentId 映射为 id
        tree.value = convertDocumentTree(response.documents)
        flatDocs.value = flattenDocuments(tree.value)
      } else if (Array.isArray(response)) {
        tree.value = convertDocumentTree(response)
        flatDocs.value = flattenDocuments(tree.value)
      } else {
        console.warn('[documentStore] loadTree: unexpected response format', response)
        tree.value = []
        flatDocs.value = []
      }
    } catch (error) {
      console.error('[documentStore] loadTree error:', error)
      tree.value = []
      flatDocs.value = []
    } finally {
      loading.value = false
    }
  }

  // 递归转换文档树，将后端字段映射为前端字段
  function convertDocumentTree(nodes: any[]): Document[] {
    return nodes.map((node: any) => {
      const doc: Document = {
        id: node.id || node.documentId,
        projectId: node.projectId,
        parentId: node.parentId,
        title: node.title,
        type: node.type,
        level: node.level || 0,
        order: node.order || 0,
        status: node.status || 'planned',
        wordCount: node.wordCount || 0,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        characterIds: node.characterIds,
        locationIds: node.locationIds,
        timelineIds: node.timelineIds,
        tags: node.tags,
        notes: node.notes,
        children: node.children ? convertDocumentTree(node.children) : undefined,
      }
      return doc
    })
  }

  // 扁平化文档树
  function flattenDocuments(docs: Document[]): Document[] {
    const result: Document[] = []
    for (const doc of docs) {
      result.push(doc)
      if (doc.children && doc.children.length > 0) {
        result.push(...flattenDocuments(doc.children))
      }
    }
    return result
  }

  async function selectDocument(doc: Document) {
    currentDocMeta.value = doc
  }

  async function create(projectId: string, data: CreateDocumentRequest) {
    const response: any = await documentApi.create(projectId, data)
    // 后端返回 { documentId, title, type, createdAt }，需要转换为 Document 类型
    const newDoc: Document = {
      id: response.documentId || response.id,
      projectId: projectId,
      title: response.title,
      type: response.type,
      createdAt: response.createdAt,
      updatedAt: response.createdAt,
      level: 0,
      order: 0,
      status: 'planned',
      wordCount: 0,
    }
    await loadTree(projectId) // 刷新树
    return newDoc
  }

  async function move(documentId: string, parentId?: string, order?: number) {
    await documentApi.move(documentId, { parentId, order })
    // 如果有 projectId，建议刷新树；或者在前端手动移动节点以优化体验
    // 这里简单起见先刷新
    if (currentDocMeta.value?.projectId) {
      await loadTree(currentDocMeta.value.projectId)
    }
  }

  async function remove(documentId: string) {
    // 先保存 projectId，因为删除后可能清空 currentDocMeta
    const projectId = currentDocMeta.value?.projectId

    await documentApi.delete(documentId)

    // 清除当前选中的文档
    if (currentDocMeta.value?.id === documentId) {
      currentDocMeta.value = null
    }

    // 刷新文档树
    if (projectId) {
      await loadTree(projectId)
    }
  }

  return {
    tree,
    flatDocs,
    currentDocMeta,
    loading,
    loadTree,
    selectDocument,
    create,
    move,
    remove,
  }
})
