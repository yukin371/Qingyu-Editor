# DatePicker 组件

日期选择器组件，支持单日期、日期范围、日期时间和日期时间范围选择，是表单组件系列的重要组成部分。

## 功能特性

- **多种选择类型**: 支持 date、daterange、datetime、datetimerange 四种选择模式
- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **快捷选项**: 支持预定义的快捷日期选项（如"今天"、"最近一周"等）
- **可清空**: 支持一键清空已选日期
- **日期限制**: 支持设置最小和最大可选日期
- **前缀图标**: 支持自定义前缀图标
- **插槽支持**: 支持 prefix 和 suffix 插槽用于自定义内容
- **状态支持**: 支持禁用、只读、错误等状态
- **深色模式**: 支持自定义深色模式样式
- **v-model**: 完整的双向绑定支持
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { DatePicker } from '@/design-system/form'
import { ref } from 'vue'

const date = ref<Date | null>(null)
</script>

<template>
  <DatePicker v-model="date" type="date" placeholder="选择日期" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|------|
| `modelValue` | `Date \| string \| [Date, Date] \| [string, string] \| null` | `undefined` | v-model 绑定值 |
| `type` | `'date' \| 'daterange' \| 'datetime' \| 'datetimerange'` | `'date'` | 选择器类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| `placeholder` | `string \| string[]` | `undefined` | 占位符文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `error` | `boolean` | `false` | 是否为错误状态 |
| `clearable` | `boolean` | `false` | 是否可清空 |
| `format` | `string` | `undefined` | 显示格式 |
| `valueFormat` | `string` | `undefined` | 绑定值格式 |
| `disabledDate` | `(date: Date) => boolean` | `undefined` | 禁用日期函数 |
| `shortcuts` | `DatePickerShortcut[]` | `undefined` | 快捷选项 |
| `prefix` | `string` | `undefined` | 前缀图标名称 |
| `showPrefix` | `boolean` | `true` | 是否显示前缀图标 |
| `class` | `any` | `undefined` | 自定义类名 |
| `minDate` | `Date \| string` | `undefined` | 最小日期 |
| `maxDate` | `Date \| string` | `undefined` | 最大日期 |
| `placement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end'` | `'bottom-start'` | 弹出位置 |
| `showTime` | `boolean` | `false` | 是否显示时间选择 |
| `timeFormat` | `string` | `'HH:mm:ss'` | 时间格式 |
| `showToday` | `boolean` | `false` | 是否显示当前按钮 |
| `startPlaceholder` | `string` | `undefined` | 开始日期占位符 |
| `endPlaceholder` | `string` | `undefined` | 结束日期占位符 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: DatePickerValue)` | 值更新时触发 |
| `focus` | `(event: FocusEvent)` | 获得焦点时触发 |
| `blur` | `(event: FocusEvent)` | 失去焦点时触发 |
| `change` | `(value: DatePickerValue)` | 日期改变时触发 |
| `clear` | `()` | 清空时触发 |
| `visible-change` | `(visible: boolean)` | 弹出框显示/隐藏时触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `prefix` | 前缀内容（覆盖 prefix 属性） |
| `suffix` | 后缀内容 |

### Expose

| 方法 | 描述 |
|------|------|
| `focus()` | 让输入框获得焦点 |
| `blur()` | 让输入框失去焦点 |

## 选择类型

### 单日期选择 (date)

默认的日期选择模式，用于选择单个日期。

```vue
<DatePicker v-model="date" type="date" placeholder="选择日期" />
```

### 日期范围选择 (daterange)

用于选择一个日期范围，返回开始和结束两个日期。

```vue
<DatePicker v-model="dateRange" type="daterange" placeholder="选择日期范围" />
```

### 日期时间选择 (datetime)

用于选择具体的日期和时间。

```vue
<DatePicker v-model="dateTime" type="datetime" placeholder="选择日期时间" />
```

### 日期时间范围选择 (datetimerange)

用于选择日期时间范围。

```vue
<DatePicker v-model="dateTimeRange" type="datetimerange" placeholder="选择日期时间范围" />
```

## 尺寸

### Small (sm)

小尺寸选择器，适用于紧凑布局。

```vue
<DatePicker size="sm" v-model="date" placeholder="小尺寸" />
```

- 高度: `h-8` (32px)
- 内边距: `px-2 py-1`
- 字体: `text-sm`

### Medium (md)

中等尺寸选择器，默认尺寸。

```vue
<DatePicker size="md" v-model="date" placeholder="中等尺寸（默认）" />
```

- 高度: `h-10` (40px)
- 内边距: `px-3 py-2`
- 字体: `text-base`

### Large (lg)

大尺寸选择器，适用于需要强调的场景。

```vue
<DatePicker size="lg" v-model="date" placeholder="大尺寸" />
```

- 高度: `h-12` (48px)
- 内边距: `px-4 py-3`
- 字体: `text-lg`

## 快捷选项

使用 `shortcuts` 属性添加快捷日期选项。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref<Date | null>(null)

const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return d
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
]
</script>

<template>
  <DatePicker v-model="date" type="date" :shortcuts="shortcuts" placeholder="选择日期" />
</template>
```

