import { tailwindThemeExtension } from './src/design-system/tokens/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // 支持暗色模式
  theme: {
    extend: tailwindThemeExtension,
  },
  plugins: [
    // 可以在这里添加 Tailwind 插件
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}
