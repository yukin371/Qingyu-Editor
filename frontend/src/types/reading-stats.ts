/**
 * 阅读统计类型定义
 */

/**
 * 统计周期
 */
export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * 阅读统计
 */
export interface ReadingStats {
  userId: string
  period: StatsPeriod
  totalReadingTime: number      // 总阅读时长（分钟）
  totalBooks: number            // 阅读书籍数
  totalChapters: number         // 阅读章节数
  totalWords: number            // 阅读字数
  averageDaily: number          // 日均阅读时长
  longestStreak: number         // 最长连续天数
  currentStreak: number         // 当前连续天数
  favoriteGenre: string         // 最爱类型
  favoriteTime: string          // 最爱阅读时段
  favoriteDay: string           // 最爱阅读星期
  dailyBreakdown: DailyStats[]
  genreBreakdown: GenreStats[]
  monthlyTrend: TrendData[]
}

/**
 * 每日统计
 */
export interface DailyStats {
  date: string
  readingTime: number
  booksRead: number
  chaptersRead: number
  wordsRead: number
}

/**
 * 类型统计
 */
export interface GenreStats {
  genre: string
  readingTime: number
  percentage: number
  bookCount: number
}

/**
 * 趋势数据
 */
export interface TrendData {
  date: string
  value: number
}

/**
 * 阅读报告
 */
export interface ReadingReport {
  period: StatsPeriod
  startDate: string
  endDate: string
  summary: {
    totalDays: number
    readingDays: number
    completionRate: number
  }
  stats: ReadingStats
  highlights: string[]
  recommendations: string[]
}
