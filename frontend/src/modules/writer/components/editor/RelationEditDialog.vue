<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="relation-edit-overlay" @click.self="handleClose">
        <div class="relation-edit-dialog">
          <header class="dialog-header">
            <h3>{{ isEditing ? '编辑关系' : '创建关系' }}</h3>
            <button class="close-btn" @click="handleClose">×</button>
          </header>

          <div class="dialog-body">
            <!-- 关系双方 -->
            <div class="relation-parties">
              <div class="party from">
                <span class="party-label">从</span>
                <span class="party-name">{{ fromName }}</span>
              </div>
              <div class="relation-arrow">→</div>
              <div class="party to">
                <span class="party-label">到</span>
                <span class="party-name">{{ toName }}</span>
              </div>
            </div>

            <!-- 关系类型 -->
            <div class="form-group">
              <label>关系类型</label>
              <div class="type-grid">
                <button
                  v-for="t in relationTypes"
                  :key="t.value"
                  class="type-btn"
                  :class="{ active: form.type === t.value }"
                  :style="{ '--type-color': t.color }"
                  @click="form.type = t.value"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- 关系强度 -->
            <div class="form-group">
              <label>关系强度</label>
              <div class="strength-control">
                <input
                  v-model.number="form.strength"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  class="strength-slider"
                />
                <span class="strength-value">{{ form.strength }}%</span>
              </div>
            </div>

            <!-- 时序设置（仅编辑模式显示） -->
            <div v-if="isEditing" class="form-group">
              <label>生效范围</label>
              <div class="timeline-setting">
                <div class="timeline-row">
                  <span class="timeline-label">从章节</span>
                  <select v-model="form.validFromChapterId" class="chapter-select">
                    <option value="">第1章开始</option>
                    <option v-for="ch in chapters" :key="ch.id" :value="ch.id">
                      {{ ch.title }}
                    </option>
                  </select>
                </div>
                <div class="timeline-row">
                  <span class="timeline-label">至章节</span>
                  <select v-model="form.validUntilChapterId" class="chapter-select">
                    <option value="">持续至今</option>
                    <option v-for="ch in chapters" :key="ch.id" :value="ch.id">
                      {{ ch.title }}
                    </option>
                  </select>
                </div>
              </div>
              <p class="timeline-hint">
                设置章节范围可以追踪角色关系随剧情的变化
              </p>
            </div>

            <!-- 备注 -->
            <div class="form-group">
              <label>备注（可选）</label>
              <textarea
                v-model="form.notes"
                placeholder="描述这段关系的背景..."
                class="form-textarea"
                rows="3"
              />
            </div>

            <!-- 创建变化提示（编辑时序关系时） -->
            <div v-if="isEditing && currentChapterId" class="create-change-hint">
              <span>📖 在「{{ currentChapterTitle }}」创建新变化？</span>
              <p>这将记录关系在当前章节的变化历史</p>
            </div>
          </div>

          <footer class="dialog-footer">
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button
              v-if="isEditing && currentChapterId"
              class="btn btn-warning"
              @click="handleSaveWithTimeline"
            >
              保存为新变化
            </button>
            <button
              class="btn btn-primary"
              @click="handleSave"
            >
              {{ isEditing ? '保存' : '创建' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'

export interface RelationFormData {
  type: string
  strength: number
  notes?: string
  validFromChapterId?: string
  validUntilChapterId?: string
}

const props = defineProps<{
  visible: boolean
  relationId?: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  initialData?: Partial<RelationFormData>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: RelationFormData): void
  (e: 'saveWithTimeline', data: RelationFormData & { chapterId: string }): void
}>()

const writerStore = useWriterStore()

const isEditing = computed(() => !!props.relationId)

const form = reactive<RelationFormData>({
  type: '朋友',
  strength: 50,
  notes: '',
  validFromChapterId: '',
  validUntilChapterId: '',
  ...props.initialData,
})

const relationTypes = [
  { value: '朋友', label: '朋友', color: '#7c9885' },
  { value: '恋人', label: '恋人', color: '#c9a962' },
  { value: '家人', label: '家人', color: '#c9a962' },
  { value: '盟友', label: '盟友', color: '#6b8e9f' },
  { value: '敌人', label: '敌人', color: '#a85d5d' },
  { value: '陌生人', label: '陌生人', color: '#8b7355' },
]

const chapters = computed(() => {
  const tree = writerStore.documentTree || []
  const result: Array<{ id: string; title: string }> = []

  function traverse(nodes: any[]) {
    nodes.forEach(node => {
      if (node.id && node.title) {
        result.push({ id: node.id, title: node.title })
      }
      if (node.children?.length) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return result
})

const currentChapterId = computed(() => writerStore.currentDocumentId)
const currentChapterTitle = computed(() => {
  if (!currentChapterId.value) return ''
  const chapter = chapters.value.find(c => c.id === currentChapterId.value)
  return chapter?.title || ''
})

function handleClose() {
  emit('close')
}

function handleSave() {
  emit('save', {
    type: form.type,
    strength: form.strength,
    notes: form.notes || undefined,
    validFromChapterId: form.validFromChapterId || undefined,
    validUntilChapterId: form.validUntilChapterId || undefined,
  })
}

function handleSaveWithTimeline() {
  if (!currentChapterId.value) return
  emit('saveWithTimeline', {
    type: form.type,
    strength: form.strength,
    notes: form.notes || undefined,
    chapterId: currentChapterId.value,
  })
}
</script>

<style scoped>
.relation-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.relation-edit-dialog {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
}

.close-btn:hover {
  background: #f3f4f6;
}

.dialog-body {
  padding: 20px;
}

.relation-parties {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.party {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.party-label {
  font-size: 11px;
  color: #9ca3af;
}

.party-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.relation-arrow {
  font-size: 20px;
  color: #d1d5db;
}

.form-group {
  margin-bottom: 16px;
}

.form-group > label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: var(--type-color);
}

.type-btn.active {
  border-color: var(--type-color);
  background: var(--type-color);
  color: white;
}

.strength-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
}

.strength-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.strength-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  width: 40px;
}

.timeline-setting {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-label {
  font-size: 12px;
  color: #6b7280;
  width: 60px;
}

.chapter-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.timeline-hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #9ca3af;
}

.create-change-hint {
  padding: 12px;
  background: #fef3c7;
  border-radius: 6px;
  margin-top: 16px;
}

.create-change-hint span {
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

.create-change-hint p {
  margin: 4px 0 0;
  font-size: 11px;
  color: #b45309;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  border: 1px solid #d1d5db;
  background: white;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-primary {
  border: none;
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-warning {
  border: none;
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
