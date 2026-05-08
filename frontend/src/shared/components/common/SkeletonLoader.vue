<template>
  <div v-if="loading" class="skeleton-loader">
    <el-skeleton :rows="rows" :animated="animated" :throttle="throttle">
      <template v-if="$slots.template" #template>
        <slot name="template"></slot>
      </template>
    </el-skeleton>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  rows?: number
  animated?: boolean
  throttle?: number
}

withDefaults(defineProps<Props>(), {
  rows: 4,
  animated: true,
  throttle: 0
})
</script>

<style scoped lang="scss">
.skeleton-loader {
  padding: 20px 0;
}
</style>


