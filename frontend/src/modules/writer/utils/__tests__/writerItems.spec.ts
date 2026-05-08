import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteWriterItem, loadWriterItems, upsertWriterItem } from '../writerItems'

describe('writerItems', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    })
    localStorage.clear()
  })

  it('应持久化新增和编辑的物品卡片', () => {
    const projectId = 'project-1'
    let items = upsertWriterItem(projectId, {
      name: '铜钥匙',
      alias: ['旧钥匙'],
      summary: '开启旧仓库的钥匙',
      category: '关键物件',
    })

    expect(items).toHaveLength(1)
    expect(loadWriterItems(projectId)[0]).toMatchObject({
      name: '铜钥匙',
      category: '关键物件',
    })

    items = upsertWriterItem(projectId, {
      id: items[0].id,
      name: '铜钥匙',
      alias: ['仓库钥匙'],
      summary: '已确认属于第一卷主线',
      category: '线索道具',
    })

    expect(items[0]).toMatchObject({
      alias: ['仓库钥匙'],
      category: '线索道具',
    })
  })

  it('应删除指定物品卡片', () => {
    const projectId = 'project-1'
    const items = upsertWriterItem(projectId, { name: '铜钥匙' })
    const nextItems = deleteWriterItem(projectId, items[0].id)
    expect(nextItems).toEqual([])
    expect(loadWriterItems(projectId)).toEqual([])
  })
})
