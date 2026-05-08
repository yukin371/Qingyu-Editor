# TimePicker 时间选择器组件

时间选择器组件，支持单时间和时间范围选择，提供多种时间格式和尺寸选项。

## 功能特性

- ✅ 单时间选择
- ✅ 时间范围选择
- ✅ 多种时间格式支持 (HH:mm:ss, HH:mm, HHmmss, HHmm)
- ✅ 三种尺寸 (small, medium, large)
- ✅ 禁用/只读/可编辑状态
- ✅ 可清空功能
- ✅ 时间间隔设置
- ✅ 时间范围限制 (start, end)
- ✅ 禁用特定时间点/时间段
- ✅ 自定义分隔符 (范围选择)
- ✅ 前缀/后缀图标支持
- ✅ 完整的 TypeScript 支持

## 基础用法

### 单时间选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const time = ref('09:30:00')
</script>

<template>
  <TimePicker v-model="time" placeholder="选择时间" />
</template>
```

### 时间范围选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const timeRange = ref(['09:00:00', '18:00:00'])
</script>

<template>
  <TimePicker
    v-model="timeRange"
    is-range
    placeholder="选择时间范围"
  />
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | `string \| [string, string] \| null` | - | 绑定值，格式为 HH:mm:ss 或 HH:mm |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |
| readonly | `boolean` | `false` | 是否只读 |
| editable | `boolean` | `true` | 是否可编辑 |
| clearable | `boolean` | `false` | 是否可清空 |
| isRange | `boolean` | `false` | 是否范围选择 |
| rangeSeparator | `string` | `'-'` | 范围分隔符 |
| format | `string` | `'HH:mm:ss'` | 时间格式 |
| start | `string` | - | 起始时间 |
| end | `string` | - | 结束时间 |
| step | `TimePickerStep` | `{ hour: 1, minute: 1, second: 1 }` | 时间间隔 |
| disabledHours | `number[] \| Function` | - | 禁用的小时 |
| disabledMinutes | `number[] \| Function` | - | 禁用的分钟 |
| disabledSeconds | `number[] \| Function` | - | 禁用的秒 |
| disabledTimeRanges | `DisabledTimeRange[]` | - | 禁用的时间段 |
| placeholder | `string \| string[]` | - | 占位符文本 |
| prefix | `string` | - | 前缀图标名称 |
| showPrefix | `boolean` | `true` | 是否显示前缀图标 |

### TimePickerStep 类型

```typescript
interface TimePickerStep {
  hour?: number    // 小时间隔，默认 1
  minute?: number  // 分钟间隔，默认 1
  second?: number  // 秒间隔，默认 1
}
```

### DisabledTimeRange 类型

```typescript
interface DisabledTimeRange {
  start: string  // 开始时间 (HH:mm:ss)
  end: string    // 结束时间 (HH:mm:ss)
}
```

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | `(value: string \| [string, string] \| null)` | 值更新时触发 |
| change | `(value: string \| [string, string] \| null)` | 值改变时触发 |
| focus | `(event: FocusEvent)` | 获得焦点时触发 |
| blur | `(event: FocusEvent)` | 失去焦点时触发 |
| clear | `()` | 清空时触发 |

### Expose Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| focus | - | - | 使输入框获得焦点 |
| blur | - | - | 使输入框失去焦点 |
| getCurrentTime | - | `string` | 获取当前时间字符串 |

## 使用示例

### 不同尺寸

```vue
<template>
  <div class="space-y-4">
    <TimePicker size="sm" v-model="smallTime" placeholder="小尺寸" />
    <TimePicker size="md" v-model="mediumTime" placeholder="中尺寸（默认）" />
    <TimePicker size="lg" v-model="largeTime" placeholder="大尺寸" />
  </div>
</template>
```

### 禁用/只读/不可编辑

```vue
<template>
  <div class="space-y-4">
    <TimePicker v-model="time1" disabled placeholder="禁用状态" />
    <TimePicker v-model="time2" readonly placeholder="只读状态" />
    <TimePicker v-model="time3" :editable="false" placeholder="不可编辑" />
  </div>
</template>
```

### 可清空

```vue
<template>
  <TimePicker v-model="time" clearable placeholder="可清空的时间选择器" />
</template>
```

### 时间格式

```vue
<template>
  <div class="space-y-4">
    <TimePicker v-model="time1" format="HH:mm:ss" placeholder="14:30:00" />
    <TimePicker v-model="time2" format="HH:mm" placeholder="14:30" />
    <TimePicker v-model="time3" format="HHmmss" placeholder="143000" />
    <TimePicker v-model="time4" format="HHmm" placeholder="1430" />
  </div>
</template>
```

### 时间限制

```vue
<template>
  <TimePicker
    v-model="time"
    start="09:00:00"
    end="18:00:00"
    placeholder="工作时间"
  />
</template>
```

### 时间间隔

```vue
<template>
  <TimePicker
    v-model="time"
    :step="{ hour: 1, minute: 15, second: 0 }"
    placeholder="每15分钟间隔"
  />
</template>
```

### 禁用特定时间

```vue
<script setup lang="ts">
import TimePicker from '@/design-system/other/TimePicker'

// 禁用午休时间
const disabledRanges = [
  { start: '12:00:00', end: '13:00:00' }
]

// 禁用特定小时
const disabledHours = [0, 1, 2, 3, 4, 5, 6, 22, 23]

