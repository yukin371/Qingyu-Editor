# Row 组件

基于 Flexbox 的行布局容器组件，用于创建灵活的网格布局系统。

## 特性

- 📐 **Flexbox 布局** - 基于 CSS Flexbox 的灵活布局
- 🎯 **对齐控制** - 支持水平和垂直对齐
- 📏 **间距系统** - 内置 gutter 间距支持
- 🔄 **换行控制** - 可控制子元素是否换行
- 🎨 **深色模式** - 自动支持深色模式
- 📱 **响应式** - 配合 Col 组件实现响应式布局

## 基本用法

```vue
<script setup>
import { Row, Col } from '@/design-system'
</script>

<template>
  <Row>
    <Col :span="6">列 1</Col>
    <Col :span="6">列 2</Col>
    <Col :span="12">列 3</Col>
  </Row>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| justify | 水平对齐方式 | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'start'` |
| align | 垂直对齐方式 | `'top' \| 'center' \| 'bottom' \| 'stretch'` | `'top'` |
| gutter | 列之间的间距（像素） | `number` (0, 8, 16, 24, 32) | `0` |
| wrap | 是否换行 | `boolean` | `true` |
| class | 自定义类名 | `any` | - |

### justify 水平对齐

- `start` - 左对齐（默认）
- `center` - 居中对齐
- `end` - 右对齐
- `space-between` - 两端对齐，项目之间间隔相等
- `space-around` - 每个项目两侧的间隔相等
- `space-evenly` - 所有间隔相等

```vue
<Row justify="center">
  <Col :span="8">居中内容</Col>
</Row>

<Row justify="space-between">
  <Col :span="8">左侧</Col>
  <Col :span="8">右侧</Col>
</Row>
```

### align 垂直对齐

- `top` - 顶部对齐（默认）
- `center` - 居中对齐
- `bottom` - 底部对齐
- `stretch` - 拉伸以适应容器高度

```vue
<Row align="center" class="h-64">
  <Col :span="8">垂直居中</Col>
</Row>

<Row align="stretch" class="h-64">
  <Col :span="8">
    <div class="h-full">拉伸内容</div>
  </Col>
</Row>
```

### gutter 间距

通过 `gutter` 属性设置列之间的间距：

```vue
<Row :gutter="16">
  <Col :span="6">列 1</Col>
  <Col :span="6">列 2</Col>
  <Col :span="12">列 3</Col>
</Row>
```

可用的间距值：
- `0` - 无间距
- `8` - 8px 间距
- `16` - 16px 间距
- `24` - 24px 间距
- `32` - 32px 间距

### wrap 换行

控制子元素是否换行：

```vue
<!-- 允许换行（默认） -->
<Row :wrap="true">
  <Col :span="8">列 1</Col>
  <Col :span="8">列 2</Col>
  <Col :span="8">列 3</Col>
  <Col :span="8">列 4</Col>
</Row>

<!-- 不换行 -->
<Row :wrap="false">
  <Col :span="6">列 1</Col>
  <Col :span="6">列 2</Col>
  <Col :span="6">列 3</Col>
</Row>
```

## 常见布局示例

### 两栏布局

```vue
<Row :gutter="16">
  <Col :span="8">
    <div class="bg-gray-100 p-4">侧边栏</div>
  </Col>
  <Col :span="16">
    <div class="bg-gray-100 p-4">主内容</div>
  </Col>
</Row>
```

### 三栏布局

```vue
<Row :gutter="16">
  <Col :span="6">
    <div class="bg-gray-100 p-4">左侧栏</div>
  </Col>
  <Col :span="12">
    <div class="bg-gray-100 p-4">主内容</div>
  </Col>
  <Col :span="6">
    <div class="bg-gray-100 p-4">右侧栏</div>
  </Col>
</Row>
```

### 四栏网格

```vue
<Row :gutter="16">
  <Col :span="6">
    <div class="bg-gray-100 p-4">项目 1</div>
  </Col>
  <Col :span="6">
    <div class="bg-gray-100 p-4">项目 2</div>
  </Col>
  <Col :span="6">
    <div class="bg-gray-100 p-4">项目 3</div>
  </Col>
  <Col :span="6">
    <div class="bg-gray-100 p-4">项目 4</div>
  </Col>
</Row>
```

### 居中布局

```vue
<Row justify="center" align="center" class="h-screen">
  <Col :span="12">
    <div class="bg-gray-100 p-4 text-center">居中内容</div>
  </Col>
</Row>
```

## 嵌套布局

Row 和 Col 组件可以无限嵌套：

```vue
<Row :gutter="16">
  <Col :span="12">
    <div class="bg-gray-100 p-4">
      <h3>左侧区域</h3>
      <Row :gutter="8">
        <Col :span="12">
          <div class="bg-white p-2">嵌套 1</div>
        </Col>
        <Col :span="12">
          <div class="bg-white p-2">嵌套 2</div>
        </Col>
      </Row>
    </div>
  </Col>
  <Col :span="12">
    <div class="bg-gray-100 p-4">
      <h3>右侧区域</h3>
      <Row :gutter="8">
        <Col :span="8">
          <div class="bg-white p-2">嵌套 3</div>
        </Col>
        <Col :span="16">
          <div class="bg-white p-2">嵌套 4</div>
        </Col>
      </Row>
    </div>
  </Col>
</Row>
```

## 与 Col 组件配合

Row 组件需要与 Col 组件配合使用。查看 [Col 组件文档](../Col/README.md) 了解更多关于列组件的信息。

## 设计规范

- 基于 CSS Flexbox 布局
- 使用 Tailwind CSS 的 flex 工具类
- gutter 通过负 margin 和 Col 的 padding 实现
- 支持深色模式
- 响应式设计

## 注意事项

1. **gutter 实现** - gutter 通过负 margin 和 Col 组件的 padding 实现，确保 Col 组件正确导入
2. **嵌套使用** - 嵌套的 Row 组件可以有自己的 gutter 值
3. **响应式** - 响应式布局通过 Col 组件的断点实现
4. **容器高度** - 使用 `align="stretch"` 时，需要给 Row 设置固定高度

## 相关组件

- [Col 组件](../Col/README.md) - 列布局组件
- [Container 组件](../Container/README.md) - 容器组件

## 更新日志

- 2026-01-23: 初始版本发布
