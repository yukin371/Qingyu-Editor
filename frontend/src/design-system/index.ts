/**
 * Qingyu Design System
 * 统一导出设计令牌和组件
 */

// 设计令牌（主题、颜色、间距等）
export * from './tokens'

// === 新的Tailwind v4组件库 (Qy前缀，包含向后兼容别名) ===
export * from './components'

// === 向后兼容：导出原有组件 (排除与Qy组件冲突的) ===
// 注意：所有组件都直接从 .vue 文件导入，避免 index.ts 的默认导出问题

// Base Components - 只导出Qy组件库中没有的
export { default as Empty } from './base/Empty/Empty.vue'      // QyEmpty已存在但可能不同
export { default as Divider } from './base/Divider/Divider.vue'   // Qy组件库中没有Divider
export { default as Skeleton } from './base/Skeleton/Skeleton.vue'  // Qy组件库中没有Skeleton

// Form Components - 只导出Qy组件库中没有的（直接从.vue文件导入）
export { default as DatePicker } from './form/DatePicker/DatePicker.vue'   // Qy组件库中没有DatePicker
export { default as Upload } from './form/Upload/Upload.vue'       // Qy组件库中没有Upload

// Layout Components - 使用显式导出避免冲突
export { Container, Row, Col } from './layout'
export type { ContainerProps, ContainerSize, ColProps, RowProps } from './layout'

// Navigation Components - 只导出Qy组件库中没有的（直接从.vue文件导入）
export { default as Breadcrumb } from './navigation/Breadcrumb/Breadcrumb.vue'  // Qy组件库中没有Breadcrumb
export { default as Steps } from './navigation/Steps/Steps.vue'     // Qy组件库中没有Steps
export { default as Step } from './navigation/Steps/Step.vue'      // Step 子组件

// Feedback Components - 只导出Qy组件库中没有的（直接从.vue文件导入以避免index.ts问题）
export { default as Alert } from './feedback/Alert/Alert.vue'        // Qy组件库中没有Alert
export { default as Dialog } from './feedback/Dialog/Dialog.vue'      // Qy组件库中没有Dialog/Modal
export { default as Message, useMessage } from './feedback/Message/useMessage'  // Message 有特殊的 useMessage 导出
export type { MessageProps, MessageType, MessageInstance, MessageOptions, MessageHandler } from './feedback/Message/types'
export { default as Notification } from './feedback/Notification/Notification.vue' // Qy组件库中没有Notification
export { default as Popover } from './feedback/Popover/Popover.vue'     // Qy组件库中没有Popover
export { default as Progress } from './feedback/Progress/Progress.vue'    // Qy组件库中没有Progress
export { default as Spinner } from './feedback/Spinner/Spinner.vue'     // Qy组件库中没有Spinner
export { default as Tooltip } from './feedback/Tooltip/Tooltip.vue'     // Qy组件库中没有Tooltip

// Data Display Components - 只导出Qy组件库中没有的（直接从.vue文件导入）
export { default as Collapse } from './data/Collapse/Collapse.vue'   // Qy组件库中没有Collapse
export { default as Tabs } from './data/Tabs/Tabs.vue'       // Qy组件库中没有Tabs
export { default as TabPane } from './data/Tabs/TabPane.vue'   // TabPane 子组件
export { default as Table } from './data/Table/Table.vue'      // Qy组件库中没有Table
export { default as Tree } from './data/Tree/Tree.vue'       // Qy组件库中没有Tree
export { default as Pagination } from './data/Pagination/Pagination.vue' // Qy组件库中没有Pagination
export { default as List } from './data/List/List.vue'       // Qy组件库中没有List

// Other Components（直接从.vue文件导入）
export { default as Drawer } from './other/Drawer/Drawer.vue'
export * from './other/ConfigProvider'
export { default as ThemeSwitcher } from './other/ThemeSwitcher.vue'

// Services - 保持通配符导出，因为服务不涉及命名空间冲突
export * from './services'