// 禁用特定分钟的函数
const disabledMinutes = (hour: number, minute: number) => {
  // 只允许每15分钟的时间点
  return minute % 15 !== 0
}
</script>

<template>
  <div class="space-y-4">
    <TimePicker
      v-model="time1"
      :disabled-time-ranges="disabledRanges"
      placeholder="禁用午休"
    />
    <TimePicker
      v-model="time2"
      :disabled-hours="disabledHours"
      placeholder="工作时间"
    />
    <TimePicker
      v-model="time3"
      :disabled-minutes="disabledMinutes"
      placeholder="15分钟间隔"
    />
  </div>
</template>
```

### 自定义分隔符

```vue
<template>
  <TimePicker
    v-model="timeRange"
    is-range
    range-separator="至"
    placeholder="选择时间范围"
  />
</template>
```

## 实际应用场景

### 1. 会议安排

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const meetingStart = ref<string | null>(null)
const meetingRange = ref<[string, string] | null>(null)

const workingHours = {
  start: '09:00:00',
  end: '18:00:00'
}

const lunchBreak = {
  start: '12:00:00',
  end: '13:00:00'
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">会议开始时间</label>
      <TimePicker
        v-model="meetingStart"
        :start="workingHours.start"
        :end="workingHours.end"
        :disabled-time-ranges="[lunchBreak]"
        placeholder="选择会议时间"
        clearable
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">会议时间段</label>
      <TimePicker
        v-model="meetingRange"
        is-range
        :start="workingHours.start"
        :end="workingHours.end"
        :disabled-time-ranges="[lunchBreak]"
        placeholder="选择时间段"
        clearable
      />
    </div>
  </div>
</template>
```

### 2. 营业时间设置

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const weekdays = ref({
  monday: { open: '09:00:00', close: '18:00:00' },
  tuesday: { open: '09:00:00', close: '18:00:00' },
  wednesday: { open: '09:00:00', close: '18:00:00' },
  thursday: { open: '09:00:00', close: '18:00:00' },
  friday: { open: '09:00:00', close: '21:00:00' },
  saturday: { open: '10:00:00', close: '22:00:00' },
  sunday: { open: '10:00:00', close: '20:00:00' }
})
</script>

<template>
  <div class="space-y-4">
    <div v-for="(day, key) in weekdays" :key="key" class="flex items-center gap-4">
      <label class="w-24 text-sm font-medium">{{ key }}</label>
      <div class="flex-1 flex items-center gap-2">
        <TimePicker v-model="day.open" size="sm" placeholder="开" />
        <span class="text-slate-400">至</span>
        <TimePicker v-model="day.close" size="sm" placeholder="关" />
      </div>
    </div>
  </div>
</template>
```

### 3. 提醒设置

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const reminderTime = ref('09:00:00')
const doNotDisturbRange = ref<[string, string] | null>(null)
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">每日提醒时间</label>
      <TimePicker
        v-model="reminderTime"
        format="HH:mm"
        placeholder="选择提醒时间"
        clearable
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">免打扰时段</label>
      <TimePicker
        v-model="doNotDisturbRange"
        is-range
        placeholder="选择免打扰时段"
        clearable
      />
    </div>
  </div>
</template>
```

### 4. 预约时间段选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker'

const appointmentTime = ref<string | null>(null)

const businessHours = {
  start: '09:00:00',
  end: '17:00:00'
}

const lunchBreak = {
  start: '12:00:00',
  end: '13:00:00'
}

const breakTimes = [
  { start: '10:00:00', end: '10:15:00' },
  { start: '15:00:00', end: '15:15:00' }
]
</script>

<template>
  <div>
    <label class="block text-sm font-medium mb-2">预约时间</label>
    <TimePicker
      v-model="appointmentTime"
      :start="businessHours.start"
      :end="businessHours.end"
      :disabled-time-ranges="[lunchBreak, ...breakTimes]"
      :step="{ hour: 0, minute: 15, second: 0 }"
      placeholder="选择预约时间"
      clearable
    />
    <p class="text-xs text-slate-500 mt-1">
      每15分钟一个时段，不含午休和休息时间
    </p>
  </div>
</template>
```

## 样式定制

组件使用 CVA (class-variance-authority) 进行样式管理，可以通过 `class` 属性进行样式覆盖：

```vue
<template>
  <TimePicker
    v-model="time"
    class="!border-red-500 !focus:border-red-500 !focus:ring-red-500/20"
    placeholder="自定义样式"
  />
</template>
```

## 可访问性

- 支持键盘导航
- 正确的 ARIA 属性
- 焦点管理
- 错误状态提示

## 浏览器兼容性

- Chrome (最新版) ✅
- Firefox (最新版) ✅
- Safari (最新版) ✅
- Edge (最新版) ✅

## 注意事项

1. **时间格式**：确保传入的时间值与 `format` 属性指定的格式一致
2. **时间范围**：时间范围选择时，会自动交换开始和结束时间（如果开始时间晚于结束时间）
3. **时间限制**：`start` 和 `end` 属性会限制可选时间范围
4. **禁用时间**：`disabledHours`、`disabledMinutes`、`disabledSeconds` 可以是数组或函数

## 相关组件

- [DatePicker](../DatePicker/README.md) - 日期选择器
- [Input](../Input/README.md) - 文本输入框
- [Select](../Select/README.md) - 下拉选择器
- [Form](../Form/README.md) - 表单组件
