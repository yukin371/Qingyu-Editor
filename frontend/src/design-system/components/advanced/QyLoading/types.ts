/**
 * QyLoading component type definitions
 */

export type QyLoadingSize = 'sm' | 'md' | 'lg'
export type QyLoadingColor = 'cyan' | 'blue' | 'white'

export interface QyLoadingProps {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: QyLoadingSize

  /**
   * Spinner color
   * @default 'cyan'
   */
  color?: QyLoadingColor

  /**
   * Loading text to display below spinner
   */
  text?: string

  /**
   * Display in fullscreen with backdrop
   * @default false
   */
  fullscreen?: boolean
}
