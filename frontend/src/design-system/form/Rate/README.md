# Rate 组件

星级评分组件，用于对内容进行评级和打分。

## 功能特性

- **多种尺寸**: 支持 sm、md、lg 三种尺寸
- **半星评分**: 支持半星评分功能
- **自定义颜色**: 支持自定义选中/未选中颜色
- **状态管理**: 支持 v-model 双向绑定
- **禁用状态**: 支持禁用状态
- **只读模式**: 支持只读模式展示
- **显示分数**: 可选显示当前分数
- **自定义文字**: 支持分数对应的文字说明
- **自定义图标**: 支持通过插槽自定义图标
- **灵活配置**: 支持自定义最大分数
- **深色模式**: 自动适配深色主题
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Rate } from '@/design-system/form'
import { ref } from 'vue'

const rating = ref(0)
</script>

<template>
  <Rate v-model="rating" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|------|
| `modelValue` | `number` | `0` | v-model 绑定值 |
| `max` | `number` | `5` | 最大分数 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `allowHalf` | `boolean` | `false` | 是否允许半星 |
| `readonly` | `boolean` | `false` | 只读模式 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Rate 尺寸 |
| `color` | `string` | `'amber-400'` | 选中颜色（Tailwind 类名） |
| `voidColor` | `string` | `'slate-300 dark:slate-600'` | 未选中颜色（Tailwind 类名） |
| `showScore` | `boolean` | `false` | 显示分数 |
| `texts` | `string[]` | `undefined` | 分数对应的文字 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: number)` | 值更新事件 |
| `change` | `(value: number)` | 分数改变事件 |

### Slots

| 插槽 | 参数 | 描述 |
|------|------|------|
| `default` | `{ state: 'full' \| 'half' \| 'empty', index: number }` | 自定义图标 |

## 尺寸

### Small (sm)

小尺寸评分，适用于紧凑布局。

```vue
<Rate size="sm" v-model="value" />
```

- 图标大小: `w-4 h-4` (16px)
- 间距: `gap-0.5` (4px)

### Medium (md)

中等尺寸评分，默认尺寸。

```vue
<Rate size="md" v-model="value" />
```

- 图标大小: `w-5 h-5` (20px)
- 间距: `gap-1` (8px)

### Large (lg)

大尺寸评分，适用于需要强调的场景。

```vue
<Rate size="lg" v-model="value" />
```

- 图标大小: `w-6 h-6` (24px)
- 间距: `gap-1.5` (12px)

## 半星评分

启用半星评分后，用户可以选择半个星级的评分。

```vue
<Rate allow-half v-model="value" />
```

在半星模式下：
- 点击星星左半部分会选择 0.5 星
- 点击星星右半部分会选择整星

```vue
<script setup lang="ts">
import { ref } from 'vue'

const rating = ref(3.5)
</script>

<template>
  <Rate v-model="rating" allow-half show-score />
  <!-- 显示：⭐⭐⭐⭐✩ 3.5 -->
</template>
```

## 显示分数

使用 `showScore` 属性在评分后显示当前分数。

```vue
<Rate v-model="value" show-score />
```

## 自定义文字

使用 `texts` 属性为每个分数级别提供对应的文字说明。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref(3)
const texts = ['极差', '失望', '一般', '满意', '惊喜']
</script>

<template>
  <Rate v-model="value" :texts="texts" />
</template>
```

## 自定义颜色

使用 `color` 和 `voidColor` 属性自定义星星的颜色。

```vue
<!-- 使用玫瑰色 -->
<Rate v-model="value" color="rose-400" />

<!-- 使用绿色 -->
<Rate v-model="value" color="emerald-400" />

<!-- 自定义未选中颜色 -->
<Rate v-model="value" void-color="slate-200" />
```

## 状态

### 禁用状态

```vue
<Rate disabled v-model="value" />
```

禁用状态下，评分不可点击，样式变为半透明。

### 只读模式

```vue
<Rate readonly :model-value="4" />
```

只读模式用于展示评分，不允许用户修改。

## 自定义图标

使用 `default` 插槽自定义星星图标。

