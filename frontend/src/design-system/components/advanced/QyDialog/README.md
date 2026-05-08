# QyDialog 组件

QyDialog 是 Qingyu Design System 的对话框组件，提供标准的对话框交互功能。

## 文档

完整的组件文档和示例请参考：[Dialog 组件文档](../../../feedback/Dialog/README.md)

## 使用方式

```vue
<script setup lang="ts">
import { QyDialog, QyDialogFooter } from 'qingyu-design-system'
</script>

<template>
  <QyDialog
    v-model:visible="visible"
    title="对话框标题"
  >
    <p>对话框内容</p>
    <template #footer>
      <QyDialogFooter>
        <button @click="visible = false">取消</button>
        <button @click="handleConfirm">确定</button>
      </QyDialogFooter>
    </template>
  </QyDialog>
</template>
```

## 组件说明

QyDialog 是 Dialog 组件的重新导出版本，符合 Qingyu 组件命名规范。所有功能、属性和事件与原始 Dialog 组件完全相同。
