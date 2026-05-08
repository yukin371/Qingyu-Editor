/**
 * Editor utility functions
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastContext: any = null

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args
    lastContext = this

    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func.apply(lastContext, lastArgs)
          lastArgs = null
          lastContext = null
          timeoutId = null
        }
      }, wait)
    }
  }
}
