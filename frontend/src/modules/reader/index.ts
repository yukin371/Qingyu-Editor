/**
 * Reader Module Export
 */

// Services
export { readerService } from './services/reader.service'
export { bookshelfService } from './services/bookshelf.service'

// API
export { default as readerAPI } from './api/reader'
// api/wrapper.ts 导出 - 使用显式导出避免类型冲突
export {
  // functions
  getBooks,
  getBookInfo,
  addBookToShelf,
  removeBookFromShelf,
  likeBook,
  unlikeBook,
  updateBookStatus,
  getFinishedBooks,
  getRecentBooks,
  getUnfinishedBooks,
  getBookChapters,
  getChapterInfo,
  getChapterContent,
  getChapterByNumber,
  getNextChapter,
  getPreviousChapter,
  purchaseChapter,
  getBookmarks,
  getBookmark,
  addBookToBookmarks,
  updateBookmark,
  deleteBookmark,
  getReadingProgress,
  saveReadingProgress,
  getProgress,
  saveProgress,
  getReadingHistory,
  clearReadingHistory,
  deleteHistory,
  clearHistory,
  getTotalReadingTime,
  getAnnotations,
  getBookAnnotations,
  getChapterAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationStats,
  getRecentAnnotations,
  batchCreateAnnotations,
  getCollections,
  getBookComments,
  createComment,
  deleteComment,
  addToBookshelf,
  removeFromBookshelf,
  getFirstChapter,
  getSettings,
  saveSettings,
  updateSettings,
  batchUpdateBookStatus,
  getBookshelf,
  recordReadingBehavior,
  updateReadingTime,
  mergeProgress,
  syncProgress,
  getApi,
  // manual exports from wrapper
  getFonts,
  getBuiltinFonts,
  getCustomFonts,
  getFontSettings,
  updateFontSettings,
  uploadCustomFont,
  addCustomFont,
} from './api/wrapper'
// 类型从 wrapper 导出（避免与 types/reader.types 冲突，使用显式 type 导出）
export type {
  Chapter,
  ChapterContent,
  ChapterListItem,
  ReadingProgress,
  ReadingHistory,
  ReadingSettings,
  AnnotationType,
  Annotation,
  AnnotationStats,
} from './api/wrapper'

export * from './api/manual/themes'
// 使用别名避免重复导出
export { getRecentReading as getRecentReadingBooks } from './api/manual/books'
export { getRecentReading as getRecentReadingProgress } from './api/manual/progress'

// Store
export { useReaderStore } from '@/stores/reader'

// Types - 从 types/reader.types 导出其他类型
export type * from './types/reader.types'

// Routes
export { default as readerRoutes } from './routes'

