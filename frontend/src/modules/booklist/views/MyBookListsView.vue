<template>
  <div class="my-booklists-view">
    <div class="container">
      <el-empty description="我的书单页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><QyIcon name="FolderOpened"  /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
</script>

<style scoped lang="scss">
.my-booklists-view {
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
