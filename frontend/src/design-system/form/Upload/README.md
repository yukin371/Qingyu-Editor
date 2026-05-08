# Upload 上传组件

功能完整的文件上传组件，支持点击上传、拖拽上传、多文件上传、图片预览等功能。

## 功能特点

- ✅ 支持点击上传和拖拽上传
- ✅ 支持多文件上传
- ✅ 支持文件数量限制
- ✅ 支持文件类型限制
- ✅ 支持自定义上传请求
- ✅ 支持上传进度显示
- ✅ 支持图片预览
- ✅ 支持文件删除
- ✅ 三种文件列表展示模式（文本、图片、图片卡片）
- ✅ 完整的钩子函数和事件系统

## 基础用法

### 点击上传

最简单的用法，点击按钮上传文件。

```vue
<template>
  <Upload
    action="/api/upload"
    v-model:file-list="fileList"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Upload from '@/design-system/form/Upload/Upload.vue'
import type { FileItem } from '@/design-system/form/Upload/types'

const fileList = ref<FileItem[]>([])
</script>
```

### 拖拽上传

启用拖拽功能，用户可以将文件拖拽到指定区域上传。

```vue
<template>
  <Upload
    action="/api/upload"
    drag
    v-model:file-list="fileList"
  />
</template>
```

### 多文件上传

支持同时上传多个文件。

```vue
<template>
  <Upload
    action="/api/upload"
    multiple
    v-model:file-list="fileList"
  />
</template>
```

## 文件列表展示

### 文本模式（默认）

以列表形式展示文件信息。

```vue
<template>
  <Upload
    action="/api/upload"
    list-type="text"
    v-model:file-list="fileList"
  />
</template>
```

### 图片卡片模式

以卡片形式展示图片，适合头像、产品图等场景。

```vue
<template>
  <Upload
    action="/api/upload"
    accept="image/*"
    list-type="picture-card"
    v-model:file-list="fileList"
  />
</template>
```

### 图片列表模式

以列表形式展示图片缩略图。

```vue
<template>
  <Upload
    action="/api/upload"
    accept="image/*"
    list-type="picture"
    v-model:file-list="fileList"
  />
</template>
```

## 文件限制

### 数量限制

限制上传文件的最大数量。

```vue
<template>
  <Upload
    action="/api/upload"
    :limit="3"
    multiple
    v-model:file-list="fileList"
    @exceed="handleExceed"
  />
</template>

<script setup lang="ts">
const handleExceed = (files: File[], fileList: FileItem[]) => {
  console.warn('超出限制', files, fileList)
}
</script>
```

### 类型限制

通过 `accept` 属性限制文件类型。

```vue
<template>
  <!-- 仅图片 -->
  <Upload
    action="/api/upload"
    accept="image/*"
    v-model:file-list="fileList"
  />

  <!-- 仅 PDF -->
  <Upload
    action="/api/upload"
    accept=".pdf"
    v-model:file-list="fileList"
  />

  <!-- 多种类型 -->
  <Upload
    action="/api/upload"
    accept="image/*,.pdf,.doc"
    v-model:file-list="fileList"
  />
</template>
```

### 上传前校验

在上传前进行文件验证。

```vue
<template>
  <Upload
    action="/api/upload"
    :before-upload="beforeUpload"
    v-model:file-list="fileList"
  />
</template>

<script setup lang="ts">
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    alert('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    alert('图片大小不能超过 2MB!')
    return false
  }
  return true
}
</script>
```

## 自定义上传

### 自定义上传函数

使用 `http-request` 自定义上传逻辑。

```vue
<template>
  <Upload
    :http-request="customRequest"
    v-model:file-list="fileList"
  />
</template>

<script setup lang="ts">
import type { UploadRequestOptions } from '@/design-system/form/Upload/types'

const customRequest = (options: UploadRequestOptions) => {
  const { file, onProgress, onSuccess, onError } = options

  // 使用 axios 或其他 HTTP 库
  const formData = new FormData()
  formData.append('file', file)

  // 模拟上传
  let percent = 0
  const interval = setInterval(() => {
    percent += 10
    onProgress(percent)

    if (percent >= 100) {
      clearInterval(interval)
      onSuccess({ url: 'https://example.com/file.jpg' })
    }
  }, 200)
}
</script>
```

### 手动上传

设置 `auto-upload` 为 false，手动触发上传。

```vue
<template>
  <Upload
    action="/api/upload"
    :auto-upload="false"
    v-model:file-list="fileList"
  />
  <button @click="handleUpload">开始上传</button>
</template>

<script setup lang="ts">
const handleUpload = () => {
  fileList.value.forEach((file) => {
    if (file.status === 'ready') {
      // 触发上传逻辑
      console.log('上传文件:', file.name)
    }
  })
}
</script>
```

## 事件处理

```vue
<template>
  <Upload
    action="/api/upload"
    v-model:file-list="fileList"
    @change="handleChange"
    @success="handleSuccess"
    @error="handleError"
    @progress="handleProgress"
    @preview="handlePreview"
    @remove="handleRemove"
  />
</template>

<script setup lang="ts">
import type { FileItem } from '@/design-system/form/Upload/types'

const handleChange = (file: FileItem, fileList: FileItem[]) => {
  console.log('文件变化', file, fileList)
}

const handleSuccess = (response: any, file: FileItem, fileList: FileItem[]) => {
  console.log('上传成功', response, file, fileList)
}

const handleError = (error: Error, file: FileItem, fileList: FileItem[]) => {
  console.error('上传失败', error, file, fileList)
}

const handleProgress = (percent: number, file: FileItem) => {
  console.log('上传进度', percent, file.name)
}

const handlePreview = (file: FileItem) => {
  window.open(file.url, '_blank')
}

const handleRemove = (file: FileItem) => {
  console.log('删除文件', file)
  return true
}
</script>
```

