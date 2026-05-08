/**
 * Composables 导出
 *
 * 统一导出所有组合函数
 */

export { usePagination } from './usePagination'
export type { PaginationOptions, PaginationResult, UsePaginationReturn } from './usePagination'

export { useAIStream } from './useAIStream'
export type { AIStreamOptions, UseAIStreamReturn } from './useAIStream'

export { useAutoSave } from './useAutoSave'
export type { AutoSaveOptions, UseAutoSaveReturn } from './useAutoSave'

export { useDebounce } from './useDebounce'
export { useStorage } from './useStorage'

// TDD Phase 3: 阅读器核心功能
export { useReadingProgress } from './useReadingProgress'
export type { ReadingProgressData, ReadingProgressOptions } from './useReadingProgress'

export { useReaderGestures } from './useReaderGestures'
export type { ReaderGestureCallbacks, ReaderGestureOptions } from './useReaderGestures'

// TDD Phase 6: 交互与动画
export { useTouchGestures } from './useTouchGestures'
export type { TouchGestureCallbacks, TouchGestureOptions, TouchGestureConfig } from './useTouchGestures'

// TDD Phase 7: 性能优化
export { useLazyLoadImage } from './useLazyLoadImage'
export type { LazyLoadImageOptions } from './useLazyLoadImage'

// 从已有的组合函数导出
export { useLazyLoad } from './useLazyLoad'
export { useResponsive } from './useResponsive'
export { useTouch } from './useTouch'

