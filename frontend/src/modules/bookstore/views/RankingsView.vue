<template>
  <div class="rankings-view">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">
          <QyIcon name="TrendCharts" />
          排行榜
        </h1>
        <p class="page-subtitle">发现最热门的作品</p>
      </div>

      <!-- 榜单内容 -->
      <el-tabs v-model="activeTab" class="rankings-tabs" @tab-click="handleTabChange">
        <el-tab-pane label="周榜" name="weekly">
          <div class="ranking-content">
            <RankingList
              type="weekly"
              :items="rankings.weekly || []"
              :loading="loading.weekly"
              :max-items="50"
              @item-click="handleItemClick"
            />

            <div v-if="hasMore.weekly" class="load-more">
              <QyButton @click="loadMore('weekly')" :loading="loadingMore.weekly" size="lg">
                加载更多
              </QyButton>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="月榜" name="monthly">
          <div class="ranking-content">
            <RankingList
              type="monthly"
              :items="rankings.monthly || []"
              :loading="loading.monthly"
              :max-items="50"
              @item-click="handleItemClick"
            />

            <div v-if="hasMore.monthly" class="load-more">
              <QyButton @click="loadMore('monthly')" :loading="loadingMore.monthly" size="lg">
                加载更多
              </QyButton>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="新人榜" name="newbie">
          <div class="ranking-content">
            <RankingList
              type="newbie"
              :items="rankings.newbie || []"
              :loading="loading.newbie"
              :max-items="50"
              @item-click="handleItemClick"
            />

            <div v-if="hasMore.newbie" class="load-more">
              <QyButton @click="loadMore('newbie')" :loading="loadingMore.newbie" size="lg">
                加载更多
              </QyButton>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="实时榜" name="realtime">
          <div class="ranking-content">
            <RankingList
              type="realtime"
              :items="rankings.realtime || []"
              :loading="loading.realtime"
              :max-items="50"
              @item-click="handleItemClick"
            />

            <!-- 加载更多 -->
            <div v-if="hasMore.realtime" class="load-more">
              <QyButton @click="loadMore('realtime')" :loading="loadingMore.realtime" size="lg">
                加载更多
              </QyButton>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 榜单说明 -->
      <div class="ranking-info">
        <QyAlert :title="getRankingDescription()" type="info" :closable="false" show-icon />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookstoreStore } from '../stores/bookstore.store'
import RankingList from '../components/RankingList.vue'
import { QyIcon, QyButton, QyAlert } from '@/design-system/components'
import { message } from '@/design-system/services'
const router = useRouter()
const bookstoreStore = useBookstoreStore()

type RankingTab = 'realtime' | 'weekly' | 'monthly' | 'newbie'

const activeTab = ref<RankingTab>('weekly')

const loading = reactive<Record<RankingTab, boolean>>({
  realtime: false,
  weekly: false,
  monthly: false,
  newbie: false,
})

const loadingMore = reactive<Record<RankingTab, boolean>>({
  realtime: false,
  weekly: false,
  monthly: false,
  newbie: false,
})

const hasMore = reactive<Record<RankingTab, boolean>>({
  realtime: false,
  weekly: false,
  monthly: false,
  newbie: false,
})

const rankings = computed(() => bookstoreStore.rankings)

// 获取榜单描述
const getRankingDescription = () => {
  const descriptions: Record<RankingTab, string> = {
    realtime: '实时榜：根据最近24小时的阅读量和互动数据实时更新',
    weekly: '周榜：统计最近7天的热度，每天更新一次',
    monthly: '月榜：统计最近30天的综合表现，每天更新一次',
    newbie: '新人榜：展示新作者的优秀作品，鼓励新人创作',
  }
  return descriptions[activeTab.value] || '榜单数据实时更新'
}

// 加载榜单数据
const loadRankingData = async (type: RankingTab) => {
  loading[type] = true
  try {
    await bookstoreStore.fetchRankings(type)
    // 检查是否还有更多数据（这里简化处理，实际应从API返回判断）
    hasMore[type] = ((rankings.value as Record<string, any[]>)?.[type]?.length || 0) >= 50
  } catch (error: unknown) {
    const err = error as Error
    message.error(`加载${type}榜单失败: ${err.message}`)
  } finally {
    loading[type] = false
  }
}

// Tab切换事件
const handleTabChange = (tab: { props: { name: RankingTab } }) => {
  const tabName = tab.props.name
  // 如果该榜单数据为空，则加载
  if (
    !(rankings.value as Record<string, any[]>)[tabName] ||
    (rankings.value as Record<string, any[]>)[tabName].length === 0
  ) {
    loadRankingData(tabName)
  }
}

// 加载更多
const loadMore = async (type: RankingTab) => {
  loadingMore[type] = true
  try {
    // 由于当前API不支持分页，这里只是重新加载
    await bookstoreStore.fetchRankings(type)
  } catch (error: unknown) {
    const err = error as Error
    message.error(`加载更多失败: ${err.message}`)
  } finally {
    loadingMore[type] = false
  }
}

// 点击榜单项
const handleItemClick = (item: any) => {
  const bookId = item.book?.id || item.book?._id || item.bookId
  if (bookId) {
    router.push(`/bookstore/books/${bookId}`)
  } else {
    message.warning('无法获取书籍信息')
  }
}

// 组件挂载时优先加载更稳定的周榜数据
onMounted(() => {
  loadRankingData('weekly')
})
</script>

<style scoped lang="scss">
.rankings-view {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.rankings-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  // 确保导航栏横向排列为一行
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-tabs__nav-wrap) {
    display: flex;
    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__nav-scroll) {
    display: flex;
  }

  :deep(.el-tabs__nav) {
    display: flex;
    border: none;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
    padding: 0 24px;
    height: 44px;
    line-height: 44px;
    white-space: nowrap;
    border: none;
    transition: all 0.2s ease;

    &:hover {
      color: #409eff;
      background: #ecf5ff;
      border-radius: 8px;
    }

    &.is-active {
      color: #409eff;
      font-weight: 600;
      background: #ecf5ff;
      border-radius: 8px;
    }
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tabs__content) {
    overflow: visible;
  }
}

.ranking-content {
  min-height: 400px;
}

.load-more {
  text-align: center;
  margin-top: 24px;
  padding: 20px 0;
}

.ranking-info {
  margin-top: 20px;

  :deep(.qy-alert) {
    border-radius: 8px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rankings-view {
    padding: 20px 0;
  }

  .container {
    padding: 0 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .rankings-tabs {
    padding: 16px;

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 16px;
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .rankings-view {
    background-color: #121212;
  }

  .page-title {
    color: #e0e0e0;
  }

  .page-subtitle {
    color: #b0b0b0;
  }

  .rankings-tabs {
    background: #1a1a1a;
  }
}
</style>
