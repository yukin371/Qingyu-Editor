<script setup lang="ts">
/**
 * 数据迁移对话框
 * 使用 QyDialog (Apple 风格) 替代 el-dialog
 */
import { ref, computed, watch } from 'vue'
import { QyDialog, QyButton, QyProgress } from '@/design-system/components'
import { Checkbox } from '@/design-system/base'
import {
  migrateToBackend,
  hasLocalDataToMigrate,
  clearLocalData,
  type MigrationResult,
} from '@/utils/migration'

interface Props {
  modelValue: boolean
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void
  (_e: 'migration-complete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localVisible = ref(props.modelValue)

watch(() => props.modelValue, (v) => {
  localVisible.value = v
})

watch(localVisible, (v) => {
  emit('update:modelValue', v)
})

const checkingLocal = ref(false)
const migrating = ref(false)
const migrationStarted = ref(false)
const clearLocalAfterMigration = ref(true)
const clearingLocal = ref(false)

const localData = ref({
  hasData: false,
  projectCount: 0,
  documentCount: 0,
})

const migrationResult = ref<MigrationResult | null>(null)

const progress = ref({
  current: 0,
  total: 0,
  status: '',
})

const progressPercent = computed(() => {
  if (progress.value.total === 0) return 0
  return Math.round((progress.value.current / progress.value.total) * 100)
})

const isSuccess = computed(() => migrationResult.value?.success)
const isFailed = computed(() => migrationResult.value && !migrationResult.value.success)

// 检查本地数据
const checkLocalData = async () => {
  checkingLocal.value = true
  try {
    localData.value = await hasLocalDataToMigrate()
  } finally {
    checkingLocal.value = false
  }
}

// 开始迁移
const startMigration = async () => {
  migrating.value = true
  migrationStarted.value = true
  migrationResult.value = null

  try {
    migrationResult.value = await migrateToBackend((p) => {
      progress.value = p
    })

    if (migrationResult.value.success && clearLocalAfterMigration.value) {
      clearingLocal.value = true
      try {
        await clearLocalData()
      } catch (error: unknown) {
        console.warn('清空本地数据失败:', error)
      } finally {
        clearingLocal.value = false
      }
    }
  } catch (error: unknown) {
    migrationResult.value = {
      success: false,
      projectsMigrated: 0,
      documentsMigrated: 0,
      errors: [error instanceof Error ? error.message : '未知错误'],
    }
  } finally {
    migrating.value = false
  }
}

// 完成迁移
const handleComplete = () => {
  emit('migration-complete')
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  localVisible.value = false
  // 重置状态
  migrationStarted.value = false
  migrating.value = false
  migrationResult.value = null
  progress.value = { current: 0, total: 0, status: '' }
}

// 监听对话框打开
watch(localVisible, (val) => {
  if (val) {
    checkLocalData()
  }
})
</script>

<template>
  <QyDialog
    v-model:visible="localVisible"
    title="数据迁移"
    size="md"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <!-- 迁移前：显示本地数据概览 -->
    <div v-if="!migrationStarted" class="migration-info">
      <div class="info-card">
        <div class="info-icon">
          <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75m-3.75 0a3 3 0 013-3h7.5M9 12h6m-6 0a3 3 0 00-3 3v6m6-6a3 3 0 013 3v6M9 12V9.75m0 0H6.75M9 12V9.75M12 15h.008v.008H12V15z" />
          </svg>
        </div>
        <div class="info-content">
          <p class="info-title">发现本地数据</p>
          <p class="info-desc">
            您有 <strong>{{ localData.projectCount }}</strong> 个本地项目和
            <strong>{{ localData.documentCount }}</strong> 个文档可以迁移到云端。
          </p>
        </div>
      </div>

      <div class="migration-note">
        <p class="note-title">迁移说明：</p>
        <ul class="note-list">
          <li>本地项目将被创建为云端项目</li>
          <li>项目中的文档也会一并迁移</li>
          <li>迁移完成后可选择清空本地数据</li>
        </ul>
      </div>
    </div>

    <!-- 迁移中：进度显示 -->
    <div v-else-if="migrating" class="migration-progress">
      <QyProgress :percentage="progressPercent" />
      <p class="progress-status">{{ progress.status }}</p>
    </div>

    <!-- 迁移后：结果展示 -->
    <div v-else class="migration-result">
      <!-- 成功状态 -->
      <div v-if="isSuccess" class="result-card success">
        <div class="result-icon success">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="result-title">迁移成功</p>
        <p class="result-subtitle">
          已迁移 {{ migrationResult?.projectsMigrated }} 个项目和
          {{ migrationResult?.documentsMigrated }} 个文档
        </p>
      </div>

      <!-- 失败状态 -->
      <div v-else-if="isFailed" class="result-card failed">
        <div class="result-icon failed">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p class="result-title">迁移完成（部分失败）</p>
        <div class="result-stats">
          <p>成功: {{ migrationResult?.projectsMigrated }} 个项目, {{ migrationResult?.documentsMigrated }} 个文档</p>
          <p v-if="migrationResult?.errors?.length" class="text-red-500">
            错误: {{ migrationResult.errors.length }} 个
          </p>
        </div>
        <div v-if="migrationResult?.errors?.length" class="error-list">
          <p v-for="(error, index) in migrationResult.errors" :key="index" class="error-item">
            {{ index + 1 }}. {{ error }}
          </p>
        </div>
      </div>

      <!-- 清空选项 -->
      <label v-if="isSuccess" class="clear-checkbox">
        <Checkbox v-model="clearLocalAfterMigration" :disabled="clearingLocal">
          迁移成功后清空本地数据
        </Checkbox>
      </label>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <QyButton v-if="!migrationStarted" variant="secondary" @click="handleClose">
          取消
        </QyButton>
        <QyButton
          v-if="!migrationStarted"
          variant="primary"
          :loading="checkingLocal"
          @click="startMigration"
        >
          开始迁移
        </QyButton>
        <QyButton
          v-if="migrationStarted && !migrating"
          variant="primary"
          @click="handleComplete"
        >
          完成
        </QyButton>
      </div>
    </template>
  </QyDialog>
</template>

<style scoped>
/* 迁移前信息卡片 */
.migration-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 4px 0;
}

.info-desc {
  font-size: 14px;
  color: #1e3a8a;
  margin: 0;
  line-height: 1.5;
}

.info-desc strong {
  color: #1d4ed8;
}

.migration-note {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.note-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 8px 0;
}

.note-list {
  margin: 0;
  padding-left: 18px;
}

.note-list li {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0;
  line-height: 1.5;
}

/* 迁移中进度 */
.migration-progress {
  padding: 24px 0;
  text-align: center;
}

.progress-status {
  margin-top: 16px;
  font-size: 14px;
  color: #64748b;
}

/* 迁移结果 */
.migration-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.result-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: 16px;
}

.result-card.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.result-card.failed {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon.success svg {
  color: #16a34a;
}

.result-icon.failed svg {
  color: #dc2626;
}

.result-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.result-card.success .result-title {
  color: #15803d;
}

.result-card.failed .result-title {
  color: #b91c1c;
}

.result-subtitle {
  font-size: 14px;
  color: #166534;
  margin: 0;
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-stats p {
  font-size: 14px;
  color: #7f1d1d;
  margin: 0;
}

.error-list {
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  text-align: left;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 12px;
}

.error-item {
  font-size: 12px;
  color: #dc2626;
  margin: 4px 0;
  line-height: 1.4;
}

.clear-checkbox {
  cursor: pointer;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
