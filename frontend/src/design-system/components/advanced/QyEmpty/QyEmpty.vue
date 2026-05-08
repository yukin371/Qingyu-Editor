<script setup lang="ts">
/**
 * QyEmpty 空状态组件
 *
 * Apple 风格的多样化空状态展示组件，支持 8 种插图类型
 */
import type { QyEmptyProps, QyEmptyEmits, QyEmptyType } from './types'

// Props
const props = withDefaults(defineProps<QyEmptyProps>(), {
  type: 'default',
  icon: '',
  title: '',
  description: '当前没有数据可展示',
  actionText: '',
  image: '',
  iconSize: 'medium',
})

// Emits
const emit = defineEmits<QyEmptyEmits>()

// Handle action click
const handleAction = () => {
  emit('action')
}

// Icon size classes
const iconSizeClasses: Record<string, string> = {
  small: 'qy-empty__illustration--small',
  medium: 'qy-empty__illustration--medium',
  large: 'qy-empty__illustration--large',
}

// SVG illustrations for each type
const illustrations: Record<QyEmptyType, string> = {
  // 文件箱 - 通用无数据
  default: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #f1f5f9)"/>
    <path d="M30 45L60 35L90 45V75L60 85L30 75V45Z" stroke="var(--empty-ill-stroke, #cbd5e1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="var(--empty-ill-fill, #f8fafc)"/>
    <path d="M30 45L60 55L90 45" stroke="var(--empty-ill-stroke, #cbd5e1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M45 55H75" stroke="var(--empty-ill-line, #e2e8f0)" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 63H70" stroke="var(--empty-ill-line, #e2e8f0)" stroke-width="2" stroke-linecap="round"/>`,

  // 奖杯 - 榜单排名
  ranking: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #fff7ed)"/>
    <path d="M45 30H75V45C75 52.18 69.73 58.18 63 59.58V65H67C69.76 65 72 67.24 72 70V75H48V70C48 67.24 50.24 65 53 65H57V59.58C50.27 58.18 45 52.18 45 45V30Z" fill="var(--empty-ill-fill, #fed7aa)" stroke="var(--empty-ill-stroke, #fb923c)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M42 30H48V40C42 40 39 37 42 33" stroke="var(--empty-ill-stroke, #fb923c)" stroke-width="2" stroke-linecap="round"/>
    <path d="M78 30H72V40C78 40 81 37 78 33" stroke="var(--empty-ill-stroke, #fb923c)" stroke-width="2" stroke-linecap="round"/>
    <path d="M54 75H66" stroke="var(--empty-ill-stroke, #fb923c)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M51 80H69" stroke="var(--empty-ill-stroke, #fb923c)" stroke-width="2.5" stroke-linecap="round"/>`,

  // 列表 - 目录纲要
  list: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #f0fdf4)"/>
    <rect x="30" y="35" width="60" height="50" rx="6" fill="var(--empty-ill-fill, #dcfce7)" stroke="var(--empty-ill-stroke, #86efac)" stroke-width="2"/>
    <path d="M42 47H78" stroke="var(--empty-ill-line, #bbf7d0)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M42 56H72" stroke="var(--empty-ill-line, #bbf7d0)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M42 65H66" stroke="var(--empty-ill-line, #bbf7d0)" stroke-width="2.5" stroke-linecap="round"/>`,

  // 搜索 - 无搜索结果
  search: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #eff6ff)"/>
    <circle cx="53" cy="50" r="16" fill="var(--empty-ill-fill, #dbeafe)" stroke="var(--empty-ill-stroke, #93c5fd)" stroke-width="2.5"/>
    <path d="M65 62L78 75" stroke="var(--empty-ill-stroke, #93c5fd)" stroke-width="3" stroke-linecap="round"/>
    <path d="M48 50H58" stroke="var(--empty-ill-line, #bfdbfe)" stroke-width="2" stroke-linecap="round"/>
    <path d="M48 56H55" stroke="var(--empty-ill-line, #bfdbfe)" stroke-width="2" stroke-linecap="round"/>`,

  // 书籍 - 阅读相关
  book: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #faf5ff)"/>
    <path d="M38 35V80C38 82.2 39.8 84 42 84H78C80.2 84 82 82.2 82 80V35C82 32.8 80.2 31 78 31H42C39.8 31 38 32.8 38 35Z" fill="var(--empty-ill-fill, #e9d5ff)" stroke="var(--empty-ill-stroke, #c084fc)" stroke-width="2"/>
    <path d="M46 31V84" stroke="var(--empty-ill-stroke, #c084fc)" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 45H74" stroke="var(--empty-ill-line, #d8b4fe)" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 54H70" stroke="var(--empty-ill-line, #d8b4fe)" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 63H66" stroke="var(--empty-ill-line, #d8b4fe)" stroke-width="2" stroke-linecap="round"/>`,

  // 图表 - 统计分析
  chart: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #fff1f2)"/>
    <rect x="30" y="40" width="60" height="45" rx="5" fill="var(--empty-ill-fill, #ffe4e6)" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2"/>
    <path d="M42 70V55" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M54 70V48" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M66 70V58" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M78 70V52" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 35L90 35" stroke="var(--empty-ill-stroke, #fda4af)" stroke-width="2" stroke-linecap="round"/>`,

  // 网络 - 连接相关
  network: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #f0f9ff)"/>
    <circle cx="60" cy="40" r="10" fill="var(--empty-ill-fill, #bae6fd)" stroke="var(--empty-ill-stroke, #38bdf8)" stroke-width="2"/>
    <circle cx="40" cy="70" r="8" fill="var(--empty-ill-fill, #bae6fd)" stroke="var(--empty-ill-stroke, #38bdf8)" stroke-width="2"/>
    <circle cx="80" cy="70" r="8" fill="var(--empty-ill-fill, #bae6fd)" stroke="var(--empty-ill-stroke, #38bdf8)" stroke-width="2"/>
    <path d="M60 50L47 63" stroke="var(--empty-ill-line, #7dd3fc)" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 50L73 63" stroke="var(--empty-ill-line, #7dd3fc)" stroke-width="2" stroke-linecap="round"/>`,

  // 收藏 - 书签喜欢
  favor: `<circle cx="60" cy="60" r="50" fill="var(--empty-ill-bg, #fdf2f8)"/>
    <path d="M60 85L52.4 77.8C40.3 66.6 32 58.8 32 49.5C32 41.6 38.2 35.4 46.1 35.4C50.2 35.4 54.1 37.3 57 40.7L60 44.1L63 40.7C65.9 37.3 69.8 35.4 73.9 35.4C81.8 35.4 88 41.6 88 49.5C88 58.8 79.7 66.6 67.6 77.8L60 85Z" fill="var(--empty-ill-fill, #fbcfe8)" stroke="var(--empty-ill-stroke, #f472b6)" stroke-width="2" stroke-linejoin="round"/>`,
}
</script>

<template>
  <div class="qy-empty">
    <div class="qy-empty__glow" aria-hidden="true"></div>
    <div class="qy-empty__panel">
      <div class="qy-empty__icon-shell">
        <div v-if="$slots.icon || icon || image" class="qy-empty__icon qy-empty__icon--custom">
          <slot name="icon">
            <img v-if="image" :src="image" :alt="title || 'Empty state'" class="qy-empty__image" />
            <div v-else-if="icon" v-html="icon" class="qy-empty__icon-svg" />
          </slot>
        </div>
        <div v-else class="qy-empty__icon qy-empty__icon--illustration">
          <svg
            :class="['qy-empty__illustration', iconSizeClasses[iconSize]]"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-html="illustrations[type]"
          />
        </div>
      </div>

      <div class="qy-empty__content">
        <div v-if="$slots.title || title" class="qy-empty__title">
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <p v-if="$slots.description || description" class="qy-empty__description">
          <slot name="description">
            {{ description }}
          </slot>
        </p>

        <div v-if="$slots.action || actionText" class="qy-empty__action">
          <slot name="action">
            <button class="qy-empty__btn" @click="handleAction">
              {{ actionText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qy-empty {
  position: relative;
  padding: 2rem 1rem;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qy-empty__glow {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  background:
    radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.25), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.18), transparent 40%),
    radial-gradient(circle at 50% 70%, rgba(59, 130, 246, 0.2), transparent 45%);
  filter: blur(24px);
  z-index: 0;
}

.qy-empty__panel {
  position: relative;
  z-index: 10;
  width: min(360px, 100%);
  padding: 2rem 2rem 1.5rem;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  backdrop-filter: blur(20px);
}

.qy-empty__icon-shell {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.6));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 15px 30px rgba(15, 23, 42, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  isolation: isolate;
}

.qy-empty__icon-shell::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.qy-empty__icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qy-empty__icon--illustration,
.qy-empty__icon--custom {
  border-radius: 16px;
}

.qy-empty__illustration {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.qy-empty__illustration:hover {
  transform: translateY(-4px) scale(1.02);
  opacity: 0.95;
}

.qy-empty__illustration--small {
  width: 64px;
  height: 64px;
}

.qy-empty__illustration--medium {
  width: 96px;
  height: 96px;
}

.qy-empty__illustration--large {
  width: 120px;
  height: 120px;
}

.qy-empty__image {
  width: 8rem;
  height: 8rem;
  object-fit: contain;
}

.qy-empty__icon-svg {
  width: 6rem;
  height: 6rem;
}

.qy-empty__icon-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.qy-empty__content {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qy-empty__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.qy-empty__description {
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
}

.qy-empty__action {
  margin-top: 0.25rem;
}

.qy-empty__btn {
  padding: 0.65rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(14, 165, 233, 0.35);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.qy-empty__btn:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
}

.qy-empty__btn:active {
  transform: translateY(0) scale(1);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}

@media (max-width: 640px) {
  .qy-empty__panel {
    padding: 1.5rem 1.5rem 1.25rem;
    border-radius: 24px;
  }
}
</style>
