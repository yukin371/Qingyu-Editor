// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Upload from './Upload.vue'
import type { FileItem } from './types'

/**
 * Upload 组件 Storybook 故事
 *
 * 展示各种上传场景和使用方式
 */

const meta = {
  title: 'Design System/Form/Upload',
  component: Upload,
  tags: ['autodocs'],
  argTypes: {
    action: {
      control: 'text',
      description: '上传地址',
    },
    method: {
      control: 'select',
      options: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
      description: '上传请求方法',
    },
    name: {
      control: 'text',
      description: '文件字段名',
    },
    accept: {
      control: 'text',
      description: '接受的文件类型',
    },
    multiple: {
      control: 'boolean',
      description: '是否支持多选',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    drag: {
      control: 'boolean',
      description: '是否启用拖拽上传',
    },
    autoUpload: {
      control: 'boolean',
      description: '是否自动上传',
    },
    limit: {
      control: 'number',
      description: '上传文件数量限制',
    },
    listType: {
      control: 'select',
      options: ['text', 'picture', 'picture-card'],
      description: '文件列表类型',
    },
  },
} satisfies Meta<typeof Upload>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    action: '/api/upload',
    name: 'file',
  },
  render: (args) => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { args, fileList }
    },
    template: `
      <div class="p-8 max-w-2xl">
        <Upload v-bind="args" v-model:file-list="fileList" />
      </div>
    `,
  }),
}

// 点击上传
export const ClickUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">点击上传</h3>
        <Upload
          action="/api/upload"
          v-model:file-list="fileList"
        >
          <template #tip>
            <p class="text-sm text-slate-400">只能上传 jpg/png 文件，且不超过 500kb</p>
          </template>
        </Upload>
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 拖拽上传
export const DragUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">拖拽上传</h3>
        <Upload
          action="/api/upload"
          drag
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 多文件上传
export const MultipleUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">多文件上传</h3>
        <Upload
          action="/api/upload"
          multiple
          v-model:file-list="fileList"
        >
          <template #tip>
            <p class="text-sm text-slate-400">支持多文件上传</p>
          </template>
        </Upload>
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 文件数量限制
export const LimitedUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      const handleExceed = (files: File[], fileList: FileItem[]) => {
        console.log('超出限制', files, fileList)
        alert(`最多只能上传 3 个文件，当前选择了 ${files.length} 个文件`)
      }
      return { fileList, handleExceed }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">文件数量限制（最多 3 个）</h3>
        <Upload
          action="/api/upload"
          multiple
          :limit="3"
          v-model:file-list="fileList"
          @exceed="handleExceed"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 文件类型限制
export const AcceptTypes: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const imageList = ref<FileItem[]>([])
      const pdfList = ref<FileItem[]>([])
      return { imageList, pdfList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-6">
        <h3 class="text-lg font-semibold">文件类型限制</h3>
        
        <div>
          <h4 class="text-sm font-medium mb-2">仅图片</h4>
          <Upload
            action="/api/upload"
            accept="image/*"
            v-model:file-list="imageList"
          />
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">仅 PDF</h4>
          <Upload
            action="/api/upload"
            accept=".pdf"
            v-model:file-list="pdfList"
          />
        </div>
      </div>
    `,
  }),
}

// 图片卡片模式
export const PictureCard: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">图片卡片模式</h3>
        <Upload
          action="/api/upload"
          accept="image/*"
          list-type="picture-card"
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 图片列表模式
export const PictureList: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">图片列表模式</h3>
        <Upload
          action="/api/upload"
          accept="image/*"
          list-type="picture"
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 禁用状态
export const DisabledUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([
        {
          uid: '1',
          name: 'example.jpg',
          size: 102400,
          type: 'image/jpeg',
          status: 'success',
          url: 'https://via.placeholder.com/150',
        },
      ])
      return { fileList }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">禁用状态</h3>
        <Upload
          action="/api/upload"
          disabled
          v-model:file-list="fileList"
        />
      </div>
    `,
  }),
}

