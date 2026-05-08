/**
 * Textarea 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Textarea from './Textarea.vue'

const previewShell =
  'rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.32),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-6 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)]'

const meta = {
  title: 'Base/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'v-model 绑定值',
    },
    rows: {
      control: 'number',
      description: '显示行数',
    },
    rowsMin: {
      control: 'number',
      description: '最小行数',
    },
    rowsMax: {
      control: 'number',
      description: '最大行数',
    },
    maxlength: {
      control: 'number',
      description: '最大长度',
    },
    showCount: {
      control: 'boolean',
      description: '显示字数统计',
    },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      description: '调整大小方式',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    readonly: {
      control: 'boolean',
      description: '只读状态',
    },
    error: {
      control: 'boolean',
      description: '错误状态',
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: '状态',
    },
    placeholder: {
      control: 'text',
      description: '占位提示',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
  },
  args: {
    rows: 3,
    rowsMin: 1,
    showCount: false,
    resize: 'vertical',
    disabled: false,
    readonly: false,
    error: false,
    state: 'default',
    size: 'md',
    placeholder: 'Write something thoughtful...',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[420px]">
        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">Editorial note</p>
            <p class="mt-1 text-sm text-slate-500">A restrained input surface that feels native in settings, review and compose flows.</p>
          </div>
          <Textarea v-bind="args" />
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <div class="space-y-5">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Small</p>
            <Textarea size="sm" :rows="2" placeholder="Compact reply for comments and short notes" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Medium</p>
            <Textarea size="md" :rows="3" placeholder="Balanced surface for form descriptions and moderation notes" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Large</p>
            <Textarea size="lg" :rows="4" placeholder="Roomier canvas for longer summaries, briefs and internal drafts" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[560px]">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Default</p>
            <Textarea state="default" placeholder="Everything looks good here" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Success</p>
            <Textarea state="success" model-value="Published summary is ready." />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Warning</p>
            <Textarea state="warning" model-value="This note is close to the recommended limit." />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Error</p>
            <Textarea state="error" model-value="The moderation note is missing required context." />
          </div>
        </div>
      </div>
    `,
  }),
}

export const WithCharacterCount: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return {
        previewShell,
        abstract:
          'A compact and readable synopsis for the card that surfaces the core premise without losing tone.',
        releaseNote: 'Shipped timeline alignment fixes and a softer avatar palette.',
      }
    },
    template: `
      <div :class="previewShell" class="min-w-[560px]">
        <div class="grid gap-4">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Synopsis</p>
            <Textarea
              v-model="abstract"
              :maxlength="140"
              :show-count="true"
              :rows="3"
              placeholder="Summarize the story in one calm sentence."
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Release note</p>
            <Textarea
              v-model="releaseNote"
              state="success"
              :maxlength="72"
              :show-count="true"
              :rows="2"
              placeholder="Capture the visible user-facing improvement."
            />
          </div>
        </div>
      </div>
    `,
  }),
}

export const DisabledAndReadonly: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Disabled</p>
            <Textarea disabled model-value="Publishing is temporarily unavailable during maintenance." />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700">Readonly</p>
            <Textarea readonly model-value="The generated summary is locked after approval." />
          </div>
        </div>
      </div>
    `,
  }),
}

export const AdaptiveHeight: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return {
        previewShell,
        journal:
          'The team noticed that several base components still felt like reference examples, so this pass focuses on calmer surfaces, tighter spacing and patterns that can scale into product views.',
      }
    },
    template: `
      <div :class="previewShell" class="min-w-[560px]">
        <div class="space-y-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">Adaptive height</p>
            <p class="mt-1 text-sm text-slate-500">Rows now respect a floor and ceiling, which makes longer note fields feel steadier in layouts.</p>
          </div>
          <Textarea
            v-model="journal"
            :rows="3"
            :rows-min="2"
            :rows-max="7"
            resize="vertical"
            :maxlength="320"
            :show-count="true"
            placeholder="Write a longer note and watch the field settle into a controlled height."
          />
        </div>
      </div>
    `,
  }),
}

export const WorkspaceComposer: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return {
        brief:
          'Refine the empty state surface so it feels like a considered part of the reading workspace rather than a neutral placeholder.',
        review:
          'Timeline alignment is fixed; next we should tighten divider rhythm and quiet down badge tones inside toolbars.',
      }
    },
    template: `
      <div class="w-[640px] rounded-[32px] border border-slate-200/70 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.28)]">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-900">Workspace composer</p>
            <p class="mt-1 text-sm text-slate-500">Two real input contexts sharing the same quiet surface language.</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Draft</span>
        </div>

        <div class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Design brief</label>
            <Textarea
              v-model="brief"
              size="lg"
              :rows="4"
              :maxlength="240"
              :show-count="true"
              placeholder="Describe the intent behind the UI pass."
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Review note</label>
            <Textarea
              v-model="review"
              :rows="3"
              :rows-min="2"
              :rows-max="5"
              state="success"
              placeholder="Summarize what changed and what still needs refinement."
            />
          </div>
        </div>
      </div>
    `,
  }),
}
