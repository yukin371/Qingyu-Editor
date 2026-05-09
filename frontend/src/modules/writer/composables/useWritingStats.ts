/**
 * 写作统计 Composable
 * 处理写作统计相关的本地计算
 */
import { ref, computed } from 'vue'
import { detailedWordCount } from '../utils/wordCount'

// =======================
// 类型定义
// =======================

/**
 * 今日码字统计数据
 */
export interface TodayWritingStats {
  /** 今日码字数 */
  todayWords: number
  /** 今日新增字符数 */
  todayChars: number
  /** 昨日码字数 */
  yesterdayWords: number
  /** 本周码字数 */
  weekWords: number
  /** 本月码字数 */
  monthWords: number
  /** 最后更新时间 */
  lastUpdated: Date
}

/**
 * 项目统计数据
 */
export interface ProjectWritingStats {
  /** 项目ID */
  projectId: string
  /** 总字数 */
  totalWords: number
  /** 章节数 */
  chapterCount: number
  /** 文档数 */
  documentCount: number
  /** 今日码字 */
  todayWords: number
  /** 最后更新时间 */
  lastUpdated: Date
}

export interface DailyStats {
  date: string
  words: number
}

// =======================
// 常量
// =======================

const LOCAL_STATS_KEY = 'writing_stats'

// =======================
// 本地存储
// =======================

interface LocalWritingStats {
  [date: string]: {
    words: number
    chars: number
    projects: {
      [projectId: string]: number
    }
  }
}

/**
 * 获取本地写作统计数据
 */
function getLocalWritingStats(): LocalWritingStats {
  try {
    const data = localStorage.getItem(LOCAL_STATS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

/**
 * 保存本地写作统计数据
 */
function saveLocalWritingStats(stats: LocalWritingStats): void {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('[WritingStats] 保存本地统计数据失败:', error)
  }
}

/**
 * 获取今日日期字符串
 */
function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

// =======================
// Composable
// =======================

/**
 * 写作统计 Hook
 *
 * @param _projectId 可选的项目ID，用于项目级统计（暂未使用）
 * @returns 统计状态和方法
 */
export function useWritingStats(_projectId?: string) {
  // 今日码字状态
  const todayStats = ref<TodayWritingStats>({
    todayWords: 0,
    todayChars: 0,
    yesterdayWords: 0,
    weekWords: 0,
    monthWords: 0,
    lastUpdated: new Date(),
  })

  // 项目级统计状态
  const projectStats = ref<ProjectWritingStats | null>(null)

  // 趋势统计数据
  const trendStats = ref<DailyStats[]>([])

  // 加载状态
  const loading = ref(false)

  // 错误信息
  const error = ref<string | null>(null)

  // =======================
  // 本地计算方法
  // =======================

  /**
   * 记录当日写作
   * @param chars 新增字符数
   * @param words 新增字数
   * @param pid 项目ID（可选）
   */
  function recordTodayWriting(chars: number, words: number, pid?: string) {
    const today = getTodayDateStr()
    const stats = getLocalWritingStats()

    if (!stats[today]) {
      stats[today] = { words: 0, chars: 0, projects: {} }
    }

    stats[today].chars += chars
    stats[today].words += words

    // 如果指定了项目ID，也记录项目级的写作
    if (pid) {
      if (!stats[today].projects[pid]) {
        stats[today].projects[pid] = 0
      }
      stats[today].projects[pid] += words
    }

    saveLocalWritingStats(stats)

    // 更新今日统计
    todayStats.value = {
      ...todayStats.value,
      todayChars: stats[today].chars,
      todayWords: stats[today].words,
      lastUpdated: new Date(),
    }
  }

  /**
   * 计算字符数
   * @param text 文本内容
   * @returns 字数统计
   */
  function countWords(text: string) {
    return detailedWordCount(text, false)
  }

  /**
   * 获取指定项目的今日码字
   * @param pid 项目ID
   */
  function getProjectTodayWords(pid: string): number {
    const today = getTodayDateStr()
    const stats = getLocalWritingStats()
    return stats[today]?.projects[pid] || 0
  }

  /**
   * 获取指定日期的写作统计
   * @param dateStr 日期字符串 (YYYY-MM-DD)
   */
  function getDateStats(dateStr: string): { words: number; chars: number } {
    const stats = getLocalWritingStats()
    return {
      words: stats[dateStr]?.words || 0,
      chars: stats[dateStr]?.chars || 0,
    }
  }

function buildLocalTrendStats(days: number): DailyStats[] {
  const entries = getLocalWritingStats()
  const today = new Date()

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - index - 1))
    const key = date.toISOString().split('T')[0]
    return {
      date: key,
      words: entries[key]?.words || 0,
    }
  })
}

/**
 * 初始化今日统计
 * 桌面宿主只依赖本地统计数据
 */
  async function initTodayStats(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const today = getTodayDateStr()
      const localData = getDateStats(today)
      todayStats.value.todayWords = localData.words
      todayStats.value.todayChars = localData.chars
      todayStats.value.lastUpdated = new Date()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const yesterdayData = getDateStats(yesterdayStr)
      todayStats.value.yesterdayWords = yesterdayData.words
    } catch (err: any) {
      error.value = err.message || '获取今日统计失败'
      console.error('[WritingStats] 初始化今日统计失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载趋势统计
   */
  async function loadTrendStats(pid?: string, days: number = 30): Promise<void> {
    loading.value = true

    try {
      void pid
      trendStats.value = buildLocalTrendStats(days)
    } catch (err: any) {
      error.value = err.message || '获取趋势统计失败'
      console.error('[WritingStats] 加载趋势统计失败:', err)
    } finally {
      loading.value = false
    }
  }

  // =======================
  // 计算属性
  // =======================

  /**
   * 格式化字数显示
   */
  const formattedTodayWords = computed(() => {
    const words = todayStats.value.todayWords
    if (words >= 10000) {
      return `${(words / 10000).toFixed(1)}w`
    }
    if (words >= 1000) {
      return `${(words / 1000).toFixed(1)}k`
    }
    return words.toString()
  })

  // =======================
  // 监听器
  // =======================

  // 组件卸载时保存状态
  // 注意：这个 Composable 是响应式的，不需要手动保存

  // =======================
  // 返回
  // =======================

  return {
    // 状态
    todayStats,
    projectStats,
    trendStats,
    loading,
    error,

    // 计算属性
    formattedTodayWords,

    // 方法
    recordTodayWriting,
    countWords,
    getProjectTodayWords,
    getDateStats,
    initTodayStats,
    loadTrendStats,
  }
}

// =======================
// 独立工具函数
// =======================

/**
 * 快速记录写作字数（用于全局统计）
 * @param chars 新增字符数
 * @param words 新增字数
 * @param projectId 项目ID（可选）
 */
export function quickRecordWriting(chars: number, words: number, projectId?: string): void {
  const today = getTodayDateStr()
  const stats = getLocalWritingStats()

  if (!stats[today]) {
    stats[today] = { words: 0, chars: 0, projects: {} }
  }

  stats[today].chars += chars
  stats[today].words += words

  if (projectId) {
    if (!stats[today].projects[projectId]) {
      stats[today].projects[projectId] = 0
    }
    stats[today].projects[projectId] += words
  }

  saveLocalWritingStats(stats)
}

/**
 * 获取全局今日码字（不创建响应式状态）
 */
export function getGlobalTodayWords(): number {
  const today = getTodayDateStr()
  const stats = getLocalWritingStats()
  return stats[today]?.words || 0
}
