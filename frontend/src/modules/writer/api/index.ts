// ✅ 默认使用 wrapper API
export * from './writer'

// 导出手动定义的API（兼容旧代码）
export * from './timeline'
export * from './publish'

// 导出文档/大纲管理API
export {
  getOutlineTree,
  createOutlineNode,
  updateOutlineNode,
  deleteOutlineNode
} from './document'

// 导出角色管理API
export {
  listCharacters,
  listCharacterRelations,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  characterApi
} from './character'

// 导出地点管理API
export {
  listLocations,
  getLocationTree,
  locationApi
} from './location'

// 导出export.ts中的函数（排除与wrapper冲突的函数）
export {
  createExportTask,
  getExportHistory,
  getExportTaskStatus,
  cancelExportTask,
  deleteExportTask,
  exportChapter,
  exportSelection,
  getAllExportHistory,
  downloadExportFile,
  getExportTemplates,
  saveExportTemplate,
  batchExport
} from './export'

// 导出export相关的类型和常量
export { exportFormatOptions, exportScopeOptions } from '../types/export'

// 🔁 需要回滚时，改成：
// export * from './generated/writer'
