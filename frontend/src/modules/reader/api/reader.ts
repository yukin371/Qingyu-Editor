/**
 * Reader API
 * 统一导出reader模块的API方法
 *
 * 支持两种导入方式：
 * 1. 默认导入（兼容旧代码）：
 *    import readerAPI from '@/modules/reader/api/reader'
 *    await readerAPI.getChapterList(bookId)
 *
 * 2. 命名导入：
 *    import { getChapterList, getSettings } from '@/modules/reader/api/reader'
 *    await getChapterList(bookId)
 */

// 导出所有wrapper中的方法和类型
export * from './wrapper'

// 导入所有方法用于默认导出
import * as wrapper from './wrapper'

// 默认导出，兼容旧的导入方式
export default wrapper
