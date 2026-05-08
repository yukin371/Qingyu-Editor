// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Carousel from './Carousel.vue'

/**
 * Carousel 组件 Storybook 故事
 *
 * 展示所有功能、变体和使用场景
 */

const meta = {
  title: 'Design System/Other/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: 'text',
      description: '轮播容器高度',
    },
    initialIndex: {
      control: 'number',
      description: '初始激活的索引',
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: '指示器的触发方式',
    },
    autoplay: {
      control: 'boolean',
      description: '是否自动切换',
    },
    interval: {
      control: 'number',
      description: '自动切换的时间间隔（毫秒）',
    },
    loop: {
      control: 'boolean',
      description: '是否循环切换',
    },
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '播放方向',
    },
    indicatorPosition: {
      control: 'select',
      options: ['none', 'inside', 'outside'],
      description: '指示器位置',
    },
    arrow: {
      control: 'select',
      options: ['always', 'hover', 'never'],
      description: '箭头显示方式',
    },
    pauseOnHover: {
      control: 'boolean',
      description: '是否在鼠标悬停时暂停自动切换',
    },
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础轮播
export const Default: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <Carousel height="400px">
          <div class="w-full h-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-4xl font-bold">
            Slide 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            Slide 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
            Slide 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 2. AutoPlay - 自动播放
export const AutoPlay: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自动播放（3秒间隔）</h3>
        <Carousel height="400px" :autoplay="true" :interval="3000">
          <div class="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
            自动播放 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold">
            自动播放 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold">
            自动播放 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 3. Vertical - 垂直方向
export const Vertical: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 flex items-center justify-center">
        <h3 class="text-lg font-semibold mb-4">垂直方向轮播</h3>
        <Carousel height="400px" direction="vertical" class="w-[400px]">
          <div class="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-4xl font-bold">
            垂直 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold">
            垂直 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-4xl font-bold">
            垂直 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 4. CardMode - 卡片模式
export const CardMode: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">卡片模式轮播</h3>
        <Carousel height="400px">
          <div class="w-full h-full p-8 flex items-center justify-center bg-white">
            <div class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-8 shadow-lg max-w-md">
              <h4 class="text-2xl font-bold text-secondary-600 mb-4">功能卡片 1</h4>
              <p class="text-slate-600">这是一个卡片样式的轮播项，适合展示产品特性、服务介绍等内容。</p>
            </div>
          </div>
          <div class="w-full h-full p-8 flex items-center justify-center bg-white">
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 shadow-lg max-w-md">
              <h4 class="text-2xl font-bold text-purple-600 mb-4">功能卡片 2</h4>
              <p class="text-slate-600">支持丰富的自定义选项，可以轻松适配不同的设计需求。</p>
            </div>
          </div>
          <div class="w-full h-full p-8 flex items-center justify-center bg-white">
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-8 shadow-lg max-w-md">
              <h4 class="text-2xl font-bold text-pink-600 mb-4">功能卡片 3</h4>
              <p class="text-slate-600">完整的 API 设计，让集成变得简单快捷。</p>
            </div>
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 5. WithoutIndicator - 无指示器
export const WithoutIndicator: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">无指示器轮播</h3>
        <Carousel height="400px" indicator-position="none" arrow="always">
          <div class="w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
            无指示器 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-4xl font-bold">
            无指示器 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 flex items-center justify-center text-white text-4xl font-bold">
            无指示器 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 6. DifferentTriggers - 不同触发方式
