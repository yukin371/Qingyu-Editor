/**
 * Apple/Google style responsive Grid System
 * 24-column grid with elegant spacing
 */

export interface RowProps {
  gutter?: number | string
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
}

export interface ColProps {
  span?: number | string       // 1-24 columns
  offset?: number | string     // Left margin
  push?: number | string       // Right move
  pull?: number | string       // Left move
  xs?: number | ColObject      // <576px
  sm?: number | ColObject      // ≥576px
  md?: number | ColObject      // ≥768px
  lg?: number | ColObject      // ≥1024px
  xl?: number | ColObject      // ≥1280px
  xxl?: number | ColObject     // ≥1536px
}

export interface ColObject {
  span?: number
  offset?: number
  push?: number
  pull?: number
}
