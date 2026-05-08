<script setup lang="ts">
/**
 * Upload 组件
 *
 * 功能完整的文件上传组件，支持点击上传、拖拽上传、多文件上传、图片预览等功能
 */

import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { UploadProps, UploadEmits, UploadSlots, FileItem, UploadRequestOptions } from './types'

// 使用 CVA 定义 Upload 变体
const uploadVariants = cva(
  // 基础样式
  'relative inline-block',
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

// 拖拽区域变体
const dragVariants = cva(
  'flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200',
  {
    variants: {
      isDragging: {
        true: 'border-primary-500 bg-primary-50',
        false: 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
      },
      disabled: {
        true: 'bg-slate-100 cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      isDragging: false,
      disabled: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<UploadProps>(), {
  method: 'POST',
  name: 'file',
  multiple: false,
  disabled: false,
  drag: false,
  autoUpload: true,
  showFileList: true,
  listType: 'text',
})

// 组件 Emits
const emit = defineEmits<UploadEmits>()

// 组件 Slots
const slots = defineSlots<UploadSlots>()

// 内部状态
const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const innerFileList = ref<FileItem[]>([])

// 监听 fileList 变化
watch(
  () => props.fileList,
  (newVal) => {
    if (newVal) {
      innerFileList.value = [...newVal]
    }
  },
  { immediate: true, deep: true }
)

// 计算上传区域样式
const uploadClasses = computed(() =>
  cn(
    uploadVariants({
      disabled: props.disabled,
    }),
    props.class
  )
)

// 计算拖拽区域样式
const dragClasses = computed(() =>
  cn(
    dragVariants({
      isDragging: isDragging.value,
      disabled: props.disabled,
    })
  )
)

// 计算是否可以继续上传
const canUpload = computed(() => {
  if (!props.limit) return true
  return innerFileList.value.length < props.limit
})

// 生成唯一 ID
const generateUid = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 创建文件项
const createFileItem = (file: File): FileItem => {
  return {
    uid: generateUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'ready',
    percent: 0,
    raw: file,
  }
}

// 处理文件选择
const handleFileSelect = (files: FileList | File[]) => {
  if (props.disabled) return

  const fileArray = Array.from(files)

  // 检查数量限制
  if (props.limit && innerFileList.value.length + fileArray.length > props.limit) {
    emit('exceed', fileArray, innerFileList.value)
    props.onExceed?.(fileArray, innerFileList.value)
    return
  }

  // 处理每个文件
  fileArray.forEach((file) => {
    const fileItem = createFileItem(file)

    // 执行上传前钩子
    const beforeUpload = props.beforeUpload
    if (beforeUpload) {
      const result = beforeUpload(file)
      if (result instanceof Promise) {
        result.then((proceed) => {
          if (proceed) {
            startUpload(fileItem)
          }
        })
      } else if (result) {
        startUpload(fileItem)
      }
    } else {
      startUpload(fileItem)
    }
  })
}

// 开始上传
const startUpload = (fileItem: FileItem) => {
  innerFileList.value = [...innerFileList.value, fileItem]
  updateFileList()

  // 立即触发 change 事件（文件已添加）
  emit('change', fileItem, innerFileList.value)
  props.onChange?.(fileItem, innerFileList.value)

  if (props.autoUpload) {
    uploadFile(fileItem)
  }
}

// 更新文件列表
const updateFileList = () => {
  emit('update:fileList', innerFileList.value)
}

// 上传文件
const uploadFile = async (fileItem: FileItem) => {
  if (!fileItem.raw) return

  // 更新状态为上传中
  fileItem.status = 'uploading'
  fileItem.percent = 0
  updateFileList()

  const options: UploadRequestOptions = {
    action: props.action || '',
    method: props.method || 'POST',
    headers: props.headers,
    name: props.name || 'file',
    file: fileItem.raw,
    data: props.data,
    onProgress: (percent) => {
      fileItem.percent = percent
      emit('progress', percent, fileItem)
      props.onProgress?.(percent, fileItem)
    },
    onSuccess: (response) => {
      fileItem.status = 'success'
      fileItem.response = response
      fileItem.percent = 100
      updateFileList()
      emit('success', response, fileItem, innerFileList.value)
      props.onSuccess?.(response, fileItem, innerFileList.value)
    },
    onError: (error) => {
      fileItem.status = 'error'
      fileItem.error = error
      updateFileList()
      emit('error', error, fileItem, innerFileList.value)
      props.onError?.(error, fileItem, innerFileList.value)
    },
  }

  try {
    if (props.httpRequest) {
      // 使用自定义上传函数
      await props.httpRequest(options)
    } else {
      // 使用默认上传函数
      await defaultUpload(options)
    }
  } catch (error) {
    options.onError(error as Error)
  }
}

// 默认上传函数
const defaultUpload = (options: UploadRequestOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { action, method, headers, name, file, data, onProgress, onSuccess, onError } = options

    const formData = new FormData()
    formData.append(name, file)

    // 添加额外参数
    if (data) {
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
      })
    }

    const xhr = new XMLHttpRequest()

    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    })

    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          onSuccess(response)
          resolve()
        } catch {
          onSuccess(xhr.responseText)
          resolve()
        }
      } else {
        const error = new Error(xhr.statusText || 'Upload failed')
        onError(error)
        reject(error)
      }
    })

    // 监听上传错误
    xhr.addEventListener('error', () => {
      const error = new Error('Network error')
      onError(error)
      reject(error)
    })

    // 监听上传中止
    xhr.addEventListener('abort', () => {
      const error = new Error('Upload aborted')
      onError(error)
      reject(error)
    })

    // 打开请求
    xhr.open(method, action)

    // 设置请求头
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          xhr.setRequestHeader(key, value)
        })
      } else {
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }
    }

    // 发送请求
    xhr.send(formData)
  })
}

