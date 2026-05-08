<template>
  <div class="system-config-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">系统配置</h2>
        <p class="page-subtitle">管理系统的各项配置参数，支持分组管理和备份恢复</p>
      </div>
      <div class="header-actions">
        <QyButton variant="primary" :icon="checkIconSvg" :loading="saving" @click="handleSave">
          保存修改
        </QyButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item groups">
        <div class="stat-icon" v-html="folderOpenedIconSvg" />
        <div class="stat-info">
          <span class="stat-value">{{ stats.groups }}</span>
          <span class="stat-label">配置分组</span>
        </div>
      </div>
      <div class="stat-item configs">
        <div class="stat-icon" v-html="settingIconSvg" />
        <div class="stat-info">
          <span class="stat-value">{{ stats.configs }}</span>
          <span class="stat-label">配置项数</span>
        </div>
      </div>
      <div class="stat-item editable">
        <div class="stat-icon" v-html="editIconSvg" />
        <div class="stat-info">
          <span class="stat-value">{{ stats.editable }}</span>
          <span class="stat-label">可编辑项</span>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="actions-card">
      <QyButton variant="secondary" :icon="refreshIconSvg" @click="loadConfigs">重新加载</QyButton>
      <QyButton variant="secondary" :icon="folderOpenedIconSvg" @click="showBackupDialog = true">
        配置备份
      </QyButton>
      <QyButton
        variant="outline"
        :icon="restoreIconSvg"
        class="warning-button"
        @click="handleResetDefaults"
      >
        恢复默认
      </QyButton>
    </div>

    <!-- 配置列表 -->
    <div class="config-card">
      <div class="loading-overlay" :class="{ 'is-active': loading }">
        <Spinner type="default" size="md" label="配置加载中" />
      </div>
      <Collapse v-model="activeGroups" accordion class="config-collapse">
        <CollapseItem v-for="group in configGroups" :key="group.name" :name="group.name">
          <template #title>
            <div class="group-header">
              <span class="group-icon" :class="group.name" v-html="getGroupIconSvg(group.name)" />
              <span class="group-title">{{ group.description }}</span>
              <span class="group-count">{{ group.items?.length || 0 }} 项</span>
            </div>
          </template>

          <Form :model="configValues" label-width="200px" label-position="left" class="config-form">
            <FormItem
              v-for="item in group.items"
              :key="item.key"
              :label="item.description"
              :label-width="'200px'"
            >
              <!-- Boolean类型 -->
              <QySwitch
                v-if="item.type === 'boolean'"
                v-model="configValues[item.key]"
                :disabled="!item.editable"
                color="success"
              />

              <!-- Number类型 -->
              <div v-else-if="item.type === 'number'" class="config-control config-control--number">
                <QyInputNumber
                  v-model="configValues[item.key]"
                  :disabled="!item.editable"
                  :step="1"
                />
              </div>

              <!-- String类型 -->
              <QyInput
                v-else
                v-model="configValues[item.key]"
                class="config-control"
                :type="item.sensitive ? 'password' : 'text'"
                :disabled="!item.editable"
                :placeholder="item.sensitive ? '******' : '请输入配置值'"
                :clearable="item.editable && !item.sensitive"
                :show-password="!item.sensitive"
                :autocomplete="item.sensitive ? 'new-password' : 'off'"
                :suffix-icon="item.editable && !item.sensitive ? editIndicatorIcon : undefined"
              />

              <span class="config-key">{{ item.key }}</span>
              <QyTag
                v-if="item.sensitive"
                type="warning"
                size="sm"
                effect="light"
                class="config-sensitive-tag"
              >
                敏感
              </QyTag>
            </FormItem>
          </Form>
        </CollapseItem>
      </Collapse>
    </div>

    <!-- 备份管理对话框 -->
    <Dialog
      v-model:visible="showBackupDialog"
      title="配置备份管理"
      size="lg"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      center
    >
      <Alert type="info" title="配置备份可以帮助您在修改配置出错时快速恢复" class="backup-alert" />

      <div class="backup-panel">
        <div
          class="loading-overlay loading-overlay--dialog"
          :class="{ 'is-active': loadingBackups }"
        >
          <Spinner type="default" size="md" label="备份加载中" />
        </div>
        <div class="backup-header">
          <h4>可用备份</h4>
          <QyButton variant="primary" size="sm" :icon="plusIconSvg" @click="handleCreateBackup">
            创建备份
          </QyButton>
        </div>

        <Empty v-if="backups.length === 0" description="暂无备份" class="backup-empty" />
        <div v-else class="backup-list">
          <div v-for="(backup, index) in backups" :key="index" class="backup-item">
            <div class="backup-info">
              <span class="backup-info__icon" v-html="clockIconSvg" />
              <span>{{ backup.name }}</span>
              <span class="backup-time">{{ backup.time }}</span>
            </div>
            <div class="backup-actions">
              <QyButton variant="primary" size="sm" @click="handleRestore(backup)">恢复</QyButton>
              <QyButton variant="danger" size="sm" @click="handleDeleteBackup(backup)"
                >删除</QyButton
              >
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <QyButton variant="secondary" @click="showBackupDialog = false">关闭</QyButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Form, FormItem } from '@/design-system/form/Form'
import { Empty } from '@/design-system/base/Empty'
import { Alert } from '@/design-system/feedback/Alert'
import { Dialog } from '@/design-system/feedback/Dialog'
import { Spinner } from '@/design-system/feedback/Spinner'
import { message, messageBox } from '@/design-system/services'
import { Collapse, CollapseItem } from '@/design-system/data/Collapse'
import { QyButton, QyInput, QyInputNumber, QySwitch, QyTag } from '@/design-system/components'
import * as adminAPI from '@/modules/admin/api'

