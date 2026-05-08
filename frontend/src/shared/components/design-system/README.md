# 青羽设计系统 (Qingyu Design System)

> 统一的用户端设计系统，提供一致的视觉体验和交互规范

## 📐 设计原则

### 1. 一致性 (Consistency)
- 统一的颜色、字体、间距规范
- 可预测的交互行为
- 标准化的组件使用方式

### 2. 简洁性 (Simplicity)
- 清晰的信息层级
- 减少不必要的装饰
- 突出核心功能

### 3. 响应式 (Responsive)
- 适配多种屏幕尺寸
- 流畅的移动端体验
- 合理的断点设计

### 4. 可访问性 (Accessibility)
- 合理的颜色对比度
- 键盘导航支持
- 语义化的HTML结构

---

## 🎨 设计Token

### 颜色系统

#### 主色调 - 青羽蓝
```typescript
import { colors } from '@/shared/components/design-system'

colors.primary[500] // #2196F3
```

**使用场景**：
- 主要操作按钮
- 链接文字
- 选中状态
- 品牌标识

#### 功能色
- **成功色** (Success): `#4CAF50` - 成功提示、完成状态
- **警告色** (Warning): `#FF9800` - 警告信息、需注意事项
- **错误色** (Error): `#F44336` - 错误提示、危险操作
- **信息色** (Info): `#03A9F4` - 一般信息提示

#### 中性色
用于文字、边框、背景等

```typescript
colors.gray[900]  // #212121 - 主要文字
colors.gray[600]  // #757575 - 次要文字
colors.gray[400]  // #BDBDBD - 禁用文字
colors.gray[300]  // #E0E0E0 - 边框
colors.gray[100]  // #F5F5F5 - 背景
```

### 间距系统

基于 4px 栅格系统：

```typescript
import { spacing, getSpacing } from '@/shared/components/design-system'

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px

// 或使用函数
getSpacing(4)  // 16px (4 * 4px)
```

### 排版系统

#### 字体族
```typescript
typography.fontFamily.base      // 系统默认字体
typography.fontFamily.chinese   // 中文优化字体
typography.fontFamily.mono      // 等宽字体
```

#### 标题样式
```typescript
// H1 - 页面主标题
typography.heading.h1  // 36px / 700 / 1.25

// H2 - 区块标题
typography.heading.h2  // 30px / 700 / 1.25

// H3 - 小节标题
typography.heading.h3  // 24px / 600 / 1.3

// H4-H6 - 辅助标题
```

#### 正文样式
```typescript
typography.body.large    // 18px - 突出显示
typography.body.default  // 16px - 标准正文
typography.body.small    // 14px - 辅助信息
typography.body.tiny     // 12px - 次要信息
```

---

## 🧩 组件库

### 布局组件

#### Container - 容器组件
```vue
<template>
  <Container maxWidth="lg" padding centered>
    <!-- 内容 -->
  </Container>
</template>
```

**Props**:
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (默认: 'lg')
- `padding`: boolean (默认: true) - 是否添加左右内边距
- `centered`: boolean (默认: true) - 是否居中
- `fluid`: boolean (默认: false) - 是否全宽

#### Section - 区块组件
```vue
<template>
  <Section title="标题" spacing="md" bordered>
    <template #extra>
      <el-button>操作</el-button>
    </template>
    <!-- 内容 -->
  </Section>
</template>
```

**Props**:
- `title`: string - 区块标题
- `spacing`: 'sm' | 'md' | 'lg' (默认: 'md')
- `bordered`: boolean (默认: false) - 是否显示边框
- `background`: boolean (默认: false) - 是否显示背景色

**Slots**:
- `title` - 自定义标题区域
- `extra` - 标题右侧额外内容
- `default` - 主要内容

#### Grid - 网格组件
```vue
<template>
  <Grid :cols="3" gap="md">
    <div>项目1</div>
    <div>项目2</div>
    <div>项目3</div>
  </Grid>
</template>
```

**Props**:
- `cols`: number (默认: 3) - 列数（响应式自适应）
- `gap`: 'sm' | 'md' | 'lg' (默认: 'md')
- `align`: 'start' | 'center' | 'end' | 'stretch'
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around'

### 表单组件

#### FormCard - 表单卡片
```vue
<template>
  <FormCard 
    title="基本信息"
    description="请填写您的基本信息"
    @submit="handleSubmit"
    @cancel="handleCancel"
    :loading="submitting"
  >
    <el-form>
      <!-- 表单内容 -->
    </el-form>
  </FormCard>
</template>
```

**Props**:
- `title`: string - 卡片标题
- `description`: string - 描述文字
- `shadow`: 'always' | 'hover' | 'never' (默认: 'hover')
- `showFooter`: boolean (默认: true)
- `showCancel`: boolean (默认: true)
- `submitText`: string (默认: '提交')
- `cancelText`: string (默认: '取消')
- `loading`: boolean (默认: false)

**Events**:
- `submit` - 提交事件
- `cancel` - 取消事件

#### FormSection - 表单区块
```vue
<template>
  <FormSection 
    label="用户名" 
    description="4-20个字符"
    hint="只能包含字母、数字和下划线"
    required
  >
    <el-input v-model="username" />
  </FormSection>
</template>
```

**Props**:
- `label`: string - 字段标签
- `description`: string - 字段描述
- `hint`: string - 提示文字
- `required`: boolean (默认: false) - 是否必填
- `layout`: 'vertical' | 'horizontal' (默认: 'vertical')

