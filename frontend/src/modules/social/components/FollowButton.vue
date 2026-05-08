<template>
  <div class="follow-button-wrapper">
    <!-- 已关注状态 -->
    <el-button
      v-if="isFollowing && !isMutual"
      class="follow-btn following"
      @click="handleUnfollow"
    >
      <QyIcon name="Select"  />
      <span>已关注</span>
    </el-button>

    <!-- 互相关注状态 -->
    <el-button
      v-else-if="isMutual"
      class="follow-btn mutual"
      @click="handleUnfollow"
    >
      <QyIcon name="UserFilled"  />
      <span>互相关注</span>
    </el-button>

    <!-- 未关注状态 -->
    <el-button
      v-else
      class="follow-btn not-following"
      type="primary"
      :loading="loading"
      @click="handleFollow"
    >
      <QyIcon name="Plus"  />
      <span>{{ showText ? '关注' : '' }}</span>
    </el-button>

    <!-- 取消关注确认弹窗 -->
    <el-dialog
      v-model="showUnfollowDialog"
      title="确认取消关注"
      width="400px"
    >
      <p>确定要取消关注该用户吗？</p>
      <template #footer>
        <el-button @click="showUnfollowDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUnfollow">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { useSocialStore } from '@/stores/social'

interface Props {
  userId: string
  isFollowing?: boolean
  isMutual?: boolean
  showText?: boolean
  size?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'follow', userId: string): void
  (e: 'unfollow', userId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isFollowing: false,
  isMutual: false,
  showText: true,
  size: 'default'
})

const emit = defineEmits<Emits>()

const socialStore = useSocialStore()
const loading = ref(false)
const showUnfollowDialog = ref(false)

// 使用 props 传入的状态或从 store 获取
const isFollowing = computed(() => {
  return props.isFollowing || socialStore.isFollowing(props.userId)
})

const isMutual = computed(() => {
  return props.isMutual || socialStore.isMutualFollow(props.userId)
})

// 关注用户
const handleFollow = async () => {
  if (loading.value) return

  loading.value = true
  try {
    await socialStore.followUser(props.userId)
    message.success('关注成功')
    emit('follow', props.userId)
  } catch (error: any) {
    message.error(error.message || '关注失败')
  } finally {
    loading.value = false
  }
}

// 取消关注
const handleUnfollow = () => {
  showUnfollowDialog.value = true
}

// 确认取消关注
const confirmUnfollow = async () => {
  showUnfollowDialog.value = false
  loading.value = true

  try {
    await socialStore.unfollowUser(props.userId)
    message.success('已取消关注')
    emit('unfollow', props.userId)
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.follow-button-wrapper {
  display: inline-block;
}

.follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s;

  &.following {
    background: #f0f9ff;
    border-color: #409eff;
    color: #409eff;

    &:hover {
      background: #d9ecff;
    }
  }

  &.mutual {
    background: #fef0f0;
    border-color: #f56c6c;
    color: #f56c6c;

    &:hover {
      background: #fde2e2;
    }
  }

  &.not-following {
    &:active {
      transform: scale(0.95);
    }
  }
}

// 纯图标模式
.follow-btn:not(:has(span)) {
  padding: 8px;
  min-width: auto;

  .el-icon {
    margin: 0;
  }
}

// 响应式
@media (max-width: 768px) {
  .follow-btn {
    font-size: 13px;
    padding: 6px 14px;
  }
}
</style>
