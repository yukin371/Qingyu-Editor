<template>
  <article class="collection-card" :class="{ selected }">
    <div class="card-tools">
      <el-checkbox :model-value="selected" @change="(v:boolean) => emit('update:selected', v)" />
      <el-dropdown trigger="click" @command="(cmd:string) => emit('command', cmd)">
        <el-button text class="more-btn">更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit-note">编辑备注</el-dropdown-item>
            <el-dropdown-item command="toggle-note">展开/收起备注</el-dropdown-item>
            <el-dropdown-item command="remove" divided>取消收藏</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="cover-wrap" @click="emit('open-book')">
      <div
        ref="bookContainerRef"
        class="book-container"
        :class="{ 'is-hover': hovering }"
        :style="{ '--target-rotate': `${targetRotate}deg` }"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <div class="book-wrapper">
          <div class="book-image-wrapper">
            <div class="book-back"></div>
            <div class="book-spine"></div>
            <div class="book-pages"></div>
            <img :src="item.cover" class="book-cover" loading="lazy" decoding="async" alt="" />
          </div>
        </div>
        <div class="shadow-blob"></div>
      </div>
    </div>

    <div class="book-info">
      <h3 class="book-title" @click="emit('open-book')">{{ item.title }}</h3>
      <p class="book-author">{{ item.author }}</p>
      <p class="book-date">收藏于 {{ formattedDate }}</p>

      <div class="tags">
        <el-tag v-for="tag in (item.tags || []).slice(0, 3)" :key="`${item.id}-${tag}`" size="small" effect="plain">{{ tag }}</el-tag>
      </div>

      <div class="note-box" :class="item.description?.trim() ? 'has-note' : 'no-note'">
        <div class="note-head">
          <span>{{ item.description?.trim() ? '已备注' : '未备注' }}</span>
          <el-button text size="small" @click="emit('toggle-note')">{{ expanded ? '收起' : '展开' }}</el-button>
        </div>
        <p class="note-text" :class="{ collapsed: !expanded }">{{ item.description?.trim() || '暂无备注' }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Collection } from '@/modules/reader/api/manual/collections'

interface Props {
  item: Collection
  selected: boolean
  expanded: boolean
  formattedDate: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:selected': [value: boolean]
  'open-book': []
  'command': [cmd: string]
  'toggle-note': []
}>()

const bookContainerRef = ref<HTMLElement | null>(null)
const hovering = ref(false)
const targetRotate = ref(0)

function onMouseEnter(event: MouseEvent) {
  const el = bookContainerRef.value
  if (el) {
    const rect = el.getBoundingClientRect()
    const enterFromLeft = event.clientX <= rect.left + rect.width / 2
    targetRotate.value = enterFromLeft ? 18 : -18
  } else {
    targetRotate.value = 0
  }
  hovering.value = true
}

function onMouseLeave() {
  hovering.value = false
  targetRotate.value = 0
}
</script>

<style scoped lang="scss">
.collection-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 12px;
  transition: box-shadow .2s ease, border-color .2s ease;
}

.collection-card:hover {
  box-shadow: 0 8px 26px rgba(15, 23, 42, .08);
  border-color: #cbd5e1;
}

.collection-card.selected {
  border-color: #60a5fa;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, .28);
}

.card-tools {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.more-btn {
  color: #475569;
}

.cover-wrap {
  cursor: pointer;
}

.book-container {
  width: 94px;
  aspect-ratio: 2/3;
  perspective: 900px;
  position: relative;
}

.book-wrapper {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform .28s ease;
}

.book-container.is-hover .book-wrapper {
  transform: rotateY(var(--target-rotate, 0deg)) rotateX(5deg) translateY(-4px) translateZ(14px);
}

.book-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px 6px 6px 4px;
  position: absolute;
  transform: translateZ(10px);
}

.book-back {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateZ(-10px);
  background: #334155;
  border-radius: 4px 6px 6px 4px;
}

.book-spine {
  position: absolute;
  top: 0;
  left: -20px;
  width: 20px;
  height: 100%;
  transform-origin: right;
  transform: rotateY(-90deg);
  background: linear-gradient(to right, #94a3b8, #e2e8f0 40%, #cbd5e1);
}

.book-pages {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 18px;
  height: calc(100% - 4px);
  transform: rotateY(90deg) translateZ(-9px);
  background: #fff;
}

.shadow-blob {
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 80%;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, .22);
  filter: blur(6px);
  transform: translateX(-50%);
}

.book-info {
  min-width: 0;
}

.book-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  line-height: 1.25;
}

.book-author {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.book-date {
  margin: 4px 0 8px;
  color: #94a3b8;
  font-size: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.note-box {
  border-radius: 8px;
  padding: 7px 8px;
}

.note-box.has-note {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.note-box.no-note {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.note-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #475569;
}

.note-text {
  margin: 4px 0 0;
  color: #334155;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.note-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
