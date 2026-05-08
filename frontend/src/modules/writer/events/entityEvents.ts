// 事件类型
export type EntityEventType =
  | 'character:created'
  | 'character:updated'
  | 'character:deleted'
  | 'relation:created'
  | 'relation:updated'
  | 'relation:deleted'
  | 'relation:timeline-changed'
  | 'graph:view-changed'

export interface EntityEvent<T = unknown> {
  type: EntityEventType
  payload: T
  timestamp: number
}

// 事件总线
class EntityEventBusClass {
  private listeners = new Map<EntityEventType, Set<(event: EntityEvent) => void>>()

  // 发送事件
  emit<T>(type: EntityEventType, payload: T) {
    const event: EntityEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    }

    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event as EntityEvent)
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error)
        }
      })
    }
  }

  // 订阅事件
  on<T>(type: EntityEventType, callback: (event: EntityEvent<T>) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback as (event: EntityEvent) => void)

    // 返回取消订阅函数
    return () => {
      this.listeners.get(type)?.delete(callback as (event: EntityEvent) => void)
    }
  }

  // 订阅多个事件
  onTypes(types: EntityEventType[], callback: (event: EntityEvent) => void): () => void {
    const unsubscribers = types.map(type => this.on(type, callback))
    return () => unsubscribers.forEach(unsub => unsub())
  }

  // 清除所有监听器（用于测试或清理）
  clear() {
    this.listeners.clear()
  }
}

// 单例
export const entityEventBus = new EntityEventBusClass()

// 辅助函数：创建角色后触发
export function emitCharacterCreated(character: { id: string; name: string; projectId: string }) {
  entityEventBus.emit('character:created', character)
}

// 辅助函数：创建关系后触发
export function emitRelationCreated(relation: { id: string; fromId: string; toId: string; type: string }) {
  entityEventBus.emit('relation:created', relation)
}

// 辅助函数：关系时序变化后触发
export function emitRelationTimelineChanged(payload: {
  relationId: string
  chapterId: string
  oldType: string
  newType: string
}) {
  entityEventBus.emit('relation:timeline-changed', payload)
}
