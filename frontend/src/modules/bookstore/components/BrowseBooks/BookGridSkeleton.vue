<template>
  <div class="book-grid-skeleton">
    <div
      v-for="n in count"
      :key="n"
      class="skeleton-card"
    >
      <div class="skeleton-cover"></div>
      <div class="skeleton-info">
        <div class="skeleton-title"></div>
        <div class="skeleton-author"></div>
        <div class="skeleton-meta"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 12
})
</script>

<style scoped lang="scss">
.book-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  padding: 12px;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  padding: 12px 4px 0;
}

.skeleton-title {
  height: 16px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 1.5s infinite;
}

.skeleton-author {
  height: 12px;
  width: 70%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 6px;
  animation: shimmer 1.5s infinite;
}

.skeleton-meta {
  height: 12px;
  width: 50%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .book-grid-skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .skeleton-card {
    padding: 8px;
  }
}
</style>
