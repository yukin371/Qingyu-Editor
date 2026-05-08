/**
 * useImmersiveTimer - 沉浸模式计时器 Composable
 *
 * 从 ProjectWorkspace.vue 提取的沉浸模式计时器逻辑，包括：
 * - 计时器状态 (开始时间、累计秒数、tick ID)
 * - 面板折叠状态记忆
 * - 计时器文本格式化
 * - 启动/停止计时器方法
 */
import { ref, computed, onBeforeUnmount, type ComputedRef, type Ref } from 'vue'
import { usePanelStore } from '@/modules/writer/stores/panelStore'

// =======================
// Types
// =======================

/** useImmersiveTimer 参数 */
export interface UseImmersiveTimerOptions {
  /** 是否处于沉浸模式 */
  isImmersiveMode: ComputedRef<boolean>
}

/** useImmersiveTimer 返回值 */
export interface UseImmersiveTimerReturn {
  // 状态
  immersiveStartedAt: Ref<number | null>
  immersiveAccumulatedSeconds: Ref<number>
  immersiveTickNow: Ref<number>
  immersiveTickId: Ref<ReturnType<typeof setInterval> | null>
  immersivePrevLeftCollapsed: Ref<boolean | null>
  immersivePrevRightCollapsed: Ref<boolean | null>
  // 计算属性
  immersiveElapsedSeconds: ComputedRef<number>
  immersiveTimerText: ComputedRef<string>
  // 方法
  startImmersiveTimer: () => void
  stopImmersiveTimer: () => void
  // 生命周期
  cleanup: () => void
}

// =======================
// Composable
// =======================

/**
 * 沉浸模式计时器管理
 *
 * 管理沉浸写作模式的计时功能，包括：
 * - 累计计时（支持暂停/恢复）
 * - 自动折叠面板并记忆状态
 * - 格式化显示时间
 *
 * @param options 配置选项
 * @returns 计时器状态和方法
 *
 * @example
 * ```ts
 * const isImmersiveMode = computed(() => editorStore.activeTool === 'immersive')
 *
 * const {
 *   immersiveTimerText,
 *   startImmersiveTimer,
 *   stopImmersiveTimer,
 * } = useImmersiveTimer({ isImmersiveMode })
 *
 * // 在 watch 中响应模式切换
 * watch(isImmersiveMode, (immersive) => {
 *   if (immersive) {
 *     startImmersiveTimer()
 *   } else {
 *     stopImmersiveTimer()
 *   }
 * })
 * ```
 */
export function useImmersiveTimer(options: UseImmersiveTimerOptions): UseImmersiveTimerReturn {
  const { isImmersiveMode } = options
  const panelStore = usePanelStore()

  // =======================
  // 计时器状态
  // =======================

  /** 计时开始时间戳 (null 表示未在计时) */
  const immersiveStartedAt = ref<number | null>(null)

  /** 累计秒数 (用于暂停恢复时保持之前的计时) */
  const immersiveAccumulatedSeconds = ref(0)

  /** 当前 tick 时间戳 (用于实时计算) */
  const immersiveTickNow = ref(Date.now())

  /** setInterval 返回的 ID */
  const immersiveTickId = ref<ReturnType<typeof setInterval> | null>(null)

  // =======================
  // 面板状态记忆
  // =======================

  /** 进入沉浸模式前的左侧面板折叠状态 */
  const immersivePrevLeftCollapsed = ref<boolean | null>(null)

  /** 进入沉浸模式前的右侧面板折叠状态 */
  const immersivePrevRightCollapsed = ref<boolean | null>(null)

  // =======================
  // 计算属性
  // =======================

  /** 已计时的总秒数 */
  const immersiveElapsedSeconds = computed(() => {
    if (!isImmersiveMode.value || immersiveStartedAt.value === null) {
      return immersiveAccumulatedSeconds.value
    }
    const ongoing = Math.max(
      0,
      Math.floor((immersiveTickNow.value - immersiveStartedAt.value) / 1000)
    )
    return immersiveAccumulatedSeconds.value + ongoing
  })

  /** 格式化的计时文本 (MM:SS 或 HH:MM:SS) */
  const immersiveTimerText = computed(() => {
    const total = immersiveElapsedSeconds.value
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  // =======================
  // 方法
  // =======================

  /**
   * 启动沉浸计时器
   *
   * 如果已经启动则不会重复启动。
   * 同时会自动折叠左右面板。
   */
  const startImmersiveTimer = () => {
    // 防止重复启动
    if (immersiveStartedAt.value !== null) return

    // 记录开始时间
    immersiveStartedAt.value = Date.now()
    immersiveTickNow.value = immersiveStartedAt.value

    // 记忆当前面板状态
    immersivePrevLeftCollapsed.value = panelStore.leftCollapsed
    immersivePrevRightCollapsed.value = panelStore.rightCollapsed

    // 折叠面板
    panelStore.setLeftCollapsed(true)
    panelStore.setRightCollapsed(true)

    // 防止重复创建定时器
    if (immersiveTickId.value) return

    // 每秒更新一次 tick 时间
    immersiveTickId.value = setInterval(() => {
      immersiveTickNow.value = Date.now()
    }, 1000)
  }

  /**
   * 停止沉浸计时器
   *
   * 将当前计时累计到总时间，并恢复面板状态。
   */
  const stopImmersiveTimer = () => {
    // 累加本次计时
    if (immersiveStartedAt.value !== null) {
      const delta = Math.max(
        0,
        Math.floor((Date.now() - immersiveStartedAt.value) / 1000)
      )
      immersiveAccumulatedSeconds.value += delta
      immersiveStartedAt.value = null
    }

    // 清除定时器
    if (immersiveTickId.value) {
      clearInterval(immersiveTickId.value)
      immersiveTickId.value = null
    }

    // 恢复面板状态
    if (immersivePrevLeftCollapsed.value !== null) {
      panelStore.setLeftCollapsed(immersivePrevLeftCollapsed.value)
      immersivePrevLeftCollapsed.value = null
    }
    if (immersivePrevRightCollapsed.value !== null) {
      panelStore.setRightCollapsed(immersivePrevRightCollapsed.value)
      immersivePrevRightCollapsed.value = null
    }
  }

  /**
   * 清理资源
   *
   * 在组件卸载时调用，确保定时器被清除。
   */
  const cleanup = () => {
    if (immersiveTickId.value) {
      clearInterval(immersiveTickId.value)
      immersiveTickId.value = null
    }
  }

  // =======================
  // 生命周期
  // =======================

  // 组件卸载时清理
  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    // 状态
    immersiveStartedAt,
    immersiveAccumulatedSeconds,
    immersiveTickNow,
    immersiveTickId,
    immersivePrevLeftCollapsed,
    immersivePrevRightCollapsed,
    // 计算属性
    immersiveElapsedSeconds,
    immersiveTimerText,
    // 方法
    startImmersiveTimer,
    stopImmersiveTimer,
    // 生命周期
    cleanup,
  }
}
