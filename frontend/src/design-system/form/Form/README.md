# Form 和 FormItem 组件

功能完整的表单容器组件，提供表单数据管理和验证功能，是表单组件系列的核心组件。

## 功能特性

### Form 组件
- **表单状态管理**: 统一管理整个表单的数据状态
- **表单验证**: 支持完整的表单验证规则
- **标签布局**: 支持左对齐、右对齐、顶部对齐三种标签位置
- **统一尺寸**: 支持 sm、md、lg 三种表单尺寸
- **全局禁用**: 支持一键禁用整个表单
- **嵌套验证**: 支持嵌套对象和数组验证
- **验证规则**: 支持内置规则和自定义验证器
- **异步验证**: 支持异步验证器

### FormItem 组件
- **标签显示**: 支持自定义标签和标签宽度
- **错误提示**: 自动显示验证错误信息
- **必填标识**: 自动显示必填星号
- **验证状态**: 实时显示验证状态
- **插槽支持**: 支持标签、内容、错误信息自定义

## 安装使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input } from '@/design-system/form'

const form = ref({
  username: '',
  email: '',
  password: '',
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
}
</script>

<template>
  <Form :model="form" :rules="rules">
    <FormItem label="用户名" prop="username">
      <Input v-model="form.username" placeholder="请输入用户名" />
    </FormItem>

    <FormItem label="邮箱" prop="email">
      <Input v-model="form.email" type="email" placeholder="请输入邮箱" />
    </FormItem>

    <FormItem label="密码" prop="password">
      <Input v-model="form.password" type="password" placeholder="请输入密码" />
    </FormItem>
  </Form>
</template>
```

## API

### Form Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `model` | `FormModel` | `undefined` | 表单数据对象 |
| `rules` | `FormRules` | `undefined` | 验证规则 |
| `labelWidth` | `string` | `'auto'` | 标签宽度，如 '100px' |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'right'` | 标签位置 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 统一尺寸 |
| `disabled` | `boolean` | `false` | 全局禁用 |
| `validateOnRuleChange` | `boolean` | `true` | 规则改变时验证 |
| `showColon` | `boolean` | `true` | 是否显示标签冒号 |
| `requireAsterisk` | `boolean` | `true` | 是否显示必填星号 |
| `class` | `any` | `undefined` | 自定义类名 |

### Form Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `validate` | `()` | 表单验证成功时触发 |
| `validate-failed` | `(errors: Record<string, string[]>)` | 表单验证失败时触发 |
| `change` | `(model: FormModel)` | 表单值改变时触发 |

### Form Methods

通过 ref 可以访问以下方法：

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `validate()` | - | `Promise<boolean>` | 验证整个表单 |
| `validateField()` | `props: string \| string[]` | `Promise<boolean>` | 验证指定字段 |
| `resetFields()` | - | `void` | 重置表单 |
| `clearValidation()` | `props?: string \| string[]` | `void` | 清除验证 |
| `getFormData()` | - | `FormModel` | 获取表单数据 |
| `setFormData()` | `data: Partial<FormModel>` | `void` | 设置表单数据 |

### FormItem Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `prop` | `string` | `undefined` | 表单域模型字段 |
| `label` | `string` | `undefined` | 标签文本 |
| `labelWidth` | `string` | `undefined` | 标签宽度 |
| `required` | `boolean` | `false` | 是否必填 |
| `rules` | `FormRule[]` | `undefined` | 验证规则 |
| `error` | `string` | `undefined` | 错误信息 |
| `showMessage` | `boolean` | `true` | 是否显示错误信息 |
| `inline` | `boolean` | `false` | 是否显示行内 |
| `class` | `any` | `undefined` | 自定义类名 |

### FormItem Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `change` | `(value: any)` | 表单项值改变时触发 |
| `validate` | `()` | 表单项验证通过时触发 |
| `validate-failed` | `(error: string)` | 表单项验证失败时触发 |

### FormItem Slots

| 插槽 | 描述 |
|------|------|
| `label` | 自定义标签内容 |
| `default` | 表单控件 |
| `error` | 自定义错误信息 |

### FormItem Methods

通过 ref 可以访问以下方法：

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `validate()` | - | `Promise<boolean>` | 验证表单项 |
| `clearValidation()` | - | `void` | 清除验证 |
| `resetField()` | - | `void` | 重置表单项 |
| `setError()` | `error: string` | `void` | 设置错误信息 |
| `getValue()` | - | `any` | 获取当前值 |
| `setValue()` | `value: any` | `void` | 设置值 |

## 验证规则

### 基础规则

```typescript
const rules = {
  // 必填验证
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],

  // 长度验证
  password: [
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],

  // 精确长度
  code: [
    { len: 6, message: '请输入 6 位验证码', trigger: 'blur' }
  ],

  // 正则验证
  email: [
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],

  // 多个触发时机
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] }
  ],
}
```

### 自定义验证器

```typescript
const rules = {
  // 异步验证器
  username: [
    {
      validator: async (rule, value) => {
        if (!value) {
          return '请输入用户名'
        }
        // 模拟异步请求
        const exists = await checkUsernameExists(value)
        if (exists) {
          return '用户名已存在'
        }
        return true
      },
      trigger: 'blur'
    }
  ],

  // 同步验证器
  password: [
    {
      validator: (rule, value) => {
        if (!value) {
          return '请输入密码'
        }
        if (!/[A-Z]/.test(value)) {
          return '密码必须包含大写字母'
        }
        if (!/[0-9]/.test(value)) {
          return '密码必须包含数字'
        }
        return true
      },
      trigger: 'blur'
    }
  ],

  // 确认密码
  confirmPassword: [
    {
      validator: (rule, value) => {
        if (value !== form.password) {
          return '两次输入密码不一致'
        }
        return true
      },
      trigger: 'blur'
    }
  ],
}
```

### 验证触发时机

- `blur`: 失去焦点时触发
- `change`: 值改变时触发
- `submit`: 提交表单时触发
- 可以传递数组来指定多个触发时机

## 使用场景

### 登录表单

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input } from '@/design-system/form'

