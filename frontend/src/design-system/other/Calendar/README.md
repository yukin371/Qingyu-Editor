# Calendar 日历组件

日历组件，用于显示和选择日期，支持单日期选择和日期范围选择。

## 特性

- 支持 v-model 双向绑定
- 单日期选择和范围选择模式
- 自定义每周的第一天
- 显示/隐藏周数
- 禁用特定日期
- 日期范围限制（最小/最大日期）
- 多种尺寸（sm/md/lg）
- 国际化支持（中文/英文）
- 今天快速选择
- 月份/年份切换

## 基础用法

### 单日期选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@qingyu/design-system'

const date = ref(new Date())
</script>

<template>
  <Calendar v-model="date" />
</template>
```

### 范围选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@qingyu/design-system'

const dateRange = ref<[Date, Date] | null>(null)
</script>

<template>
  <Calendar v-model="dateRange" :range="true" />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `Date \| string \| [Date, Date] \| [string, string] \| null` | - |
| range | 是否为范围选择 | `boolean` | `false` |
| size | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| firstDayOfWeek | 每周的第一天（0-6, 0=周日） | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` |
| showWeekNumbers | 是否显示周数 | `boolean` | `false` |
| disabledDate | 禁用日期函数 | `(date: Date) => boolean` | - |
| minDate | 最小日期 | `Date \| string` | - |
| maxDate | 最大日期 | `Date \| string` | - |
| format | 日期格式 | `string` | `'YYYY-MM-DD'` |
| locale | 语言环境 | `string` | `'zh-CN'` |
| disabled | 是否禁用 | `boolean` | `false` |
| showToday | 是否显示今天按钮 | `boolean` | `true` |
| showMonthSwitcher | 是否显示月份切换 | `boolean` | `true` |
| class | 自定义类名 | `any` | - |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值更新事件 | `Date \| [Date, Date] \| null` |
| select | 选中日期事件 | `Date \| [Date, Date]` |
| panel-change | 面板切换事件 | `Date` |
| month-change | 月份变化事件 | `Date` |
| year-change | 年份变化事件 | `Date` |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| goTo | 跳转到指定日期 | `date: Date \| string` |
| getSelectedDate | 获取当前选中的日期 | - |
| getRange | 获取当前范围 | - |
| clear | 清空选择 | - |

## 示例

### 自定义起始日

```vue
<template>
  <Calendar v-model="date" :first-day-of-week="1" />
</template>
```

### 显示周数

```vue
<template>
  <Calendar v-model="date" :show-week-numbers="true" :first-day-of-week="1" />
</template>
```

### 禁用日期

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref(new Date())

// 禁用周末
const disabledDate = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}
</script>

<template>
  <Calendar v-model="date" :disabled-date="disabledDate" />
</template>
```

### 日期范围限制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref(new Date())
const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 30) // 未来30天
</script>

<template>
  <Calendar
    v-model="date"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>
```

### 不同尺寸

```vue
<template>
  <div class="flex flex-col gap-4">
    <Calendar v-model="smallDate" size="sm" />
    <Calendar v-model="mediumDate" size="md" />
    <Calendar v-model="largeDate" size="lg" />
  </div>
</template>
```

### 国际化

```vue
<template>
  <!-- 中文 -->
  <Calendar v-model="zhDate" locale="zh-CN" />
  
  <!-- 英文 -->
  <Calendar v-model="enDate" locale="en-US" />
</template>
```

### 使用方法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@qingyu/design-system'

const calendarRef = ref()
const date = ref(new Date())

// 跳转到指定日期
const goToToday = () => {
  calendarRef.value?.goTo(new Date())
}

// 获取选中的日期
const getSelected = () => {
  const selected = calendarRef.value?.getSelectedDate()
  console.log('选中的日期:', selected)
}

// 清空选择
const clearSelection = () => {
  calendarRef.value?.clear()
}
</script>

