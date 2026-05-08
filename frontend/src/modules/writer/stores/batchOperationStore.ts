import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { batchOperationApi } from '../api/batch-operation'
import type {
  BatchOperation,
  BatchOperationProgress,
  SubmitBatchOperationRequest,
  SubmitBatchOperationResponse,
} from '../types/batch-operation'

export const useBatchOperationStore = defineStore('writer-batch-operation', () => {
  // =======================
  // State
  // =======================

  /**
   * 当前批量操作
   */
  const currentOperation = ref<BatchOperation | null>(null)

  /**
   * 操作进度
   */
  const progress = ref<BatchOperationProgress | null>(null)

  /**
   * 加载状态
   */
  const loading = ref(false)

  /**
   * 错误信息
   */
  const error = ref<string | null>(null)

  /**
   * 轮询定时器
   */
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  // =======================
  // Computed
  // =======================

  /**
   * 操作是否完成
   */
  const isCompleted = computed(() => {
    return currentOperation.value?.status === 'completed' ||
           currentOperation.value?.status === 'failed' ||
           currentOperation.value?.status === 'cancelled' ||
           currentOperation.value?.status === 'partially_failed'
  })

  /**
   * 操作是否可取消
   */
  const isCancelable = computed(() => {
    return currentOperation.value?.cancelable ?? false
  })

  /**
   * 操作进度百分比
   */
  const progressPercentage = computed(() => {
    if (!progress.value || progress.value.totalItems === 0) {
      return 0
    }
    return Math.round((progress.value.completedItems / progress.value.totalItems) * 100)
  })

  /**
   * 是否有错误
   */
  const hasError = computed(() => {
    return progress.value?.failedItems ?? 0 > 0
  })

  // =======================
  // Actions
  // =======================

  /**
   * 提交批量操作
   */
  async function submit(request: SubmitBatchOperationRequest) {
    loading.value = true
    error.value = null

    try {
      // httpService 响应拦截器会自动解包返回 data，这里使用类型断言
      const response = await batchOperationApi.submit(request) as unknown as SubmitBatchOperationResponse

      // 保存当前操作
      currentOperation.value = {
        id: response.batchId,
        projectId: request.projectId,
        type: request.type,
        targetIds: request.targetIds,
        atomic: request.atomic ?? true,
        payload: request.payload,
        conflictPolicy: request.conflictPolicy,
        expectedVersions: request.expectedVersions,
        clientRequestId: request.clientRequestId,
        status: response.status,
        cancelable: true,
        createdBy: '', // 后端会填充
        createdAt: new Date(),
        preflightSummary: response.preflightSummary,
      }

      // 初始化进度
      progress.value = {
        batchId: response.batchId,
        status: response.status,
        totalItems: response.preflightSummary?.validCount ?? 0,
        completedItems: 0,
        failedItems: 0,
      }

      // 启动轮询
      startPolling(response.batchId)

      return response
    } catch (err: any) {
      error.value = err.message || '提交批量操作失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 启动轮询
   */
  function startPolling(batchId: string) {
    // 清除之前的定时器
    stopPolling()

    // 立即查询一次
    fetchStatus(batchId)

    // 每2秒轮询一次
    pollingTimer = setInterval(() => {
      fetchStatus(batchId)
    }, 2000)
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  /**
   * 获取操作状态
   */
  async function fetchStatus(batchId: string) {
    try {
      // httpService 响应拦截器会自动解包返回 data
      const operation = await batchOperationApi.getStatus(batchId) as unknown as BatchOperation
      currentOperation.value = operation

      // 如果操作完成，停止轮询
      if (isCompleted.value) {
        stopPolling()
      }

      // 更新进度
      const operationProgress = await batchOperationApi.getProgress(batchId) as unknown as BatchOperationProgress
      progress.value = operationProgress
    } catch (err: any) {
      // 如果是404错误，说明操作已被删除，停止轮询
      if (err.response?.status === 404) {
        stopPolling()
        return
      }

      error.value = err.message || '获取操作状态失败'
    }
  }

  /**
   * 取消批量操作
   */
  async function cancel() {
    if (!currentOperation.value || !isCancelable.value) {
      throw new Error('当前操作不可取消')
    }

    loading.value = true
    error.value = null

    try {
      await batchOperationApi.cancel(currentOperation.value.id)

      // 更新状态
      if (currentOperation.value) {
        currentOperation.value.status = 'cancelled'
      }

      // 停止轮询
      stopPolling()
    } catch (err: any) {
      error.value = err.message || '取消操作失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 撤销批量操作
   */
  async function undo() {
    if (!currentOperation.value || currentOperation.value.status !== 'completed') {
      throw new Error('只能撤销已完成的操作')
    }

    loading.value = true
    error.value = null

    try {
      await batchOperationApi.undo(currentOperation.value.id)

      // 重置状态
      currentOperation.value = null
      progress.value = null
    } catch (err: any) {
      error.value = err.message || '撤销操作失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    stopPolling()
    currentOperation.value = null
    progress.value = null
    error.value = null
    loading.value = false
  }

  // =======================
  // Lifecycle
  // =======================

  // 组件卸载时停止轮询
  // 在setup函数中调用者需要手动处理，或者使用onUnmounted
  // 这里提供清理方法
  function cleanup() {
    stopPolling()
  }

  // =======================
  // Return
  // =======================

  return {
    // State
    currentOperation,
    progress,
    loading,
    error,

    // Computed
    isCompleted,
    isCancelable,
    progressPercentage,
    hasError,

    // Actions
    submit,
    fetchStatus,
    cancel,
    undo,
    reset,
    cleanup,
  }
})
