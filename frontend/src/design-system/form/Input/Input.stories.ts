import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Input from './Input.vue'

/**
 * Input 组件 Storybook 故事
 *
 * 展示所有类型、尺寸、状态和功能
 */

const meta = {
  title: 'Design System/Form/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      description: '输入类型',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '输入框尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readonly: {
      control: 'boolean',
      description: '是否只读',
    },
    error: {
      control: 'boolean',
      description: '是否为错误状态',
    },
    clearable: {
      control: 'boolean',
      description: '是否可清空',
    },
    showCount: {
      control: 'boolean',
      description: '是否显示字数统计',
    },
    placeholder: {
      control: 'text',
      description: '占位符文本',
    },
    maxlength: {
      control: 'number',
      description: '最大输入长度',
    },
    prefix: {
      control: 'text',
      description: '前缀图标名称',
    },
    suffix: {
      control: 'text',
      description: '后缀图标名称',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    type: 'text',
    size: 'md',
    placeholder: '请输入内容',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="p-8 max-w-md">
        <Input v-bind="args" v-model="value" />
        <p class="mt-2 text-sm text-slate-500">当前值: {{ value }}</p>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const small = ref('')
      const medium = ref('')
      const large = ref('')
      return { small, medium, large }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input size="sm" v-model="small" placeholder="小尺寸输入框" />
        <Input size="md" v-model="medium" placeholder="中尺寸输入框（默认）" />
        <Input size="lg" v-model="large" placeholder="大尺寸输入框" />
      </div>
    `,
  }),
}

// 所有输入类型
export const AllTypes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const text = ref('')
      const password = ref('')
      const email = ref('')
      const number = ref('')
      const tel = ref('')
      const url = ref('')
      return { text, password, email, number, tel, url }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input type="text" v-model="text" placeholder="文本输入" />
        <Input type="password" v-model="password" placeholder="密码输入" />
        <Input type="email" v-model="email" placeholder="邮箱输入" />
        <Input type="number" v-model="number" placeholder="数字输入" />
        <Input type="tel" v-model="tel" placeholder="电话输入" />
        <Input type="url" v-model="url" placeholder="网址输入" />
      </div>
    `,
  }),
}

// 带前缀图标
export const WithPrefix: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const search = ref('')
      const email = ref('')
      const user = ref('')
      return { search, email, user }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="search" prefix="magnifying-glass" placeholder="搜索..." />
        <Input v-model="email" prefix="envelope" placeholder="邮箱地址" />
        <Input v-model="user" prefix="user" placeholder="用户名" />
      </div>
    `,
  }),
}

// 带后缀图标
export const WithSuffix: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const website = ref('')
      const currency = ref('')
      return { website, currency }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="website" suffix="globe-alt" placeholder="网站地址" />
        <Input type="number" v-model="currency" suffix="currency-dollar" placeholder="金额" />
      </div>
    `,
  }),
}

// 使用插槽
export const WithSlots: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const url = ref('')
      const search = ref('')
      return { url, search }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="url" placeholder="https://example.com">
          <template #prepend>https://</template>
          <template #append>.com</template>
        </Input>
        <Input v-model="search" placeholder="搜索内容">
          <template #prepend>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </template>
        </Input>
      </div>
    `,
  }),
}

// 错误状态
export const ErrorState: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const invalid = ref('invalid-email')
      return { invalid }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="invalid" error placeholder="错误状态输入框" />
        <p class="text-sm text-red-500">请输入有效的邮箱地址</p>
      </div>
    `,
  }),
}

// 禁用状态
export const DisabledState: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const disabled = ref('禁用的内容')
      return { disabled }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="disabled" disabled placeholder="禁用的输入框" />
      </div>
    `,
  }),
}

// 只读状态
export const ReadonlyState: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const readonly = ref('只读内容')
      return { readonly }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="readonly" readonly placeholder="只读输入框" />
      </div>
    `,
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const clearable = ref('可以清空的内容')
      return { clearable }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="clearable" clearable placeholder="可清空的输入框" />
        <p class="text-sm text-slate-500">输入内容后会出现清空按钮</p>
      </div>
    `,
  }),
}

// 字数统计
export const WithCount: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const counted = ref('')
      return { counted }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="counted" :maxlength="50" show-count placeholder="限制50个字符" />
        <Input v-model="counted" :maxlength="100" show-count placeholder="限制100个字符" size="lg" />
      </div>
    `,
  }),
}

