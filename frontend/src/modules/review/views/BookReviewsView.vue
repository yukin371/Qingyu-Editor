<template>
  <div class="book-reviews-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>书评</h1>
        <el-button type="primary" @click="showWriteReview = true">
          <QyIcon name="EditPen"  />
          写书评
        </el-button>
      </div>

      <!-- 书评列表占位 -->
      <div class="reviews-placeholder">
        <el-empty description="书评系统开发中，敬请期待...">
          <template #image>
            <el-icon :size="120" color="#ddd">
              <QyIcon name="ChatLineSquare"  />
            </el-icon>
          </template>
        </el-empty>
      </div>

      <!-- 写书评对话框占位 -->
      <el-dialog v-model="showWriteReview" title="写书评" width="500px">
        <el-empty description="书评表单开发中..." />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyIcon } from '@/design-system/components'
const showWriteReview = ref(false)
</script>

<style scoped lang="scss">
.book-reviews-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }
}

.reviews-placeholder {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}
</style>
