/**
 * 导出相关的逻辑
 */
import { ref, reactive, type Ref } from 'vue'
import { message } from '@/design-system/services'
import { exportApi } from '@/modules/writer/api/export'
import { exportFormatOptions, exportScopeOptions, type ExportTask } from '@/modules/writer/api'

// 导出类型和选项
export type { ExportTask }
export { exportFormatOptions, exportScopeOptions }

// 导出表单类型
export interface ExportForm {
  format: 'txt' | 'md' | 'docx'
  scope: 'all'
  options: string[]
}

// Mock 导出任务类型
interface MockExportTask {
  id: string
  format: string
  scope: string
  status: string
  progress: number
  created_at: string
}

// 创建默认导出表单
const createDefaultExportForm = (): ExportForm => ({
  format: 'md',
  scope: 'all',
  options: ['include_metadata', 'include_toc'],
})

export function useExport(bookId: Ref<string>, isMockProjectContext: Ref<boolean>) {
  // 导出状态
  const loadingExport = ref(false)
  const exportHistory = ref<ExportTask[]>([])
  const exportPage = ref(1)
  const exportPageSize = ref(20)
  const exportTotal = ref(0)
  const showExportDialog = ref(false)
  const exportForm = reactive<ExportForm>(createDefaultExportForm())

  // Mock 数据存储
  const mockExportMap = reactive<Record<string, MockExportTask[]>>({})

  // 加载导出历史
  const loadExportHistory = async () => {
    if (!bookId.value) return
    loadingExport.value = true
    try {
      if (isMockProjectContext.value) {
        const all = (mockExportMap[bookId.value] || []).slice().sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        const start = (exportPage.value - 1) * exportPageSize.value
        const end = start + exportPageSize.value
        exportHistory.value = all.slice(start, end) as unknown as ExportTask[]
        exportTotal.value = all.length
        return
      }
      const res = await exportApi.listTasks(bookId.value, exportPage.value, exportPageSize.value)
      exportHistory.value = res.items as unknown as ExportTask[]
      exportTotal.value = res.total
    } catch (error) {
      const err = error as Error
      message.error(err.message || '加载失败')
    } finally {
      loadingExport.value = false
    }
  }

  // 开始导出
  const startExport = async (switchToExportTab: () => void) => {
    try {
      if (isMockProjectContext.value) {
        const now = new Date().toISOString()
        const taskId = `mock-export-${Date.now()}`
        const task: MockExportTask = {
          id: taskId,
          format: exportForm.format,
          scope: exportForm.scope,
          status: 'processing',
          progress: 25,
          created_at: now,
        }
        if (!mockExportMap[bookId.value]) mockExportMap[bookId.value] = []
        mockExportMap[bookId.value].unshift(task)
        setTimeout(() => {
          const list = mockExportMap[bookId.value] || []
          const target = list.find((t) => t.id === taskId)
          if (target && target.status === 'processing') {
            target.status = 'completed'
            target.progress = 100
          }
        }, 1200)
        message.success('导出任务已创建（Mock）')
        showExportDialog.value = false
        switchToExportTab()
        loadExportHistory()
        return
      }
      await exportApi.exportProject(bookId.value, {
        includeDocuments: true,
        documentFormats: exportForm.format,
        options: {
          toc: exportForm.options.includes('include_toc'),
          includeNotes: exportForm.options.includes('include_comments'),
          includeTags: exportForm.options.includes('include_metadata'),
          pageNumbers: exportForm.options.includes('page_breaks'),
        },
      })
      message.success('导出任务已创建')
      showExportDialog.value = false
      switchToExportTab()
      loadExportHistory()
    } catch (error) {
      const err = error as Error
      message.error(err.message || '导出失败')
    }
  }

  // 下载导出
  const downloadExport = async (task: ExportTask) => {
    try {
      if (isMockProjectContext.value) {
        const content = `Mock 导出内容\n项目ID: ${bookId.value}\n任务ID: ${task.id}\n时间: ${new Date().toLocaleString('zh-CN')}\n`
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export_${task.id}.${(task as unknown as MockExportTask).format || 'txt'}`
        a.click()
        URL.revokeObjectURL(url)
        message.success('下载成功（Mock）')
        return
      }
      const blob = await exportApi.downloadFile(task.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export_${task.id}.${task.format}`
      a.click()
      URL.revokeObjectURL(url)
      message.success('下载成功')
    } catch (error) {
      const err = error as Error
      message.error(err.message || '下载失败')
    }
  }

  // 取消导出
  const cancelExport = async (task: ExportTask) => {
    try {
      if (isMockProjectContext.value) {
        const list = mockExportMap[bookId.value] || []
        const target = list.find((t) => t.id === task.id)
        if (target) {
          target.status = 'cancelled'
          target.progress = 0
        }
        message.success('已取消（Mock）')
        loadExportHistory()
        return
      }
      await exportApi.cancelTask(task.id)
      message.success('已取消')
      loadExportHistory()
    } catch (error) {
      const err = error as Error
      message.error(err.message || '操作失败')
    }
  }

  // 删除导出
  const deleteExport = async (task: ExportTask) => {
    try {
      if (isMockProjectContext.value) {
        const list = mockExportMap[bookId.value] || []
        mockExportMap[bookId.value] = list.filter((t) => t.id !== task.id)
        message.success('删除成功（Mock）')
        loadExportHistory()
        return
      }
      await exportApi.deleteTask(task.id)
      message.success('删除成功')
      loadExportHistory()
    } catch (error) {
      const err = error as Error
      message.error(err.message || '删除失败')
    }
  }

  // 重置导出表单
  const resetExportForm = () => {
    Object.assign(exportForm, createDefaultExportForm())
  }

  return {
    loadingExport,
    exportHistory,
    exportPage,
    exportPageSize,
    exportTotal,
    showExportDialog,
    exportForm,
    mockExportMap,
    loadExportHistory,
    startExport,
    downloadExport,
    cancelExport,
    deleteExport,
    resetExportForm,
  }
}
