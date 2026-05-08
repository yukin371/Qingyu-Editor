/**
 * API 网关服务
 *
 * 统一集中管理所有后端 API 导入
 * 这是前端访问后端 API 的唯一入口
 *
 * 使用方式：
 * import { apiGateway } from '@/core/services/api-gateway.service'
 * 或在 Service 层中使用
 * const result = await apiGateway.bookstore.getHomepage()
 */

// 导入所有业务模块 API
import * as bookstoreAPI from '@/modules/bookstore/api'
import * as readerAPI from '@/modules/reader/api'
import * as userAPI from '@/modules/user/api'
import * as sharedAPI from '@/modules/shared/api'
import * as writerAPI from '@/modules/writer/api'
import * as recommendationAPI from '@/modules/recommendation/api'
import { httpService } from './http.service'

/**
 * API 网关类
 * 集中管理所有 API 导入，提供统一接口
 */
class APIGateway {
  // 书城系统 API
  public bookstore = bookstoreAPI

  // 阅读系统 API
  public reader = readerAPI

  // 用户中心 API
  public user = userAPI

  // 共享服务 API（认证、钱包、管理员等）
  public shared = sharedAPI

  // 写作系统 API
  public writer = writerAPI

  // 推荐系统 API
  public recommendation = recommendationAPI

  /**
   * 获取 HTTP 服务实例
   * 用于底层 HTTP 操作或高级配置
   */
  public getHttpService() {
    return httpService
  }

  /**
   * 设置认证 Token
   * @param token 认证令牌
   */
  public setAuthToken(token: string): void {
    httpService.setAuthToken(token)
  }

  /**
   * 清除认证 Token
   */
  public clearAuthToken(): void {
    httpService.clearAuthToken()
  }

  /**
   * 通用 API 调用方法
   * 用于动态调用 API
   * @param moduleName API 模块名（bookstore, reader, user, shared, writer, recommendation）
   * @param methodName 方法名
   * @param args 参数
   */
  public async call<T = any>(
    moduleName: string,
    methodName: string,
    ...args: any[]
  ): Promise<T> {
    const module = (this as any)[moduleName]
    if (!module) {
      throw new Error(`API module "${moduleName}" not found. Available modules: bookstore, reader, user, shared, writer, recommendation`)
    }

    const method = module[methodName]
    if (!method || typeof method !== 'function') {
      throw new Error(`Method "${moduleName}.${methodName}" not found`)
    }

    // 可在此处添加日志、性能监控等
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API Gateway] Calling ${moduleName}.${methodName}`)
    }

    return method(...args)
  }

  /**
   * 取消所有待处理的请求
   */
  public cancelAllRequests(): void {
    httpService.cancelAllRequests()
  }
}

// 导出单例实例
export const apiGateway = new APIGateway()

// 也导出类供测试使用
export default apiGateway