```vue
<Rate v-model="value">
  <template #default="{ state }">
    <svg
      v-if="state === 'full'"
      class="w-5 h-5 text-amber-400"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    <svg
      v-else
      class="w-5 h-5 text-slate-300"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  </template>
</Rate>
```

## 实际应用场景

### 商品评分展示

```vue
<script setup lang="ts">
import { ref } from 'vue'

const product = ref({
  name: '无线耳机',
  rating: 4.5,
  reviews: 128,
})
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <h3 class="font-medium mb-2">{{ product.name }}</h3>
    <div class="flex items-center gap-2">
      <Rate readonly :model-value="product.rating" allow-half size="sm" />
      <span class="text-sm text-slate-600">{{ product.rating }}</span>
      <span class="text-xs text-slate-400">({{ product.reviews }} 条评价)</span>
    </div>
  </div>
</template>
```

### 服务评价表单

```vue
<script setup lang="ts">
import { ref } from 'vue'

const ratings = ref({
  quality: 0,
  service: 0,
  delivery: 0,
})

const texts = ['非常不满意', '不满意', '一般', '满意', '非常满意']

const submitReview = () => {
  console.log('提交评价:', ratings.value)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">
        商品质量
      </label>
      <Rate v-model="ratings.quality" :texts="texts" show-score />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">
        服务态度
      </label>
      <Rate v-model="ratings.service" :texts="texts" show-score />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">
        物流速度
      </label>
      <Rate v-model="ratings.delivery" :texts="texts" show-score />
    </div>
    <button
      @click="submitReview"
      :disabled="Object.values(ratings).some(v => v === 0)"
      class="px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50"
    >
      提交评价
    </button>
  </div>
</template>
```

### 不同最大分数

```vue
<Rate :max="3" v-model="value1 />
<Rate :max="10" v-model="value2 size="sm" />
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Rate
  v-model="value"
  class="shadow-lg"
/>
```

## 设计规范

### 尺寸对比

| 尺寸 | 图标大小 | 间距 | 使用场景 |
|------|----------|------|----------|
| sm | 16px | 4px | 紧凑布局、列表项 |
| md | 20px | 8px | 默认尺寸、通用场景 |
| lg | 24px | 12px | 需要强调的场景、独立展示 |

### 颜色系统

- **默认**: Amber 色系（amber-400），温暖的橙黄色，适合大多数评分场景
- **Rose**: 玫瑰色（rose-400），用于需要突出显示的场景
- **Emerald**: 翠绿色（emerald-400），表示正面评价
- **Blue**: 蓝色（blue-400），用于中性或专业评分
- **Violet**: 紫色（violet-400），用于特殊场景

### 间距

- 星星之间: `gap-0.5/1/1.5` (根据尺寸)
- 与文字之间: `ml-2` (8px)
- 与容器边框: `p-4` 或 `p-6`

### 过渡动画

- 颜色过渡: `duration-150` (150ms)
- 缓动函数: `ease-in-out`

## 注意事项

1. **分数精度**: 
   - 整星模式：分数为整数（0, 1, 2, 3, 4, 5）
   - 半星模式：分数可以为 .5 结尾的小数（0, 0.5, 1, 1.5, ...）

2. **最大分数**: 
   - 默认最大分数为 5
   - 可以通过 `max` 属性自定义
   - 建议不要设置过大的值，影响用户体验

3. **禁用 vs 只读**:
   - `disabled`: 完全禁用交互，样式变为半透明
   - `readonly`: 只展示评分，不允许修改，样式保持正常

4. **半星操作**:
   - 点击星星左半部分选择 0.5 星
   - 点击星星右半部分选择整星
   - 移动端体验最佳

5. **文字数组**:
   - `texts` 数组长度应该与 `max` 值相同
   - 每个文字对应一个评分级别
   - 超出范围的文字不会显示

6. **响应式**:
   - 移动端建议使用 `sm` 或 `md` 尺寸
   - 确保触摸区域足够大（至少 44x44px）

7. **可访问性**:
   - 组件包含适当的 ARIA 标签
   - 支持键盘导航
   - 屏幕阅读器友好

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Switch](../Switch/README.md) - 开关组件
- [Checkbox](../Checkbox/README.md) - 复选框组件
- [Radio](../Radio/README.md) - 单选框组件
- [Input](../Input/README.md) - 输入框组件
