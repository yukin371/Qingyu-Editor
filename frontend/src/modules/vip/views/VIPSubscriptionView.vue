<template>
  <div class="vip-subscription-view">
    <div class="container">
      <el-empty description="订阅管理页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><Management /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.vip-subscription-view {
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
