<template>
  <QyCard class="user-card" :class="compact ? 'compact' : ''">
    <template #title v-if="!compact"></template>
    <div class="user-card-content">
      <!-- 用户头像 -->
      <QyAvatar
        size="lg"
        :src="user.avatar"
        :text="user.nickname || user.username || 'U'"
        class="user-avatar"
      />

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-header">
          <h3 class="user-name" @click="goToProfile">
            {{ user.nickname || user.username }}
          </h3>
          <span
            v-if="showRole"
            :class="['role-tag', `role-tag-${getRoleType(user.role)}`]"
          >
            {{ getRoleText(user.role) }}
          </span>
        </div>

        <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>

        <!-- 统计数据 -->
        <div v-if="showStats && stats" class="user-stats">
          <div v-if="stats.bookCount !== undefined" class="stat-item">
            <span class="stat-value">{{ stats.bookCount }}</span>
            <span class="stat-label">作品</span>
          </div>
          <div v-if="stats.followerCount !== undefined" class="stat-item">
            <span class="stat-value">{{ formatNumber(stats.followerCount) }}</span>
            <span class="stat-label">关注者</span>
          </div>
          <div v-if="stats.totalWords !== undefined" class="stat-item">
            <span class="stat-value">{{ formatNumber(stats.totalWords) }}</span>
            <span class="stat-label">总字数</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="showActions" class="user-actions">
          <QyButton
            v-if="showFollow && !isCurrentUser"
            :variant="isFollowing ? 'ghost' : 'primary'"
            @click="handleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </QyButton>

          <QyButton
            v-if="showMessage && !isCurrentUser"
            variant="ghost"
            @click="handleMessage"
          >
            私信
          </QyButton>

          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </QyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import { useAuthStore } from '@/stores/auth'

interface User {
  user_id?: string
  userId?: string
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  role?: string
}

interface Stats {
  bookCount?: number
  followerCount?: number
  totalWords?: number
}

interface Props {
  user: User
  stats?: Stats
  compact?: boolean
  showRole?: boolean
  showStats?: boolean
  showActions?: boolean
  showFollow?: boolean
  showMessage?: boolean
  isFollowing?: boolean
  avatarSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showRole: true,
  showStats: true,
  showActions: true,
  showFollow: true,
  showMessage: false,
  isFollowing: false,
  avatarSize: 80
})

const emit = defineEmits<{
  follow: []
  unfollow: []
  message: []
}>()

const router = useRouter()
const authStore = useAuthStore()

// 是否为当前用户
const isCurrentUser = computed(() => {
  const userId = props.user.user_id || props.user.userId
  return userId === authStore.user?.id
})

// 获取角色类型
const getRoleType = (role?: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    writer: 'warning',
    reader: 'info',
    vip: 'success'
  }
  return typeMap[role || 'reader'] || 'info'
}

// 获取角色文本
const getRoleText = (role?: string) => {
  const textMap: Record<string, string> = {
    admin: '管理员',
    writer: '作者',
    reader: '读者',
    vip: 'VIP'
  }
  return textMap[role || 'reader'] || '读者'
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 前往用户主页
const goToProfile = () => {
  const userId = props.user.user_id || props.user.userId
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// 处理关注/取消关注
const handleFollow = () => {
  if (props.isFollowing) {
    emit('unfollow')
  } else {
    emit('follow')
  }
}

// 处理私信
const handleMessage = () => {
  emit('message')
}
</script>

<style scoped lang="scss">
.user-card {
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  &.compact {
    .user-avatar {
      width: 60px;
      height: 60px;
    }

    .user-name {
      font-size: 16px;
    }
  }
}

.user-card-content {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.user-card.compact .user-card-content {
  padding: 16px;
}

.user-avatar {
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #409eff;
  }
}

.role-tag {
  flex-shrink: 0;
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  background-color: #f0f2f5;
  color: #606266;
  border: 1px solid #d9d9d9;

  &.role-tag-danger {
    background-color: #fef0f0;
    color: #f56c6c;
    border-color: #fbc4c4;
  }

  &.role-tag-warning {
    background-color: #fdf6ec;
    color: #e6a23c;
    border-color: #f5dab1;
  }

  &.role-tag-info {
    background-color: #f4f4f5;
    color: #909399;
    border-color: #d3d4d6;
  }

  &.role-tag-success {
    background-color: #f0f9ff;
    color: #67c23a;
    border-color: #c2e7b0;
  }
}

.user-bio {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 12px;
      color: #909399;
    }
  }
}

.user-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .user-card-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-info {
    width: 100%;
  }

  .user-header {
    justify-content: center;
  }

  .user-stats {
    justify-content: center;
  }

  .user-actions {
    justify-content: center;
  }
}
</style>