// 处理点击上传
const handleClick = () => {
  if (props.disabled || !canUpload.value) return
  inputRef.value?.click()
}

// 处理文件输入变化
const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFileSelect(files)
  }
  // 重置 input 以允许再次选择相同文件
  target.value = ''
}

// 处理拖拽事件
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled && props.drag) {
    isDragging.value = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (props.disabled || !props.drag) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelect(files)
  }
}

// 处理文件预览
const handlePreview = (file: FileItem) => {
  emit('preview', file)
  props.onPreview?.(file)
}

// 处理文件移除
const handleRemove = async (file: FileItem) => {
  const shouldRemove = props.onRemove?.(file)
  if (shouldRemove instanceof Promise) {
    const result = await shouldRemove
    if (result) {
      removeFile(file)
    }
  } else if (shouldRemove !== false) {
    removeFile(file)
  }
}

// 移除文件
const removeFile = (file: FileItem) => {
  const index = innerFileList.value.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    innerFileList.value.splice(index, 1)
    updateFileList()
  }
}

// 格式化文件大小
const formatSize = (size?: number): string => {
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// 判断是否为图片
const isImage = (file: FileItem): boolean => {
  return file.type?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) !== null
}

// 获取文件 URL
const getFileUrl = (file: FileItem): string | undefined => {
  if (file.url) return file.url
  if (file.raw && isImage(file)) {
    return URL.createObjectURL(file.raw)
  }
  return undefined
}
</script>