快捷选项支持：
- 静态日期值
- 函数返回动态日期
- 日期范围数组

## 日期限制

### 最小日期

限制只能选择指定日期之后的日期。

```vue
<DatePicker v-model="date" :min-date="new Date()" placeholder="选择未来日期" />
```

### 最大日期

限制只能选择指定日期之前的日期。

```vue
<DatePicker v-model="date" :max-date="new Date()" placeholder="选择过去日期" />
```

### 范围限制

同时设置最小和最大日期，限制选择范围。

```vue
<script setup lang="ts">
const minDate = new Date()
minDate.setDate(minDate.getDate() - 7)

const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 7)
</script>

<template>
  <DatePicker v-model="date" :min-date="minDate" :max-date="maxDate" placeholder="选择日期" />
</template>
```

## 前缀图标

使用 `prefix` 属性添加前缀图标。

```vue
<DatePicker prefix="calendar" v-model="date" placeholder="选择日期" />
```

如需隐藏前缀图标：

```vue
<DatePicker :show-prefix="false" v-model="date" placeholder="选择日期" />
```

## 状态

### 错误状态

使用 `error` 属性显示错误状态。

```vue
<DatePicker v-model="date" error placeholder="选择日期" />
<p class="text-sm text-red-500">请选择有效的日期</p>
```

### 禁用状态

使用 `disabled` 属性禁用日期选择器。

```vue
<DatePicker v-model="date" disabled placeholder="禁用的日期选择器" />
```

### 只读状态

使用 `readonly` 属性使日期选择器只读。

```vue
<DatePicker v-model="date" readonly placeholder="只读的日期选择器" />
```

## 特殊功能

### 可清空

使用 `clearable` 属性添加清空按钮，选择日期后会显示清空图标。

```vue
<DatePicker v-model="date" clearable placeholder="可清空的日期选择器" />
```

### 自定义占位符

```vue
<!-- 单日期选择 -->
<DatePicker v-model="date" placeholder="请选择您的生日" />

<!-- 日期范围选择 -->
<DatePicker
  v-model="dateRange"
  type="daterange"
  :start-placeholder="开始日期"
  :end-placeholder="结束日期"
/>
```

## 实际应用场景

### 用户注册 - 出生日期

```vue
<script setup lang="ts">
import { ref } from 'vue'

const birthDate = ref<Date | null>(null)

const shortcuts = [
  { text: '18岁', value: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; } },
  { text: '30岁', value: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 30); return d; } },
]
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700">出生日期</label>
    <DatePicker
      v-model="birthDate"
      type="date"
      placeholder="请选择出生日期"
      :max-date="new Date()"
      :shortcuts="shortcuts"
    />
  </div>
</template>
```

### 订单查询 - 时间范围筛选

```vue
<script setup lang="ts">
import { ref } from 'vue'

const orderDate = ref<[Date, Date] | null>(null)

const shortcuts = [
  {
    text: '今天',
    value: () => [new Date(), new Date()],
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return [start, end]
    },
  },
]
</script>

<template>
  <div class="flex gap-4">
    <DatePicker
      v-model="orderDate"
      type="daterange"
      placeholder="选择下单时间"
      :shortcuts="shortcuts"
      clearable
    />
    <button class="px-6 py-2 bg-primary-500 text-white rounded-lg">
      查询
    </button>
  </div>
</template>
```

### 酒店预订 - 入住和退房日期

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const checkIn = ref<Date | null>(null)
const checkOut = ref<Date | null>(null)

