/**
 * QyBookCard Component Types
 * Qingyu Book Card Component - Display book information in a beautiful card format
 */

export interface BookCardProps {
  /** Book title */
  title: string
  /** Author name */
  author: string
  /** Cover image URL */
  cover?: string
  /** Short description */
  description?: string
  /** Rating (0-5) */
  rating?: number
  /** Tags (e.g., "玄幻", "修真") */
  tags?: string[]
  /** Reading progress (0-100) */
  readProgress?: number
  /** Reading status */
  status?: 'reading' | 'completed' | 'planned'
  /** Click action */
  clickAction?: () => void
}

export interface BookCardEmits {
  /** Click event */
  click: [event: MouseEvent]
}
