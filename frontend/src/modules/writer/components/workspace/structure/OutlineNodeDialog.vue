<template>
  <QyModal
    :visible="visible"
    :title="isEdit ? '编辑大纲节点' : '新增大纲节点'"
    width="560px"
    @update:visible="handleClose"
  >
    <div class="outline-node-dialog">
      <!-- 基本信息 -->
      <section class="dialog-section">
        <h4 class="section-title">基本信息</h4>

        <div class="form-field">
          <label class="form-label" for="outline-node-title">节点标题</label>
          <input
            id="outline-node-title"
            name="outline-node-title"
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="请输入节点标题"
            maxlength="200"
          />
        </div>

        <div class="form-field">
          <label class="form-label" for="outline-node-summary">摘要说明</label>
          <textarea
            id="outline-node-summary"
            name="outline-node-summary"
            v-model="formData.summary"
            class="form-textarea"
            placeholder="简要描述本节内容..."
            rows="3"
            maxlength="1000"
          />
        </div>
      </section>

      <!-- 章节绑定 -->
      <section class="dialog-section">
        <h4 class="section-title">章节绑定</h4>

        <div class="form-field">
          <label class="form-label" for="outline-node-document">关联章节</label>
          <select
            id="outline-node-document"
            v-model="formData.documentId"
            name="outline-node-document"
            class="form-select"
          >
            <option value="">未关联章节</option>
            <option
              v-for="chapter in availableChapters"
              :key="chapter.id"
              :value="chapter.id"
            >
              {{ chapter.title }}
            </option>
          </select>
          <p class="form-hint">选择关联的写作章节，用于快速跳转和内容映射</p>
        </div>
      </section>

      <!-- 写作规划 -->
      <section class="dialog-section">
        <h4 class="section-title">写作规划</h4>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="outline-node-type">结构类型</label>
            <select
              id="outline-node-type"
              v-model="formData.type"
              name="outline-node-type"
              class="form-select"
            >
              <option value="">无类型</option>
              <option
                v-for="nodeType in OUTLINE_NODE_TYPES"
                :key="nodeType"
                :value="nodeType"
              >
                {{ OUTLINE_NODE_TYPE_CONFIG[nodeType].icon }} {{ OUTLINE_NODE_TYPE_CONFIG[nodeType].label }}
              </option>
            </select>
            <span v-if="formData.type && OUTLINE_NODE_TYPE_CONFIG[formData.type]" class="type-preview" :style="{ color: OUTLINE_NODE_TYPE_CONFIG[formData.type].color }">
              {{ OUTLINE_NODE_TYPE_CONFIG[formData.type].icon }} {{ OUTLINE_NODE_TYPE_CONFIG[formData.type].label }}
            </span>
          </div>

          <div class="form-field">
            <label class="form-label" for="outline-node-tension">紧张度 (0-10)</label>
            <input
              id="outline-node-tension"
              name="outline-node-tension"
              v-model.number="formData.tension"
              type="number"
              class="form-input"
              min="0"
              max="10"
              placeholder="5"
            />
          </div>
        </div>
      </section>

      <!-- 关联实体 -->
      <section class="dialog-section">
        <h4 class="section-title">关联实体</h4>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="outline-node-characters">登场角色</label>
            <input
              id="outline-node-characters"
              name="outline-node-characters"
              v-model="charactersInput"
              type="text"
              class="form-input"
              placeholder="角色ID，用逗号分隔"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="outline-node-items">涉及道具</label>
            <input
              id="outline-node-items"
              name="outline-node-items"
              v-model="itemsInput"
              type="text"
              class="form-input"
              placeholder="道具ID，用逗号分隔"
            />
          </div>
        </div>
      </section>
    </div>
    <template #footer>
      <div class="outline-node-dialog__footer">
        <button type="button" class="dialog-action dialog-action--ghost" @click="handleClose">
          取消
        </button>
        <button type="button" class="dialog-action dialog-action--primary" @click="handleConfirm">
          {{ isEdit ? '保存修改' : '创建节点' }}
        </button>
      </div>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import QyModal from '@/design-system/components/advanced/QyModal/QyModal.vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { OUTLINE_NODE_TYPE_CONFIG, OUTLINE_NODE_TYPES } from '@/modules/writer/api/outline'
