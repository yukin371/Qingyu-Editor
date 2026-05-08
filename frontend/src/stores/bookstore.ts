/**
 * 书城状态管理（re-export）
 *
 * 统一从模块 store 导出，避免 Pinia 注册两个同名 store 导致状态丢失。
 * 所有使用方应从此文件或 @/modules/bookstore 导入 useBookstoreStore。
 */

export { useBookstoreStore } from '@/modules/bookstore/stores/bookstore.store'
