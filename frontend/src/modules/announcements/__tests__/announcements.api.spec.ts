import { describe, expect, it } from 'vitest'
import type { Announcement } from '../api/announcements'

describe('announcements api types', () => {
  it('matches backend announcement contract fields', () => {
    const announcement: Announcement = {
      id: 'announcement-1',
      title: '系统维护通知',
      content: '今晚 23:00 进行维护',
      type: 'notice',
      priority: 80,
      isActive: true,
      targetRole: 'all',
      viewCount: 10,
      createdAt: '2026-04-24T10:00:00Z',
      updatedAt: '2026-04-24T10:00:00Z',
      startTime: '2026-04-24T10:00:00Z',
      endTime: '2026-04-25T10:00:00Z',
    }

    expect(announcement.type).toBe('notice')
    expect(announcement.priority).toBe(80)
    expect(announcement.targetRole).toBe('all')
  })
})
