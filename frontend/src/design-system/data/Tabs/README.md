# Tabs 标签页组件

标签页组件，用于在同一个页面切换显示不同的内容区域。

## 基本用法

最简单的用法，通过 `v-model` 绑定当前激活的标签。

```vue
<Tabs v-model="activeTab">
  <TabPane name="1" label="用户管理">
    用户管理的内容
  </TabPane>
  <TabPane name="2" label="角色管理">
    角色管理的内容
  </TabPane>
  <TabPane name="3" label="权限管理">
    权限管理的内容
  </TabPane>
</Tabs>
```

## 类型

支持三种标签页类型：`line`（默认）、`card`、`border-card`。

```vue
<!-- Line 类型 -->
<Tabs v-model="activeTab" type="line">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
  <TabPane name="2" label="标签 2">内容 2</TabPane>
</Tabs>

<!-- Card 类型 -->
<Tabs v-model="activeTab" type="card">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
  <TabPane name="2" label="标签 2">内容 2</TabPane>
</Tabs>

<!-- Border-card 类型 -->
<Tabs v-model="activeTab" type="border-card">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
  <TabPane name="2" label="标签 2">内容 2</TabPane>
</Tabs>
```

## 位置

标签页可以放在顶部、右侧、底部、左侧。

```vue
<!-- 顶部（默认） -->
<Tabs v-model="activeTab" tab-position="top">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
</Tabs>

<!-- 右侧 -->
<Tabs v-model="activeTab" tab-position="right">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
</Tabs>

<!-- 底部 -->
<Tabs v-model="activeTab" tab-position="bottom">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
</Tabs>

<!-- 左侧 -->
<Tabs v-model="activeTab" tab-position="left">
  <TabPane name="1" label="标签 1">内容 1</TabPane>
</Tabs>
```

## 自适应宽度

设置 `stretch` 属性可以让标签宽度自适应容器宽度。

```vue
<Tabs v-model="activeTab" stretch>
  <TabPane name="1" label="短">内容 1</TabPane>
  <TabPane name="2" label="中等长度">内容 2</TabPane>
  <TabPane name="3" label="标签 3">内容 3</TabPane>
</Tabs>
```

## 可关闭标签

设置 `closable` 属性可以让标签可关闭。

```vue
<Tabs v-model="activeTab" closable>
  <TabPane name="1" label="标签 1">内容 1</TabPane>
  <TabPane name="2" label="标签 2">内容 2</TabPane>
  <TabPane name="3" label="标签 3" :closable="false">
    内容 3（不可关闭）
  </TabPane>
</Tabs>
```

## 禁用状态

通过 `disabled` 属性可以禁用某个标签。

```vue
<Tabs v-model="activeTab">
  <TabPane name="1" label="可点击">正常内容</TabPane>
  <TabPane name="2" label="禁用" :disabled="true">
    禁用内容
  </TabPane>
</Tabs>
```

## 自定义标签

通过 `label` 插槽可以自定义标签内容。

```vue
<Tabs v-model="activeTab">
  <TabPane name="1">
    <template #label>
      <div class="flex items-center gap-2">
        <span>📝</span>
        <span>待办事项</span>
        <span class="badge">3</span>
      </div>
    </template>
    待办事项的内容
  </TabPane>
</Tabs>
```

## 动态标签

可以通过动态数据渲染标签页。

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('1')
const tabs = ref([
  { name: '1', label: 'Tab 1', content: 'Content 1' },
  { name: '2', label: 'Tab 2', content: 'Content 2' },
])

const addTab = () => {
  const newTab = {
    name: String(tabs.value.length + 1),
    label: `Tab ${tabs.value.length + 1}`,
    content: `Content ${tabs.value.length + 1}`,
  }
  tabs.value.push(newTab)
  activeTab.value = newTab.name
}

const removeTab = (targetName) => {
  tabs.value = tabs.value.filter(tab => tab.name !== targetName)
}
</script>

<template>
  <Tabs v-model="activeTab" closable>
    <TabPane
      v-for="tab in tabs"
      :key="tab.name"
      :name="tab.name"
      :label="tab.label"
    >
      {{ tab.content }}
    </TabPane>
  </Tabs>
  <button @click="addTab">添加标签</button>
</template>
```

## API

### Tabs Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| modelValue | 绑定值，当前激活的标签 | string / number | — | — |
| type | 标签页类型 | string | line / card / border-card | 'line' |
| tabPosition | 标签页位置 | string | top / right / bottom / left | 'top' |
| stretch | 标签宽度是否自适应 | boolean | — | false |
| closable | 标签是否可关闭 | boolean | — | false |

### Tabs Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | v-model 更新事件 | (value: string \| number) |
| tabClick | 标签点击事件 | (pane: TabPaneInstance, event: MouseEvent) |
| tabChange | 标签切换事件 | (name: string \| number) |
| tabRemove | 标签移除事件 | (name: string \| number, event: MouseEvent) |

### Tabs Slots

| 插槽名 | 说明 |
| --- | --- |
| default | TabPane 内容 |
| content | 自定义内容区域 |

### TabPane Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| label | 标签标题 | string | — | — |
| name | 标签标识符 | string / number | — | — |
| disabled | 是否禁用 | boolean | — | false |
| closable | 是否可关闭 | boolean | — | false |

### TabPane Slots

| 插槽名 | 说明 |
| --- | --- |
| label | 自定义标签内容 |
| default | 面板内容 |

## 样式定制

组件使用 Tailwind CSS 构建，可以通过 `class` 属性进行样式定制。

```vue
<Tabs v-model="activeTab" class="custom-tabs">
  <TabPane name="1" label="标签 1" class="custom-tab-pane">
    内容 1
  </TabPane>
</Tabs>
```

## 无障碍访问

组件遵循 WAI-ARIA 规范，支持键盘导航和屏幕阅读器。

- 使用 `role="tablist"` 和 `role="tab"` 标识标签页结构
- 使用 `aria-selected` 标识当前激活的标签
- 使用 `aria-disabled` 标识禁用的标签
- 支持 Tab 键导航

## 示例

### 配合表单使用

```vue
<Tabs v-model="activeTab" type="border-card">
  <TabPane name="basic" label="基础信息">
    <form class="space-y-4">
      <div>
        <label>用户名</label>
        <input type="text" />
      </div>
      <div>
        <label>邮箱</label>
        <input type="email" />
      </div>
    </form>
  </TabPane>
  <TabPane name="advanced" label="高级设置">
    <form class="space-y-4">
      <div>
        <label>通知偏好</label>
        <select>
          <option>邮件</option>
          <option>短信</option>
        </select>
      </div>
    </form>
  </TabPane>
</Tabs>
```

### 内容预加载

```vue
<Tabs v-model="activeTab">
  <TabPane name="1" label="标签 1">
    <Suspense>
      <AsyncComponent1 />
    </Suspense>
  </TabPane>
  <TabPane name="2" label="标签 2">
    <Suspense>
      <AsyncComponent2 />
    </Suspense>
  </TabPane>
</Tabs>
```
