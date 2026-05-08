import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createSyncManager, createEventBatcher, resolveConflict } from '../entitySync'

describe('createSyncManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('startValidation', () => {
    it('应该定期执行校验', () => {
      const getLocalIds = vi.fn().mockReturnValue(['1', '2', '3'])
      const getRemoteIds = vi.fn().mockResolvedValue(['1', '2', '3'])
      const onValidateFail = vi.fn()

      const manager = createSyncManager({
        autoValidate: true,
        validateInterval: 5000,
        onValidateFail,
      })

      manager.startValidation(getLocalIds, getRemoteIds)

      // 初始状态下 setInterval 尚未触发
      expect(getLocalIds).not.toHaveBeenCalled()

      // 快进时间触发第一次 interval
      vi.advanceTimersByTime(5000)
      expect(getLocalIds).toHaveBeenCalledTimes(1)
      expect(getRemoteIds).toHaveBeenCalledTimes(1)

      // 快进时间触发第二次 interval
      vi.advanceTimersByTime(5000)
      expect(getLocalIds).toHaveBeenCalledTimes(2)

      manager.stopValidation()
    })

    it('检测到不一致时应该调用 onValidateFail', async () => {
      const getLocalIds = vi.fn().mockReturnValue(['1', '2'])
      const getRemoteIds = vi.fn().mockResolvedValue(['1', '2', '3', '4']) // 远程多了两个
      const onValidateFail = vi.fn()

      const manager = createSyncManager({
        autoValidate: true,
        validateInterval: 10000,
        onValidateFail,
      })

      manager.startValidation(getLocalIds, getRemoteIds)

      // 快进时间触发 interval，然后等待 promise resolve
      vi.advanceTimersByTime(10000)
      await Promise.resolve() // 等待 async callback 完成

      expect(onValidateFail).toHaveBeenCalledWith(
        expect.objectContaining({
          missingInStore: ['3', '4'], // 远程有但本地没有
          missingInRemote: [], // 本地有但远程没有
        }),
      )

      manager.stopValidation()
    })
  })

  describe('validate (手动校验)', () => {
    it('应该手动执行校验并返回差异', async () => {
      const getLocalIds = vi.fn().mockReturnValue(['1', '2'])
      const getRemoteIds = vi.fn().mockResolvedValue(['1', '3'])
      const onDiff = vi.fn()

      const manager = createSyncManager()
      await manager.validate(getLocalIds, getRemoteIds, onDiff)

      expect(onDiff).toHaveBeenCalledWith({
        missingInStore: ['3'],
        missingInRemote: ['2'],
        updatedInRemote: [],
      })
    })
  })

  describe('stopValidation', () => {
    it('应该停止定时校验', async () => {
      const getLocalIds = vi.fn().mockReturnValue(['1'])
      const getRemoteIds = vi.fn().mockResolvedValue(['1'])
      const onValidateFail = vi.fn()

      const manager = createSyncManager({
        autoValidate: true,
        validateInterval: 1000,
        onValidateFail,
      })

      manager.startValidation(getLocalIds, getRemoteIds)
      await Promise.resolve()
      vi.advanceTimersByTime(1000)
      await Promise.resolve()

      manager.stopValidation()

      const callCountBeforeStop = getLocalIds.mock.calls.length
      vi.advanceTimersByTime(2000)
      await Promise.resolve()

      // 停止后不应该再调用
      expect(getLocalIds.mock.calls.length).toBe(callCountBeforeStop)
    })
  })
})

describe('resolveConflict', () => {
  it('local-wins 应该返回本地数据', () => {
    const local = { name: '本地', updatedAt: '2024-01-01' }
    const remote = { name: '远程', updatedAt: '2024-01-02' }

    const result = resolveConflict(local, remote, 'local-wins')
    expect(result).toEqual(local)
  })

  it('remote-wins 应该返回远程数据', () => {
    const local = { name: '本地', updatedAt: '2024-01-01' }
    const remote = { name: '远程', updatedAt: '2024-01-02' }

    const result = resolveConflict(local, remote, 'remote-wins')
    expect(result).toEqual(remote)
  })

  it('newest-wins 应该返回更新时间最新的', () => {
    const local = { name: '本地', updatedAt: '2024-01-01' }
    const remote = { name: '远程', updatedAt: '2024-01-03' }

    const result = resolveConflict(local, remote, 'newest-wins')
    expect(result).toEqual(remote)
  })

  it('newest-wins 没有时间戳时应该返回远程', () => {
    const local = { name: '本地' } // 没有 updatedAt
    const remote = { name: '远程', updatedAt: '2024-01-03' }

    const result = resolveConflict(
      local as { name: string; updatedAt?: string },
      remote,
      'newest-wins',
    )
    expect(result).toEqual(remote)
  })

  it('manual 应该抛出错误', () => {
    const local = { name: '本地' }
    const remote = { name: '远程' }

    expect(() =>
      resolveConflict(
        local as { name: string; updatedAt?: string },
        remote as { name: string; updatedAt?: string },
        'manual',
      ),
    ).toThrow('Manual conflict resolution required')
  })
})

describe('createEventBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该批量处理事件', async () => {
    const processedEvents: any[] = []
    const batcher = createEventBatcher(async (events) => {
      processedEvents.push(...events)
    }, 100)

    batcher.add({ id: 1, type: 'a' })
    batcher.add({ id: 2, type: 'b' })
    batcher.add({ id: 3, type: 'c' })

    // 事件尚未处理
    expect(processedEvents).toHaveLength(0)

    // 快进时间
    vi.advanceTimersByTime(100)
    await Promise.resolve()

    // 应该批量处理所有事件
    expect(processedEvents).toHaveLength(3)
    expect(processedEvents.map((e) => e.id)).toEqual([1, 2, 3])
  })

  it('flush 应该立即处理待处理的事件', async () => {
    const processedEvents: any[] = []
    const batcher = createEventBatcher(async (events) => {
      processedEvents.push(...events)
    }, 100)

    batcher.add({ id: 1 })
    batcher.add({ id: 2 })

    await batcher.flush()

    expect(processedEvents).toHaveLength(2)
  })

  it('flush 在没有待处理事件时应该返回 Promise.resolve', async () => {
    const processedEvents: any[] = []
    const batcher = createEventBatcher(async (events) => {
      processedEvents.push(...events)
    }, 100)

    const result = await batcher.flush()
    expect(result).toBeUndefined()
    expect(processedEvents).toHaveLength(0)
  })

  it('处理失败时应该记录错误', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const batcher = createEventBatcher(async () => {
      throw new Error('Batch failed')
    }, 100)

    batcher.add({ id: 1 })

    vi.advanceTimersByTime(100)
    await Promise.resolve()

    expect(consoleSpy).toHaveBeenCalledWith('批量处理事件失败：', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('重复调用 flush 时只处理一次', async () => {
    const processedEvents: any[] = []
    const batcher = createEventBatcher(async (events) => {
      processedEvents.push(...events)
    }, 100)

    batcher.add({ id: 1 })

    await batcher.flush()
    await batcher.flush()
    await batcher.flush()

    expect(processedEvents).toHaveLength(1)
  })
})