<template>
  <Calendar ref="calendarRef" v-model="date" />
  <button @click="goToToday">跳转到今天</button>
  <button @click="getSelected">获取选中日期</button>
  <button @click="clearSelection">清空</button>
</template>
```

## 实际应用场景

### 1. 会议安排

```vue
<script setup lang="ts">
import { ref } from 'vue'

const meetingDate = ref(new Date())

const disabledDate = (date: Date) => {
  const day = date.getDay()
  const today = new Date()
  // 禁用周末和过去的日期
  return day === 0 || day === 6 || date < today
}
</script>

<template>
  <div>
    <h3>选择会议日期</h3>
    <Calendar v-model="meetingDate" :disabled-date="disabledDate" />
    <p>已选择: {{ meetingDate?.toLocaleDateString('zh-CN') }}</p>
  </div>
</template>
```

### 2. 酒店预订

```vue
<script setup lang="ts">
import { ref } from 'vue'

const bookingRange = ref<[Date, Date] | null>(null)

const disabledDate = (date: Date) => {
  const today = new Date()
  // 只能预订今天及以后的日期
  return date < today
}
</script>

<template>
  <div>
    <h3>选择入住和退房日期</h3>
    <Calendar v-model="bookingRange" :range="true" :disabled-date="disabledDate" />
    <p v-if="bookingRange">
      入住: {{ bookingRange[0].toLocaleDateString('zh-CN') }}<br />
      退房: {{ bookingRange[1].toLocaleDateString('zh-CN') }}<br />
      共: {{ Math.ceil((bookingRange[1] - bookingRange[0]) / (1000 * 60 * 60 * 24)) }} 晚
    </p>
  </div>
</template>
```

### 3. 活动日历

```vue
<script setup lang="ts">
import { ref } from 'vue'

const eventDate = ref(new Date())

const disabledDate = (date: Date) => {
  const today = new Date()
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // 未来3个月
  // 只能选择未来3个月内的日期
  return date < today || date > maxDate
}
</script>

<template>
  <div>
    <h3>选择活动日期</h3>
    <Calendar
      v-model="eventDate"
      :disabled-date="disabledDate"
      :show-week-numbers="true"
    />
    <p>活动日期: {{ eventDate?.toLocaleDateString('zh-CN') }}</p>
  </div>
</template>
```

### 4. 报表周期

```vue
<script setup lang="ts">
import { ref } from 'vue'

const reportRange = ref<[Date, Date] | null>(null)
const disabledDate = (date: Date) => {
  const today = new Date()
  // 不能选择未来的日期
  return date > today
}
</script>

<template>
  <div>
    <h3>选择报表周期</h3>
    <Calendar
      v-model="reportRange"
      :range="true"
      :disabled-date="disabledDate"
      :show-week-numbers="true"
    />
    <p v-if="reportRange">
      报表周期: {{ reportRange[0].toLocaleDateString('zh-CN') }} - {{ reportRange[1].toLocaleDateString('zh-CN') }}
    </p>
  </div>
</template>
```

## 样式定制

### 使用 class 属性

```vue
<template>
  <Calendar v-model="date" class="shadow-lg" />
</template>
```

### 尺寸定制

组件提供三种尺寸：`sm`、`md`（默认）、`lg`

```vue
<template>
  <Calendar v-model="date" size="sm" />  <!-- 小尺寸 -->
  <Calendar v-model="date" size="md" />  <!-- 中尺寸 -->
  <Calendar v-model="date" size="lg" />  <!-- 大尺寸 -->
</template>
```

## 可访问性

- 组件支持键盘导航（方向键移动焦点）
- 日期选择有明确的视觉反馈
- 禁用状态有明显的视觉提示
- 支持屏幕阅读器

## 浏览器兼容性

- Chrome (最新版) ✅
- Firefox (最新版) ✅
- Safari (最新版) ✅
- Edge (最新版) ✅

## 相关组件

- [DatePicker](../form/DatePicker/) - 日期选择器组件
- [Input](../form/Input/) - 输入框组件
- [Form](../form/Form/) - 表单组件
