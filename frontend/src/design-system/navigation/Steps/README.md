# Steps 步骤条组件

引导用户按照流程完成任务的导航条，支持水平/垂直方向、简洁模式、自定义状态等多种功能。

## 功能特性

- 水平/垂直两种方向
- 简洁模式
- 自定义步骤状态（wait/process/finish/error/success）
- 图标支持
- 描述文本支持
- 标题居中对齐（仅水平方向）
- 可点击跳转步骤
- 自定义完成状态和当前状态样式

## 基础用法

### 基础步骤条

```vue
<Steps :current="1">
  <Step title="步骤1" description="这是第一步的描述" />
  <Step title="步骤2" description="这是第二步的描述" />
  <Step title="步骤3" description="这是第三步的描述" />
</Steps>
```

### 带图标的步骤

使用 `icon` 插槽可以添加自定义图标。

```vue
<Steps :current="1">
  <Step title="注册账号">
    <template #icon>
      <UserIcon />
    </template>
    <template #description>创建您的账号</template>
  </Step>
  <Step title="填写信息">
    <template #icon>
      <DocumentIcon />
    </template>
    <template #description>完善个人信息</template>
  </Step>
  <Step title="完成注册">
    <template #icon>
      <CheckCircleIcon />
    </template>
    <template #description>注册成功</template>
  </Step>
</Steps>
```

### 垂直方向步骤条

设置 `direction` 属性为 `vertical`。

```vue
<Steps direction="vertical" :current="1">
  <Step title="上传文件" description="选择要上传的文件" />
  <Step title="处理中" description="正在处理您的文件" />
  <Step title="完成" description="文件处理完成" />
</Steps>
```

### 简洁模式

设置 `simple` 属性启用简洁模式，适用于步骤较多的情况。

```vue
<Steps simple :current="1">
  <Step title="开始" />
  <Step title="进行中" />
  <Step title="完成" />
</Steps>
```

### 居中对齐

设置 `alignCenter` 属性使标题居中（仅水平方向有效）。

```vue
<Steps align-center :current="1">
  <Step title="开始" description="开始流程" />
  <Step title="进行中" description="正在处理" />
  <Step title="完成" description="流程结束" />
</Steps>
```

## 步骤状态

步骤有以下几种状态：

- `wait` - 等待状态（默认）
- `process` - 进行中
- `finish` - 已完成
- `error` - 错误
- `success` - 成功

可以通过 `status` 属性设置步骤状态：

```vue
<Steps :current="2">
  <Step title="步骤1" status="finish" />
  <Step title="步骤2" status="error">
    <template #description>出错了，请重试</template>
  </Step>
  <Step title="步骤3" />
</Steps>
```

## 自定义状态样式

可以通过 `finishStatus` 和 `processStatus` 自定义完成步骤和当前步骤的样式：

```vue
<Steps
  :current="1"
  finish-status="success"
  process-status="finish"
>
  <Step title="步骤1" />
  <Step title="步骤2" />
  <Step title="步骤3" />
</Steps>
```

## 可点击步骤

步骤条支持点击跳转功能：

```vue
<Steps :current="currentStep" @change="handleChange">
  <Step title="账号信息" description="填写您的账号信息" />
  <Step title="基本信息" description="填写您的基本信息" />
  <Step title="完成注册" description="完成注册流程" />
</Steps>
```

```ts
const handleChange = (current: number) => {
  console.log('Step changed to:', current)
  currentStep.value = current
}
```

## 插槽

### Steps 插槽

Steps 组件只有一个默认插槽，用于放置 Step 组件。

### Step 插槽

| 插槽名 | 说明 |
|--------|------|
| default | 默认插槽，步骤标题内容 |
| icon | 图标插槽 |
| title | 标题插槽 |
| description | 描述插槽 |

## API

### Steps Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| current | `number` | `0` | 当前激活步骤（从 0 开始） |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | 步骤条方向 |
| alignCenter | `boolean` | `false` | 标题居中（仅水平方向） |
| simple | `boolean` | `false` | 简洁模式 |
| finishStatus | `StepStatus` | `'finish'` | 完成步骤的状态 |
| processStatus | `StepStatus` | `'process'` | 当前步骤的状态 |

### Step Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | `string` | - | 步骤标题 |
| description | `string` | - | 步骤描述 |
| icon | `string` | - | 步骤图标 |
| status | `StepStatus` | - | 步骤状态 |

### Steps 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 步骤变化时触发 | current: 当前步骤, prevCurrent: 上一步骤 |

### Step 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击步骤时触发 | index: 步骤索引 |

## 样式定制

Steps 组件使用 Tailwind CSS 构建，可以通过以下方式定制样式：

### 使用默认样式变体

组件已内置 Tailwind 类名，自动适配设计令牌。

### 自定义类名

所有组件都支持 `class` 属性来添加自定义样式：

```vue
<Steps class="shadow-lg">
  <Step class="text-red-500">自定义样式</Step>
</Steps>
```

## 无障碍访问

- 步骤条容器使用 `role="list"` 属性
- 步骤项使用 `role="listitem"` 属性
- 当前步骤使用 `aria-current="step"` 属性
- 支持键盘导航和点击交互

## 设计令牌

Steps 组件使用以下设计令牌：

- `primary-*` - 主色调
- `slate-*` - 中性色
- `red-*` - 错误色
- `green-*` - 成功色
- 设计规范的间距、圆角、过渡动画等

## 注意事项

1. `alignCenter` 属性仅在水平方向时生效
2. 简洁模式适用于步骤较多的情况，不显示描述文本
3. 步骤状态优先级：手动指定的 status > 根据 current 自动计算的状态
4. 点击步骤可以触发跳转，需要配合 `change` 事件使用
