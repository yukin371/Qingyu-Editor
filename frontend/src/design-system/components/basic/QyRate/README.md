# QyRate 组件

QyRate 是 Qingyu Design System 的评分组件，提供标准的评分交互功能。

## 文档

完整的组件文档和示例请参考：[Rate 组件文档](../../../form/Rate/README.md)

## 使用方式

```vue
<script setup lang="ts">
import { QyRate } from 'qingyu-design-system'
import { ref } from 'vue'

const score = ref(0)
</script>

<template>
  <QyRate v-model="score" :max="5" />
</template>
```

## 组件说明

QyRate 是 Rate 组件的重新导出版本，符合 Qingyu 组件命名规范。所有功能、属性和事件与原始 Rate 组件完全相同。

## 主要特性

- 支持 v-model 双向绑定
- 支持半星评分
- 支持只读模式
- 支持禁用状态
- 支持自定义尺寸和颜色
- 支持显示分数和文字
