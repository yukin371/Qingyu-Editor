// @ts-nocheck - Storybook file with flexible type assertions
import type { Meta, StoryObj } from '@storybook/vue3'
import Form from './Form.vue'
import FormItem from './FormItem.vue'
import Input from '../Input/Input.vue'
import Switch from '../Switch/Switch.vue'
import Checkbox from '../../base/Checkbox/Checkbox.vue'
import RadioGroup from '../Radio/RadioGroup.vue'
import Radio from '../Radio/Radio.vue'
import Select from '../Select/Select.vue'

/**
 * Form 和 FormItem 组件 Storybook 故事
 *
 * 展示表单组件的各种使用场景和配置
 */

import { ref, reactive } from 'vue'

const meta: Meta<typeof Form> = {
  title: 'Form/Form',
  component: Form,
  tags: ['autodocs'],
  argTypes: {
    labelWidth: {
      control: 'text',
      description: '标签宽度',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right', 'top'],
      description: '标签位置',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表单尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用整个表单',
    },
    showColon: {
      control: 'boolean',
      description: '是否显示标签冒号',
    },
    requireAsterisk: {
      control: 'boolean',
      description: '是否显示必填星号',
    },
  },
}

export default meta
type Story = StoryObj<typeof Form>

/**
 * 基础表单示例
 */
export const Default: Story = {
  render: (args) => ({
    components: { Form, FormItem, Input },
    setup() {
      const form = reactive({
        name: '',
        email: '',
        phone: '',
      })

      const rules = {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
        ],
      }

      const handleSubmit = async () => {
        console.log('表单数据:', form)
      }

      return { args, form, rules, handleSubmit }
    },
    template: `
      <div style="max-width: 600px; padding: 20px;">
        <Form v-bind="args" :model="form" :rules="rules" ref="formRef">
          <FormItem label="姓名" prop="name">
            <Input v-model="form.name" placeholder="请输入姓名" clearable />
          </FormItem>

          <FormItem label="邮箱" prop="email">
            <Input v-model="form.email" type="email" placeholder="请输入邮箱" clearable />
          </FormItem>

          <FormItem label="手机号" prop="phone">
            <Input v-model="form.phone" type="tel" placeholder="请输入手机号" clearable />
          </FormItem>
        </Form>

        <button @click="handleSubmit" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          提交
        </button>
      </div>
    `,
  }),
  args: {
    labelWidth: '100px',
    labelPosition: 'right',
    size: 'md',
  },
}

/**
 * 不同标签位置
 */
export const LabelPositions: Story = {
  render: () => ({
    components: { Form, FormItem, Input },
    setup() {
      const formLeft = reactive({ username: '' })
      const formRight = reactive({ username: '' })
      const formTop = reactive({ username: '' })

      return { formLeft, formRight, formTop }
    },
    template: `
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 40px;">
        <div>
          <h3>左对齐 (Left)</h3>
          <Form :model="formLeft" label-position="left" label-width="100px">
            <FormItem label="用户名" prop="username">
              <Input v-model="formLeft.username" placeholder="请输入用户名" />
            </FormItem>
          </Form>
        </div>

        <div>
          <h3>右对齐 (Right)</h3>
          <Form :model="formRight" label-position="right" label-width="100px">
            <FormItem label="用户名" prop="username">
              <Input v-model="formRight.username" placeholder="请输入用户名" />
            </FormItem>
          </Form>
        </div>

        <div>
          <h3>顶部对齐 (Top)</h3>
          <Form :model="formTop" label-position="top">
            <FormItem label="用户名" prop="username">
              <Input v-model="formTop.username" placeholder="请输入用户名" />
            </FormItem>
          </Form>
        </div>
      </div>
    `,
  }),
}

/**
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => ({
    components: { Form, FormItem, Input },
    setup() {
      const formSmall = reactive({ username: '', email: '' })
      const formMedium = reactive({ username: '', email: '' })
      const formLarge = reactive({ username: '', email: '' })

      return { formSmall, formMedium, formLarge }
    },
    template: `
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 40px;">
        <div>
          <h3>小尺寸 (Small)</h3>
          <Form :model="formSmall" size="sm">
            <FormItem label="用户名" prop="username" label-width="80px">
              <Input v-model="formSmall.username" size="sm" placeholder="小尺寸输入框" />
            </FormItem>
            <FormItem label="邮箱" prop="email" label-width="80px">
              <Input v-model="formSmall.email" type="email" size="sm" placeholder="小尺寸邮箱" />
            </FormItem>
          </Form>
        </div>

        <div>
          <h3>中等尺寸 (Medium)</h3>
          <Form :model="formMedium" size="md">
            <FormItem label="用户名" prop="username" label-width="80px">
              <Input v-model="formMedium.username" size="md" placeholder="中等尺寸输入框" />
            </FormItem>
            <FormItem label="邮箱" prop="email" label-width="80px">
              <Input v-model="formMedium.email" type="email" size="md" placeholder="中等尺寸邮箱" />
            </FormItem>
          </Form>
        </div>

        <div>
          <h3>大尺寸 (Large)</h3>
          <Form :model="formLarge" size="lg">
            <FormItem label="用户名" prop="username" label-width="80px">
              <Input v-model="formLarge.username" size="lg" placeholder="大尺寸输入框" />
            </FormItem>
            <FormItem label="邮箱" prop="email" label-width="80px">
              <Input v-model="formLarge.email" type="email" size="lg" placeholder="大尺寸邮箱" />
            </FormItem>
          </Form>
        </div>
      </div>
    `,
  }),
}

/**
 * 验证规则示例
 */
