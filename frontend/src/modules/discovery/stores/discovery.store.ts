/**
 * 发现模块状态管理
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as discoveryApi from '../api'
import type { RecommendationItem, PersonalizedRecommendations } from '@/types/discovery'

export const useDiscoveryStore = defineStore('discovery', () => {
  // State
  const recommendations = ref<RecommendationItem[]>([])
  const personalized = ref<PersonalizedRecommendations | null>(null)
  const newReleases = ref<any[]>([])
  const editorsPick = ref<any[]>([])
  const trending = ref<any[]>([])
  const topics = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const hasRecommendations = computed(() => recommendations.value.length > 0)

  // Actions
  /**
   * 获取推荐内容
   */
  async function fetchRecommendations() {
    loading.value = true
    error.value = null
    try {
      const data = await discoveryApi.getRecommendations()
      recommendations.value = data
    } catch (err) {
      error.value = err as Error
      console.error('获取推荐失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取个性化推荐
   */
  async function fetchPersonalized() {
    loading.value = true
    try {
      const data = await discoveryApi.getPersonalizedRecommendations()
      personalized.value = data
    } catch (err) {
      console.error('获取个性化推荐失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取新书推荐
   */
  async function fetchNewReleases() {
    loading.value = true
    try {
      const response = await discoveryApi.getNewReleases()
      newReleases.value = response.list
    } catch (err) {
      console.error('获取新书推荐失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取编辑推荐
   */
  async function fetchEditorsPick() {
    loading.value = true
    try {
      const response = await discoveryApi.getEditorsPick()
      editorsPick.value = response.list
    } catch (err) {
      console.error('获取编辑推荐失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取热门榜单
   */
  async function fetchTrending(type: 'daily' | 'weekly' | 'monthly' = 'daily') {
    try {
      const data = await discoveryApi.getTrending({ type })
      trending.value = data
    } catch (err) {
      console.error('获取热门榜单失败:', err)
    }
  }

  /**
   * 获取话题列表
   */
  async function fetchTopics() {
    try {
      const response = await discoveryApi.getTopics()
      topics.value = response.list
    } catch (err) {
      console.error('获取话题列表失败:', err)
    }
  }

  return {
    // State
    recommendations,
    personalized,
    newReleases,
    editorsPick,
    trending,
    topics,
    loading,
    error,
    // Getters
    hasRecommendations,
    // Actions
    fetchRecommendations,
    fetchPersonalized,
    fetchNewReleases,
    fetchEditorsPick,
    fetchTrending,
    fetchTopics
  }
})
