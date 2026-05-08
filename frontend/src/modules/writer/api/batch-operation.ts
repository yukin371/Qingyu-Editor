import httpService from '@/core/services/http.service'
import type {
  BatchOperation,
  BatchOperationProgress,
  SubmitBatchOperationRequest,
  SubmitBatchOperationResponse,
} from '../types/batch-operation'

const BASE_URL = '/batch-operations'

/**
 * 批量操作API
 */
export const batchOperationApi = {
  /**
   * 提交批量操作
   * POST /api/v1/batch-operations
   *
   * @param data 批量操作请求参数
   * @returns 提交响应，包含batchId和初始状态
   */
  submit(data: SubmitBatchOperationRequest) {
    return httpService.post<SubmitBatchOperationResponse>(
      BASE_URL,
      data
    )
  },

  /**
   * 获取批量操作状态
   * GET /api/v1/batch-operations/:id
   *
   * @param batchId 批量操作ID
   * @returns 批量操作详情
   */
  getStatus(batchId: string) {
    return httpService.get<BatchOperation>(
      `${BASE_URL}/${batchId}`
    )
  },

  /**
   * 获取批量操作进度
   * GET /api/v1/batch-operations/:id/progress
   *
   * @param batchId 批量操作ID
   * @returns 操作进度信息
   */
  getProgress(batchId: string) {
    return httpService.get<BatchOperationProgress>(
      `${BASE_URL}/${batchId}/progress`
    )
  },

  /**
   * 取消批量操作
   * POST /api/v1/batch-operations/:id/cancel
   *
   * @param batchId 批量操作ID
   * @returns 操作结果
   */
  cancel(batchId: string) {
    return httpService.post<{ message: string }>(
      `${BASE_URL}/${batchId}/cancel`,
      {}
    )
  },

  /**
   * 撤销批量操作
   * POST /api/v1/batch-operations/:id/undo
   *
   * @param batchId 批量操作ID
   * @returns 操作结果
   */
  undo(batchId: string) {
    return httpService.post<{ message: string }>(
      `${BASE_URL}/${batchId}/undo`,
      {}
    )
  },
}

// ==========================================
// 命名导出函数（为了向后兼容和使用便利）
// ==========================================

/**
 * 提交批量操作
 */
export const submitBatchOperation = (data: SubmitBatchOperationRequest) => {
  return batchOperationApi.submit(data)
}

/**
 * 获取批量操作状态
 */
export const getBatchOperationStatus = (batchId: string) => {
  return batchOperationApi.getStatus(batchId)
}

/**
 * 获取批量操作进度
 */
export const getBatchOperationProgress = (batchId: string) => {
  return batchOperationApi.getProgress(batchId)
}

/**
 * 取消批量操作
 */
export const cancelBatchOperation = (batchId: string) => {
  return batchOperationApi.cancel(batchId)
}

/**
 * 撤销批量操作
 */
export const undoBatchOperation = (batchId: string) => {
  return batchOperationApi.undo(batchId)
}
