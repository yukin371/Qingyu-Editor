<template>
  <div class="banner-wrapper" :class="{ 'is-loading': loading }" :style="{ '--carousel-height': height }">
    <el-carousel ref="carouselRef" :interval="5000" :height="height" trigger="click" indicator-position="none"
      arrow="never" class="premium-carousel" @change="handleCarouselChange">
      <el-carousel-item v-for="(banner, index) in banners" :key="banner.id || index" @click="handleBannerClick(banner)">
        <div class="banner-slide">
          <!-- 图片层 -->
          <div class="image-container">
            <img :src="banner.image" :alt="banner.title" class="slide-image" loading="eager" @error="handleImageError" />
            <!-- 渐变遮罩，保证图片过亮时文字依然可见 -->
            <div class="overlay-gradient"></div>
          </div>

          <!-- 内容悬浮卡片 (毛玻璃效果) -->
          <div class="content-card animate-content" v-show="activeIndex === index">
            <div class="card-glass">
              <h3 class="slide-title" :title="banner.title">{{ banner.title }}</h3>
              <p class="slide-desc" v-if="banner.description">
                {{ banner.description }}
              </p>

              <!-- 按钮区域 -->
              <div class="slide-action">
                <el-button v-if="banner.buttonText" type="primary" round class="action-btn"
                  @click.stop="handleButtonClick(banner)">
                  {{ banner.buttonText }}
                  <el-icon class="el-icon--right">
                    <QyIcon name="ArrowRight"  />
                  </el-icon>
                </el-button>

                <!-- 如果没有按钮文字，显示简单的 "探索" 链接 -->
                <span v-else class="explore-link">
                  立即探索 <QyIcon name="ArrowRight"  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 自定义导航控制 (右下角) -->
    <div class="custom-controls" v-if="banners.length > 1">
      <!-- 指示器条 -->
      <div class="indicators">
        <span v-for="(banner, index) in banners" :key="index" class="indicator-dot"
          :class="{ active: activeIndex === index }" @click.stop="setActiveItem(index)"></span>
      </div>

      <!-- 翻页按钮 -->
      <div class="nav-arrows">
        <button class="nav-btn prev" @click.stop="prevSlide">
          <QyIcon name="ArrowLeft"  />
        </button>
        <button class="nav-btn next" @click.stop="nextSlide">
          <QyIcon name="ArrowRight"  />
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && banners.length === 0" class="empty-state" :style="{ height }">
      <Empty description="暂无精彩内容" iconSize="medium" />
    </div>

    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="skeleton-layer">
      <el-skeleton animated class="banner-skeleton">
        <template #template>
          <el-skeleton-item variant="image" style="width: 100%; height: 100%" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
// Props
const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: '320px'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['banner-click', 'button-click', 'carousel-change'])

// State
const carouselRef = ref(null)
const activeIndex = ref(0)

// Methods
const handleCarouselChange = (index) => {
  activeIndex.value = index
  emit('carousel-change', index)
}

const handleBannerClick = (banner) => {
  emit('banner-click', banner)
}

const handleButtonClick = (banner) => {
  emit('button-click', banner)
}

const setActiveItem = (index) => {
  carouselRef.value?.setActiveItem(index)
}

const prevSlide = () => {
  carouselRef.value?.prev()
}

const nextSlide = () => {
  carouselRef.value?.next()
}

const handleImageError = (event) => {
  const target = event.target
  if (!target || target.dataset.fallbackApplied === '1') {
    return
  }

  target.dataset.fallbackApplied = '1'
  target.src = '/images/banners/banner-1.svg'
  target.style.objectFit = 'cover'
  target.style.objectPosition = 'center center'
  target.style.backgroundColor = '#0f172a'
}

// Watchers (Optional: Reset index if banners change)
watch(() => props.banners, () => {
  activeIndex.value = 0
})
</script>

<style scoped lang="scss">
.banner-wrapper {
  position: relative;
  width: 100%;
  height: var(--carousel-height, 320px);
  border-radius: 24px;
  /* 与首页统一的大圆角 */
  overflow: hidden;
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
  /* 深度阴影 */
  background-color: #f0f2f5;
  /* 图片加载前的底色 */
  transform: translateZ(0);
  /* 开启硬件加速，防止圆角溢出 */

  &.is-loading {
    box-shadow: none;
  }
}

/* 轮播主体 */
.premium-carousel {
  width: 100%;
  height: var(--carousel-height, 320px);
}

:deep(.el-carousel__container) {
  height: var(--carousel-height, 320px) !important;
}

:deep(.el-carousel__item) {
  position: absolute;
  inset: 0;
  height: var(--carousel-height, 320px);
  overflow: hidden;
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 图片容器 */
.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #0f172a;
}

.slide-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  background: transparent;
  transition: opacity 0.25s ease;
}

.overlay-gradient {
  position: absolute;
  inset: 0;
  /* 渐变：左下角稍暗，保证文字可读性 */
  background: linear-gradient(to right,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.1) 40%,
      transparent 100%);
  pointer-events: none;
}

/* 内容悬浮卡片 */
.content-card {
  position: absolute;
  left: 40px;
  bottom: 26px;
  max-width: 480px;
  z-index: 10;

  @media (max-width: 768px) {
    left: 20px;
    bottom: 60px;
    /* 留出底部控制条空间 */
    right: 20px;
    max-width: none;
  }
}

.card-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  /* 核心：毛玻璃 */
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  color: #fff;

  /* 文字动画 */
  .slide-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 12px;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .slide-desc {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 20px;
    opacity: 0.9;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-weight: 400;
  }
}

/* 按钮样式 */
.action-btn {
  font-weight: 600;
  padding: 10px 24px;
  background-color: #fff;
  color: #333;
  border: none;
  transition: all 0.3s;

  &:hover {
    background-color: #409eff;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }
}

.explore-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition: gap 0.3s;

  &:hover {
    gap: 8px;
    text-decoration: underline;
  }
}

/* 内容进场动画 */
.animate-content {
  animation: slideUpFade 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义控制区 (右下角) */
.custom-controls {
  position: absolute;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 20;

  @media (max-width: 768px) {
    bottom: 15px;
    right: 50%;
    transform: translateX(50%);
    gap: 10px;
  }
}

/* 指示器点 */
.indicators {
  display: flex;
  gap: 8px;

  .indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      width: 24px;
      background: #fff;
      border-radius: 10px;
      /* 拉长变为胶囊状 */
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.8);
    }
  }
}

/* 翻页箭头按钮 */
.nav-arrows {
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
    /* 移动端通常滑动，隐藏箭头 */
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);

    &:hover {
      background: #fff;
      color: #333;
      border-color: #fff;
    }

    &:active {
      transform: scale(0.9);
    }
  }
}

/* 骨架屏与空状态 */
.skeleton-layer,
.empty-state {
  position: absolute;
  inset: 0;
  background: #f5f7fa;
  z-index: 30;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
