/**
 * 响应式布局组合式函数
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

// 历史断点配置
export const breakpoints: Breakpoints = {
  xs: 0,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920,
  xxl: 2560,
}

export function useResponsive() {
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  // 更新窗口尺寸
  const updateSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  // 当前断点
  const currentBreakpoint = computed<BreakpointKey>(() => {
    const width = windowWidth.value
    if (width >= breakpoints.xxl) return 'xxl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  // 是否为移动端
  const isMobile = computed(() => windowWidth.value < breakpoints.md)

  // 是否为平板
  const isTablet = computed(
    () => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.lg,
  )

  // 是否为桌面端
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

  // 是否为小屏幕
  const isSmallScreen = computed(() => windowWidth.value < breakpoints.sm)

  // 是否为大屏幕
  const isLargeScreen = computed(() => windowWidth.value >= breakpoints.xl)

  // 断点判断函数
  const isBreakpoint = (breakpoint: BreakpointKey) => {
    return computed(() => currentBreakpoint.value === breakpoint)
  }

  // 大于等于某个断点
  const isGreaterOrEqual = (breakpoint: BreakpointKey) => {
    return computed(() => windowWidth.value >= breakpoints[breakpoint])
  }

  // 小于某个断点
  const isLessThan = (breakpoint: BreakpointKey) => {
    return computed(() => windowWidth.value < breakpoints[breakpoint])
  }

  // 在某个范围内
  const isBetween = (min: BreakpointKey, max: BreakpointKey) => {
    return computed(
      () => windowWidth.value >= breakpoints[min] && windowWidth.value < breakpoints[max],
    )
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    windowWidth,
    windowHeight,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    isBreakpoint,
    isGreaterOrEqual,
    isLessThan,
    isBetween,
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}
