# Slider 组件

滑块选择组件，用于在数值范围内进行选择，支持单滑块和双滑块模式。

## 功能特性

- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **多种颜色**: 支持 primary、success、warning、danger 四种颜色
- **单/双滑块**: 支持单滑块和双滑块（范围）模式
- **垂直模式**: 支持垂直方向显示
- **状态管理**: 支持 v-model 双向绑定
- **禁用状态**: 支持禁用状态
- **刻度标记**: 支持显示刻度标记和标签
- **自定义格式**: 支持自定义 tooltip 格式化函数
- **步长控制**: 支持自定义步长
- **范围限制**: 支持自定义最小值和最大值
- **深色模式**: 自动适配深色主题
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Slider } from '@/design-system/form'
import { ref } from 'vue'

const value = ref(50)
</script>

<template>
  <Slider v-model="value" :min="0" :max="100" label="Volume" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|------|
| `modelValue` | `number \| number[]` | `0` | v-model 绑定值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `range` | `boolean` | `false` | 双滑块模式 |
| `vertical` | `boolean` | `false` | 垂直模式 |
| `height` | `string` | `'200px'` | 垂直模式高度 |
| `showTooltip` | `boolean` | `true` | 显示提示 |
| `formatTooltip` | `(value: number) => string` | `undefined` | 格式化提示 |
| `marks` | `Record<number, string>` | `undefined` | 刻度标记 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Slider 尺寸 |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Slider 颜色 |
| `label` | `string` | `undefined` | 标签文本 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: number \| number[])` | 值更新事件 |
| `change` | `(value: number \| number[])` | 值改变事件 |

## 尺寸

### Small (sm)

小尺寸滑块，适用于紧凑布局。

```vue
<Slider size="sm" v-model="value" />
```

- 轨道高度: `h-1.5` (6px)
- 滑块: `h-3 w-3` (12px)

### Medium (md)

中等尺寸滑块，默认尺寸。

```vue
<Slider size="md" v-model="value" />
```

- 轨道高度: `h-2` (8px)
- 滑块: `h-4 w-4` (16px)

### Large (lg)

大尺寸滑块，适用于需要强调的场景。

```vue
<Slider size="lg" v-model="value" />
```

- 轨道高度: `h-2.5` (10px)
- 滑块: `h-5 w-5` (20px)

## 颜色

### Primary

主要颜色，蓝色主题。

```vue
<Slider color="primary" v-model="value" />
```

### Success

成功状态，绿色。

```vue
<Slider color="success" v-model="value" />
```

### Warning

警告状态，橙黄色。

```vue
<Slider color="warning" v-model="value" />
```

### Danger

危险状态，红色。

```vue
<Slider color="danger" v-model="value" />
```

## 单滑块模式

默认的单滑块模式，用于选择单个数值。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const volume = ref(50)
</script>

<template>
  <Slider v-model="volume" :min="0" :max="100" label="Volume" />
</template>
```

## 双滑块模式

使用 `range` 属性启用双滑块模式，用于选择数值范围。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const priceRange = ref([100, 500])
</script>

<template>
  <Slider
    v-model="priceRange"
    :min="0"
    :max="1000"
    :step="50"
    range
    label="Price Range"
  />
</template>
```

## 垂直模式

使用 `vertical` 属性启用垂直模式。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref(50)
</script>

<template>
  <Slider v-model="value" vertical height="200px" />
</template>
```

## 刻度标记

使用 `marks` 属性显示刻度标记和标签。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref(0)

const marks = {
  0: '0°C',
  25: '25°C',
  50: '50°C',
  75: '75°C',
  100: '100°C',
}
</script>

<template>
  <Slider v-model="value" :marks="marks" label="Temperature" />
</template>
```

## 自定义格式化

使用 `formatTooltip` 函数自定义 tooltip 显示格式。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref(50)

const formatCurrency = (value: number) => `$${value}`
const formatPercent = (value: number) => `${value}%`
const formatTemperature = (value: number) => `${value}°C`
</script>

<template>
  <Slider v-model="value" :format-tooltip="formatCurrency" label="Price" />
</template>
```

## 步长控制

使用 `step` 属性控制数值变化的步长。

```vue
<!-- 整数步长 -->
<Slider v-model="value1" :step="1" label="Step: 1" />

<!-- 5 的倍数 -->
<Slider v-model="value2" :step="5" label="Step: 5" />

<!-- 10 的倍数 -->
<Slider v-model="value3" :step="10" label="Step: 10" />

<!-- 小数步长 -->
<Slider v-model="value4" :step="0.5" label="Step: 0.5" />
```

## 范围限制

使用 `min` 和 `max` 属性限制可选范围。

```vue
<!-- 0-10 范围 -->
<Slider v-model="rating" :min="0" :max="10" label="Rating" />

<!-- -100 到 100 -->
<Slider v-model="balance" :min="-100" :max="100" label="Balance" />

<!-- 自定义范围 -->
<Slider v-model="percentage" :min="25" :max="75" label="Percentage" />
```

## 隐藏 Tooltip

使用 `showTooltip` 属性控制 tooltip 显示。

```vue
<Slider v-model="value" :show-tooltip="false" label="Volume" />
```

## 禁用状态

```vue
<Slider disabled v-model="value" />
```

