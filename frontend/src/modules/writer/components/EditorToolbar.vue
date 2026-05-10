<template>
  <div
    class="flex min-h-[42px] flex-wrap items-center gap-1 rounded-[10px] border border-slate-200 bg-white px-2 py-1 shadow-sm"
  >
    <div v-if="!isSimpleMode" class="flex items-center gap-1">
      <button
        v-for="button in historyButtons"
        :key="button.command"
        type="button"
        :title="button.title"
        :data-testid="button.testId"
        :disabled="button.disabled"
        :class="toolButtonClass(button.disabled)"
        @click="emitCommand(button.command)"
      >
        <QyIcon :name="button.icon!" :size="16" />
      </button>
    </div>

    <span v-if="!isSimpleMode" class="h-5 w-px shrink-0 rounded-full bg-slate-200" />

    <div class="flex items-center gap-1">
      <QyDropdown
        :items="headingItems"
        placement="bottom-start"
        trigger="click"
        @select="emitCommand"
      >
        <button
          type="button"
          title="标题设置"
          data-testid="toolbar-heading-trigger"
          :class="toolButtonClass(false, true)"
        >
          <span class="font-semibold tracking-wide">H</span>
          <QyIcon name="ArrowDown" :size="14" class="text-slate-400" />
        </button>
      </QyDropdown>
    </div>

    <span class="h-5 w-px shrink-0 rounded-full bg-slate-200" />

    <div class="flex items-center gap-1">
      <button
        v-for="button in textButtons"
        :key="button.command"
        type="button"
        :title="button.title"
        :data-testid="button.testId"
        :class="toolButtonClass()"
        @click="emitCommand(button.command)"
      >
        <QyIcon v-if="button.icon" :name="button.icon" :size="16" />
        <span
          v-else
          class="select-none text-[13px] font-semibold leading-none text-current"
          :class="button.textClass"
        >
          {{ button.text }}
        </span>
      </button>
    </div>

    <span class="h-5 w-px shrink-0 rounded-full bg-slate-200" />

    <div class="flex items-center gap-1">
      <button
        v-for="button in blockButtons"
        :key="button.command"
        type="button"
        :title="button.title"
        :data-testid="button.testId"
        :class="toolButtonClass()"
        @click="emitCommand(button.command)"
      >
        <QyIcon v-if="button.icon" :name="button.icon" :size="16" />
        <span
          v-else
          class="select-none text-[13px] font-semibold leading-none text-current"
          :class="button.textClass"
        >
          {{ button.text }}
        </span>
      </button>
    </div>

    <span v-if="!isSimpleMode" class="h-5 w-px shrink-0 rounded-full bg-slate-200" />

    <div v-if="!isSimpleMode" class="flex items-center gap-1">
      <button
        v-for="button in insertButtons"
        :key="button.command"
        type="button"
        :title="button.title"
        :data-testid="button.testId"
        :class="toolButtonClass()"
        @click="emitCommand(button.command)"
      >
        <QyIcon v-if="button.icon" :name="button.icon" :size="16" />
        <span
          v-else
          class="select-none text-[13px] font-semibold leading-none text-current"
          :class="button.textClass"
        >
          {{ button.text }}
        </span>
      </button>
    </div>

    <div class="flex items-center gap-1 md:ml-auto">
      <span class="h-5 w-px shrink-0 rounded-full bg-slate-200" />
      <button
        type="button"
        :title="showPreview ? '隐藏预览' : '双栏预览'"
        data-testid="toolbar-preview"
        :class="toolButtonClass(false, false, showPreview)"
        @click="emitTogglePreview"
      >
        <QyIcon name="View" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyDropdown, QyIcon, type DropdownItem } from '@/design-system/components'

interface Props {
  isSimpleMode?: boolean
  showPreview?: boolean
  canUndo?: boolean
  canRedo?: boolean
}

interface ToolbarButtonConfig {
  command: string
  title: string
  testId: string
  icon?: string
  text?: string
  textClass?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSimpleMode: false,
  showPreview: true,
  canUndo: false,
  canRedo: false,
})

const emit = defineEmits<{
  (e: 'command', type: string): void
  (e: 'togglePreview'): void
}>()

const headingItems: DropdownItem[] = [
  { key: 'heading1', label: 'H1 一级标题' },
  { key: 'heading2', label: 'H2 二级标题' },
  { key: 'heading3', label: 'H3 三级标题' },
]

const historyButtons = computed<ToolbarButtonConfig[]>(() => [
  {
    command: 'undo',
    title: '撤销 (Ctrl+Z)',
    testId: 'toolbar-undo',
    icon: 'ArrowLeft',
    disabled: !props.canUndo,
  },
  {
    command: 'redo',
    title: '重做 (Ctrl+Y)',
    testId: 'toolbar-redo',
    icon: 'ArrowRight',
    disabled: !props.canRedo,
  },
])

const textButtons = computed<ToolbarButtonConfig[]>(() => {
  const buttons: ToolbarButtonConfig[] = [
    {
      command: 'bold',
      title: '粗体 (Ctrl+B)',
      testId: 'toolbar-bold',
      text: 'B',
      textClass: 'font-serif text-[14px] font-bold',
    },
    {
      command: 'italic',
      title: '斜体 (Ctrl+I)',
      testId: 'toolbar-italic',
      text: 'I',
      textClass: 'font-serif text-[14px] italic',
    },
  ]

  if (!props.isSimpleMode) {
    buttons.push({
      command: 'strikethrough',
      title: '删除线',
      testId: 'toolbar-strikethrough',
      text: 'S',
      textClass: 'text-[13px] line-through',
    })
  }

  return buttons
})

const blockButtons = computed<ToolbarButtonConfig[]>(() => {
  const buttons: ToolbarButtonConfig[] = [
    {
      command: 'quote',
      title: '引用',
      testId: 'toolbar-quote',
      icon: 'ChatLineSquare',
    },
    {
      command: 'list',
      title: '无序列表',
      testId: 'toolbar-list',
      icon: 'Memo',
    },
  ]

  if (!props.isSimpleMode) {
    buttons.push({
      command: 'orderedList',
      title: '有序列表',
      testId: 'toolbar-ordered-list',
      text: '1.',
      textClass: 'text-[12px]',
    })
  }

  return buttons
})

const insertButtons = computed<ToolbarButtonConfig[]>(() => [
  {
    command: 'code',
    title: '代码块',
    testId: 'toolbar-code',
    icon: 'Files',
  },
  {
    command: 'link',
    title: '链接 (Ctrl+K)',
    testId: 'toolbar-link',
    icon: 'Share',
  },
  {
    command: 'image',
    title: '图片',
    testId: 'toolbar-image',
    icon: 'Picture',
  },
  {
    command: 'line',
    title: '分隔线',
    testId: 'toolbar-line',
    icon: 'Minus',
  },
])

const toolButtonClass = (disabled = false, wide = false, active = false) => [
  'inline-flex h-8 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-all duration-150',
  wide ? 'min-w-[44px] gap-1 px-2.5' : 'w-8',
  active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent',
  disabled
    ? 'cursor-not-allowed opacity-45'
    : 'hover:-translate-y-px hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
]

const emitCommand = (type: string) => {
  emit('command', type)
}

const emitTogglePreview = () => {
  emit('togglePreview')
}
</script>