export const ValidationRules: Story = {
  render: () => ({
    components: { Form, FormItem, Input },
    setup() {
      const form = reactive({
        username: '',
        password: '',
        confirm: '',
        age: '',
      })

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
        ],
        confirm: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (rule, value) => value === form.password,
            message: '两次输入密码不一致',
            trigger: 'blur',
          },
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字', trigger: 'blur' },
          { min: 18, max: 100, message: '年龄必须在 18 到 100 之间', trigger: 'blur' },
        ],
      }

      return { form, rules }
    },
    template: `
      <div style="max-width: 600px; padding: 20px;">
        <Form :model="form" :rules="rules" ref="formRef">
          <FormItem label="用户名" prop="username" label-width="100px">
            <Input v-model="form.username" placeholder="3-15个字符，字母数字下划线" clearable />
          </FormItem>

          <FormItem label="密码" prop="password" label-width="100px">
            <Input v-model="form.password" type="password" placeholder="6-20个字符" clearable />
          </FormItem>

          <FormItem label="确认密码" prop="confirm" label-width="100px">
            <Input v-model="form.confirm" type="password" placeholder="再次输入密码" clearable />
          </FormItem>

          <FormItem label="年龄" prop="age" label-width="100px">
            <Input v-model.number="form.age" type="number" placeholder="18-100" clearable />
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 注册表单
 */
export const RegistrationForm: Story = {
  render: () => ({
    components: { Form, FormItem, Input, Checkbox, Switch },
    setup() {
      const form = reactive({
        username: '',
        email: '',
        password: '',
        phone: '',
        agree: false,
        newsletter: true,
      })

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
        ],
      }

      const loading = ref(false)

      const handleSubmit = async () => {
        console.log('表单数据:', form)
      }

      return { form, rules, loading, handleSubmit }
    },
    template: `
      <div style="max-width: 500px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="margin: 0 0 24px; font-size: 1.5rem; font-weight: 600; color: #111827;">
          创建账户
        </h2>

        <Form :model="form" :rules="rules" label-position="top">
          <FormItem label="用户名" prop="username">
            <Input v-model="form.username" placeholder="请输入用户名" clearable />
          </FormItem>

          <FormItem label="邮箱" prop="email">
            <Input v-model="form.email" type="email" placeholder="example@email.com" clearable />
          </FormItem>

          <FormItem label="密码" prop="password">
            <Input v-model="form.password" type="password" placeholder="至少6个字符" clearable />
          </FormItem>

          <FormItem label="手机号" prop="phone">
            <Input v-model="form.phone" type="tel" placeholder="请输入手机号" clearable />
          </FormItem>

          <FormItem>
            <Checkbox v-model="form.agree">
              我已阅读并同意服务条款和隐私政策
            </Checkbox>
          </FormItem>

          <FormItem>
            <Switch v-model="form.newsletter">
              订阅新闻邮件
            </Switch>
          </FormItem>

          <FormItem>
            <button 
              @click="handleSubmit"
              :disabled="loading"
              style="width: 100%; padding: 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer;"
            >
              {{ loading ? '提交中...' : '注册' }}
            </button>
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 行内表单
 */
