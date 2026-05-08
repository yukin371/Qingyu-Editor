<template>
  <div class="reading-stats-view">
    <div class="container">
      <el-empty description="阅读统计页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><DataAnalysis /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
// 占位页面，功能开发中
</script>

<style scoped lang="scss">
.reading-stats-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
}
</style>
