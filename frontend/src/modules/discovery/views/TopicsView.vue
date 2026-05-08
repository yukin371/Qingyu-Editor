<template>
  <div class="topics-view">
    <div class="container">
      <el-empty description="话题广场页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><PriceTag /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PriceTag } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.topics-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
}
</style>
