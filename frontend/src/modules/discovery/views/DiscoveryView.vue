<template>
  <div class="discovery-view">
    <div class="container">
      <!-- 顶部Tab导航 -->
      <div class="tabs-section">
        <el-tabs v-model="activeTab" class="discovery-tabs">
          <el-tab-pane label="讨论" name="discussion">
            <DiscussionFeed />
          </el-tab-pane>
          <el-tab-pane label="书单" name="booklist">
            <BooklistFeed />
          </el-tab-pane>
          <el-tab-pane label="发现" name="discovery">
            <DiscoveryFeed />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DiscussionFeed from '../components/DiscussionFeed.vue'
import BooklistFeed from '../components/BooklistFeed.vue'
import DiscoveryFeed from '../components/DiscoveryFeed.vue'

// 默认选中"讨论"tab
const activeTab = ref('discussion')
</script>

<style scoped lang="scss">
.discovery-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tabs-section {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 40px);
}

.discovery-tabs {
  // 确保导航栏横向排列为一行
  :deep(.el-tabs__header) {
    margin: 0 0 20px 0;
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
    color: #606266;
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
</style>
