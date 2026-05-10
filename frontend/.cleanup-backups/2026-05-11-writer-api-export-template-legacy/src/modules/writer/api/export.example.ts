/**
 * Export API 使用示例
 *
 * 此文件展示了如何使用新的export API
 * 这些是示例代码，不会被编译到生产环境中
 */

import { exportApi, ExportFormats, ExportTaskStatuses } from './export'
import type { ExportDocumentRequest, ExportProjectRequest } from '../types/export'

// ============================================
// 示例1：导出单个文档
// ============================================
async function example1_ExportDocument() {
  const documentId = 'doc-123'
  const projectId = 'project-456'

  const options: ExportDocumentRequest = {
    format: ExportFormats.MD,
    includeMeta: true,
    options: {
      toc: true,
      pageNumbers: true,
      includeNotes: false
    }
  }

  try {
    const task = await exportApi.exportDocument(documentId, projectId, options)
    console.log('导出任务已创建:', task.id)
    console.log('任务状态:', task.status)
    console.log('进度:', task.progress)
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// ============================================
// 示例2：导出整个项目
// ============================================
async function example2_ExportProject() {
  const projectId = 'project-456'

  const options: ExportProjectRequest = {
    includeDocuments: true,
    includeCharacters: true,
    includeLocations: true,
    includeTimeline: false,
    documentFormats: ExportFormats.MD,
    options: {
      toc: true,
      pageNumbers: true,
      header: '我的小说',
      footer: '第{page}页',
      fontSize: 12,
      lineSpacing: 1.5
    }
  }

  try {
    const task = await exportApi.exportProject(projectId, options)
    console.log('项目导出任务已创建:', task.id)
  } catch (error) {
    console.error('项目导出失败:', error)
  }
}

// ============================================
// 示例3：轮询导出任务状态
// ============================================
async function example3_PollTaskStatus() {
  const taskId = 'task-789'

  const pollInterval = setInterval(async () => {
    try {
      const task = await exportApi.getTask(taskId)

      console.log(`任务进度: ${task.progress}%`)

      if (task.status === ExportTaskStatuses.COMPLETED) {
        clearInterval(pollInterval)
        console.log('导出完成!')
        console.log('文件URL:', task.fileUrl)
        console.log('文件大小:', task.fileSize, 'bytes')
      } else if (task.status === ExportTaskStatuses.FAILED) {
        clearInterval(pollInterval)
        console.error('导出失败:', task.errorMsg)
      }
    } catch (error) {
      clearInterval(pollInterval)
      console.error('获取任务状态失败:', error)
    }
  }, 2000) // 每2秒轮询一次
}

// ============================================
// 示例4：列出项目的所有导出任务
// ============================================
async function example4_ListProjectTasks() {
  const projectId = 'project-456'

  try {
    const result = await exportApi.listTasks(projectId, 1, 20)

    console.log(`总共有 ${result.total} 个导出任务`)
    console.log(`当前第 ${result.page} 页，每页 ${result.pageSize} 条`)

    result.items.forEach(task => {
      console.log(`- ${task.resourceTitle}: ${task.status} (${task.progress}%)`)
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

// ============================================
// 示例5：下载导出文件
// ============================================
async function example5_DownloadFile() {
  const taskId = 'task-789'

  try {
    const blob = await exportApi.downloadFile(taskId)

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'export.md' // 或从task中获取文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log('文件下载成功')
  } catch (error) {
    console.error('文件下载失败:', error)
  }
}

// ============================================
// 示例6：取消导出任务
// ============================================
async function example6_CancelTask() {
  const taskId = 'task-789'

  try {
    await exportApi.cancelTask(taskId)
    console.log('任务已取消')
  } catch (error) {
    console.error('取消任务失败:', error)
  }
}

// ============================================
// 示例7：删除导出任务
// ============================================
async function example7_DeleteTask() {
  const taskId = 'task-789'

  try {
    await exportApi.deleteTask(taskId)
    console.log('任务已删除')
  } catch (error) {
    console.error('删除任务失败:', error)
  }
}

// ============================================
// 示例8：完整的导出流程（Vue 3 Composition API）
// ============================================
import { ref } from 'vue'

function useExportDocument() {
  const isExporting = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function exportDocument(documentId: string, projectId: string) {
    isExporting.value = true
    progress.value = 0
    error.value = null

    try {
      // 创建导出任务
      const options: ExportDocumentRequest = {
        format: ExportFormats.MD,
        includeMeta: true,
        options: {
          toc: true
        }
      }

      const task = await exportApi.exportDocument(documentId, projectId, options)

      // 轮询任务状态
      const pollTask = async () => {
        const status = await exportApi.getTask(task.id)
        progress.value = status.progress

        if (status.status === ExportTaskStatuses.COMPLETED) {
          // 下载文件
          const blob = await exportApi.downloadFile(task.id)

          // 触发浏览器下载
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${status.resourceTitle}.${status.format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          isExporting.value = false
        } else if (status.status === ExportTaskStatuses.FAILED) {
          error.value = status.errorMsg || '导出失败'
          isExporting.value = false
        } else {
          // 继续轮询
          setTimeout(pollTask, 2000)
        }
      }

      pollTask()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导出失败'
      isExporting.value = false
    }
  }

  return {
    isExporting,
    progress,
    error,
    exportDocument
  }
}

// ============================================
// 示例9：使用导出选项
// ============================================
async function example9_AdvancedOptions() {
  const projectId = 'project-456'

  // 高级导出选项
  const options: ExportProjectRequest = {
    includeDocuments: true,
    includeCharacters: true,
    includeLocations: true,
    includeTimeline: false,
    documentFormats: ExportFormats.DOCX,
    options: {
      // 生成目录
      toc: true,

      // 添加页码
      pageNumbers: true,

      // 包含注释和标签
      includeNotes: true,
      includeTags: true,

      // 自定义页眉页脚
      header: '我的作品',
      footer: '第{page}页',

      // 字体设置
      fontSize: 12,
      lineSpacing: 1.5,

      // 排除某些章节
      excludeChapters: ['chapter-draft-1', 'chapter-notes']
    }
  }

  const task = await exportApi.exportProject(projectId, options)
  console.log('高级导出任务已创建:', task.id)
}

// ============================================
// 导出示例（供测试使用）
// ============================================
export {
  example1_ExportDocument,
  example2_ExportProject,
  example3_PollTaskStatus,
  example4_ListProjectTasks,
  example5_DownloadFile,
  example6_CancelTask,
  example7_DeleteTask,
  example9_AdvancedOptions,
  useExportDocument
}
