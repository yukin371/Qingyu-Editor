<script setup lang="ts">
/**
 * 结构节点编辑器对话框
 * 使用 QyDialog (Apple 风格) 替代 el-dialog
 */
import { computed, reactive, watch, ref } from 'vue'
import { QyDialog, QyButton, QySelect } from '@/design-system/components'
import { Textarea, Input } from '@/design-system/base'

export interface StructureNodeFormValue {
  title: string
  level: number
  status: 'planned' | 'writing' | 'completed'
  description: string
}

const props = defineProps<{
  visible: boolean
  mode: 'create-root' | 'create-child' | 'edit'
  initialValue: StructureNodeFormValue
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', value: StructureNodeFormValue): void
}>()

// 本地 visible 状态
const localVisible = ref(props.visible)

watch(
  () => props.visible,
  (v) => {
    localVisible.value = v
  },
)

watch(localVisible, (v) => {
  emit('update:visible', v)
})

const localForm = reactive<StructureNodeFormValue>({
  title: '',
  level: 1,
  status: 'planned',
  description: '',
})

const dialogTitle = computed(() => {
  if (props.mode === 'edit') return '编辑结构节点'
  if (props.mode === 'create-child') return '新增子节点'
  return '新增主干节点'
})

watch(
  () => props.initialValue,
  (value) => {
    localForm.title = value.title
    localForm.level = value.level
    localForm.status = value.status
    localForm.description = value.description
  },
  { immediate: true, deep: true },
)

function emitSubmit() {
  emit('submit', {
    title: localForm.title.trim(),
    level: localForm.level,
    status: localForm.status,
    description: localForm.description.trim(),
  })
}

// 选项数据
const levelOptions = [
  { label: '章节主干', value: 1 },
  { label: '小节细纲', value: 2 },
  { label: '场景节拍', value: 3 },
]

const statusOptions = [
  { label: '草稿', value: 'planned' },
  { label: '写作中', value: 'writing' },
  { label: '已完成', value: 'completed' },
]
</script>

<template>
  <QyDialog
    v-model:visible="localVisible"
    :title="dialogTitle"
    size="md"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div class="space-y-5">
      <!-- 节点标题 -->
      <div class="form-item">
        <label class="form-label">节点标题</label>
        <Input v-model="localForm.title" placeholder="输入结构节点标题" />
      </div>

      <!-- 层级（新增时显示） -->
      <div v-if="mode !== 'edit'" class="form-item">
        <label class="form-label">层级</label>
        <QySelect v-model="localForm.level" :options="levelOptions" placeholder="选择层级" />
      </div>

      <!-- 状态 -->
      <div class="form-item">
        <label class="form-label">状态</label>
        <QySelect v-model="localForm.status" :options="statusOptions" placeholder="选择状态" />
      </div>

      <!-- 结构说明 -->
      <div class="form-item">
        <label class="form-label">结构说明</label>
        <Textarea
          v-model="localForm.description"
          :rows="4"
          placeholder="补充这个节点的目标、冲突、结果或节拍要点"
        />
      </div>
    </div>

    <template #footer>
      <QyButton variant="secondary" @click="localVisible = false"> 取消 </QyButton>
      <QyButton variant="primary" :loading="submitting" @click="emitSubmit"> 保存 </QyButton>
    </template>
  </QyDialog>
</template>

<style scoped>
.space-y-5 > * + * {
  margin-top: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
</style>
