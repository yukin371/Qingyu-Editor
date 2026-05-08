import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * 设计令牌预览
 *
 * 展示设计系统中的颜色、间距、排版等令牌
 */

const meta: Meta = {
  title: 'Design System/Tokens/Overview',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Colors: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h2 class="text-2xl font-bold mb-4">颜色系统</h2>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">主色 (Primary)</h3>
          <div class="flex gap-2">
            <div class="w-12 h-12 rounded bg-primary-50" title="50"></div>
            <div class="w-12 h-12 rounded bg-primary-100" title="100"></div>
            <div class="w-12 h-12 rounded bg-primary-200" title="200"></div>
            <div class="w-12 h-12 rounded bg-primary-300" title="300"></div>
            <div class="w-12 h-12 rounded bg-primary-400" title="400"></div>
            <div class="w-12 h-12 rounded bg-primary-500" title="500"></div>
            <div class="w-12 h-12 rounded bg-primary-600" title="600"></div>
            <div class="w-12 h-12 rounded bg-primary-700" title="700"></div>
            <div class="w-12 h-12 rounded bg-primary-800" title="800"></div>
            <div class="w-12 h-12 rounded bg-primary-900" title="900"></div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">功能色</h3>
          <div class="flex gap-4">
            <div class="space-y-2">
              <div class="text-sm text-slate-600">Success</div>
              <div class="flex gap-2">
                <div class="w-12 h-12 rounded bg-success-light"></div>
                <div class="w-12 h-12 rounded bg-success-DEFAULT"></div>
                <div class="w-12 h-12 rounded bg-success-dark"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-sm text-slate-600">Warning</div>
              <div class="flex gap-2">
                <div class="w-12 h-12 rounded bg-warning-light"></div>
                <div class="w-12 h-12 rounded bg-warning-DEFAULT"></div>
                <div class="w-12 h-12 rounded bg-warning-dark"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-sm text-slate-600">Danger</div>
              <div class="flex gap-2">
                <div class="w-12 h-12 rounded bg-danger-light"></div>
                <div class="w-12 h-12 rounded bg-danger-DEFAULT"></div>
                <div class="w-12 h-12 rounded bg-danger-dark"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-sm text-slate-600">Info</div>
              <div class="flex gap-2">
                <div class="w-12 h-12 rounded bg-info-light"></div>
                <div class="w-12 h-12 rounded bg-info-DEFAULT"></div>
                <div class="w-12 h-12 rounded bg-info-dark"></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">中性色 (Slate)</h3>
          <div class="flex gap-2">
            <div class="w-12 h-12 rounded bg-slate-50" title="50"></div>
            <div class="w-12 h-12 rounded bg-slate-100" title="100"></div>
            <div class="w-12 h-12 rounded bg-slate-200" title="200"></div>
            <div class="w-12 h-12 rounded bg-slate-300" title="300"></div>
            <div class="w-12 h-12 rounded bg-slate-400" title="400"></div>
            <div class="w-12 h-12 rounded bg-slate-500" title="500"></div>
            <div class="w-12 h-12 rounded bg-slate-600" title="600"></div>
            <div class="w-12 h-12 rounded bg-slate-700" title="700"></div>
            <div class="w-12 h-12 rounded bg-slate-800" title="800"></div>
            <div class="w-12 h-12 rounded bg-slate-900" title="900"></div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Spacing: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-6">
        <h2 class="text-2xl font-bold mb-4">间距系统</h2>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-4 h-4 bg-primary-500"></div>
            <div class="text-sm">p-1 (4px)</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-6 h-6 bg-primary-500"></div>
            <div class="text-sm">p-2 (8px)</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-primary-500"></div>
            <div class="text-sm">p-4 (16px)</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-500"></div>
            <div class="text-sm">p-6 (24px)</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-primary-500"></div>
            <div class="text-sm">p-8 (32px)</div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Typography: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-6">
        <h2 class="text-2xl font-bold mb-4">排版系统</h2>
        <div class="space-y-4">
          <div>
            <div class="text-xs">text-xs - 0.75rem / 12px</div>
          </div>
          <div>
            <div class="text-sm">text-sm - 0.875rem / 14px</div>
          </div>
          <div>
            <div class="text-base">text-base - 1rem / 16px</div>
          </div>
          <div>
            <div class="text-lg">text-lg - 1.125rem / 18px</div>
          </div>
          <div>
            <div class="text-xl">text-xl - 1.25rem / 20px</div>
          </div>
          <div>
            <div class="text-2xl">text-2xl - 1.5rem / 24px</div>
          </div>
          <div>
            <div class="text-3xl">text-3xl - 1.875rem / 30px</div>
          </div>
          <div>
            <div class="text-4xl">text-4xl - 2.25rem / 36px</div>
          </div>
        </div>

        <div class="mt-8 space-y-2">
          <div class="font-light">font-light - 300</div>
          <div class="font-normal">font-normal - 400</div>
          <div class="font-medium">font-medium - 500</div>
          <div class="font-semibold">font-semibold - 600</div>
          <div class="font-bold">font-bold - 700</div>
        </div>
      </div>
    `,
  }),
}

export const BorderRadius: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-6">
        <h2 class="text-2xl font-bold mb-4">圆角</h2>
        <div class="flex items-end gap-4">
          <div class="w-16 h-16 bg-primary-500 rounded-none"></div>
          <div class="text-xs">none</div>

          <div class="w-16 h-16 bg-primary-500 rounded-sm"></div>
          <div class="text-xs">sm</div>

          <div class="w-16 h-16 bg-primary-500 rounded-md"></div>
          <div class="text-xs">md</div>

          <div class="w-16 h-16 bg-primary-500 rounded-lg"></div>
          <div class="text-xs">lg</div>

          <div class="w-16 h-16 bg-primary-500 rounded-xl"></div>
          <div class="text-xs">xl</div>

          <div class="w-16 h-16 bg-primary-500 rounded-2xl"></div>
          <div class="text-xs">2xl</div>

          <div class="w-16 h-16 bg-primary-500 rounded-3xl"></div>
          <div class="text-xs">3xl</div>

          <div class="w-16 h-16 bg-primary-500 rounded-full"></div>
          <div class="text-xs">full</div>
        </div>
      </div>
    `,
  }),
}
