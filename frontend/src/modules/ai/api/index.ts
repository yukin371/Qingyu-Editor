// ✅ 默认使用生成的 API
export * from './generated/ai'

// 导出手动定义的AI函数（兼容旧代码）
export * from './ai'

// 🔁 需要回滚时，改成：
// export * from './manual'
