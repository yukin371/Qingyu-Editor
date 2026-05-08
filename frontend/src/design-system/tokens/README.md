# 设计令牌系统

青羽项目的前端设计令牌系统，提供类型安全的设计规范和 Tailwind CSS 集成。

## 概述

设计令牌系统采用双层架构：
- **静态令牌**: `colors.ts`, `spacing.ts`, `typography.ts` - 提供编译时类型安全
- **动态主题**: `theme.ts` - 支持运行时主题切换

## 主题

### qingyu 主题（默认）
- **主色**: Cyan (#06b6d4) - 清新、现代
- **辅助色**: Blue (#3b82f6) - 稳重、可靠
- **渐变**: cyan-600 → blue-600

### 其他可用主题
- `berry`: 紫粉渐变主题（purple-600 → pink-600）
- `forest`: 绿蓝渐变主题（green-600 → cyan-600）

## 使用方式

### 在组件中使用令牌

#### TypeScript 组件
```typescript
import { colors, spacing, fontSize } from '@/design-system/tokens'

const buttonStyle = {
  backgroundColor: colors.primary[500],      // '#06b6d4'
  padding: `${spacing.padding.sm} ${spacing.padding.xl}`,  // '0.5rem 2rem' = 8px 32px
  fontSize: fontSize.base[0],                // '1rem'
}
```

#### Tailwind 类名
```html
<button class="bg-primary-500 px-4 py-2 text-base">
  点击我
</button>
```

#### 使用语义化颜色和组件间距
```typescript
import { semantic, component, borderRadius } from '@/design-system/tokens'

const cardStyle = {
  backgroundColor: semantic.background.DEFAULT,  // 使用中性色背景
  padding: component.card.md,                    // 24px 卡片内边距
  borderRadius: borderRadius.lg,                 // 8px 圆角
  color: semantic.text.primary,                  // 主要文本颜色
  borderColor: semantic.border.DEFAULT,          // 默认边框颜色
}

// 玻璃拟态卡片示例
const glassCardStyle = {
  backgroundColor: semantic.background.paper,
  boxShadow: `0 ${semantic.shadow.light}`,
  padding: component.card.lg,
}
```

### 主题切换

```typescript
import { setTheme, initTheme } from '@/design-system/tokens'

// 初始化主题（在应用启动时调用）
initTheme('qingyu')

// 切换到 berry 主题
setTheme('berry')

// 切换到 forest 主题
setTheme('forest')

// 切换回 qingyu 主题
setTheme('qingyu')
```

### 获取 Tailwind 配置

```typescript
import { tailwindThemeExtension } from '@/design-system/tokens'

// 在 tailwind.config.js 中使用
export default {
  theme: {
    extend: tailwindThemeExtension,
  }
}
```

## 令牌结构

### 颜色令牌 (`colors.ts`)

#### 品牌色
- **primary**: 主色系（cyan）
  - 50-900: 完整色阶
  - 400: 悬停状态
  - 500: 主色
  - 600: 激活状态
- **secondary**: 辅助色系（blue）
  - 50-900: 完整色阶
  - 500: 辅助色
  - 600: 深色状态

#### 渐变色
- **gradient**: 渐变配置
  - `from`: 渐变起点（cyan-600）
  - `to`: 渐变终点（blue-600）
  - `soft`: 柔和渐变（cyan-400 → blue-500）

#### 功能色
- **success**: 成功色（绿色系）
- **warning**: 警告色（黄色系）
- **danger**: 危险色（红色系）
- **info**: 信息色（蓝色系）

#### 中性色
- **neutral**: 灰度色系（50-950）

#### 语义化颜色（`semantic`）
- **background**: 背景色
  - `DEFAULT`: 默认背景（neutral-50）
  - `paper`: 纸张背景（白色）
  - `overlay`: 遮罩层背景（半透明黑色）
- **border**: 边框色
  - `DEFAULT`: 默认边框（neutral-200）
  - `focus`: 聚焦边框（primary-500）
- **text**: 文本色
  - `primary`: 主要文本（neutral-900）
  - `secondary`: 次要文本（neutral-600）
  - `disabled`: 禁用文本（neutral-400）
  - `inverse`: 反色文本（白色）
- **shadow**: 阴影色
  - `DEFAULT`: 默认阴影（10% 透明度）
  - `light`: 浅阴影（5% 透明度）
  - `medium`: 中阴影（15% 透明度）
  - `dark`: 深阴影（25% 透明度）

### 间距令牌 (`spacing.ts`)

#### 基础间距（`base`）
- **px**: 1px
- **0-96**: 以 0.25rem (4px) 为基础单位的完整刻度
- 包含所有 Tailwind 默认间距值（0, 0.5, 1, 1.5, 2, ... 96）

#### 语义化间距预设（`spacing`）
- **padding**: 内边距预设（none, xs, sm, md, lg, xl, 2xl, 3xl）
- **margin**: 外边距预设（none, xs, sm, md, lg, xl, 2xl, 3xl）
- **gap**: 间隙预设（0, xs, sm, md, lg, xl）

#### 组件间距（`component`）
- **button**: 按钮内边距（xs, sm, md, lg, xl）
- **input**: 输入框内边距（sm, md, lg）
- **card**: 卡片内边距（sm, md, lg）
- **form**: 表单项间距（item, section）

#### 圆角（`borderRadius`）
- **预设值**: none, sm, DEFAULT, md, lg, xl, 2xl, 3xl, full
- **值范围**: 0 到 9999px

#### Apple 风格间距（`glassmorphism`, `grid`, `animation`）
- **glassmorphism**: 玻璃拟态专用间距
  - `card`: 玻璃卡片内边距（sm, md, lg）
  - `blur`: 模糊区域外边距（sm, md, lg）
  - `floatShadow`: 浮动元素阴影扩散距离（sm, md, lg）
- **grid**: Apple 风格栅格间距
  - `macWindow`: macOS 窗口栅格（16px）
  - `iosApp`: iOS 应用网格（12px）
  - `dashboard`: 仪表盘卡片栅格（24px）
- **animation**: Apple 风格动画时序
  - `duration`: 动画时长（instant, fast, standard, slow）
  - `easing`: 缓动函数（ios, mac, spring）

### 字体令牌 (`typography.ts`)

#### 字体族
- **fontFamily**: 字体家族
  - `sans`: 中文字体（PingFang SC 优先）
  - `sansEn`: 英文字体（SF Pro 优先）
  - `mono`: 等宽字体（SF Mono 优先）

#### 字体大小
- **fontSize**: 字体大小（xs 到 9xl）
  - 移动端优先设计
  - 桌面端自动适配

#### 字体权重
- **fontWeight**: 字体粗细（字符串类型）
  - `thin`: '100'
  - `light`: '300'
  - `normal`: '400'
  - `medium`: '500'
  - `semibold`: '600'
  - `bold`: '700'
- **appleFontWeight**: Apple 风格字重（数字类型）
  - `light`: 300
  - `regular`: 400
  - `medium`: 500
  - `semibold`: 600
  - `bold`: 700

#### 字体预设
- **heading**: 标题字体（h1-h6）
- **body**: 正文字体（base, large, small）
- **caption**: 说明文字（small, tiny）

### 主题令牌 (`theme.ts`)

#### 主题配置
- **themes**: 所有可用主题
  - `qingyu`: 青蓝渐变主题（默认）
  - `berry`: 紫粉渐变主题
  - `forest`: 绿蓝渐变主题

#### 主题工具函数
- **setTheme()**: 切换主题
- **initTheme()**: 初始化主题
- **getTailwindColors()**: 获取 Tailwind 颜色配置
- **updateCSSVariables()**: 更新 CSS 变量

## Tailwind 集成

所有令牌通过 `tailwind.ts` 聚合后集成到 Tailwind CSS 配置中，`tailwind.config.js` 不再维护分散硬编码值。

```javascript
// tailwind.config.js
import { tailwindThemeExtension } from './src/design-system/tokens/tailwind'

export default {
  theme: {
    extend: tailwindThemeExtension
  },
}
```

`tailwindThemeExtension` 当前统一输出：
- 颜色（primary/secondary/success/warning/danger/info/slate/semantic）
- 间距、圆角、字体、字重、行高、字距
- 阴影、背景渐变、动画、过渡时序

### 使用示例

```html
<!-- 渐变按钮 -->
<button class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
  点击我
</button>

<!-- 玻璃拟态卡片 -->
<div class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl">
  卡片内容
</div>

<!-- 语义化颜色 -->
<div class="bg-glass text-text-primary border-border-default">
  语义化内容
</div>
```

## 类型定义

```typescript
// 颜色类型
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96

// 主题类型
export type ThemeName = 'qingyu' | 'berry' | 'forest'
export type ThemeColors = typeof qingyuTheme

// 设计令牌类型
export type DesignTokens = typeof designTokens
```

## 测试

运行令牌测试：

```bash
# 运行所有测试
npm run test

# 运行令牌测试
npm run test tokens

# 运行类型检查
npx tsc --noEmit --skipLibCheck
```

## 测试覆盖

测试文件位于 `__tests__/` 目录：
- `colors.test.ts`: 颜色令牌测试
- `spacing.test.ts`: 间距令牌测试
- `typography.test.ts`: 字体令牌测试
- `theme.test.ts`: 主题系统测试

## 参考

- [Apple 风格设计规范](../../../../docs/plans/2026-01-25-apple-style-tailwind-design-system.md)
- [Tailwind 主题集成指南](../../../../docs/guides/tailwind-theme-integration-guide.md)
- [前端重构 WBS](../../../../docs/plans/2026-01-23-frontend-tailwind-ui-refactor-wbs.md)
- [设计令牌系统统一实施计划](../../../../docs/plans/2026-01-27-design-token-system-alignment.md)

## 更新日志

### v1.0.0 (2026-01-27)
- 完成颜色令牌系统（qingyu 主题）
- 完成 Apple 风格间距系统
- 完成 Apple 风格字体系统
- 完成主题切换功能
- 完成 Tailwind CSS 集成
- 添加完整的测试覆盖

## 维护者

青羽项目团队

---

**最后更新**: 2026-02-08
