/**
 * 阅读统计状态管理
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as readingStatsApi from '../api'
import type { ReadingStats, ReadingReport, StatsPeriod } from '@/types/reading-stats'

export const useReadingStatsStore = defineStore('readingStats', () => {
  // State
  const stats = ref<ReadingStats | null>(null)
  const report = ref<ReadingReport | null>(null)
  const history = ref<any[]>([])
  const ranking = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const totalReadingTime = computed(() => stats.value?.totalReadingTime || 0)
  const totalBooks = computed(() => stats.value?.totalBooks || 0)

  // Actions
  /**
   * 获取阅读统计
   */
  async function fetchStats(period: StatsPeriod = 'weekly') {
    loading.value = true
    error.value = null
    try {
      const data = await readingStatsApi.getReadingStats(period)
      stats.value = data
    } catch (err) {
      error.value = err as Error
      console.error('获取阅读统计失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取阅读报告
   */
  async function fetchReport(period: StatsPeriod = 'weekly') {
    loading.value = true
    try {
      const data = await readingStatsApi.getReadingReport(period)
      report.value = data
    } catch (err) {
      error.value = err as Error
      console.error('获取阅读报告失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取周报
   */
  async function fetchWeeklyReport() {
    return fetchReport('weekly')
  }

  /**
   * 获取月报
   */
  async function fetchMonthlyReport() {
    return fetchReport('monthly')
  }

  /**
   * 获取年报
   */
  async function fetchYearlyReport() {
    return fetchReport('yearly')
  }

  /**
   * 获取阅读排行
   */
  async function fetchRanking(type: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    loading.value = true
    try {
      const data = await readingStatsApi.getReadingRanking({ type })
      ranking.value = data
    } catch (err) {
      error.value = err as Error
      console.error('获取阅读排行失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取阅读历史
   */
  async function fetchHistory() {
    loading.value = true
    try {
      const response = await readingStatsApi.getReadingHistory()
      history.value = response.list
    } catch (err) {
      error.value = err as Error
      console.error('获取阅读历史失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    stats,
    report,
    history,
    ranking,
    loading,
    error,
    // Getters
    totalReadingTime,
    totalBooks,
    // Actions
    fetchStats,
    fetchReport,
    fetchWeeklyReport,
    fetchMonthlyReport,
    fetchYearlyReport,
    fetchRanking,
    fetchHistory
  }
})
