<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="entity-create-overlay" @click.self="$emit('close')">
        <div class="entity-create-dialog">
          <header class="dialog-header">
            <h3>创建新实体</h3>
            <button class="close-btn" @click="$emit('close')">×</button>
          </header>

          <div class="dialog-body">
            <!-- 提取的名称 -->
            <div class="form-group">
              <label>名称</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="输入实体名称"
                class="form-input"
                @keydown.enter="handleSubmit"
              />
              <p v-if="duplicateWarning" class="warning-text">
                ⚠️ 已存在同名实体：{{ duplicateWarning }}
              </p>
            </div>

            <!-- 实体类型 -->
            <div class="form-group">
              <label>类型</label>
              <div class="type-selector">
                <button
                  v-for="t in entityTypes"
                  :key="t.value"
                  class="type-btn"
                  :class="{ active: form.type === t.value }"
                  @click="form.type = t.value"
                >
                  <span class="type-icon">{{ t.icon }}</span>
                  <span class="type-label">{{ t.label }}</span>
                </button>
              </div>
            </div>

            <!-- 角色专属字段 -->
            <div v-if="form.type === 'character'">
              <div class="form-group">
                <label>角色定位</label>
                <div class="role-selector">
                  <button
                    v-for="role in ['主角', '配角', '龙套']"
                    :key="role"
                    class="role-btn"
                    :class="{ active: form.roleTag === role }"
                    @click="form.roleTag = form.roleTag === role ? '' : role"
                  >
                    {{ role }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>别名（可选，用逗号分隔）</label>
                <input
                  v-model="form.alias"
                  type="text"
                  placeholder="例如：小明, 阿明"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>性格特征（可选，用逗号分隔）</label>
                <input
                  v-model="form.traits"
                  type="text"
                  placeholder="例如：勇敢, 善良, 冲动"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 地点专属字段 -->
            <div v-if="form.type === 'location'">
              <div class="form-group">
                <label>地点类型</label>
                <div class="role-selector">
                  <button
                    v-for="type in ['城市', '建筑', '自然', '室内']"
                    :key="type"
                    class="role-btn"
                    :class="{ active: form.locationType === type }"
                    @click="form.locationType = form.locationType === type ? '' : type"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>所属区域（可选）</label>
                <input
                  v-model="form.region"
                  type="text"
                  placeholder="例如：东方大陆, 皇城"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 物品专属字段 -->
            <div v-if="form.type === 'item'">
              <div class="form-group">
                <label>物品类型</label>
                <div class="role-selector">
                  <button
                    v-for="type in ['武器', '道具', '消耗品', '装备']"
                    :key="type"
                    class="role-btn"
                    :class="{ active: form.itemType === type }"
                    @click="form.itemType = form.itemType === type ? '' : type"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>稀有度</label>
                <div class="role-selector">
                  <button
                    v-for="rarity in ['普通', '稀有', '传说']"
                    :key="rarity"
                    class="role-btn"
                    :class="{ active: form.rarity === rarity }"
                    @click="form.rarity = form.rarity === rarity ? '' : rarity"
                  >
                    {{ rarity }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 概念专属字段 -->
            <div v-if="form.type === 'concept'">
              <div class="form-group">
                <label>分类</label>
                <div class="role-selector">
                  <button
                    v-for="cat in ['魔法体系', '文化', '政治', '科技']"
                    :key="cat"
                    class="role-btn"
                    :class="{ active: form.category === cat }"
                    @click="form.category = form.category === cat ? '' : cat"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 简短描述 -->
            <div class="form-group">
              <label>简短描述（可选）</label>
              <textarea
                v-model="form.summary"
                placeholder="简要描述实体..."
                class="form-textarea"
                rows="2"
              />
            </div>

            <!-- 自动关联选项 -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.autoLinkToChapter" type="checkbox" />
                <span>自动关联到当前章节</span>
              </label>
            </div>
          </div>

          <footer class="dialog-footer">
            <button class="btn btn-secondary" @click="$emit('close')">取消</button>
            <button
              class="btn btn-primary"
              :disabled="!form.name.trim()"
              @click="handleSubmit"
            >
              创建
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { KeywordType } from './extensions/SmartKeyword'

export interface CreatedEntity {
  name: string
  type: KeywordType
  summary?: string
  autoLinkToChapter: boolean
  roleTag?: string
  alias?: string[]
  traits?: string[]
  locationType?: string
  region?: string
  itemType?: string
  rarity?: string
  category?: string
}

const props = defineProps<{
  visible: boolean
  initialName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', entity: CreatedEntity): void
}>()

const entityTypes: Array<{ value: KeywordType; label: string; icon: string }> = [
  { value: 'character', label: '角色', icon: '👤' },
  { value: 'location', label: '地点', icon: '📍' },
  { value: 'item', label: '物件', icon: '🎁' },
  { value: 'organization', label: '组织', icon: '🏛️' },
  { value: 'concept', label: '概念', icon: '💡' },
]

const form = reactive({
  name: '',
  type: 'character' as KeywordType,
  summary: '',
  autoLinkToChapter: true,
  // 角色专属
  roleTag: '',
  alias: '',
  traits: '',
  // 地点专属
  locationType: '',
  region: '',
  // 物品专属
  itemType: '',
  rarity: '',
  // 概念专属
  category: '',
})

// 监听 initialName 变化
watch(() => props.initialName, (name) => {
  if (name) form.name = name
}, { immediate: true })

// 重复名称警告（简化版，实际需要从 API 获取）
const duplicateWarning = computed(() => {
  if (!form.name.trim()) return ''
  // TODO: 实际实现需要检查 existingEntities
  return ''
})

function handleSubmit() {
  if (!form.name.trim()) return
  const entity: CreatedEntity = {
    name: form.name.trim(),
    type: form.type,
    summary: form.summary.trim() || undefined,
    autoLinkToChapter: form.autoLinkToChapter,
  }

  // 根据类型添加专属字段
  if (form.type === 'character') {
    if (form.roleTag) entity.roleTag = form.roleTag
    if (form.alias.trim()) {
      entity.alias = form.alias.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    }
    if (form.traits.trim()) {
      entity.traits = form.traits.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    }
  } else if (form.type === 'location') {
    if (form.locationType) entity.locationType = form.locationType
    if (form.region.trim()) entity.region = form.region.trim()
  } else if (form.type === 'item') {
    if (form.itemType) entity.itemType = form.itemType
    if (form.rarity) entity.rarity = form.rarity
  } else if (form.type === 'concept') {
    if (form.category) entity.category = form.category
  }

  emit('create', entity)
  resetForm()
}

function resetForm() {
  form.name = ''
  form.type = 'character'
  form.summary = ''
  form.autoLinkToChapter = true
  // 角色专属
  form.roleTag = ''
  form.alias = ''
  form.traits = ''
  // 地点专属
  form.locationType = ''
  form.region = ''
  // 物品专属
  form.itemType = ''
  form.rarity = ''
  // 概念专属
  form.category = ''
}
</script>

<style scoped>
.entity-create-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.entity-create-dialog {
  background: white;
  border-radius: 12px;
  width: 400px;
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
  color: #111827;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
}

.dialog-body {
  padding: 20px;
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

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.warning-text {
  margin: 4px 0 0;
  font-size: 12px;
  color: #f59e0b;
}

.type-selector {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #3b82f6;
}

.type-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.type-icon {
  font-size: 20px;
}

.type-label {
  font-size: 12px;
  color: #6b7280;
}

.role-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.role-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.role-btn:hover {
  border-color: #3b82f6;
}

.role-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.checkbox-group {
  margin-top: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
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
  color: #374151;
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

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .entity-create-dialog,
.dialog-fade-leave-active .entity-create-dialog {
  transition: transform 0.2s ease;
}

.dialog-fade-enter-from .entity-create-dialog,
.dialog-fade-leave-to .entity-create-dialog {
  transform: scale(0.95);
}
</style>
