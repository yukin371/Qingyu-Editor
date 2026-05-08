import { describe, it, expect, beforeEach } from 'vitest'
import {
  entityEventBus,
  emitCharacterCreated,
  emitRelationCreated,
  emitRelationTimelineChanged,
  type EntityEvent,
} from '../entityEvents'

describe('EntityEventBus', () => {
  beforeEach(() => {
    // 清理所有监听器
    entityEventBus.clear()
  })

  describe('emit & on', () => {
    it('应该触发事件并传递 payload', () => {
      const receivedEvents: EntityEvent[] = []
      const unsubscribe = entityEventBus.on('character:created', (event) => {
        receivedEvents.push(event)
      })

      emitCharacterCreated({ id: '1', name: '测试角色', projectId: 'p1' })

      expect(receivedEvents).toHaveLength(1)
      expect(receivedEvents[0].type).toBe('character:created')
      expect(receivedEvents[0].payload).toEqual({ id: '1', name: '测试角色', projectId: 'p1' })
      expect(receivedEvents[0].timestamp).toBeLessThanOrEqual(Date.now())

      unsubscribe()
    })

    it('应该支持多个监听器', () => {
      const events1: EntityEvent[] = []
      const events2: EntityEvent[] = []

      entityEventBus.on('character:created', (e) => events1.push(e))
      entityEventBus.on('character:created', (e) => events2.push(e))

      emitCharacterCreated({ id: '1', name: '角色A', projectId: 'p1' })

      expect(events1).toHaveLength(1)
      expect(events2).toHaveLength(1)
    })

    it('不同事件类型不应该互相干扰', () => {
      const charEvents: EntityEvent[] = []
      const relEvents: EntityEvent[] = []

      entityEventBus.on('character:created', (e) => charEvents.push(e))
      entityEventBus.on('relation:created', (e) => relEvents.push(e))

      emitCharacterCreated({ id: '1', name: '角色', projectId: 'p1' })
      emitRelationCreated({ id: 'r1', fromId: '1', toId: '2', type: '朋友' })

      expect(charEvents).toHaveLength(1)
      expect(relEvents).toHaveLength(1)
      expect(charEvents[0].payload).toHaveProperty('name')
      expect(relEvents[0].payload).toHaveProperty('type')
    })

    it('监听器错误不应该影响其他监听器', () => {
      const safeEvents: EntityEvent[] = []

      entityEventBus.on('character:created', () => {
        throw new Error('Listener error')
      })
      entityEventBus.on('character:created', (e) => safeEvents.push(e))

      expect(() => {
        emitCharacterCreated({ id: '1', name: '测试', projectId: 'p1' })
      }).not.toThrow()

      expect(safeEvents).toHaveLength(1)
    })
  })

  describe('onTypes', () => {
    it('应该同时订阅多个事件类型', () => {
      const receivedEvents: EntityEvent[] = []
      const unsubscribe = entityEventBus.onTypes(['character:created', 'character:updated'], (e) =>
        receivedEvents.push(e),
      )

      emitCharacterCreated({ id: '1', name: '角色', projectId: 'p1' })
      // character:updated 没有辅助函数，直接用 emit
      entityEventBus.emit('character:updated', { id: '1', name: '更新后的角色' })

      expect(receivedEvents).toHaveLength(2)

      unsubscribe()
    })

    it('取消订阅应该停止接收事件', () => {
      const events: EntityEvent[] = []
      const unsubscribe = entityEventBus.onTypes(['character:created', 'relation:created'], (e) =>
        events.push(e),
      )

      emitCharacterCreated({ id: '1', name: '角色', projectId: 'p1' })
      unsubscribe()
      emitRelationCreated({ id: 'r1', fromId: '1', toId: '2', type: '朋友' })

      expect(events).toHaveLength(1)
    })
  })

  describe('取消订阅', () => {
    it('返回的函数应该能取消订阅', () => {
      const events: EntityEvent[] = []
      const unsubscribe = entityEventBus.on('character:created', (e) => events.push(e))

      emitCharacterCreated({ id: '1', name: '角色1', projectId: 'p1' })
      expect(events).toHaveLength(1)

      unsubscribe()

      emitCharacterCreated({ id: '2', name: '角色2', projectId: 'p1' })
      expect(events).toHaveLength(1) // 没有增长
    })
  })

  describe('emitRelationTimelineChanged', () => {
    it('应该正确触发时序变化事件', () => {
      const events: EntityEvent[] = []
      entityEventBus.on('relation:timeline-changed', (e) => events.push(e))

      emitRelationTimelineChanged({
        relationId: 'r1',
        chapterId: 'ch5',
        oldType: '朋友',
        newType: '敌人',
      })

      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('relation:timeline-changed')
      expect(events[0].payload).toEqual({
        relationId: 'r1',
        chapterId: 'ch5',
        oldType: '朋友',
        newType: '敌人',
      })
    })
  })

  describe('clear', () => {
    it('应该清除所有监听器', () => {
      const events: EntityEvent[] = []
      entityEventBus.on('character:created', (e) => events.push(e))
      entityEventBus.on('relation:created', (e) => events.push(e))

      entityEventBus.clear()

      emitCharacterCreated({ id: '1', name: '角色', projectId: 'p1' })
      emitRelationCreated({ id: 'r1', fromId: '1', toId: '2', type: '朋友' })

      expect(events).toHaveLength(0)
    })
  })
})
