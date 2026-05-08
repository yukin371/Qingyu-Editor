import { ref } from 'vue'

export function useDebounce<T extends (..._args: any[]) => any>(fn: T, delay: number) {
  const timer = ref<number | null>(null)
  const lastArgs = ref<Parameters<T> | null>(null)
  const lastThis = ref<any>(null)

  const debouncedFn = function (this: any, ...args: Parameters<T>) {
    lastThis.value = this // P0 Fix: 保存this上下文
    lastArgs.value = args

    if (timer.value) clearTimeout(timer.value)
    timer.value = window.setTimeout(() => {
      fn.apply(lastThis.value, lastArgs.value!)
      // 清理状态
      timer.value = null
      lastArgs.value = null
      lastThis.value = null
    }, delay)
  }

  const flush = function (this: any) {
    if (timer.value) clearTimeout(timer.value)
    if (lastArgs.value) {
      fn.apply(this || lastThis.value, lastArgs.value) // P0 Fix: 使用保存的this
      // 清理状态
      timer.value = null
      lastArgs.value = null
      lastThis.value = null
    }
  }

  return { debouncedFn, flush }
}
