<template>
  <div class="new-releases-view">
    <div class="container">
      <el-empty description="新书上架页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><Notebook /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Notebook } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.new-releases-view {
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