<template>
  <div :class="uploadClasses">
    <!-- 文件输入 -->
    <input
      ref="inputRef"
      type="file"
      :class="['hidden']"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleInputChange"
    />

    <!-- 拖拽上传区域 -->
    <div
      v-if="drag"
      :class="dragClasses"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <slot>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="h-10 w-10 text-slate-400 mb-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-slate-600">
          将文件拖到此处，或<span class="text-primary-500">点击上传</span>
        </p>
        <p v-if="accept" class="text-xs text-slate-400 mt-1">
          支持 {{ accept }} 格式
        </p>
      </slot>
    </div>

    <!-- 点击上传区域 -->
    <div v-else @click="handleClick">
      <slot name="trigger">
        <button
          type="button"
          :disabled="disabled || !canUpload"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ canUpload ? '上传文件' : `已达到限制 (${limit})` }}</span>
        </button>
      </slot>
    </div>

    <!-- 提示信息 -->
    <div v-if="slots.tip && !drag" class="mt-2">
      <slot name="tip" />
    </div>

    <!-- 文件列表 -->
    <div v-if="showFileList && innerFileList.length > 0" class="mt-4 space-y-2">
      <!-- 列表模式 -->
      <template v-if="listType === 'text'">
        <div
          v-for="file in innerFileList"
          :key="file.uid"
          class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- 文件图标 -->
            <svg v-if="isImage(file)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-slate-400 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-slate-400 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            <!-- 文件信息 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 truncate">
                {{ file.name }}
              </p>
              <p v-if="file.size" class="text-xs text-slate-400">
                {{ formatSize(file.size) }}
              </p>
            </div>

            <!-- 上传进度 -->
            <div v-if="file.status === 'uploading'" class="flex-1 mx-4">
              <div class="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${file.percent || 0}%` }"
                />
              </div>
              <p class="text-xs text-slate-400 mt-1">
                {{ file.percent || 0 }}%
              </p>
            </div>

            <!-- 状态图标 -->
            <div class="flex items-center gap-2">
              <svg v-if="file.status === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-green-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-if="file.status === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <!-- 操作按钮 -->
              <button
                v-if="file.status !== 'uploading'"
                type="button"
                class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                @click.stop="handleRemove(file)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 自定义文件项插槽 -->
          <slot v-if="slots.file" name="file" :file="file" />
        </div>
      </template>

      <!-- 图片卡片模式 -->
      <template v-else-if="listType === 'picture-card'">
        <div class="flex flex-wrap gap-4">
          <div
            v-for="file in innerFileList"
            :key="file.uid"
            class="relative w-32 h-32 bg-white border border-slate-200 rounded-lg overflow-hidden group"
          >
            <!-- 图片预览 -->
            <img
              v-if="isImage(file) && getFileUrl(file)"
              :src="getFileUrl(file)"
              :alt="file.name"
              class="w-full h-full object-cover"
            />

            <!-- 非图片文件 -->
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-8 w-8 text-slate-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <!-- 上传中遮罩 -->
            <div
              v-if="file.status === 'uploading'"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-white animate-spin mx-auto">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p class="text-xs text-white mt-1">{{ file.percent || 0 }}%</p>
              </div>
            </div>

            <!-- 操作遮罩 -->
            <div
              v-if="file.status !== 'uploading'"
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            >
              <button
                v-if="isImage(file)"
                type="button"
                class="p-2 text-white hover:bg-white/20 rounded transition-colors"
                @click.stop="handlePreview(file)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                type="button"
                class="p-2 text-white hover:bg-white/20 rounded transition-colors"
                @click.stop="handleRemove(file)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- 状态图标 -->
            <div
              v-if="file.status === 'success'"
              class="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-3 w-3 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div
              v-if="file.status === 'error'"
              class="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-3 w-3 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div
            v-if="canUpload"
            class="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors"
            @click="handleClick"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-slate-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <p class="text-xs text-slate-400 mt-1">上传</p>
          </div>
        </div>
      </template>

      <!-- 图片列表模式 -->
      <template v-else-if="listType === 'picture'">
        <div class="space-y-2">
          <div
            v-for="file in innerFileList"
            :key="file.uid"
            class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            <!-- 缩略图 -->
            <div class="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
              <img
                v-if="isImage(file) && getFileUrl(file)"
                :src="getFileUrl(file)"
                :alt="file.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <!-- 文件信息 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 truncate">
                {{ file.name }}
              </p>
              <div class="flex items-center gap-2">
                <p v-if="file.size" class="text-xs text-slate-400">
                  {{ formatSize(file.size) }}
                </p>
                <p v-if="file.status === 'uploading'" class="text-xs text-primary-500">
                  上传中 {{ file.percent || 0 }}%
                </p>
              </div>
            </div>

            <!-- 状态图标 -->
            <div class="flex items-center gap-2">
              <svg v-if="file.status === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-green-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-if="file.status === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <!-- 操作按钮 -->
              <button
                v-if="isImage(file) && file.status !== 'uploading'"
                type="button"
                class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                @click.stop="handlePreview(file)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                v-if="file.status !== 'uploading'"
                type="button"
                class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                @click.stop="handleRemove(file)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
