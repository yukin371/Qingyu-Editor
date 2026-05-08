<template>
  <div class="follow-view">
    <!-- 用户信息卡片 -->
    <el-card class="user-stats-card" shadow="never">
      <div class="stats-content">
        <div class="stat-item">
          <div class="stat-value">{{ stats.follower_count }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.following_count }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.mutual_count }}</div>
          <div class="stat-label">互关</div>
        </div>
      </div>
    </el-card>

    <!-- 操作栏 -->
    <div class="actions-bar">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我的关注" name="following">
          <template #label>
            <span>我的关注 {{ followingTotal > 0 ? `(${followingTotal})` : '' }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的粉丝" name="followers">
          <template #label>
            <span>我的粉丝 {{ followersTotal > 0 ? `(${followersTotal})` : '' }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="互关好友" name="mutual">
          <template #label>
            <span>互关好友 {{ mutualTotal > 0 ? `(${mutualTotal})` : '' }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="推荐关注" name="recommended" />
      </el-tabs>

      <div v-if="activeTab === 'recommended'" class="refresh-btn">
        <el-button @click="loadRecommendedFollows" :loading="loading">
          <QyIcon name="Refresh"  />
          换一批
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div v-loading="loading" class="user-list">
      <el-empty v-if="!loading && userList.length === 0" description="暂无数据" />

      <div v-for="user in userList" :key="user.user_id" class="user-card">
        <img :src="user.avatar_url || '/default-avatar.png'" :alt="user.username" class="user-avatar" />
        <div class="user-info">
          <h4 class="user-name">{{ user.username }}</h4>
          <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
          <div class="user-stats">
            <span>{{ user.follower_count }} 粉丝</span>
            <span>{{ user.following_count }} 关注</span>
          </div>
        </div>
        <div class="user-actions">
          <el-button
            v-if="activeTab === 'following'"
            type="danger"
            size="small"
            @click="handleUnfollow(user.user_id)"
          >
            取消关注
          </el-button>
          <el-button
            v-else-if="activeTab === 'followers' || activeTab === 'mutual'"
            :type="user.is_following ? 'danger' : 'primary'"
            size="small"
            @click="user.is_following ? handleUnfollow(user.user_id) : handleFollow(user.user_id)"
          >
            {{ user.is_following ? '取消关注' : '关注' }}
          </el-button>
          <el-button
            v-else-if="activeTab === 'recommended'"
            :type="user.is_following ? 'danger' : 'primary'"
            size="small"
            @click="user.is_following ? handleUnfollow(user.user_id) : handleFollow(user.user_id)"
          >
            {{ user.is_following ? '已关注' : '关注' }}
          </el-button>
          <el-button size="small" @click="viewUserProfile(user.user_id)">
            查看主页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination && total > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 40, 60]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import * as socialAPI from '@/modules/social/api'
import { useAuthStore } from '@/stores/auth'
import type { UserFollowInfo, FollowStats } from '@/modules/social/api'

const loading = ref(false)
const activeTab = ref<'following' | 'followers' | 'mutual' | 'recommended'>('following')
const userList = ref<UserFollowInfo[]>([])
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id || '')

const stats = reactive<FollowStats>({
  follower_count: 0,
  following_count: 0,
  mutual_count: 0
})

const currentPage = ref(1)
const pageSize = ref(20)
const followingTotal = ref(0)
const followersTotal = ref(0)
const mutualTotal = ref(0)

const total = computed(() => {
  switch (activeTab.value) {
    case 'following': return followingTotal.value
    case 'followers': return followersTotal.value
    case 'mutual': return mutualTotal.value
    default: return 0
  }
})

const showPagination = computed(() => {
  return activeTab.value === 'following' || activeTab.value === 'followers'
})

// 加载统计数据
const loadStats = async () => {
  if (!currentUserId.value) return
  try {
    const api = socialAPI as any
    const res = await api.getUserFollowStats?.(currentUserId.value)
    const payload = res?.data || res || {}
    Object.assign(stats, {
      follower_count: payload.follower_count || 0,
      following_count: payload.following_count || 0,
      mutual_count: payload.mutual_count || 0
    })
  } catch (error: any) {
    message.error(error.message || '加载统计数据失败')
  }
}

// 加载关注列表
const loadFollowingList = async () => {
  loading.value = true
  try {
    const api = socialAPI as any
    const res = await api.getFollowingList?.({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    const payload = res?.data || res || {}
    userList.value = payload.items || payload.data || []
    followingTotal.value = payload.total || userList.value.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载粉丝列表
const loadFollowersList = async () => {
  if (!currentUserId.value) return
  loading.value = true
  try {
    const api = socialAPI as any
    const res = await api.getFollowersList?.(currentUserId.value, {
      page: currentPage.value,
      pageSize: pageSize.value
    })
    const payload = res?.data || res || {}
    userList.value = payload.items || payload.data || []
    followersTotal.value = payload.total || userList.value.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载互关好友
const loadMutualFollows = async () => {
  loading.value = true
  try {
    const api = socialAPI as any
    const res = await api.getMutualFollows?.(100)
    const payload = res?.data || res || []
    userList.value = Array.isArray(payload) ? payload : []
    mutualTotal.value = userList.value.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载推荐关注
const loadRecommendedFollows = async () => {
  loading.value = true
  try {
    const api = socialAPI as any
    const res = await api.getRecommendedFollows?.(20)
    const payload = res?.data || res || []
    userList.value = Array.isArray(payload) ? payload : []
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 切换标签页
const handleTabChange = () => {
  currentPage.value = 1
  loadCurrentUserList()
}

// 加载当前标签页对应的列表
const loadCurrentUserList = () => {
  switch (activeTab.value) {
    case 'following':
      loadFollowingList()
      break
    case 'followers':
      loadFollowersList()
      break
    case 'mutual':
      loadMutualFollows()
      break
    case 'recommended':
      loadRecommendedFollows()
      break
  }
}

// 分页变化
const handlePageChange = () => loadCurrentUserList()
const handleSizeChange = () => {
  currentPage.value = 1
  loadCurrentUserList()
}

// 关注用户
const handleFollow = async (userId: string) => {
  try {
    await (socialAPI as any).followUser(userId)
    message.success('关注成功')
    // 更新用户状态
    const user = userList.value.find(u => u.user_id === userId)
    if (user) {
      user.is_following = true
    }
    // 重新加载统计数据
    loadStats()
  } catch (error: any) {
    message.error(error.message || '关注失败')
  }
}

// 取消关注
const handleUnfollow = async (userId: string) => {
  try {
    await (socialAPI as any).unfollowUser(userId)
    message.success('已取消关注')
    // 更新用户状态
    const user = userList.value.find(u => u.user_id === userId)
    if (user) {
      user.is_following = false
    }
    // 如果是关注列表，移除该用户
    if (activeTab.value === 'following') {
      userList.value = userList.value.filter(u => u.user_id !== userId)
      followingTotal.value--
    }
    // 重新加载统计数据
    loadStats()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 查看用户主页
const viewUserProfile = (userId: string) => {
  // TODO: 实现跳转到用户主页逻辑
  message.info(`跳转到用户 ${userId} 的主页`)
}

onMounted(() => {
  loadStats()
  loadCurrentUserList()
})
</script>

<style scoped lang="scss">
.follow-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.user-stats-card {
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-bio {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);

  span {
    margin-right: 16px;
  }
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
