// ✅ 默认使用 wrapper API
export * from './writer'

// 导出手动定义的API（兼容旧代码）
export * from './timeline'

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

// 🔁 需要回滚时，改成：
// export * from './generated/writer'
