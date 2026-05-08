export interface QyGhostButtonProps {
  active?: boolean
  disabled?: boolean
  class?: string
}

export interface QyGhostButtonEmits {
  (e: 'click', event: MouseEvent): void
}
