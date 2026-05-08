<template>
  <div class="author-revenue-view">
    <section class="author-revenue-card">
      <h1>作者收入</h1>
      <p>作者收入页正在整理中，当前入口已保留以避免路由失效。</p>
      <p>如需余额、充值或提现操作，请先使用钱包页完成。</p>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.author-revenue-view {
  padding: 24px;
}

.author-revenue-card {
  max-width: 720px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.author-revenue-card h1 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
  color: #0f172a;
}

.author-revenue-card p {
  margin: 0 0 8px;
  color: #475569;
  line-height: 1.7;
}
</style>
