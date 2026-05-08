<template>
  <div class="achievements-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>成就系统</h1>
        <div class="level-info">
          <div class="level-badge">
            <el-icon :size="32"><QyIcon name="Trophy"  /></el-icon>
          </div>
          <div class="level-text">
            <div class="level-title">Lv.1</div>
            <div class="level-exp">0 / 100 EXP</div>
          </div>
        </div>
      </div>

      <!-- 成就列表占位 -->
      <div class="achievements-placeholder">
        <el-empty description="成就系统开发中，敬请期待...">
          <template #image>
            <el-icon :size="120" color="#ddd">
              <QyIcon name="Medal"  />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
</script>

<style scoped lang="scss">
.achievements-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 1000px;
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

  .level-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .level-badge {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      color: #fff;
    }

    .level-text {
      .level-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .level-exp {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }
  }
}

.achievements-placeholder {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}
</style>
