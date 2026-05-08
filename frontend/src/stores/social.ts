/**
 * 社交功能状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FollowStats } from '@/types/social'
import { followAPI } from '@/modules/social/api/follow'

export const useSocialStore = defineStore('social', () => {
  // 状态
  const followStats = ref<Map<string, FollowStats>>(new Map())
  const followingList = ref<Set<string>>(new Set())
  const followerList = ref<Set<string>>(new Set())
  const isLoading = ref(false)

  // Getters
  const isFollowing = computed(() => (userId: string) => {
    return followingList.value.has(userId)
  })

  const isFollower = computed(() => (userId: string) => {
    return followerList.value.has(userId)
  })

  const isMutualFollow = computed(() => (userId: string) => {
    return followingList.value.has(userId) && followerList.value.has(userId)
  })

  const getStats = computed(() => (userId: string) => {
    return followStats.value.get(userId)
  })

  // Actions
  async function fetchFollowStats(userId: string) {
    try {
      const response = await followAPI.getFollowStats(userId)
      followStats.value.set(userId, response as unknown as FollowStats)
    } catch (error) {
      console.error('[SocialStore] 获取关注统计失败:', error)
    }
  }

  async function followUser(userId: string) {
    isLoading.value = true
    try {
      await followAPI.followUser(userId)
      // 更新本地状态
      followingList.value.add(userId)

      // 更新统计
      const stats = followStats.value.get(userId)
      if (stats) {
        stats.followingCount++
      }
    } finally {
      isLoading.value = false
    }
  }

  async function unfollowUser(userId: string) {
    isLoading.value = true
    try {
      await followAPI.unfollowUser(userId)
      // 更新本地状态
      followingList.value.delete(userId)

      // 更新统计
      const stats = followStats.value.get(userId)
      if (stats) {
        stats.followingCount--
      }
    } finally {
      isLoading.value = false
    }
  }

  async function checkFollowStatus(userId: string) {
    try {
      const response = await followAPI.checkFollowStatus(userId)
      const { is_following } = response as unknown as { is_following: boolean }

      if (is_following) {
        followingList.value.add(userId)
      } else {
        followingList.value.delete(userId)
      }
    } catch (error) {
      console.error('[SocialStore] 检查关注状态失败:', error)
    }
  }

  async function fetchFollowingList(userId: string, page = 1, pageSize = 20) {
    try {
      const response = await followAPI.getFollowingList({ user_id: userId, page, page_size: pageSize })
      const data = response as unknown as { items: { user_id: string }[] }
      if (data?.items) {
        // 更新关注列表
        data.items.forEach((item: { user_id: string }) => {
          if (item.user_id) {
            followingList.value.add(item.user_id)
          }
        })

        return response
      }
    } catch (error) {
      console.error('[SocialStore] 获取关注列表失败:', error)
      throw error
    }
  }

  async function fetchFollowersList(userId: string, page = 1, pageSize = 20) {
    try {
      const response = await followAPI.getFollowersList({ user_id: userId, page, page_size: pageSize })
      const data = response as unknown as { items: { user_id: string }[] }
      if (data?.items) {
        // 更新粉丝列表
        data.items.forEach((item: { user_id: string }) => {
          if (item.user_id) {
            followerList.value.add(item.user_id)
          }
        })

        return response
      }
    } catch (error) {
      console.error('[SocialStore] 获取粉丝列表失败:', error)
      throw error
    }
  }

  // 批量操作
  async function batchFollow(userIds: string[]) {
    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    }

    for (const userId of userIds) {
      try {
        await followUser(userId)
        results.success.push(userId)
      } catch (error) {
        results.failed.push(userId)
      }
    }

    return results
  }

  // 清除缓存
  function clearCache() {
    followStats.value.clear()
    followingList.value.clear()
    followerList.value.clear()
  }

  // 清除特定用户的缓存
  function clearUserCache(userId: string) {
    followStats.value.delete(userId)
    followingList.value.delete(userId)
    followerList.value.delete(userId)
  }

  return {
    // State
    followStats,
    followingList,
    followerList,
    isLoading,

    // Getters
    isFollowing,
    isFollower,
    isMutualFollow,
    getStats,

    // Actions
    fetchFollowStats,
    followUser,
    unfollowUser,
    checkFollowStatus,
    fetchFollowingList,
    fetchFollowersList,
    batchFollow,
    clearCache,
    clearUserCache
  }
})
