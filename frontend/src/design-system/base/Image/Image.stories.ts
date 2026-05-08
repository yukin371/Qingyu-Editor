import type { Meta, StoryObj } from '@storybook/vue3'
import Image from './Image.vue'

/**
 * Image 组件 Storybook 故事
 *
 * 展示所有尺寸、形状和状态，包含真实使用场景
 */

// Tonal 预览容器
const previewShell = 'rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-6 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)] dark:border-slate-700/50 dark:bg-[radial-gradient(circle_at_top_left,rgba(30,58,95,0.4),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(15,23,42,0.95))]'

const cardRow = 'rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60'

const labelCls = 'text-xs font-medium text-slate-400 dark:text-slate-500'

const meta = {
  title: 'Design System/Base/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '图片 URL',
    },
    alt: {
      control: 'text',
      description: '图片替代文本',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: '图片尺寸',
    },
    shape: {
      control: 'select',
      options: ['rect', 'circle', 'rounded'],
      description: '图片形状',
    },
    fit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
      description: '对象填充方式',
    },
    lazy: {
      control: 'boolean',
      description: '是否懒加载',
    },
    showSkeleton: {
      control: 'boolean',
      description: '是否显示骨架屏',
    },
    fallbackIcon: {
      control: 'text',
      description: '错误状态图标名称',
    },
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Story 1: Default - 带控件的单张图片
// ============================================================
export const Default: Story = {
  args: {
    src: 'https://picsum.photos/seed/img-default/400/400',
    alt: '示例图片',
    size: 'lg',
    shape: 'rect',
    fit: 'cover',
  },
  render: (args) => ({
    components: { Image },
    setup() {
      return { args, previewShell, cardRow }
    },
    template: `
      <div :class="previewShell">
        <div class="flex items-center justify-center p-4">
          <div :class="cardRow" class="inline-flex items-center gap-4 px-6 py-5">
            <Image v-bind="args" />
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Image Preview</span>
              <span class="text-xs text-slate-400 dark:text-slate-500">Use the Controls panel to adjust props</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 2: Sizes - 所有尺寸并排
// ============================================================
export const Sizes: Story = {
  render: () => ({
    components: { Image },
    setup() {
      return { previewShell, cardRow, labelCls }
    },
    template: `
      <div :class="previewShell">
        <div class="flex flex-wrap items-end justify-center gap-6">
          <div v-for="s in ['xs','sm','md','lg','xl']" :key="s" class="flex flex-col items-center gap-2">
            <Image :src="'https://picsum.photos/seed/size-' + s + '/300/300'" :alt="s" :size="s" />
            <span :class="labelCls">{{ s }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 3: Shapes - 三种形状对比
// ============================================================
export const Shapes: Story = {
  render: () => ({
    components: { Image },
    setup() {
      return { previewShell, cardRow, labelCls }
    },
    template: `
      <div :class="previewShell">
        <div :class="cardRow" class="flex items-center justify-center gap-8">
          <div v-for="sh in ['rect','circle','rounded']" :key="sh" class="flex flex-col items-center gap-2">
            <Image src="https://picsum.photos/seed/shape-demo/300/300" :alt="sh" size="xl" :shape="sh" />
            <span :class="labelCls">{{ sh }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 4: States - 加载中、已加载、错误、无 Src
// ============================================================
export const States: Story = {
  render: () => ({
    components: { Image },
    setup() {
      return { previewShell, cardRow, labelCls }
    },
    template: `
      <div :class="previewShell">
        <div class="grid grid-cols-4 gap-4">
          <!-- 加载中（骨架屏）：通过 showSkeleton=true + 一个极慢的 src 模拟 -->
          <div class="flex flex-col items-center gap-2">
            <Image
              src=""
              alt="加载中"
              size="lg"
              :show-skeleton="true"
            />
            <span :class="labelCls">Loading</span>
          </div>
          <!-- 已加载 -->
          <div class="flex flex-col items-center gap-2">
            <Image src="https://picsum.photos/seed/state-loaded/300/300" alt="已加载" size="lg" />
            <span :class="labelCls">Loaded</span>
          </div>
          <!-- 错误状态 -->
          <div class="flex flex-col items-center gap-2">
            <Image src="https://invalid-url-that-does-not-exist.com/image.jpg" alt="错误" size="lg" />
            <span :class="labelCls">Error</span>
          </div>
          <!-- 无 Src -->
          <div class="flex flex-col items-center gap-2">
            <Image alt="无图片" size="lg" />
            <span :class="labelCls">No Src</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 5: FitOptions - cover/contain/fill/scale-down 对比
// ============================================================
export const FitOptions: Story = {
  render: () => ({
    components: { Image },
    setup() {
      return { previewShell, cardRow, labelCls }
    },
    template: `
      <div :class="previewShell">
        <div class="flex flex-wrap justify-center gap-6">
          <div v-for="f in ['cover','contain','fill','scale-down']" :key="f" class="flex flex-col items-center gap-2">
            <Image
              src="https://picsum.photos/seed/fit-demo/300/200"
              :alt="f"
              width="180px"
              height="180px"
              :fit="f"
            />
            <span :class="labelCls">{{ f }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 6: BookCovers - 书籍封面网格（3x2）
// ============================================================
export const BookCovers: Story = {
  render: () => ({
    components: { Image },
    setup() {
      const books = [
        { seed: 'book-1', title: 'The Silent Garden', shape: 'rect' as const },
        { seed: 'book-2', title: 'Ocean Depths', shape: 'rect' as const },
        { seed: 'book-3', title: 'Midnight Echo', shape: 'rounded' as const },
        { seed: 'book-4', title: 'Digital Horizons', shape: 'rect' as const },
        { seed: 'book-5', title: 'Starfall Chronicles', shape: 'rounded' as const },
        { seed: 'book-6', title: 'Whispered Paths', shape: 'rect' as const },
      ]
      return { previewShell, books }
    },
    template: `
      <div :class="previewShell">
        <p class="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">Book Cover Grid</p>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="b in books" :key="b.seed" class="group flex flex-col gap-2">
            <div class="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/30">
              <Image
                :src="'https://picsum.photos/seed/' + b.seed + '/240/360'"
                :alt="b.title"
                width="100%"
                height="240px"
                :shape="b.shape"
                fit="cover"
                class="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-400 truncate px-1">{{ b.title }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 7: AvatarGallery - 头像画廊
// ============================================================
export const AvatarGallery: Story = {
  render: () => ({
    components: { Image },
    setup() {
      const users = [
        { seed: 'Harper', name: 'Harper' },
        { seed: 'Elliott', name: 'Elliott' },
        { seed: 'Sage', name: 'Sage' },
        { seed: 'Rowan', name: 'Rowan' },
        { seed: 'Finley', name: 'Finley' },
        { seed: 'Quinn', name: 'Quinn' },
      ]
      return { previewShell, cardRow, users }
    },
    template: `
      <div :class="previewShell">
        <p class="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">Avatar Gallery</p>
        <div class="flex flex-wrap gap-3">
          <div v-for="u in users" :key="u.seed" :class="cardRow" class="flex items-center gap-3">
            <Image
              :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.seed"
              :alt="u.name"
              size="sm"
              shape="circle"
            />
            <span class="text-sm text-slate-700 dark:text-slate-300">{{ u.name }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ============================================================
// Story 8: ContentCard - 内容卡片（封面图 + 标题 + 描述）
// ============================================================
export const ContentCard: Story = {
  render: () => ({
    components: { Image },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell">
        <p class="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">Content Cards</p>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i"
            class="rounded-2xl border border-slate-200/60 bg-white/70 dark:border-slate-700/30 dark:bg-slate-800/50 overflow-hidden"
          >
            <Image
              :src="'https://picsum.photos/seed/card-' + i + '/400/240'"
              :alt="'Card cover ' + i"
              width="100%"
              height="160px"
              shape="rect"
              fit="cover"
            />
            <div class="p-4 space-y-1.5">
              <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {{ ['Exploring New Worlds', 'Design Systems at Scale', 'The Art of Simplicity'][i - 1] }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ [
                  'A journey through creative landscapes and uncharted territories.',
                  'Building consistent UI across products with shared tokens.',
                  'Minimalist approaches to complex interface challenges.',
                ][i - 1] }}
              </p>
              <div class="flex items-center gap-2 pt-1">
                <Image
                  :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=author-' + i"
                  :alt="'Author ' + i"
                  size="xs"
                  shape="circle"
                />
                <span class="text-[11px] text-slate-400 dark:text-slate-500">
                  {{ ['Harper', 'Sage', 'Rowan'][i - 1] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