### 反馈组件

#### LoadingOverlay - 加载遮罩
```vue
<template>
  <LoadingOverlay 
    :visible="loading" 
    text="加载中..."
    :fullscreen="true"
  />
</template>
```

**Props**:
- `visible`: boolean (默认: false)
- `text`: string - 加载文字
- `iconSize`: number (默认: 48)
- `fullscreen`: boolean (默认: false) - 是否全屏
- `background`: string (默认: 'rgba(255, 255, 255, 0.9)')
- `closeOnClick`: boolean (默认: false)

#### ConfirmDialog - 确认对话框
```vue
<template>
  <ConfirmDialog
    v-model:visible="showDialog"
    title="确认删除"
    message="确定要删除这条记录吗？"
    description="删除后无法恢复"
    type="danger"
    @confirm="handleDelete"
  />
</template>
```

**Props**:
- `visible`: boolean (默认: false)
- `title`: string (默认: '确认')
- `message`: string (必填) - 主要信息
- `description`: string - 补充说明
- `type`: 'warning' | 'info' | 'success' | 'danger' (默认: 'warning')
- `showIcon`: boolean (默认: true)
- `confirmText`: string (默认: '确定')
- `cancelText`: string (默认: '取消')
- `showCancel`: boolean (默认: true)
- `confirmType`: 'primary' | 'success' | 'warning' | 'danger'
- `loading`: boolean (默认: false)

**Events**:
- `update:visible` - 显示状态变化
- `confirm` - 确认事件
- `cancel` - 取消事件
- `close` - 关闭事件

---

## 📱 响应式断点

```scss
// 移动端
@media (max-width: 640px) { }

// 平板
@media (min-width: 641px) and (max-width: 1024px) { }

// 桌面端
@media (min-width: 1025px) { }
```

---

## 🎯 使用示例

### 完整页面示例

```vue
<template>
  <Container maxWidth="lg" padding>
    <!-- 页面头部 -->
    <Section title="我的钱包" spacing="lg">
      <template #extra>
        <el-button type="primary" @click="showRecharge = true">充值</el-button>
      </template>
      
      <!-- 统计卡片 -->
      <Grid :cols="3" gap="lg">
        <el-card>
          <div class="stat-card">
            <p class="stat-label">账户余额</p>
            <p class="stat-value">¥{{ balance }}</p>
          </div>
        </el-card>
        <!-- 更多卡片 -->
      </Grid>
    </Section>
    
    <!-- 表单区域 -->
    <FormCard
      title="充值"
      description="选择充值金额"
      @submit="handleRecharge"
      @cancel="showRecharge = false"
      :loading="recharging"
    >
      <FormSection label="充值金额" required>
        <el-input-number v-model="amount" :min="1" />
      </FormSection>
      
      <FormSection label="支付方式" required>
        <el-radio-group v-model="payMethod">
          <el-radio label="alipay">支付宝</el-radio>
          <el-radio label="wechat">微信支付</el-radio>
        </el-radio-group>
      </FormSection>
    </FormCard>
    
    <!-- 加载状态 -->
    <LoadingOverlay :visible="loading" text="处理中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Container, Section, Grid, FormCard, FormSection, LoadingOverlay } from '@/shared/components/design-system'

const balance = ref(0)
const loading = ref(false)
const showRecharge = ref(false)
const recharging = ref(false)
const amount = ref(100)
const payMethod = ref('alipay')

const handleRecharge = async () => {
  recharging.value = true
  try {
    // API调用
  } finally {
    recharging.value = false
  }
}
</script>
```

---

## 🔧 最佳实践

### 1. 统一导入
```typescript
// 推荐：从设计系统统一导入
import { Container, Section, colors, spacing } from '@/shared/components/design-system'

// 避免：直接从具体文件导入
import Container from '@/shared/components/design-system/layouts/Container.vue'
```

### 2. 使用Token而非硬编码
```vue
<!-- ✅ 推荐 -->
<div :style="{ padding: spacing.md, color: colors.primary[500] }">

<!-- ❌ 避免 -->
<div style="padding: 16px; color: #2196F3">
```

### 3. 组件组合
```vue
<!-- ✅ 推荐：使用设计系统组件组合 -->
<Container>
  <Section title="标题">
    <FormCard>
      <FormSection label="字段">
        <el-input />
      </FormSection>
    </FormCard>
  </Section>
</Container>

<!-- ❌ 避免：直接使用ElementPlus组件堆砌 -->
<div class="container">
  <el-card>
    <el-form-item label="字段">
      <el-input />
    </el-form-item>
  </el-card>
</div>
```

### 4. 保持一致性
- 相同功能使用相同组件
- 相同间距使用相同Token
- 相同颜色使用相同变量

---

## 📚 参考资源

- **ElementPlus**: https://element-plus.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Material Design**: https://material.io/design

---

## 🔄 更新日志

### v1.0.0 (2025-10-29)
- ✅ 初始版本发布
- ✅ 设计Token定义（颜色、间距、排版）
- ✅ 布局组件（Container、Section、Grid）
- ✅ 表单组件（FormCard、FormSection）
- ✅ 反馈组件（LoadingOverlay、ConfirmDialog）

---

**维护者**: 青羽前端团队  
**最后更新**: 2025-10-29