const loginForm = ref({
  username: '',
  password: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
}

const handleLogin = async () => {
  console.log('登录:', loginForm.value)
}
</script>

<template>
  <Form :model="loginForm" :rules="rules" label-position="top">
    <FormItem label="用户名" prop="username">
      <Input v-model="loginForm.username" placeholder="请输入用户名" />
    </FormItem>

    <FormItem label="密码" prop="password">
      <Input v-model="loginForm.password" type="password" placeholder="请输入密码" />
    </FormItem>

    <button @click="handleLogin">登录</button>
  </Form>
</template>
```

### 注册表单

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input, Checkbox } from '@/design-system/form'

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
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
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value) => value === registerForm.value.password,
      message: '两次输入密码不一致',
      trigger: 'blur'
    }
  ],
}

const handleRegister = async () => {
  console.log('注册:', registerForm.value)
}
</script>

<template>
  <Form :model="registerForm" :rules="rules" label-position="top">
    <FormItem label="用户名" prop="username">
      <Input v-model="registerForm.username" placeholder="请输入用户名" />
    </FormItem>

    <FormItem label="邮箱" prop="email">
      <Input v-model="registerForm.email" type="email" placeholder="请输入邮箱" />
    </FormItem>

    <FormItem label="密码" prop="password">
      <Input v-model="registerForm.password" type="password" placeholder="请输入密码" />
    </FormItem>

    <FormItem label="确认密码" prop="confirmPassword">
      <Input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
    </FormItem>

    <FormItem>
      <Checkbox v-model="registerForm.agree">
        我已阅读并同意服务条款
      </Checkbox>
    </FormItem>

    <button @click="handleRegister">注册</button>
  </Form>
</template>
```

### 动态表单

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input } from '@/design-system/form'

const dynamicForm = ref({
  users: [] as Array<{ name: string; email: string }>
})

const addUser = () => {
  dynamicForm.value.users.push({ name: '', email: '' })
}

const removeUser = (index: number) => {
  dynamicForm.value.users.splice(index, 1)
}

// 添加初始用户
addUser()
</script>

<template>
  <Form :model="dynamicForm" label-position="top">
    <div v-for="(user, index) in dynamicForm.users" :key="index">
      <h4>用户 {{ index + 1 }}</h4>

      <FormItem :prop="`users.${index}.name`" :label="`用户名-${index}`">
        <Input v-model="user.name" placeholder="请输入用户名" />
      </FormItem>

      <FormItem :prop="`users.${index}.email`" :label="`邮箱-${index}`">
        <Input v-model="user.email" type="email" placeholder="请输入邮箱" />
      </FormItem>

      <button v-if="dynamicForm.users.length > 1" @click="removeUser(index)">
        删除
      </button>
    </div>

    <button @click="addUser">添加用户</button>
  </Form>