## 插槽

### 触发器插槽

自定义上传按钮。

```vue
<template>
  <Upload action="/api/upload" v-model:file-list="fileList">
    <template #trigger>
      <button class="custom-button">选择文件</button>
    </template>
  </Upload>
</template>
```

### 提示信息插槽

自定义提示信息。

```vue
<template>
  <Upload action="/api/upload" v-model:file-list="fileList">
    <template #tip>
      <p class="text-slate-400">只能上传 jpg/png 文件，且不超过 500kb</p>
    </template>
  </Upload>
</template>
```

### 文件项插槽

自定义文件列表项的渲染。

```vue
<template>
  <Upload action="/api/upload" v-model:file-list="fileList">
    <template #file="{ file }">
      <div class="custom-file-item">
        <span>{{ file.name }}</span>
        <span>{{ file.size }} bytes</span>
      </div>
    </template>
  </Upload>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| action | string | - | 上传地址 |
| method | UploadMethod | 'POST' | 上传请求方法 |
| headers | Headers \| Record<string, string> | - | 请求头 |
| data | Record<string, any> | - | 上传时附带的额外参数 |
| name | string | 'file' | 文件字段名 |
| accept | string | - | 接受的文件类型 |
| multiple | boolean | false | 是否支持多选 |
| disabled | boolean | false | 是否禁用 |
| limit | number | - | 上传文件数量限制 |
| fileList | FileItem[] | - | 文件列表 |
| drag | boolean | false | 是否启用拖拽上传 |
| autoUpload | boolean | true | 是否自动上传 |
| showFileList | boolean | true | 是否显示文件列表 |
| listType | 'text' \| 'picture' \| 'picture-card' | 'text' | 文件列表类型 |
| httpRequest | (options: UploadRequestOptions) => Promise<any> | - | 自定义上传函数 |
| beforeUpload | (file: File) => boolean \| Promise<boolean> | - | 上传前钩子 |
| onExceed | (files: File[], fileList: FileItem[]) => void | - | 文件超出限制时的钩子 |
| onChange | (file: FileItem, fileList: FileItem[]) => void | - | 文件列表变化时的钩子 |
| onSuccess | (response: any, file: FileItem, fileList: FileItem[]) => void | - | 文件上传成功时的钩子 |
| onError | (error: Error, file: FileItem, fileList: FileItem[]) => void | - | 文件上传失败时的钩子 |
| onProgress | (percent: number, file: FileItem) => void | - | 文件上传进度改变时的钩子 |
| onPreview | (file: FileItem) => void | - | 文件预览时的钩子 |
| onRemove | (file: FileItem) => boolean \| Promise<boolean> | - | 文件移除时的钩子 |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:fileList | 文件列表更新 | fileList: FileItem[] |
| change | 文件状态改变 | file: FileItem, fileList: FileItem[] |
| success | 上传成功 | response: any, file: FileItem, fileList: FileItem[] |
| error | 上传失败 | error: Error, file: FileItem, fileList: FileItem[] |
| progress | 上传进度 | percent: number, file: FileItem |
| preview | 预览文件 | file: FileItem |
| exceed | 文件超出限制 | files: File[], fileList: FileItem[] |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认内容，用于拖拽区域 | - |
| trigger | 触发器内容 | - |
| tip | 提示信息 | - |
| file | 文件列表项 | { file: FileItem } |

### Types

```typescript
// 上传状态
type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

// 文件项
interface FileItem {
  uid: string
  name: string
  size?: number
  type?: string
  status?: UploadStatus
  percent?: number
  url?: string
  response?: any
  error?: Error | null
  raw?: File
}

// 上传请求选项
interface UploadRequestOptions {
  action: string
  method: string
  headers?: Headers | Record<string, string>
  name: string
  file: File
  data?: Record<string, any>
  onProgress: (percent: number) => void
  onSuccess: (response: any) => void
  onError: (error: Error) => void
}
```

## 最佳实践

### 头像上传

```vue
<template>
  <Upload
    action="/api/upload"
    accept="image/*"
    list-type="picture-card"
    :limit="1"
    :before-upload="beforeUpload"
    v-model:file-list="fileList"
  >
    <template #tip>
      <p class="text-xs text-slate-400 mt-2">只能上传 JPG/PNG 格式，不超过 2MB</p>
    </template>
  </Upload>
</template>

<script setup lang="ts">
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  return isImage && isLt2M
}
</script>
```

### 图片批量上传

```vue
<template>
  <Upload
    action="/api/upload"
    accept="image/*"
    list-type="picture-card"
    multiple
    :limit="5"
    v-model:file-list="fileList"
  >
    <template #tip>
      <p class="text-xs text-slate-400 mt-2">最多上传 5 张图片</p>
    </template>
  </Upload>
</template>
```

### 文档上传

```vue
<template>
  <Upload
    action="/api/upload"
    accept=".pdf,.doc,.docx"
    drag
    multiple
    v-model:file-list="fileList"
  >
    <template #tip>
      <p class="text-sm text-slate-400">支持 PDF、Word 文档，可拖拽上传</p>
    </template>
  </Upload>
</template>
```
