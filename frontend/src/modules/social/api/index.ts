// ✅ 使用 wrapper 层（兼容旧API）
export * from './social'
export { default } from './social'

// 注意：./follow, ./message, ./review, ./booklist 的导出
// 已经包含在 ./social -> ./wrapper 中，无需重复导出
// 如果需要使用手动实现的版本，请直接导入对应模块：
// import * as followAPI from '@/modules/social/api/follow'
// import * as messageAPI from '@/modules/social/api/message'
// import * as reviewAPI from '@/modules/social/api/review'
// import * as booklistAPI from '@/modules/social/api/booklist'

// 🔁 需要回滚到原始 generated API 时，改成：
// export * from './generated/social'

// 🔁 需要回滚到手动实现的 API 时，改成：
// export * from './manual'
