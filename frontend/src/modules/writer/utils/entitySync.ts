/**
 * 数据一致性保证工具
 *
 * 原则：
 * 1. 设定百科是实体数据的单一数据源
 * 2. 图谱是关系数据的可视化界面
 * 3. 所有变更通过事件总线同步
 * 4. 本地状态与后端状态定期校验
 */

export interface SyncOptions {
  /** 是否在变更后自动校验 */
  autoValidate?: boolean
  /** 校验间隔（毫秒） */
  validateInterval?: number
  /** 校验失败回调 */
  onValidateFail?: (diff: StateDiff) => void
}

export interface StateDiff {
  missingInStore: string[]    // store 中缺失的 ID
  missingInRemote: string[]   // 远程缺失的 ID
  updatedInRemote: string[]   // 远程更新的 ID
}

/**
 * 创建同步管理器
 */
export function createSyncManager(options: SyncOptions = {}) {
  const {
    autoValidate = true,
    validateInterval = 30000, // 30秒
    onValidateFail,
  } = options

  let validateTimer: ReturnType<typeof setInterval> | null = null

  // 启动校验
  function startValidation(
    getLocalIds: () => string[],
    getRemoteIds: () => Promise<string[]>
  ) {
    if (!autoValidate) return

    validateTimer = setInterval(async () => {
      const localIds = new Set(getLocalIds())
      let remoteIds: string[] = []

      try {
        remoteIds = await getRemoteIds()
      } catch (error) {
        console.error('同步校验失败：', error)
        return
      }

      const remoteIdSet = new Set(remoteIds)

      const diff: StateDiff = {
        missingInStore: remoteIds.filter(id => !localIds.has(id)),
        missingInRemote: Array.from(localIds).filter(id => !remoteIdSet.has(id)),
        updatedInRemote: [], // 需要比较更新时间
      }

      if (
        diff.missingInStore.length > 0 ||
        diff.missingInRemote.length > 0 ||
        diff.updatedInRemote.length > 0
      ) {
        console.warn('检测到数据不一致：', diff)
        onValidateFail?.(diff)
      }
    }, validateInterval)
  }

  // 停止校验
  function stopValidation() {
    if (validateTimer) {
      clearInterval(validateTimer)
      validateTimer = null
    }
  }

  // 手动触发校验
  async function validate(
    getLocalIds: () => string[],
    getRemoteIds: () => Promise<string[]>,
    onDiff: (diff: StateDiff) => void
  ) {
    const localIds = new Set(getLocalIds())

    try {
      const remoteIds = await getRemoteIds()
      const remoteIdSet = new Set(remoteIds)

      const diff: StateDiff = {
        missingInStore: remoteIds.filter(id => !localIds.has(id)),
        missingInRemote: Array.from(localIds).filter(id => !remoteIdSet.has(id)),
        updatedInRemote: [],
      }

      onDiff(diff)
    } catch (error) {
      console.error('同步校验失败：', error)
    }
  }

  return {
    startValidation,
    stopValidation,
    validate,
  }
}

/**
 * 冲突解决策略
 */
export type ConflictResolution =
  | 'local-wins'      // 本地优先
  | 'remote-wins'     // 远程优先
  | 'manual'          // 手动解决
  | 'newest-wins'     // 以最新时间戳为准

/**
 * 解决数据冲突
 */
export function resolveConflict<T extends { updatedAt?: string }>(
  local: T,
  remote: T,
  strategy: ConflictResolution
): T {
  switch (strategy) {
    case 'local-wins':
      return local
    case 'remote-wins':
      return remote
    case 'newest-wins':
      const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
      const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0
      return remoteTime > localTime ? remote : local
    case 'manual':
    default:
      throw new Error('Manual conflict resolution required')
  }
}

/**
 * 批量处理事件，防抖重复事件
 */
export function createEventBatcher(
  processBatch: (events: any[]) => Promise<void>,
  delay = 100
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingEvents: any[] = []

  return {
    add(event: any) {
      pendingEvents.push(event)

      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        const events = [...pendingEvents]
        pendingEvents = []
        timer = null

        try {
          await processBatch(events)
        } catch (error) {
          console.error('批量处理事件失败：', error)
        }
      }, delay)
    },

    flush() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      if (pendingEvents.length > 0) {
        const events = [...pendingEvents]
        pendingEvents = []
        return processBatch(events)
      }

      return Promise.resolve()
    },
  }
}
