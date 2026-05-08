import type { Meta, StoryObj } from '@storybook/vue3'
import ThemePreview from './ThemePreview.vue'

const meta: Meta<typeof ThemePreview> = {
  title: 'Other/ThemePreview',
  component: ThemePreview,
  tags: ['autodocs'],
  argTypes: {
    showApplyButton: {
      control: 'boolean',
      description: '是否显示应用按钮',
    },
    layout: {
      control: 'radio',
      options: ['grid', 'horizontal'],
      description: '布局方式',
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemePreview>

export const Default: Story = {
  args: {
    showApplyButton: true,
    layout: 'grid',
  },
}

export const WithoutApplyButton: Story = {
  args: {
    showApplyButton: false,
    layout: 'grid',
  },
}

export const HorizontalLayout: Story = {
  args: {
    showApplyButton: true,
    layout: 'horizontal',
  },
}