export const InlineForm: Story = {
  render: () => ({
    components: { Form, FormItem, Input, Select },
    setup() {
      const searchForm = reactive({
        keyword: '',
        category: '',
      })

      const categories = [
        { label: '全部', value: '' },
        { label: '技术', value: 'tech' },
        { label: '设计', value: 'design' },
        { label: '产品', value: 'product' },
      ]

      const handleSearch = () => {
        console.log('搜索:', searchForm)
      }

      return { searchForm, categories, handleSearch }
    },
    template: `
      <div style="padding: 20px;">
        <Form :model="searchForm" label-width="auto">
          <FormItem label="关键词" prop="keyword" inline>
            <Input v-model="searchForm.keyword" placeholder="请输入关键词" style="width: 200px;" clearable />
          </FormItem>

          <FormItem label="分类" prop="category" inline>
            <Select v-model="searchForm.category" :options="categories" placeholder="选择分类" style="width: 150px;" />
          </FormItem>

          <FormItem inline>
            <button @click="handleSearch" style="padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
              搜索
            </button>
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 动态表单
 */
export const DynamicForm: Story = {
  render: () => ({
    components: { Form, FormItem, Input },
    setup() {
      const form = reactive({
        users: [] as Array<{ name: string; email: string }>,
      })

      const addUser = () => {
        form.users.push({ name: '', email: '' })
      }

      const removeUser = (index: number) => {
        form.users.splice(index, 1)
      }

      // 添加初始用户
      addUser()

      return { form, addUser, removeUser }
    },
    template: `
      <div style="max-width: 600px; padding: 20px;">
        <h3>动态添加用户</h3>

        <Form :model="form" label-position="top">
          <div v-for="(user, index) in form.users" :key="index" style="margin-bottom: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h4 style="margin: 0 0 12px;">用户 {{ index + 1 }}</h4>

            <FormItem :label="'用户名-' + index" :prop="'users.' + index + '.name'">
              <Input v-model="user.name" placeholder="请输入用户名" clearable />
            </FormItem>

            <FormItem :label="'邮箱-' + index" :prop="'users.' + index + '.email'">
              <Input v-model="user.email" type="email" placeholder="请输入邮箱" clearable />
            </FormItem>

            <button 
              v-if="form.users.length > 1"
              @click="removeUser(index)"
              style="padding: 0.375rem 0.75rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
            >
              删除
            </button>
          </div>

          <FormItem>
            <button 
              @click="addUser"
              style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
            >
              添加用户
            </button>
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 自定义标签
 */
export const CustomLabels: Story = {
  render: () => ({
    components: { Form, FormItem, Input },
    setup() {
      const form = reactive({
        username: '',
        email: '',
      })

      return { form }
    },
    template: `
      <div style="max-width: 500px; padding: 20px;">
        <Form :model="form" label-width="100px">
          <FormItem prop="username">
            <template #label>
              <span style="color: #4f46e5; font-weight: 600;">用户名</span>
            </template>
            <Input v-model="form.username" placeholder="请输入用户名" clearable />
          </FormItem>

          <FormItem prop="email">
            <template #label>
              <span style="color: #4f46e5; font-weight: 600;">
                <svg style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                邮箱
              </span>
            </template>
            <Input v-model="form.email" type="email" placeholder="请输入邮箱" clearable />
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 禁用状态
 */
export const DisabledState: Story = {
  render: () => ({
    components: { Form, FormItem, Input, Switch },
    setup() {
      const form = reactive({
        username: 'disabled_user',
        email: 'disabled@example.com',
        enabled: true,
      })

      return { form }
    },
    template: `
      <div style="max-width: 500px; padding: 20px;">
        <h3>整个表单禁用</h3>
        <Form :model="form" disabled label-width="100px">
          <FormItem label="用户名" prop="username">
            <Input v-model="form.username" placeholder="请输入用户名" />
          </FormItem>

          <FormItem label="邮箱" prop="email">
            <Input v-model="form.email" type="email" placeholder="请输入邮箱" />
          </FormItem>

          <FormItem label="启用状态">
            <Switch v-model="form.enabled" />
          </FormItem>
        </Form>
      </div>
    `,
  }),
}

/**
 * 复杂示例：用户信息编辑
 */
export const ComplexExample: Story = {
  render: () => ({
    components: { Form, FormItem, Input, Select, RadioGroup, Radio, Switch },
    setup() {
      const userForm = reactive({
        name: '',
        email: '',
        phone: '',
        gender: '',
        role: '',
        bio: '',
        notifications: true,
      })

      const rules = {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' },
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' },
        ],
      }

      const genderOptions = [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ]

      const roleOptions = [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '访客', value: 'guest' },
      ]

      return { userForm, rules, genderOptions, roleOptions }
    },
    template: `
      <div style="max-width: 600px; padding: 24px; background: #f9fafb; border-radius: 8px;">
        <h2 style="margin: 0 0 24px; font-size: 1.5rem; font-weight: 600;">
          编辑用户信息
        </h2>

        <Form :model="userForm" :rules="rules" label-position="top">
          <FormItem label="姓名" prop="name">
            <Input v-model="userForm.name" placeholder="请输入姓名" clearable />
          </FormItem>

          <FormItem label="邮箱" prop="email">
            <Input v-model="userForm.email" type="email" placeholder="请输入邮箱" clearable />
          </FormItem>

          <FormItem label="手机号" prop="phone">
            <Input v-model="userForm.phone" type="tel" placeholder="请输入手机号" clearable />
          </FormItem>

          <FormItem label="性别" prop="gender">
            <RadioGroup v-model="userForm.gender">
              <Radio v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </Radio>
            </RadioGroup>
          </FormItem>

          <FormItem label="角色" prop="role">
            <Select v-model="userForm.role" :options="roleOptions" placeholder="请选择角色" />
          </FormItem>

          <FormItem label="个人简介" prop="bio">
            <textarea
              v-model="userForm.bio"
              placeholder="请输入个人简介"
              style="width: 100%; min-height: 100px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem;"
            ></textarea>
          </FormItem>

          <FormItem>
            <Switch v-model="userForm.notifications">
              接收通知邮件
            </Switch>
          </FormItem>
        </Form>
      </div>
    `,
  }),
}
