<template>
  <div class="publish-management-legacy" data-testid="publish-management-legacy">
    <p>发布管理已移出桌面主链，正在回到写作工作区…</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  await router.replace({ name: 'writer-projects' })
})
</script>

<style scoped lang="scss">
.publish-management-legacy {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #5f5347;
  font-size: 13px;
  letter-spacing: 0.04em;
  background: #f5efe5;
}

.publish-management-legacy p {
  margin: 0;
}
</style>