</template>
```

### 自定义标签

```vue
<template>
  <Form :model="form" label-width="100px">
    <FormItem prop="username">
      <template #label>
        <span class="custom-label">
          <Icon name="user" />
          用户名
        </span>
      </template>
      <Input v-model="form.username" />
    </FormItem>
  </Form>
</template>

<style scoped>
.custom-label {
  color: #4f46e5;
  font-weight: 600;
}
</style>
```

## 标签位置

### 左对齐 (Left)

标签文本左对齐，适合需要强调标签的场景。

```vue
<Form :model="form" label-position="left" label-width="100px">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" />
  </FormItem>
</Form>
```

### 右对齐 (Right)

标签文本右对齐，默认对齐方式，视觉上更整齐。

```vue
<Form :model="form" label-position="right" label-width="100px">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" />
  </FormItem>
</Form>
```

### 顶部对齐 (Top)

标签位于输入框上方，适合移动端或窄容器。

```vue
<Form :model="form" label-position="top">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" />
  </FormItem>
</Form>
```

## 表单尺寸

### Small (sm)

小尺寸表单，适用于紧凑布局。

```vue
<Form :model="form" size="sm">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" size="sm" />
  </FormItem>
</Form>
```

### Medium (md)

中等尺寸表单，默认尺寸。

```vue
<Form :model="form" size="md">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" size="md" />
  </FormItem>
</Form>
```

### Large (lg)

大尺寸表单，适用于需要强调的场景。

```vue
<Form :model="form" size="lg">
  <FormItem label="用户名" prop="username">
    <Input v-model="form.username" size="lg" />
  </FormItem>
</Form>
```

## 表单方法

### 手动验证

```vue
<script setup lang="ts">
import { ref } from 'vue'

const formRef = ref()
const form = ref({ username: '' })

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('验证通过，提交表单:', form.value)
  } else {
    console.log('验证失败')
  }
}
</script>

<template>
  <Form ref="formRef" :model="form">
    <FormItem label="用户名" prop="username">
      <Input v-model="form.username" />
    </FormItem>
    <button @click="handleSubmit">提交</button>
  </Form>
</template>
```

### 验证单个字段

```vue
<script setup lang="ts">
const formRef = ref()

const validateUsername = async () => {
  const valid = await formRef.value?.validateField('username')
  console.log('用户名字段验证:', valid)
}
</script>
```

### 重置表单

```vue
<script setup lang="ts">
const formRef = ref()

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<template>
  <Form ref="formRef" :model="form">
    <!-- 表单项 -->
  </Form>
  <button @click="handleReset">重置</button>
</template>
```

### 清除验证

```vue
<script setup lang="ts">
const formRef = ref()

// 清除所有验证
const clearAll = () => {
  formRef.value?.clearValidation()
}

// 清除指定字段验证
const clearField = () => {
  formRef.value?.clearValidation('username')
}
</script>
```

## 可访问性

- 支持键盘导航
- 支持屏幕阅读器
- 错误状态有明确的视觉和文本反馈
- 必填字段有明确的标识
- 符合 WCAG 2.1 AA 标准

## 注意事项

1. **响应式数据**: `model` 必须是响应式对象（使用 `ref` 或 `reactive`）
2. **prop 字段**: FormItem 的 `prop` 必须与 model 中的字段名一致
3. **规则格式**: 规则必须是数组格式，支持多个规则
4. **验证时机**: 默认在 `blur` 和 `change` 时触发验证
5. **异步验证**: 自定义验证器可以返回 Promise
6. **嵌套验证**: 支持使用点号语法验证嵌套对象，如 `user.name`
7. **数组验证**: 支持验证数组元素，如 `users.0.name`

## 相关组件

- [Input](../Input/README.md) - 输入框组件
- [Select](../Select/README.md) - 下拉选择组件
- [Checkbox](../../base/Checkbox/README.md) - 复选框组件
- [Radio](../Radio/README.md) - 单选框组件
- [Switch](../Switch/README.md) - 开关组件
