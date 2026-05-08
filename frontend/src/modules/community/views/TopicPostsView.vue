<template>
  <div class="topic-posts-view">
    <div class="container">
      <el-empty description="话题动态页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><PriceTag /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
// QyIcon导入已移除 - 当前未使用
</script>

<style scoped lang="scss">
.topic-posts-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
}
</style>
