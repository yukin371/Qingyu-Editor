/**
 * 历史 UI 兼容层
 *
 * 提供历史全局消息 API 的 Qingyu 实现
 */

// 重新导出 Qingyu 服务作为历史别名替代品
export { message as ElMessage, useMessage } from '@/design-system/services'
export { messageBox as ElMessageBox, useMessageBox } from '@/design-system/services'
export { notification as ElNotification, useNotification } from '@/design-system/services'

// 导出组件
// TODO: 逐步添加其他组件的导出
// export { ElDialog } from '@/design-system/feedback/Dialog'
// export { ElForm, ElFormItem } from '@/design-system/form/Form'