type ConfigItem = {
  key: string
  value: string | number | boolean | null
  type: 'string' | 'number' | 'boolean'
  description: string
  editable: boolean
  sensitive?: boolean
}

type ConfigGroup = {
  name: string
  description: string
  items: ConfigItem[]
}

type BackupItem = {
  id: string
  name: string
  time: string
}

const loading = ref(false)
const saving = ref(false)
const configGroups = ref<ConfigGroup[]>([])
const configValues = reactive<Record<string, any>>({})
const initialValues = ref<Record<string, string | number | boolean | null>>({})
const activeGroups = ref<string[]>([])
const showBackupDialog = ref(false)
const backups = ref<BackupItem[]>([])
const loadingBackups = ref(false)

const checkIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
const refreshIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`
const folderOpenedIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v1M3 7v10a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3"/></svg>`
const settingIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1 1 0 011.35-.936l1.2.48a1 1 0 00.75 0l1.2-.48a1 1 0 011.35.936l.081 1.29a1 1 0 00.514.81l1.11.63a1 1 0 01.318 1.398l-.72 1.074a1 1 0 000 .992l.72 1.074a1 1 0 01-.318 1.398l-1.11.63a1 1 0 00-.514.81l-.08 1.29a1 1 0 01-1.351.936l-1.2-.48a1 1 0 00-.75 0l-1.2.48a1 1 0 01-1.35-.936l-.081-1.29a1 1 0 00-.514-.81l-1.11-.63a1 1 0 01-.318-1.398l.72-1.074a1 1 0 000-.992l-.72-1.074a1 1 0 01.318-1.398l1.11-.63a1 1 0 00.514-.81l.08-1.29z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>`
const editIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.586 2.586a2 2 0 112.828 2.828L12 14.828 8 16l1.172-4 9.414-9.414z"/></svg>`
const restoreIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l-1.5-1.5M21 14h-4l1.5 1.5M7 10a7 7 0 0112.02-2.02M17 14a7 7 0 01-12.02 2.02"/></svg>`
const plusIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14"/></svg>`
const clockIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
const editIndicatorIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.586 2.586a2 2 0 112.828 2.828L12 14.828 8 16l1.172-4 9.414-9.414z"/></svg>`

