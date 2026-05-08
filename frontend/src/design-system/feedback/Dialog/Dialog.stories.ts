import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Dialog from './Dialog.vue'
import { QyButton, QyInput } from '@/design-system/components'

const meta = {
  title: 'Qingyu Components/Feedback/QyDialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    title: 'Promote foundation tokens',
    size: 'md',
    modal: true,
    showClose: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { Dialog, QyButton },
    setup() {
      const visible = ref(false)
      return { args, visible }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <QyButton @click="visible = true">Open dialog</QyButton>
        <Dialog v-bind="args" v-model:visible="visible">
          <p class="text-slate-600">
            The dialog now uses the same surface, line and elevation tokens as the rest of the Tailwind v4 foundation set.
          </p>
        </Dialog>
      </div>
    `,
  }),
}

export const ConfirmationFlow: Story = {
  render: () => ({
    components: { Dialog, QyButton },
    setup() {
      const visible = ref(false)
      return { visible }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <QyButton variant="outline" @click="visible = true">Launch confirmation</QyButton>
        <Dialog title="Replace Element Plus?" v-model:visible="visible" size="md">
          <div class="space-y-3">
            <p class="text-slate-600">The foundation set is ready to take over button, input, card, select and dialog flows.</p>
            <div class="rounded-[1.25rem] bg-slate-50/90 p-4 text-sm text-slate-500">
              Blast radius is high, so visuals stay API-compatible while stories and DemoHub prove the new direction.
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <QyButton variant="ghost" size="sm" @click="visible = false">Cancel</QyButton>
              <QyButton size="sm" @click="visible = false">Confirm</QyButton>
            </div>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

export const FormSurface: Story = {
  render: () => ({
    components: { Dialog, QyButton, QyInput },
    setup() {
      const visible = ref(false)
      const form = ref({
        name: '',
        owner: '',
      })
      return { visible, form }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <QyButton variant="secondary" @click="visible = true">Open form dialog</QyButton>
        <Dialog title="Foundation intake" v-model:visible="visible" size="lg">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-600">Project name</label>
              <QyInput v-model="form.name" placeholder="Tailwind v4 migration" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-600">Owner</label>
              <QyInput v-model="form.owner" placeholder="Design system team" />
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <QyButton variant="ghost" size="sm" @click="visible = false">Back</QyButton>
              <QyButton size="sm" @click="visible = false">Ship</QyButton>
            </div>
          </template>
        </Dialog>
      </div>
    `,
  }),
}
