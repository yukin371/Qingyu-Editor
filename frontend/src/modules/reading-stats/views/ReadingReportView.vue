<template>
  <div class="reading-report-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>阅读报告</h1>
        <el-radio-group v-model="period" size="large">
          <el-radio-button label="week">周报</el-radio-button>
          <el-radio-button label="month">月报</el-radio-button>
          <el-radio-button label="year">年报</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 报告内容占位 -->
      <div class="report-placeholder">
        <el-empty description="阅读报告功能开发中，敬请期待...">
          <template #image>
            <el-icon :size="120" color="#ddd">
              <DataAnalysis />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const period = ref('week')
</script>

<style scoped lang="scss">
.reading-report-view {
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
}

.report-placeholder {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}
</style>