// 手动上传
export const ManualUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      const uploadRef = ref()
      
      const handleSubmit = () => {
        fileList.value.forEach((file) => {
          if (file.status === 'ready') {
            // 这里应该触发上传
            console.log('上传文件:', file.name)
          }
        })
      }

      return { fileList, uploadRef, handleSubmit }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">手动上传</h3>
        <Upload
          action="/api/upload"
          :auto-upload="false"
          v-model:file-list="fileList"
        />
        <button
          @click="handleSubmit"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          开始上传
        </button>
      </div>
    `,
  }),
}

// 自定义上传
export const CustomUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      
      const customRequest = (options: any) => {
        const { file, onProgress, onSuccess, onError } = options
        
        // 模拟上传进度
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

      return { fileList, customRequest }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">自定义上传</h3>
        <Upload
          :http-request="customRequest"
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 上传前校验
export const BeforeUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      
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

      return { fileList, beforeUpload }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">上传前校验（JPG/PNG, < 2MB）</h3>
        <Upload
          action="/api/upload"
          accept="image/*"
          :before-upload="beforeUpload"
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 文件预览
export const FilePreview: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([
        {
          uid: '1',
          name: 'example.jpg',
          size: 102400,
          type: 'image/jpeg',
          status: 'success',
          url: 'https://via.placeholder.com/300',
        },
      ])
      
      const handlePreview = (file: FileItem) => {
        console.log('预览文件:', file)
        window.open(file.url, '_blank')
      }

      return { fileList, handlePreview }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">文件预览</h3>
        <Upload
          action="/api/upload"
          accept="image/*"
          list-type="picture-card"
          v-model:file-list="fileList"
          @preview="handlePreview"
        />
      </div>
    `,
  }),
}

// 头像上传
export const AvatarUpload: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([
        {
          uid: '1',
          name: 'avatar.jpg',
          size: 51200,
          type: 'image/jpeg',
          status: 'success',
          url: 'https://via.placeholder.com/150',
        },
      ])
      
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

      return { fileList, beforeUpload }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold">头像上传（最多 1 张）</h3>
        <Upload
          action="/api/upload"
          accept="image/*"
          list-type="picture-card"
          :limit="1"
          :before-upload="beforeUpload"
          v-model:file-list="fileList"
        />
        <div class="mt-4">
          <p class="text-sm font-medium">文件列表:</p>
          <pre class="text-xs bg-slate-100 p-2 rounded mt-2">{{ JSON.stringify(fileList, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 完整表单示例
export const FormExample: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const avatarList = ref<FileItem[]>([])
      const imageList = ref<FileItem[]>([])
      const documentList = ref<FileItem[]>([])
      
      const handleAvatarChange = (file: FileItem, fileList: FileItem[]) => {
        console.log('头像变化:', file, fileList)
      }

      const handleImageSuccess = (response: any, file: FileItem, fileList: FileItem[]) => {
        console.log('图片上传成功:', response, file, fileList)
      }

      const handleDocumentRemove = (file: FileItem) => {
        console.log('删除文档:', file)
        return true
      }

      return {
        avatarList,
        imageList,
        documentList,
        handleAvatarChange,
        handleImageSuccess,
        handleDocumentRemove,
      }
    },
    template: `
      <div class="p-8 max-w-3xl space-y-6">
        <h2 class="text-2xl font-bold">用户信息设置</h2>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">头像</label>
          <Upload
            action="/api/upload"
            accept="image/*"
            list-type="picture-card"
            :limit="1"
            v-model:file-list="avatarList"
            @change="handleAvatarChange"
          >
            <template #tip>
              <p class="text-xs text-slate-400 mt-2">只能上传 JPG/PNG 格式，不超过 2MB</p>
            </template>
          </Upload>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">产品图片</label>
          <Upload
            action="/api/upload"
            accept="image/*"
            list-type="picture-card"
            multiple
            :limit="5"
            v-model:file-list="imageList"
            @success="handleImageSuccess"
          >
            <template #tip>
              <p class="text-xs text-slate-400 mt-2">最多上传 5 张图片</p>
            </template>
          </Upload>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">附件文档</label>
          <Upload
            action="/api/upload"
            accept=".pdf,.doc,.docx"
            drag
            multiple
            v-model:file-list="documentList"
            @remove="handleDocumentRemove"
          >
            <template #tip>
              <p class="text-sm text-slate-400">支持 PDF、Word 文档，可拖拽上传</p>
            </template>
          </Upload>
        </div>

        <div class="pt-4">
          <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            保存设置
          </button>
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Upload },
    setup() {
      const fileList = ref<FileItem[]>([])
      return { fileList }
    },
    template: `
      <div class="bg-slate-900 p-8 max-w-2xl space-y-4">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <Upload
          action="/api/upload"
          drag
          v-model:file-list="fileList"
          class="!border-slate-700"
        />
      </div>
    `,
  }),
}