const nights = computed(() => {
  if (checkIn.value && checkOut.value) {
    return Math.ceil((checkOut.value.getTime() - checkIn.value.getTime()) / (1000 * 60 * 60 * 24))
  }
  return 0
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium mb-2">入住日期</label>
      <DatePicker
        v-model="checkIn"
        type="date"
        placeholder="选择入住日期"
        :min-date="new Date()"
        clearable
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">退房日期</label>
      <DatePicker
        v-model="checkOut"
        type="date"
        placeholder="选择退房日期"
        clearable
      />
    </div>
  </div>

  <div class="mt-4 text-sm">
    入住晚数: <span class="font-semibold">{{ nights }} 晚</span>
  </div>
</template>
```

### 会议安排 - 日期时间范围

```vue
<script setup lang="ts">
import { ref } from 'vue'

const meetingTime = ref<[Date, Date] | null>(null)

const shortcuts = [
  {
    text: '今天',
    value: () => {
      const start = new Date()
      start.setHours(9, 0, 0, 0)
      const end = new Date()
      end.setHours(10, 0, 0, 0)
      return [start, end]
    },
  },
  {
    text: '明天上午',
    value: () => {
      const start = new Date()
      start.setDate(start.getDate() + 1)
      start.setHours(9, 0, 0, 0)
      const end = new Date()
      end.setDate(end.getDate() + 1)
      end.setHours(12, 0, 0, 0)
      return [start, end]
    },
  },
]
</script>

<template>
  <div>
    <label class="block text-sm font-medium mb-2">会议时间</label>
    <DatePicker
      v-model="meetingTime"
      type="datetimerange"
      placeholder="选择会议时间范围"
      :shortcuts="shortcuts"
      :min-date="new Date()"
      clearable
    />
  </div>
</template>
```

### 报表生成 - 月份选择

```vue
<script setup lang="ts">
import { ref } from 'vue'

const reportPeriod = ref<[Date, Date] | null>(null)

const shortcuts = [
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(1)
      return [start, end]
    },
  },
  {
    text: '上月',
    value: () => {
      const end = new Date()
      const start = new Date()
      end.setMonth(end.getMonth() - 1)
      end.setDate(0)
      start.setMonth(start.getMonth() - 1)
      start.setDate(1)
      return [start, end]
    },
  },
  {
    text: '本季度',
    value: () => {
      const end = new Date()
      const start = new Date()
      const quarter = Math.floor(start.getMonth() / 3)
      start.setMonth(quarter * 3, 1)
      return [start, end]
    },
  },
]
</script>

<template>
  <div>
    <label class="block text-sm font-medium mb-2">报表周期</label>
    <DatePicker
      v-model="reportPeriod"
      type="daterange"
      placeholder="选择报表周期"
      :shortcuts="shortcuts"
      clearable
    />
  </div>
</template>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<DatePicker
  v-model="date"
  class="shadow-lg focus:shadow-xl transition-shadow"
  placeholder="自定义样式"
/>
```

### 深色模式

```vue
<DatePicker
  v-model="date"
  class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400"
  placeholder="深色模式"
/>
```

## 事件处理

### 值变化监听

```vue
<DatePicker
  v-model="date"
  @update:modelValue="handleUpdate"
  @change="handleChange"
/>
```

```typescript
const handleUpdate = (newValue: DatePickerValue) => {
  console.log('值更新:', newValue)
}

const handleChange = (newValue: DatePickerValue) => {
  console.log('值改变:', newValue)
  // 执行查询或其他操作
}
```

### 焦点事件

```vue
<DatePicker
  v-model="date"
  @focus="handleFocus"
  @blur="handleBlur"
/>
```

```typescript
const handleFocus = (event: FocusEvent) => {
  console.log('获得焦点')
}

const handleBlur = (event: FocusEvent) => {
  console.log('失去焦点')
  // 验证或保存数据
}
```

### 清空事件

```vue
<DatePicker
  v-model="date"
  clearable
  @clear="handleClear"
/>
```

```typescript
const handleClear = () => {
  console.log('日期选择器已清空')
  // 重置相关状态
}
```

## 暴露方法

可以通过 ref 访问日期选择器的方法。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const datePickerRef = ref()

const focusDatePicker = () => {
  datePickerRef.value?.focus()
}

const blurDatePicker = () => {
  datePickerRef.value?.blur()
}
</script>

<template>
  <DatePicker ref="datePickerRef" v-model="date" />
  <button @click="focusDatePicker">聚焦</button>
  <button @click="blurDatePicker">失焦</button>
</template>
```

## 可访问性

- 支持键盘导航
- 支持屏幕阅读器
- 焦点状态清晰可见
- 错误状态有明确的视觉反馈
- 符合 WCAG 2.1 AA 标准

## 注意事项

1. **日期格式**: 组件使用标准的 HTML5 日期输入格式（YYYY-MM-DD）
2. **日期范围**: 范围选择需要两个输入框都选择了值才会更新
3. **快捷选项**: 快捷选项的 value 可以是静态值或返回值的函数
4. **日期限制**: minDate 和 maxDate 应使用 Date 对象或标准日期字符串
5. **时区**: 日期值基于本地时区，需要注意时区转换
6. **响应式**: 选择器宽度默认为 100%，会自动适应容器宽度

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

注意：datetime-local 类型在 Safari 14.1+ 才完全支持。

## 相关组件

- [Input](../Input/README.md) - 文本输入组件
- [Textarea](../Textarea/README.md) - 多行文本输入组件
- [Select](../Select/README.md) - 下拉选择组件
- [TimePicker](../TimePicker/README.md) - 时间选择组件（即将推出）
- [Icon](../Icon/README.md) - 图标组件
