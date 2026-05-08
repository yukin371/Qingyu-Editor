# Progress 组件

用于展示操作当前进度的反馈组件。

支持线性进度条、圆形进度条和仪表盘进度条三种展示形式。

## 功能特性

- **三种类型**: 支持 line（线性）、circle（圆形）、dashboard（仪表盘）三种类型
- **状态指示**: 支持 success、exception、warning、active 四种状态
- **自定义颜色**: 支持单一颜色、渐变色和函数自定义颜色
- **条纹动画**: 支持静态条纹和流动动画效果
- **文字自定义**: 支持文字内部/外部显示、自定义格式
- **灵活配置**: 支持自定义线条粗细、容器尺寸等
- **仪表盘配置**: 支持仪表盘角度和起始位置配置
- **深色模式**: 自动适配深色主题
- **动画效果**: 平滑的进度过渡动画

## 安装使用

```vue
<script setup lang="ts">
import { Progress } from '@/design-system/feedback'
</script>

<template>
  <Progress :percentage="50" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `percentage` | `number` | `0` | 百分比（0-100） |
| `type` | `'line' \| 'circle' \| 'dashboard'` | `'line'` | Progress 类型 |
| `strokeWidth` | `number` | `6` | 线条粗细 |
| `status` | `'success' \| 'exception' \| 'warning' \| 'active'` | `undefined` | 状态 |
| `color` | `string \| string[] \| function` | `undefined` | 进度条颜色 |
| `striped` | `boolean` | `false` | 是否显示条纹动画（仅 line） |
| `flow` | `boolean` | `false` | 是否为流动动画（仅 line 且 striped 为 true） |
| `textInside` | `boolean` | `false` | 文字是否在进度条内部（仅 line） |
| `showText` | `boolean` | `true` | 是否显示百分比文字 |
| `format` | `(percentage: number) => string` | `undefined` | 自定义文字内容 |
| `width` | `number` | `126` | 容器宽度（circle/dashboard，单位 px） |
| `gapDegree` | `number` | `240` | 仪表盘角度（dashboard，0-360） |
| `gapPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 仪表盘起始位置 |
| `animated` | `boolean` | `true` | 是否显示描边动画 |
| `class` | `any` | `undefined` | 自定义类名 |
| `style` | `any` | `undefined` | 自定义样式 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `change` | `(percentage: number)` | 百分比变化时触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `default` | 自定义内容 |

## 类型

### Line（线性进度条）

最基础的进度条，适用于大多数场景。

```vue
<Progress :percentage="50" />
```

### Circle（圆形进度条）

圆形进度条，常用于显示任务完成度。

```vue
<Progress type="circle" :percentage="75" />
```

### Dashboard（仪表盘）

仪表盘样式，适用于数据指标展示。

```vue
<Progress type="dashboard" :percentage="80" />
```

## 基础用法

### 不同百分比

```vue
<Progress :percentage="0" />
<Progress :percentage="25" />
<Progress :percentage="50" />
<Progress :percentage="75" />
<Progress :percentage="100" />
```

### 不同状态

```vue
<Progress :percentage="80" status="success" />
<Progress :percentage="60" status="exception" />
<Progress :percentage="40" status="warning" />
<Progress :percentage="30" status="active" />
```

### 条纹动画

```vue
<!-- 静态条纹 -->
<Progress :percentage="50" :striped="true" />

<!-- 流动动画 -->
<Progress :percentage="50" :striped="true" :flow="true" />
```

### 文字内部显示

```vue
<Progress :percentage="50" :text-inside="true" />
```

## 圆形进度条

### 基础用法

```vue
<Progress type="circle" :percentage="75" />
```

### 不同尺寸

```vue
<Progress type="circle" :percentage="75" :width="80" />
<Progress type="circle" :percentage="75" :width="120" />
<Progress type="circle" :percentage="75" :width="160" />
```

### 不同状态

```vue
<Progress type="circle" :percentage="100" status="success" />
<Progress type="circle" :percentage="60" status="exception" />
<Progress type="circle" :percentage="40" status="warning" />
```

## 仪表盘

### 基础用法

```vue
<Progress type="dashboard" :percentage="80" />
```

### 不同起始位置

```vue
<Progress type="dashboard" :percentage="75" gap-position="top" />
<Progress type="dashboard" :percentage="75" gap-position="bottom" />
<Progress type="dashboard" :percentage="75" gap-position="left" />
<Progress type="dashboard" :percentage="75" gap-position="right" />
```

### 自定义角度