// 密码输入框
export const PasswordInput: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const password = ref('')
      return { password }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input type="password" v-model="password" placeholder="请输入密码" />
        <Input type="password" v-model="password" placeholder="带前缀图标的密码框" prefix="key" />
      </div>
    `,
  }),
}

// 复杂组合示例
export const ComplexExample: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const username = ref('')
      const email = ref('')
      const password = ref('')
      const website = ref('')
      const phone = ref('')
      const bio = ref('')
      return { username, email, password, website, phone, bio }
    },
    template: `
      <div class="p-8 max-w-2xl space-y-6">
        <h2 class="text-2xl font-bold">用户注册</h2>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">用户名</label>
          <Input v-model="username" prefix="user" placeholder="请输入用户名" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">邮箱</label>
          <Input v-model="email" type="email" prefix="envelope" placeholder="example@email.com" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">密码</label>
          <Input v-model="password" type="password" prefix="lock-closed" placeholder="请输入密码" :maxlength="20" show-count />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">电话</label>
          <Input v-model="phone" type="tel" prefix="phone" placeholder="请输入电话号码" />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">个人网站</label>
          <Input v-model="website" type="url" prefix="globe-alt" placeholder="https://example.com" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">个人简介</label>
          <Input v-model="bio" placeholder="一句话介绍自己" :maxlength="100" show-count />
        </div>

        <div class="pt-4">
          <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            提交注册
          </button>
        </div>
      </div>
    `,
  }),
}

// 搜索框示例
export const SearchExample: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const search = ref('')
      return { search }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <Input v-model="search" prefix="magnifying-glass" placeholder="搜索..." clearable size="lg" />
        <p class="text-sm text-slate-500">正在搜索: {{ search || '全部' }}</p>
      </div>
    `,
  }),
}

// 表单验证示例
export const FormValidation: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const email = ref('')
      const password = ref('')
      const showError = ref(false)
      
      const validateEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      }

      return { email, password, showError, validateEmail }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">邮箱</label>
          <Input 
            v-model="email" 
            type="email" 
            prefix="envelope" 
            placeholder="请输入邮箱"
            :error="email !== '' && !validateEmail(email)"
            clearable
          />
          <p v-if="email !== '' && !validateEmail(email)" class="text-sm text-red-500">
            请输入有效的邮箱地址
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">密码</label>
          <Input 
            v-model="password" 
            type="password" 
            prefix="lock-closed" 
            placeholder="请输入密码"
            :error="password !== '' && password.length < 6"
            :maxlength="20"
            show-count
          />
          <p v-if="password !== '' && password.length < 6" class="text-sm text-red-500">
            密码长度至少为6位
          </p>
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const text = ref('')
      const email = ref('')
      const password = ref('')
      return { text, email, password }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <Input v-model="text" placeholder="文本输入" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
        <Input v-model="email" type="email" prefix="envelope" placeholder="邮箱输入" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
        <Input v-model="password" type="password" prefix="lock-closed" placeholder="密码输入" clearable class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
      </div>
    `,
  }),
}

// 禁用和只读组合
export const DisabledAndReadonly: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const disabled = ref('禁用的值')
      const readonly = ref('只读的值')
      return { disabled, readonly }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">禁用和只读状态</h3>
        <Input v-model="disabled" disabled placeholder="禁用输入框" />
        <Input v-model="readonly" readonly placeholder="只读输入框" />
        <Input v-model="disabled" disabled prefix="user" placeholder="禁用带图标" />
        <Input v-model="readonly" readonly suffix="check" placeholder="只读带图标" />
      </div>
    `,
  }),
}
