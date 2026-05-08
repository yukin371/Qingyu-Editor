<template>
  <div class="vip-purchase-view">
    <div class="container">
      <el-empty description="购买会员页开发中，敬请期待...">
        <template #image>
          <el-icon :size="120" color="#ddd"><ShoppingCart /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.vip-purchase-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
