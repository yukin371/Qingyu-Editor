/**
 * Upload 组件类型定义
 */

// 上传状态
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

// 文件项接口
export interface FileItem {
  /**
   * 文件唯一标识
   */
  uid: string

  /**
   * 文件名
   */
  name: string

  /**
   * 文件大小（字节）
   */
  size?: number

  /**
   * 文件类型
   */
  type?: string

  /**
   * 文件状态
   */
  status?: UploadStatus

  /**
   * 上传百分比
   */
  percent?: number

  /**
   * 文件 URL
   */
  url?: string

  /**
   * 响应数据
   */
  response?: any

  /**
   * 错误信息
   */
  error?: Error | null

  /**
   * 原始文件对象
   */
  raw?: File
}

// 上传方法
export type UploadMethod = 'POST' | 'PUT' | 'PATCH' | 'GET' | 'DELETE'

// Upload Props 接口
export interface UploadProps {
  /**
   * 上传地址
   */
  action?: string

  /**
   * 上传请求方法
   * @default 'POST'
   */
  method?: UploadMethod

  /**
   * 请求头
   */
  headers?: Headers | Record<string, string>

  /**
   * 上传时附带的额外参数
   */
  data?: Record<string, any>

  /**
   * 文件字段名
   * @default 'file'
   */
  name?: string

  /**
   * 接受的文件类型（如 'image/*', '.pdf'）
   */
  accept?: string

  /**
   * 是否支持多选
   * @default false
   */
  multiple?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 上传文件数量限制
   */
  limit?: number

  /**
   * 文件列表
   */
  fileList?: FileItem[]

  /**
   * 是否启用拖拽上传
   * @default false
   */
  drag?: boolean

  /**
   * 是否自动上传
   * @default true
   */
  autoUpload?: boolean

  /**
   * 是否显示文件列表
   * @default true
   */
  showFileList?: boolean

  /**
   * 文件列表中的文本
   */
  listType?: 'text' | 'picture' | 'picture-card'

  /**
   * 自定义上传函数
   */
  httpRequest?: (options: UploadRequestOptions) => Promise<any>

  /**
   * 上传前钩子
   */
  beforeUpload?: (file: File) => boolean | Promise<boolean>

  /**
   * 文件超出数量限制时的钩子
   */
  onExceed?: (files: File[], fileList: FileItem[]) => void

  /**
   * 文件列表变化时的钩子
   */
  onChange?: (file: FileItem, fileList: FileItem[]) => void

  /**
   * 文件上传成功时的钩子
   */
  onSuccess?: (response: any, file: FileItem, fileList: FileItem[]) => void

  /**
   * 文件上传失败时的钩子
   */
  onError?: (error: Error, file: FileItem, fileList: FileItem[]) => void

  /**
   * 文件上传进度改变时的钩子
   */
  onProgress?: (percent: number, file: FileItem) => void

  /**
   * 文件预览时的钩子
   */
  onPreview?: (file: FileItem) => void

  /**
   * 文件移除时的钩子
   */
  onRemove?: (file: FileItem) => boolean | Promise<boolean>

  /**
   * 自定义类名
   */
  class?: any
}

// 上传请求选项
export interface UploadRequestOptions {
  /**
   * 上传地址
   */
  action: string

  /**
   * 请求方法
   */
  method: string

  /**
   * 请求头
   */
  headers?: Headers | Record<string, string>

  /**
   * 文件字段名
   */
  name: string

  /**
   * 文件
   */
  file: File

  /**
   * 额外参数
   */
  data?: Record<string, any>

  /**
   * 上传进度回调
   */
  onProgress: (percent: number) => void

  /**
   * 上传成功回调
   */
  onSuccess: (response: any) => void

  /**
   * 上传失败回调
   */
  onError: (error: Error) => void
}

// Upload 组件默认属性
export const uploadDefaults: Partial<UploadProps> = {
  method: 'POST',
  name: 'file',
  multiple: false,
  disabled: false,
  drag: false,
  autoUpload: true,
  showFileList: true,
  listType: 'text',
}

// Upload Events 接口
export interface UploadEmits {
  'update:fileList': [fileList: FileItem[]]
  'change': [file: FileItem, fileList: FileItem[]]
  'success': [response: any, file: FileItem, fileList: FileItem[]]
  'error': [error: Error, file: FileItem, fileList: FileItem[]]
  'progress': [percent: number, file: FileItem]
  'preview': [file: FileItem]
  'exceed': [files: File[], fileList: FileItem[]]
}

// Upload Slots 接口
export interface UploadSlots {
  /**
   * 默认插槽 - 触发器内容
   */
  default?: () => any

  /**
   * 触发器插槽
   */
  trigger?: () => any

  /**
   * 提示信息插槽
   */
  tip?: () => any

  /**
   * 文件列表项插槽
   */
  file?: (props: { file: FileItem }) => any
}
