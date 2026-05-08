/**
 * QyBookCover Component Types
 * Qingyu Book Cover Component - Display a book cover with glassmorphism frame
 */

export interface BookCoverProps {
  /** Cover image URL */
  src: string
  /** Book title */
  title: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Enable shadow effect */
  shadow?: boolean
  /** Click action */
  clickAction?: () => void
}

export interface BookCoverEmits {
  /** Click event */
  click: [event: MouseEvent]
}