import type { CreateOutlineRequest, UpdateOutlineRequest } from '@/modules/writer/api/outline'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  visible: boolean
  isEdit: boolean
  node?: {
    id: string
    title: string
    summary?: string
    parentId?: string
    type?: string
    tension?: number
    documentId?: string
    characters?: string[]
    items?: string[]
    order?: number
  }
  chapters: SidebarChapterSummary[]
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: CreateOutlineRequest | UpdateOutlineRequest): void
}>()

// =======================
// 表单数据
// =======================
const formData = reactive({
  title: '',
  summary: '',
  parentId: '',
  type: '',
  tension: 5,
  documentId: '',
  characters: [] as string[],
  items: [] as string[],
})

// 字符串输入（用于逗号分隔的数组）
const charactersInput = ref('')
const itemsInput = ref('')

// 可用章节列表
const availableChapters = computed(() => {
  return props.chapters.filter(chapter => chapter.nodeType !== 'directory')
})

// =======================
// 同步数据到表单
// =======================
function syncNodeToForm() {
  if (!props.node) return

  formData.title = props.node.title || ''
  formData.summary = props.node.summary || ''
  formData.parentId = props.node.parentId || ''
  formData.type = props.node.type || ''
  formData.tension = props.node.tension ?? 5
  formData.documentId = props.node.documentId || ''
  formData.characters = props.node.characters || []
  formData.items = props.node.items || []

  // 同步到字符串输入
  charactersInput.value = formData.characters.join(', ')
  itemsInput.value = formData.items.join(', ')
}

// =======================
// 监听字符串输入变化
// =======================
watch(charactersInput, (val) => {
  formData.characters = val
    ? val.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : []
})

watch(itemsInput, (val) => {
  formData.items = val
    ? val.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : []
})

// =======================
// 监听 visible 变化
// =======================
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      syncNodeToForm()
    } else {
      // 重置表单
      formData.title = ''
      formData.summary = ''
      formData.parentId = ''
      formData.type = ''
      formData.tension = 5
      formData.documentId = ''
      formData.characters = []
      formData.items = []
      charactersInput.value = ''
      itemsInput.value = ''
    }
  }
)

// =======================
// 事件处理
// =======================
function handleClose() {
  emit('update:visible', false)
}

function handleConfirm() {
  // 验证必填字段
  if (!formData.title.trim()) {
    alert('请输入节点标题')
    return
  }

  // 构建请求数据
  if (props.isEdit) {
    const updateData: UpdateOutlineRequest = {
      title: formData.title,
      summary: formData.summary,
      type: formData.type,
      tension: formData.tension,
      documentId: formData.documentId,
      characters: formData.characters,
      items: formData.items,
    }
    emit('confirm', updateData)
  } else {
    const createData: CreateOutlineRequest = {
      title: formData.title,
      parentId: formData.parentId,
      summary: formData.summary,
      type: formData.type,
      tension: formData.tension,
      documentId: formData.documentId,
      characters: formData.characters,
      items: formData.items,
    }
    emit('confirm', createData)
  }
}
</script>

<style scoped lang="scss">
.outline-node-dialog {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.outline-node-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--editor-text-primary, #0f172a);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--editor-text-secondary, #334155);
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-md, 6px);
  background: var(--editor-bg-base, #ffffff);
  color: var(--editor-text-primary, #0f172a);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 120ms ease-out, box-shadow 120ms ease-out;

  &:focus {
    outline: none;
    border-color: var(--editor-accent, #06b6d4);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, #06b6d4) 16%, transparent);
  }

  &:disabled {
    background: var(--editor-bg-surface, #f8fafc);
    color: var(--editor-text-muted, #64748b);
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--editor-text-muted, #64748b);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  margin: 0;
  font-size: 12px;
  color: var(--editor-text-muted, #64748b);
  line-height: 1.4;
}

.type-preview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  margin-top: 4px;
}

.dialog-action {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-secondary, #334155);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 120ms ease-out,
    background-color 120ms ease-out,
    color 120ms ease-out;

  &:hover {
    border-color: var(--editor-border-focus, #06b6d4);
    background: color-mix(in srgb, var(--editor-bg-base, #fff) 90%, var(--editor-bg-surface, #f8fafc) 10%);
  }
}

.dialog-action--ghost {
  background: var(--editor-bg-surface, #f8fafc);
}

.dialog-action--primary {
  border-color: var(--editor-accent-soft-border, #a5f3fc);
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
}
</style>
