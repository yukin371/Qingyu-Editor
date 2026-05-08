import type { Document } from '@/modules/writer/types/document'
import type { Location } from '@/modules/writer/types/location'

export function buildDocumentTree(docs: Document[]): Document[] {
  const map = new Map<string, Document>()
  const roots: Document[] = []

  // 1. 初始化 map，添加 children 属性
  docs.forEach((doc) => {
    map.set(doc.id, { ...doc, children: [] })
  })

  // 2. 组装树
  docs.forEach((doc) => {
    const node = map.get(doc.id)!
    if (doc.parentId && map.has(doc.parentId)) {
      map.get(doc.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  // 3. 排序 (假设后端 order 字段是同级排序)
  const sortFn = (a: Document, b: Document) => a.order - b.order

  const sortRecursive = (nodes: Document[]) => {
    nodes.sort(sortFn)
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortRecursive(node.children)
      }
    })
  }

  sortRecursive(roots)
  return roots
}

/**
 * 将扁平的地点列表转换为树形结构
 */
export function buildLocationTree(locations: Location[]): Location[] {
  const map = new Map<string, Location>()
  const roots: Location[] = []

  // 1. 初始化并建立映射，确保 children 数组存在
  locations.forEach((loc) => {
    map.set(loc.id, { ...loc, children: [] })
  })

  // 2. 构建树
  locations.forEach((loc) => {
    const node = map.get(loc.id)!
    // 如果有父节点且父节点存在于当前列表中
    if (loc.parentId && map.has(loc.parentId)) {
      map.get(loc.parentId)!.children!.push(node)
    } else {
      // 否则视为根节点 (顶级区域)
      roots.push(node)
    }
  })

  return roots
}
