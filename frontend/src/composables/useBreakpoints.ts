/**
 * useBreakpoints - 响应式断点组合式函数
 * 用于检测当前屏幕尺寸并返回相应的断点状态
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface Breakpoints {
  mobile: number
  tablet: number
  desktop: number
}

export function useBreakpoints(breakpoints: Breakpoints) {
  // 当前窗口宽度
  const windowWidth = ref(0)

  // 更新窗口宽度
  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  // 判断是否小于指定断点
  const smaller = (breakpoint: keyof Breakpoints) => {
    return computed(() => windowWidth.value < breakpoints[breakpoint])
  }

  // 判断是否大于等于指定断点
  const greaterOrEqual = (breakpoint: keyof Breakpoints) => {
    return computed(() => windowWidth.value >= breakpoints[breakpoint])
  }

  // 判断是否在两个断点之间
  const between = (lower: keyof Breakpoints, upper: keyof Breakpoints) => {
    return computed(() =>
      windowWidth.value >= breakpoints[lower] && windowWidth.value < breakpoints[upper]
    )
  }

  // 响应式断点状态
  const isMobile = smaller('mobile')
  const isTablet = between('mobile', 'desktop')
  const isDesktop = greaterOrEqual('desktop')

  // 生命周期钩子
  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    windowWidth: computed(() => windowWidth.value),
    smaller,
    greaterOrEqual,
    between,
    isMobile,
    isTablet,
    isDesktop
  }
}
