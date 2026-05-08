/**
 * 设计系统 - 颜色Token
 * 定义统一的颜色变量，确保品牌一致性
 */

export const colors = {
  // 主色调 - 青羽蓝
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // 主色
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1'
  },

  // 成功色
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // 主色
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20'
  },

  // 警告色
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // 主色
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100'
  },

  // 错误色
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // 主色
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C'
  },

  // 信息色
  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4', // 主色
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B'
  },

  // 中性色
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },

  // 背景色
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    dark: '#F5F5F5',
    darker: '#EEEEEE'
  },

  // 文字颜色
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E'
  },

  // 边框颜色
  border: {
    light: '#F5F5F5',
    default: '#E0E0E0',
    dark: '#BDBDBD'
  },

  // 特殊色
  special: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    vip: '#FF6B6B'
  }
}

// 导出CSS变量格式（用于SCSS）
export const colorsToCssVars = () => {
  const vars: Record<string, string> = {}

  Object.entries(colors).forEach(([category, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, color]) => {
        vars[`--color-${category}-${shade}`] = color as string
      })
    }
  })

  return vars
}

export default colors