export const DifferentTriggers: Story = {
  render: () => ({
    components: { Carousel },
    setup() {
      const slides = [
        { color: 'from-secondary-400 to-secondary-600', title: '点击触发' },
        { color: 'from-purple-400 to-purple-600', title: 'Hover 触发' },
        { color: 'from-pink-400 to-pink-600', title: '自动播放' },
      ]
      return { slides }
    },
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">Click 触发（默认）</h3>
          <Carousel height="300px" trigger="click">
            <div v-for="(slide, i) in slides" :key="i" class="w-full h-full bg-gradient-to-br ${slide.color} flex items-center justify-center text-white text-2xl font-bold">
              {{ slide.title }} - {{ i + 1 }}
            </div>
          </Carousel>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">Hover 触发</h3>
          <Carousel height="300px" trigger="hover">
            <div v-for="(slide, i) in slides" :key="i" class="w-full h-full bg-gradient-to-br ${slide.color} flex items-center justify-center text-white text-2xl font-bold">
              {{ slide.title }} - {{ i + 1 }}
            </div>
          </Carousel>
        </div>
      </div>
    `,
  }),
}

// 7. CustomArrow - 自定义箭头
export const CustomArrow: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义箭头按钮</h3>
        <Carousel height="400px" arrow="always">
          <template #prev>
            <div class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </template>
          <template #next>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </template>
          <div class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-4xl font-bold">
            自定义箭头 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-4xl font-bold">
            自定义箭头 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-4xl font-bold">
            自定义箭头 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 8. Loop - 循环播放
export const Loop: Story = {
  render: () => ({
    components: { Carousel },
    setup() {
      return {
        loop: true,
        toggleLoop() {
          this.loop = !this.loop
        }
      }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">循环播放控制</h3>
          <button
            @click="toggleLoop"
            class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600"
          >
            {{ loop ? '循环播放：开启' : '循环播放：关闭' }}
          </button>
        </div>
        <Carousel height="400px" :loop="loop">
          <div class="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold">
            循环 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-4xl font-bold">
            循环 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
            循环 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 9. LazyLoad - 懒加载
export const LazyLoad: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">懒加载模式</h3>
        <p class="text-slate-600 mb-4">轮播项只有在激活时才会加载内容</p>
        <Carousel height="400px" :autoplay="true" :interval="2000">
          <div class="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white">
            <div>
              <div class="text-2xl font-bold mb-2">懒加载 1</div>
              <div class="text-sm opacity-80">内容仅在激活时加载</div>
            </div>
          </div>
          <div class="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white">
            <div>
              <div class="text-2xl font-bold mb-2">懒加载 2</div>
              <div class="text-sm opacity-80">提升页面加载性能</div>
            </div>
          </div>
          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
            <div>
              <div class="text-2xl font-bold mb-2">懒加载 3</div>
              <div class="text-sm opacity-80">适合图片较多的场景</div>
            </div>
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 10. Thumbs - 缩略图模式
export const Thumbs: Story = {
  render: () => ({
    components: { Carousel },
    setup() {
      const products = [
        {
          name: '商品 1',
          color: 'from-secondary-400 to-secondary-600',
          desc: '这是第一件商品的详细描述'
        },
        {
          name: '商品 2',
          color: 'from-purple-400 to-purple-600',
          desc: '这是第二件商品的详细描述'
        },
        {
          name: '商品 3',
          color: 'from-pink-400 to-pink-600',
          desc: '这是第三件商品的详细描述'
        },
        {
          name: '商品 4',
          color: 'from-indigo-400 to-indigo-600',
          desc: '这是第四件商品的详细描述'
        },
      ]
      return { products }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">产品展示轮播</h3>
        <Carousel height="500px" :autoplay="true" :interval="4000">
          <div v-for="(product, i) in products" :key="i" class="w-full h-full p-12 flex flex-col items-center justify-center bg-gradient-to-br ${product.color} text-white">
            <div class="text-6xl font-bold mb-4">{{ product.name }}</div>
            <div class="text-xl opacity-90 text-center max-w-md">{{ product.desc }}</div>
            <button class="mt-8 px-6 py-3 bg-white text-slate-800 rounded-lg font-semibold hover:bg-opacity-90 transition">
              立即购买
            </button>
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 11. 完整功能演示
export const FullFeatured: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-5xl mx-auto">
        <h3 class="text-xl font-bold mb-6">完整功能演示</h3>
        <Carousel
          height="450px"
          :autoplay="true"
          :interval="3500"
          :loop="true"
          direction="horizontal"
          trigger="click"
          indicator-position="inside"
          arrow="hover"
          :pause-on-hover="true"
        >
          <div class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white">
            <div class="text-center">
              <div class="text-5xl font-bold mb-4">🎨 轮播图组件</div>
              <div class="text-xl opacity-90">支持自动播放、循环、方向控制</div>
            </div>
          </div>
          <div class="w-full h-full bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white">
            <div class="text-center">
              <div class="text-5xl font-bold mb-4">⚡ 性能优化</div>
              <div class="text-xl opacity-90">懒加载、平滑过渡动画</div>
            </div>
          </div>
          <div class="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 flex items-center justify-center text-white">
            <div class="text-center">
              <div class="text-5xl font-bold mb-4">🎯 高度可定制</div>
              <div class="text-xl opacity-90">自定义箭头、指示器、插槽</div>
            </div>
          </div>
          <div class="w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white">
            <div class="text-center">
              <div class="text-5xl font-bold mb-4">💫 完美体验</div>
              <div class="text-xl opacity-90">响应式设计、触摸友好</div>
            </div>
          </div>
        </Carousel>
      </div>
    `,
  }),
}

// 12. 响应式高度
export const ResponsiveHeight: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">小高度轮播（200px）</h3>
          <Carousel height="200px">
            <div class="w-full h-full bg-gradient-to-r from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-bold">
              小高度 1
            </div>
            <div class="w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
              小高度 2
            </div>
          </Carousel>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">大高度轮播（600px）</h3>
          <Carousel height="600px">
            <div class="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
              大高度 1
            </div>
            <div class="w-full h-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold">
              大高度 2
            </div>
          </Carousel>
        </div>
      </div>
    `,
  }),
}

// 13. 外部指示器
export const OutsideIndicators: Story = {
  render: () => ({
    components: { Carousel },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">外部指示器</h3>
        <Carousel height="400px" indicator-position="outside">
          <div class="w-full h-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-4xl font-bold">
            外部指示器 1
          </div>
          <div class="w-full h-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-4xl font-bold">
            外部指示器 2
          </div>
          <div class="w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
            外部指示器 3
          </div>
        </Carousel>
      </div>
    `,
  }),
}
