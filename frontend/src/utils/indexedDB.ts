/**
 * IndexedDB 本地存储工具
 * 用于在后端未就绪时进行离线开发和测试
 */

const DB_NAME = 'QingyuWriterDB'
const DB_VERSION = 1

// 数据库表名
export const STORES = {
  PROJECTS: 'projects',
  DOCUMENTS: 'documents',
  SETTINGS: 'settings'
}

let db: IDBDatabase | null = null

/**
 * 初始化数据库
 */
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open database'))
    }

    request.onsuccess = () => {
      db = request.result
      console.log('✅ IndexedDB 初始化成功')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 创建项目表
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, {
          keyPath: 'projectId'
        })
        projectStore.createIndex('title', 'title', { unique: false })
        projectStore.createIndex('createdAt', 'createdAt', { unique: false })
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        console.log('✅ 创建 projects 表')
      }

      // 创建文档表
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docStore = db.createObjectStore(STORES.DOCUMENTS, {
          keyPath: 'documentId'
        })
        docStore.createIndex('projectId', 'projectId', { unique: false })
        docStore.createIndex('title', 'title', { unique: false })
        docStore.createIndex('createdAt', 'createdAt', { unique: false })
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        console.log('✅ 创建 documents 表')
      }

      // 创建设置表
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
        console.log('✅ 创建 settings 表')
      }
    }
  })
}

/**
 * 添加数据
 */
export async function addItem<T>(storeName: string, item: T): Promise<T> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(item)

    request.onsuccess = () => {
      resolve(item)
    }

    request.onerror = () => {
      reject(new Error(`Failed to add item to ${storeName}`))
    }
  })
}

/**
 * 更新数据
 */
export async function updateItem<T>(storeName: string, item: T): Promise<T> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(item)

    request.onsuccess = () => {
      resolve(item)
    }

    request.onerror = () => {
      reject(new Error(`Failed to update item in ${storeName}`))
    }
  })
}

/**
 * 获取单条数据
 */
export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onsuccess = () => {
      resolve(request.result || null)
    }

    request.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`))
    }
  })
}

/**
 * 获取所有数据
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      reject(new Error(`Failed to get all items from ${storeName}`))
    }
  })
}

/**
 * 根据索引查询数据
 */
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      reject(new Error(`Failed to get items by index from ${storeName}`))
    }
  })
}

/**
 * 删除数据
 */
export async function deleteItem(storeName: string, key: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Failed to delete item from ${storeName}`))
    }
  })
}

/**
 * 清空表
 */
export async function clearStore(storeName: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Failed to clear store ${storeName}`))
    }
  })
}

/**
 * 统计数据数量
 */
export async function countItems(storeName: string): Promise<number> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.count()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Failed to count items in ${storeName}`))
    }
  })
}

/**
 * 关闭数据库
 */
export function closeDB(): void {
  if (db) {
    db.close()
    db = null
    console.log('📦 IndexedDB 已关闭')
  }
}

/**
 * 删除数据库
 */
export async function deleteDB(): Promise<void> {
  closeDB()
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => {
      console.log('🗑️ IndexedDB 已删除')
      resolve()
    }

    request.onerror = () => {
      reject(new Error('Failed to delete database'))
    }
  })
}

