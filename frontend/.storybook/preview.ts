import type { Preview } from '@storybook/vue3'
import '../src/style.css'

/**
 * Storybook 预览配置
 *
 * 全局配置、装饰器、参数等
 */

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // 为所有故事添加默认背景
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'gray',
          value: '#f8fafc',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
      ],
    },
    // 视口配置
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
    },
  },

  // 全局装饰器
  decorators: [
    (story, context) => {
      // 根据背景色切换暗色模式
      const isDark = context.parameters.backgrounds?.value === '#0f172a'
      document.documentElement.classList.toggle('dark', isDark)

      return {
        components: { story },
        template: `
          <div :class="{ 'dark': ${isDark} }">
            <story />
          </div>
        `,
      }
    },
  ],

  // 全局类型
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
}

export default preview
