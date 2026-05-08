<template>
  <div class="file-uploader">
    <el-upload
      :action="uploadAction"
      :headers="uploadHeaders"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :show-file-list="showFileList"
      :drag="drag"
      :disabled="disabled"
      v-bind="$attrs"
    >
      <slot>
        <div v-if="drag" class="upload-drag-content">
          <el-icon class="upload-icon">
            <UploadFilled />
          </el-icon>
          <div class="upload-text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <div class="upload-tip">{{ tipText }}</div>
        </div>
        <el-button v-else type="primary" :icon="UploadFilled">
          {{ buttonText }}
        </el-button>
      </slot>
    </el-upload>

    <!-- 上传进度列表 -->
    <div v-if="uploadQueue.length > 0 && showProgress" class="upload-queue">
      <div
        v-for="item in uploadQueue"
        :key="item.fileId"
        class="upload-item"
        :class="`status-${item.status}`"
      >
        <div class="upload-item-info">
          <i :class="getStatusIcon(item.status)"></i>
          <span class="upload-item-name">{{ item.filename }}</span>
        </div>
        <div class="upload-item-progress">
          <el-progress
            v-if="item.status === 'uploading'"
            :percentage="item.progress"
            :show-text="false"
          />
          <span v-if="item.status === 'done'" class="status-text success">上传成功</span>
          <span v-if="item.status === 'error'" class="status-text error">{{ item.error }}</span>
        </div>
        <el-button
          v-if="item.status !== 'uploading'"
          type="text"
          :icon="Close"
          @click="removeUploadItem(item.fileId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from '@/design-system/services'
import type { UploadProps, UploadRawFile } from 'element-plus'
import { UploadFilled, Close } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

// 扩展的上传进度接口
interface ExtendedUploadProgress {
  fileId: string
  filename: string
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
}

interface Props {
  accept?: string
  multiple?: boolean
  limit?: number
  maxSize?: number // MB
  drag?: boolean
  buttonText?: string
  tipText?: string
  showFileList?: boolean
  showProgress?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'success', response: any, file: UploadRawFile): void
  (e: 'error', error: Error, file: UploadRawFile): void
  (e: 'progress', progress: number, file: UploadRawFile): void
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  multiple: true,
  limit: 10,
  maxSize: 10,
  drag: true,
  buttonText: '上传文件',
  tipText: '支持扩展名：.jpg .png .pdf等，单个文件不超过10MB',
  showFileList: false,
  showProgress: true,
  disabled: false
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const uploadQueue = ref<ExtendedUploadProgress[]>([])

// 上传地址
const uploadAction = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/shared/storage/upload`
})

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
})

// 上传前检查
const handleBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 检查文件大小
  const fileSizeMB = rawFile.size / 1024 / 1024
  if (fileSizeMB > props.maxSize) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 添加到上传队列
  const fileId = `upload_${Date.now()}_${Math.random()}`
  uploadQueue.value.push({
    fileId,
    filename: rawFile.name,
    progress: 0,
    status: 'uploading'
  })

  return true
}

// 上传成功
const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  const item = uploadQueue.value.find((i) => i.filename === uploadFile.name)
  if (item) {
    item.status = 'done'
    item.progress = 100
  }

  emit('success', response, uploadFile.raw!)
}

// 上传失败
const handleError: UploadProps['onError'] = (error, uploadFile) => {
  const item = uploadQueue.value.find((i) => i.filename === uploadFile.name)
  if (item) {
    item.status = 'error'
    item.error = '上传失败'
  }

  emit('error', error, uploadFile.raw!)
}

// 上传进度
const handleProgress: UploadProps['onProgress'] = (evt, uploadFile) => {
  const progress = Math.round(evt.percent || 0)
  const item = uploadQueue.value.find((i) => i.filename === uploadFile.name)
  if (item) {
    item.progress = progress
  }

  emit('progress', progress, uploadFile.raw!)
}

// 超出文件数量限制
const handleExceed: UploadProps['onExceed'] = (_files) => {
  message.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 获取状态图标
const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    pending: 'el-icon-document',
    uploading: 'el-icon-loading',
    done: 'el-icon-circle-check',
    error: 'el-icon-circle-close'
  }
  return iconMap[status] || 'el-icon-document'
}

// 移除上传项
const removeUploadItem = (fileId: string) => {
  const index = uploadQueue.value.findIndex((item) => item.fileId === fileId)
  if (index !== -1) {
    uploadQueue.value.splice(index, 1)
  }
}

// 清空上传队列
const clearUploadQueue = () => {
  uploadQueue.value = []
}

// 暴露方法
defineExpose({
  clearUploadQueue
})
</script>

<style scoped lang="scss">
.file-uploader {
  width: 100%;
}

.upload-drag-content {
  padding: 40px 20px;
  text-align: center;

  .upload-icon {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
  }
}

.upload-queue {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.status-success {
    background: #f0f9ff;
    border-left: 3px solid #67c23a;
  }

  &.status-error {
    background: #fef0f0;
    border-left: 3px solid #f56c6c;
  }
}

.upload-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  i {
    font-size: 18px;
    flex-shrink: 0;
  }

  .status-uploading i {
    color: #409eff;
  }

  .status-success i {
    color: #67c23a;
  }

  .status-error i {
    color: #f56c6c;
  }
}

.upload-item-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-item-progress {
  flex: 1;
  max-width: 200px;
}

.status-text {
  font-size: 12px;

  &.success {
    color: #67c23a;
  }

  &.error {
    color: #f56c6c;
  }
}
</style>