// 统计数据
const stats = reactive({
  groups: 0,
  configs: 0,
  editable: 0,
})

// 获取分组图标
const getGroupIconSvg = (name: string) => {
  const icons: Record<string, string> = {
    site: documentIconSvg,
    user: userIconSvg,
    content: editIconSvg,
    payment: creditCardIconSvg,
    notify: bellIconSvg,
  }
  return icons[name] || settingIconSvg
}

const userIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.97 9.97 0 0112 15c2.634 0 5.028 1.018 6.879 2.683M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
const bellIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"/></svg>`
const creditCardIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h5M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>`
const documentIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`

const syncStats = (groups: ConfigGroup[]) => {
  stats.groups = groups.length
  stats.configs = groups.reduce((sum, group) => sum + (group.items?.length || 0), 0)
  stats.editable = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => item.editable).length,
    0,
  )
}

const applyConfigValues = (groups: ConfigGroup[]) => {
  const nextValues: Record<string, string | number | boolean | null> = {}
  groups.forEach((group) => {
    group.items.forEach((item) => {
      nextValues[item.key] = item.value ?? null
      configValues[item.key] = item.value ?? null
    })
  })
  initialValues.value = nextValues
}

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = (await adminAPI.getAllConfigs()) as any
    const payload = response?.groups ? response : (response?.data ?? {})
    const groups = Array.isArray(payload.groups) ? (payload.groups as ConfigGroup[]) : []
    configGroups.value = groups
    applyConfigValues(groups)
    syncStats(groups)
    activeGroups.value = groups[0]?.name ? [groups[0].name] : []
  } catch (error) {
    configGroups.value = []
    activeGroups.value = []
    syncStats([])
    message.error('加载配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await messageBox.confirm('确定要保存所有修改吗？', '确认保存', {
      type: 'warning',
    })

    saving.value = true
    const updates = configGroups.value.flatMap((group) =>
      group.items
        .filter((item) => item.editable)
        .map((item) => ({
          key: item.key,
          value: configValues[item.key],
        })),
    )
    await adminAPI.batchUpdateConfig({ updates } as any)

    message.success('配置保存成功')
    await loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('保存配置失败')
      console.error(error)
    }
  } finally {
    saving.value = false
  }
}

// 恢复默认配置
const handleResetDefaults = async () => {
  try {
    await messageBox.confirm('恢复默认配置将覆盖当前所有设置，确定继续吗？', '警告', {
      type: 'warning',
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
    })
    Object.entries(initialValues.value).forEach(([key, value]) => {
      configValues[key] = value
    })
    message.success('已恢复到当前服务端配置')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复默认配置失败')
    }
  }
}

// 创建备份
const handleCreateBackup = async () => {
  message.warning('当前后端未提供手动创建配置备份接口')
}

// 恢复备份
const handleRestore = async (backup: BackupItem) => {
  try {
    await messageBox.confirm(`恢复备份 "${backup.name}" 将覆盖当前配置，确定继续吗？`, '警告', {
      type: 'warning',
    })

    await adminAPI.restoreConfigBackup()
    message.success('配置恢复成功')
    showBackupDialog.value = false
    await loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复配置失败')
    }
  }
}

// 删除备份
const handleDeleteBackup = async (_backup: BackupItem) => {
  message.warning('当前后端未提供删除配置备份接口')
}

const loadBackups = async () => {
  loadingBackups.value = true
  try {
    const response = (await adminAPI.getConfigBackups()) as any
    const payload = response?.backups ? response : (response?.data ?? {})
    const list = Array.isArray(payload.backups) ? (payload.backups as string[]) : []
    backups.value = list.map((name, index) => ({
      id: `backup_${index}_${name}`,
      name,
      time: name,
    }))
  } catch (error) {
    backups.value = []
    message.error('加载配置备份失败')
    console.error(error)
  } finally {
    loadingBackups.value = false
  }
}

