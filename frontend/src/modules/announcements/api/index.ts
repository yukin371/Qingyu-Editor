/**
 * 公告模块 API 导出
 */

export {
  announcementsAPI,
  getEffectiveAnnouncements,
  getAnnouncementById,
  incrementViewCount,
  getAnnouncements
} from './announcements'

export type { Announcement, AnnouncementType, AnnouncementPriority, GetAnnouncementsParams } from './announcements'