```vue
<Progress type="dashboard" :percentage="75" :gap-degree="180" />
```

## 自定义颜色

### 单一颜色

```vue
<Progress :percentage="60" color="#8b5cf6" />
```

### 渐变颜色

```vue
<Progress :percentage="60" :color="['#ec4899', '#8b5cf6', '#3b82f6']" />
```

### 函数颜色

```vue
<Progress
  :percentage="60"
  :color="(percentage) => percentage > 50 ? '#10b981' : '#f59e0b'"
/>
```

## 自定义文字

### 自定义格式

```vue
<Progress
  :percentage="60"
  :format="(percentage) => `${percentage} / 100`"
/>
```

### 隐藏文字

```vue
<Progress :percentage="50" :show-text="false" />
```

## 动态更新

```vue
<script setup lang="ts">
import { ref } from 'vue'

const percentage = ref(0)

const increase = () => {
  percentage.value = Math.min(100, percentage.value + 10)
}

const decrease = () => {
  percentage.value = Math.max(0, percentage.value - 10)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <button @click="decrease">-10%</button>
      <button @click="increase">+10%</button>
    </div>
    <Progress :percentage="percentage" />
  </div>
</template>
```

## 实际应用场景

### 文件上传

```vue
<div>
  <div class="flex justify-between mb-2">
    <span class="text-sm font-medium">上传文件</span>
    <span class="text-sm text-slate-500">{{ percentage }}%</span>
  </div>
  <Progress :percentage="percentage" status="active" :striped="true" :flow="true" />
</div>
```

### 存储空间

```vue
<div>
  <div class="flex justify-between mb-2">
    <span class="text-sm font-medium">存储空间</span>
    <span class="text-sm text-slate-500">85%</span>
  </div>
  <Progress :percentage="85" status="warning" />
</div>
```

### CPU 使用率

```vue
<div>
  <div class="flex justify-between mb-2">
    <span class="text-sm font-medium">CPU 使用率</span>
    <span class="text-sm text-slate-500">92%</span>
  </div>
  <Progress :percentage="92" status="exception" />
</div>
```

### 数据处理进度

```vue
<div class="flex gap-8">
  <Progress type="circle" :percentage="uploadProgress" />
  <Progress type="circle" :percentage="processProgress" />
  <Progress type="circle" :percentage="completeProgress" />
</div>
```

## 样式定制

### 线条粗细

```vue
<Progress :percentage="50" :stroke-width="4" />
<Progress :percentage="50" :stroke-width="8" />
<Progress :percentage="50" :stroke-width="12" />
```

### 容器尺寸

```vue
<!-- 圆形进度条 -->
<Progress type="circle" :percentage="75" :width="80" />
<Progress type="circle" :percentage="75" :width="120" />

<!-- 仪表盘 -->
<Progress type="dashboard" :percentage="75" :width="100" />
<Progress type="dashboard" :percentage="75" :width="150" />
```

## 设计规范

### 状态颜色

| 状态 | 颜色 | 使用场景 |
|------|------|----------|
| Success | Emerald 500 | 操作成功、完成 |
| Exception | Red 500 | 操作失败、错误 |
| Warning | Amber 500 | 警告、需要注意 |
| Active | Blue 500 | 进行中、活跃 |

### 尺寸规格

| 类型 | 默认尺寸 | 小尺寸 | 大尺寸 |
|------|----------|--------|--------|
| Line | strokeWidth: 6px | strokeWidth: 4px | strokeWidth: 12px |
| Circle | width: 126px | width: 80px | width: 160px |
| Dashboard | width: 126px | width: 80px | width: 160px |

### 动画时长

- 进度过渡: 300ms
- 条纹流动: 1s
- 描边动画: 1s

## 可访问性

- 使用语义化的 HTML 结构
- 支持屏幕阅读器读取进度信息
- 进度变化时触发 change 事件
- 支持键盘导航和屏幕阅读器

## 注意事项

1. **百分比范围**: percentage 应在 0-100 之间，超出范围会被自动限制
2. **状态优先级**: 当 percentage 达到 100 时，会自动显示 success 状态
3. **条纹动画**: flow 属性仅在 striped 为 true 时生效
4. **文字位置**: textInside 仅对 line 类型有效
5. **性能**: 大量动态更新时建议使用 requestAnimationFrame 优化

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Alert](../Alert/README.md) - 警告提示组件
- [Message](../Message/README.md) - 消息提示组件
- [Spinner](../Spinner/README.md) - 加载动画组件