watch(showBackupDialog, (visible) => {
  if (visible) {
    void loadBackups()
  } else {
    backups.value = []
  }
})

onMounted(() => {
  void loadConfigs()
})
</script>

<style scoped lang="scss">
.system-config-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 20px;
      height: 20px;
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  &.groups {
    .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .stat-value {
      color: #3b82f6;
    }
  }

  &.configs {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }

  &.editable {
    .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .stat-value {
      color: #f59e0b;
    }
  }
}

// 操作栏
.actions-card {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.warning-button {
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.28);
  background: rgba(255, 251, 235, 0.82);
}

// 配置卡片
.config-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 5;

  &.is-active {
    opacity: 1;
    pointer-events: auto;
  }

  &--dialog {
    border-radius: 20px;
    background: rgba(248, 250, 252, 0.88);
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .group-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 18px;
      height: 18px;
    }

    &.site {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    &.user {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    &.content {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.payment {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    &.notify {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
  }

  .group-title {
    font-size: 16px;
    font-weight: 500;
    color: #374151;
  }

  .group-count {
    margin-left: auto;
    font-size: 12px;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 4px 10px;
    border-radius: 12px;
  }
}

.config-form {
  padding: 16px 0;

  :deep(.tw-form-item) {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  :deep(.tw-form-item:last-child) {
    margin-bottom: 0;
  }

  :deep(.tw-form-item-label-left) {
    flex: 0 0 200px;
    width: 200px !important;
    padding-top: 10px;
    font-size: 14px;
    color: #374151;
  }

  :deep(.tw-form-item-label-text) {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  :deep(.tw-form-item-content-left) {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.config-key {
  margin-left: 12px;
  color: #9ca3af;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.config-control {
  width: min(100%, 350px);
}

.config-control :deep(input[type='password']::-webkit-credentials-auto-fill-button),
.config-control :deep(input[type='password']::-webkit-contacts-auto-fill-button),
.config-control :deep(input[type='password']::-ms-reveal),
.config-control :deep(input[type='password']::-ms-clear) {
  display: none !important;
  visibility: hidden;
  pointer-events: none;
}

.config-control--number {
  width: min(100%, 200px);
}

.config-control--number :deep(.qy-input-number) {
  width: 100%;
}

.config-control--number :deep(.qy-input-number__input) {
  min-width: 0;
}

.config-collapse {
  :deep(.collapse-item > div:first-child) {
    min-height: 60px;
    padding: 14px 18px;
    border-bottom: 1px solid #f3f4f6;
  }

  :deep(.collapse-item > div:last-child > div) {
    padding: 0 18px 20px;
  }
}

.config-sensitive-tag {
  margin-left: 8px;
}

// 备份对话框
.backup-alert {
  margin-bottom: 20px;
}

.backup-panel {
  position: relative;
  min-height: 120px;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 15px;
    color: #374151;
  }
}

.backup-empty {
  max-width: 440px;
  margin: 12px auto 0;
}

.backup-list {
  .backup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.2s;

    &:hover {
      border-color: #3b82f6;
      background: #f9fafb;
    }

    .backup-info {
      display: flex;
      align-items: center;
      gap: 10px;

      &__icon {
        display: inline-flex;
        color: #64748b;

        :deep(svg) {
          width: 18px;
          height: 18px;
        }
      }

      .backup-time {
        font-size: 12px;
        color: #9ca3af;
      }
    }

    .backup-actions {
      display: flex;
      gap: 8px;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .config-form {
    :deep(.tw-form-item) {
      flex-direction: column;
      gap: 8px;
    }

    :deep(.tw-form-item-label-left) {
      width: 100% !important;
      flex: none;
      padding-top: 0;
    }

    .config-control,
    .config-control--number {
      width: 100%;
    }
  }

  .backup-list .backup-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
