/**
 * 设计系统Token统一导出
 */

import { colorsToCssVars } from './colors'
import { spacingToCssVars } from './spacing'
import { typographyToCssVars } from './typography'

export { colors, colorsToCssVars } from './colors'
export { spacing, getSpacing, spacingToCssVars } from './spacing'
export { typography, typographyToCssVars } from './typography'

// 导出所有Token的CSS变量
export const allTokensToCssVars = () => {
  return {
    ...colorsToCssVars(),
    ...spacingToCssVars(),
    ...typographyToCssVars()
  }
}
