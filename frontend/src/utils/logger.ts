/**
 * 统一日志管理工具
 * 提供分级日志、日志上报、性能监控等功能
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export enum LogCategory {
  API = 'API',
  AUTH = 'AUTH',
  COMPONENT = 'COMPONENT',
  PERFORMANCE = 'PERFORMANCE',
  NETWORK = 'NETWORK',
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

interface LogEntry {
  timestamp: number
  level: LogLevel
  category: LogCategory
  message: string
  data?: any
  stack?: string
  userId?: string
  sessionId?: string
}

interface LoggerOptions {
  level?: LogLevel
  enableConsole?: boolean
  enableStorage?: boolean
  enableRemote?: boolean
  maxStorageSize?: number
  remoteEndpoint?: string
}

/**
 * 日志管理器
 */
class Logger {
  private static instance: Logger
  private options: Required<LoggerOptions>
  private logBuffer: LogEntry[] = []
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.options = {
      level: this.getLogLevelFromEnv(),
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStorageSize: 1000,
      remoteEndpoint: ''
    }
    this.init()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  private getLogLevelFromEnv(): LogLevel {
    if (import.meta.env.MODE === 'production') {
      return LogLevel.WARN
    }
    return LogLevel.DEBUG
  }

  private init() {
    // 从 localStorage 读取之前的日志
    if (this.options.enableStorage) {
      this.loadLogsFromStorage()
    }

    // 页面卸载时保存日志
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveLogsToStorage()
      })
    }
  }

  /**
   * 配置日志器
   */
  configure(options: LoggerOptions) {
    this.options = { ...this.options, ...options }
  }

  /**
   * 记录调试日志
   */
  debug(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data)
  }

  /**
   * 记录信息日志
   */
  info(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data)
  }

  /**
   * 记录警告日志
   */
  warn(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data)
  }

  /**
   * 记录错误日志
   */
  error(category: LogCategory, message: string, error?: Error | any) {
    const stack = error instanceof Error ? error.stack : undefined
    this.log(LogLevel.ERROR, category, message, error, stack)
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, category: LogCategory, message: string, data?: any, stack?: string) {
    if (level < this.options.level) {
      return
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack,
      sessionId: this.sessionId
    }

    // 添加到日志缓冲区
    this.logBuffer.push(entry)

    // 控制台输出
    if (this.options.enableConsole) {
      this.logToConsole(entry)
    }

    // 本地存储
    if (this.options.enableStorage && this.logBuffer.length >= 100) {
      this.saveLogsToStorage()
    }

    // 远程上报
    if (this.options.enableRemote && level >= LogLevel.ERROR) {
      this.sendToRemote(entry)
    }

    // 限制缓冲区大小
    if (this.logBuffer.length > this.options.maxStorageSize) {
      this.logBuffer = this.logBuffer.slice(-this.options.maxStorageSize)
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry) {
    const prefix = `[${this.getLevelString(entry.level)}][${entry.category}]`
    const message = `${prefix} ${entry.message}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '')
        break
      case LogLevel.INFO:
        console.info(message, entry.data || '')
        break
      case LogLevel.WARN:
        console.warn(message, entry.data || '')
        break
      case LogLevel.ERROR:
        console.error(message, entry.data || '', entry.stack || '')
        break
    }
  }

  /**
   * 保存日志到本地存储
   */
  private saveLogsToStorage() {
    try {
      const logs = this.getStoredLogs()
      const allLogs = [...logs, ...this.logBuffer]
      const limitedLogs = allLogs.slice(-this.options.maxStorageSize)
      localStorage.setItem('app_logs', JSON.stringify(limitedLogs))
      this.logBuffer = []
    } catch (error) {
      console.error('Failed to save logs to storage:', error)
    }
  }

  /**
   * 从本地存储加载日志
   */
  private loadLogsFromStorage() {
    try {
      const logs = this.getStoredLogs()
      this.logBuffer = logs
    } catch (error) {
      console.error('Failed to load logs from storage:', error)
    }
  }

  /**
   * 获取存储的日志
   */
  private getStoredLogs(): LogEntry[] {
    const stored = localStorage.getItem('app_logs')
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 发送日志到远程服务器
   */
  private sendToRemote(entry: LogEntry) {
    if (!this.options.remoteEndpoint) {
      return
    }

    // 使用 sendBeacon 或 fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' })
      navigator.sendBeacon(this.options.remoteEndpoint, blob)
    } else {
      fetch(this.options.remoteEndpoint, {
        method: 'POST',
        body: JSON.stringify(entry),
        keepalive: true
      }).catch(err => console.error('Failed to send log:', err))
    }
  }

  /**
   * 获取日志级别字符串
   */
  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG'
      case LogLevel.INFO:
        return 'INFO'
      case LogLevel.WARN:
        return 'WARN'
      case LogLevel.ERROR:
        return 'ERROR'
      default:
        return 'UNKNOWN'
    }
  }

  /**
   * 清除所有日志
   */
  clear() {
    this.logBuffer = []
    localStorage.removeItem('app_logs')
  }

  /**
   * 导出日志
   */
  export(): string {
    const allLogs = [...this.getStoredLogs(), ...this.logBuffer]
    return JSON.stringify(allLogs, null, 2)
  }

  /**
   * 获取日志统计信息
   */
  getStats() {
    const allLogs = [...this.getStoredLogs(), ...this.logBuffer]
    const stats = {
      total: allLogs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    }

    allLogs.forEach(log => {
      const level = this.getLevelString(log.level)
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
    })

    return stats
  }
}

// 导出单例实例
export const logger = Logger.getInstance()

// 导出便捷方法
export const log = {
  debug: (category: LogCategory, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: LogCategory, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: LogCategory, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: LogCategory, message: string, error?: Error | any) => logger.error(category, message, error)
}

/**
 * 性能监控工具
 */
export class PerformanceLogger {
  private static timers = new Map<string, number>()

  /**
   * 开始计时
   */
  static start(label: string) {
    this.timers.set(label, performance.now())
    log.debug(LogCategory.PERFORMANCE, `Timer started: ${label}`)
  }

  /**
   * 结束计时并记录
   */
  static end(label: string, category: LogCategory = LogCategory.PERFORMANCE) {
    const startTime = this.timers.get(label)
    if (!startTime) {
      log.warn(LogCategory.PERFORMANCE, `Timer not found: ${label}`)
      return
    }

    const duration = performance.now() - startTime
    this.timers.delete(label)

    log.info(category, `Timer: ${label}`, {
      duration: `${duration.toFixed(2)}ms`
    })

    return duration
  }

  /**
   * 测量异步函数执行时间
   */
  static async measure<T>(
    label: string,
    fn: () => Promise<T>,
    category: LogCategory = LogCategory.PERFORMANCE
  ): Promise<T> {
    this.start(label)
    try {
      return await fn()
    } finally {
      this.end(label, category)
    }
  }

  /**
   * 测量同步函数执行时间
   */
  static measureSync<T>(
    label: string,
    fn: () => T,
    category: LogCategory = LogCategory.PERFORMANCE
  ): T {
    this.start(label)
    try {
      return fn()
    } finally {
      this.end(label, category)
    }
  }
}

/**
 * API 请求日志工具
 */
export class ApiLogger {
  /**
   * 记录 API 请求开始
   */
  static logRequest(config: any) {
    log.debug(LogCategory.API, `API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    })
  }

  /**
   * 记录 API 响应成功
   */
  static logResponse(response: any) {
    log.info(LogCategory.API, `API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      duration: response.config.metadata?.duration
    })
  }

  /**
   * 记录 API 错误
   */
  static logError(error: any) {
    const config = error.config
    log.error(LogCategory.API, `API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
  }
}

/**
 * 用户行为日志工具
 */
export class UserActionLogger {
  /**
   * 记录用户操作
   */
  static log(action: string, details?: any) {
    log.info(LogCategory.USER, `User Action: ${action}`, {
      ...details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }

  /**
   * 记录页面访问
   */
  static logPageView(path: string, params?: any) {
    this.log('PAGE_VIEW', { path, params })
  }

  /**
   * 记录按钮点击
   */
  static logClick(buttonName: string, context?: any) {
    this.log('BUTTON_CLICK', { buttonName, context })
  }

  /**
   * 记录表单提交
   */
  static logFormSubmit(formName: string, data?: any) {
    this.log('FORM_SUBMIT', { formName, data })
  }

  /**
   * 记录错误（用户侧）
   */
  static logError(action: string, error: any) {
    log.error(LogCategory.USER, `User Error: ${action}`, error)
  }
}

export default logger
