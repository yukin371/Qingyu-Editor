<template>
  <div class="edit-booklist-view">
    <div class="container">
      <el-empty description="编辑书单页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><QyIcon name="Edit"  /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
</script>

<style scoped lang="scss">
.edit-booklist-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
}
</style>