禁用状态下，滑块不可拖动，样式变为半透明。

## 实际应用场景

### 音量控制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const volume = ref(75)
</script>

<template>
  <div class="p-4">
    <Slider
      v-model="volume"
      :min="0"
      :max="100"
      :step="1"
      :format-tooltip="(v) => v + '%'"
      label="Volume"
      color="primary"
    />
  </div>
</template>
```

### 温度控制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const temperature = ref(22)

const formatTemperature = (value: number) => `${value}°C`

const marks = {
  16: '16°C',
  20: '20°C',
  24: '24°C',
  28: '28°C',
  30: '30°C',
}
</script>

<template>
  <div class="p-4">
    <Slider
      v-model="temperature"
      :min="16"
      :max="30"
      :step="0.5"
      :format-tooltip="formatTemperature"
      :marks="marks"
      label="Temperature"
      color="warning"
    />
  </div>
</template>
```

### 价格范围筛选

```vue
<script setup lang="ts">
import { ref } from 'vue'

const priceRange = ref([100, 500])

const formatCurrency = (value: number) => `$${value}`
</script>

<template>
  <div class="p-4">
    <Slider
      v-model="priceRange"
      :min="0"
      :max="1000"
      :step="50"
      :format-tooltip="formatCurrency"
      range
      label="Price Range"
      color="success"
    />
  </div>
</template>
```

### 均衡器

```vue
<script setup lang="ts">
import { ref } from 'vue'

const equalizer = ref({
  bass: 50,
  mid: 50,
  treble: 50,
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div>
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium">Bass</span>
        <span class="text-sm text-slate-600">{{ equalizer.bass }}</span>
      </div>
      <Slider v-model="equalizer.bass" color="primary" :show-tooltip="false" />
    </div>
    <div>
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium">Mid</span>
        <span class="text-sm text-slate-600">{{ equalizer.mid }}</span>
      </div>
      <Slider v-model="equalizer.mid" color="success" :show-tooltip="false" />
    </div>
    <div>
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium">Treble</span>
        <span class="text-sm text-slate-600">{{ equalizer.treble }}</span>
      </div>
      <Slider v-model="equalizer.treble" color="warning" :show-tooltip="false" />
    </div>
  </div>
</template>
```

### 垂直滑块组

```vue
<script setup lang="ts">
import { ref } from 'vue'

const sliders = ref([50, 60, 70, 80])
</script>

<template>
  <div class="flex gap-8 p-4">
    <div
      v-for="(slider, index) in sliders"
      :key="index"
      class="flex flex-col items-center"
    >
      <Slider
        v-model="sliders[index]"
        vertical
        height="200px"
        :color="['primary', 'success', 'warning', 'danger'][index]"
      />
      <span class="mt-2 text-xs text-slate-600">{{ slider }}</span>
    </div>
  </div>
</template>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Slider
  v-model="value"
  class="shadow-lg"
/>
```

## 可访问性

- 使用语义化的 `role="slider"` 属性
- 包含 `aria-valuenow` 属性表示当前值
- 包含 `aria-valuemin` 和 `aria-valuemax` 属性表示值范围
- 包含 `aria-disabled` 属性表示禁用状态
- 支持键盘操作（左右/上下箭头键）
- 支持屏幕阅读器
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 尺寸对比

| 尺寸 | 轨道高度 | 滑块大小 | 使用场景 |
|------|----------|----------|----------|
| sm | 6px | 12px | 紧凑布局、表单密集场景 |
| md | 8px | 16px | 默认尺寸、通用场景 |
| lg | 10px | 20px | 需要强调的场景、移动端 |

### 颜色系统

- **Primary**: Primary 色系，蓝色主题，用于主要功能
- **Success**: Emerald 色系，绿色，表示成功/安全范围
- **Warning**: Amber 色系，橙黄色，表示需要注意的范围
- **Danger**: Red 色系，红色，表示危险或敏感范围

### 间距

- 滑块与标签之间: `mb-2` (8px)
- 多个滑块之间: `gap-4` (16px) 或 `space-y-4/6`

### 过渡动画

- 颜色过渡: `transition-all`
- 滑块悬停: `hover:scale-110`
- 过渡时间: `duration-200` (200ms)
- 缓动函数: `ease-in-out`

## 注意事项

1. **合理的范围**: 确保 min 和 max 的设置符合实际使用场景
2. **步长选择**: 根据数据精度选择合适的步长，避免步长过大导致精度不足
3. **刻度标记**: 刻度标记不宜过多，建议不超过 10 个
4. **tooltip 格式**: 对于特殊单位（如货币、百分比），使用 `formatTooltip` 格式化显示
5. **移动端**: 在移动端使用时，确保滑块的触摸区域足够大
6. **范围模式**: 双滑块模式下，两个滑块之间的最小距离由 `step` 属性决定
7. **垂直模式**: 垂直模式适合用于并列显示多个滑块的场景
8. **性能考虑**: 频繁拖动时会触发大量更新，如有需要可以使用防抖优化

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Input](../Input/README.md) - 输入框组件
- [Switch](../Switch/README.md) - 开关组件
- [Checkbox](../Checkbox/README.md) - 复选框组件
- [Radio](../Radio/README.md) - 单选框组件
- [Select](../Select/README.md) - 选择器组件
