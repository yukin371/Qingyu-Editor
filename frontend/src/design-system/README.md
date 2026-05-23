# Qingyu Design System

编辑器前端的基础 UI owner。这里维护通用组件、设计令牌、主题、交互服务以及 Storybook 基线，供 `writer` 和 `ai` 模块复用。

如果你要修页面样式、补新控件、统一交互行为，先从这里找现有 owner，不要直接在业务页面里复制一套按钮、弹窗、输入框或主题变量。

## 它拥有的东西

- `tokens/`：颜色、排版、间距、主题真相源
- `themes/`：编辑器主题与主题样式
- `components/`：当前推荐优先复用的 `Qy*` 组件库
- `base/`、`form/`、`data/`、`feedback/`、`navigation/`、`layout/`、`other/`：兼容层与低层原语
- `stories/` 与各组件目录下的 `*.stories.ts`：Storybook 展示与验收基线
- `services/`、`utils/`：与基础交互相关的共享辅助能力

## 目录结构

```text
src/design-system/
├── tokens/                 设计令牌与主题真相
├── themes/                 编辑器主题样式
├── components/             推荐优先使用的 Qy 组件库
├── base/                   基础原语
├── form/                   表单控件
├── data/                   数据展示控件
├── feedback/               提示、弹窗、通知、加载等
├── navigation/             导航类组件
├── layout/                 栅格与布局容器
├── other/                  其他通用控件
├── services/               与基础交互相关的服务能力
├── stories/                统一 stories
├── utils/                  工具函数
└── index.ts                统一导出入口
```

## 使用优先级

### 1. 优先使用 `Qy*` 组件

当前推荐的公共消费面是 `components/` 下的 `Qy*` 组件：

```ts
import { QyButton, QyInput, QyDialog } from '@/design-system/components'
```

适用场景：

- 新页面或新功能的基础 UI
- 需要稳定 API 和更清晰业务组合边界的地方
- 计划长期维护的工作台组件

### 2. 兼容层只在必要时使用

`base/`、`form/`、`data/` 等目录仍然保留，是为了：

- 兼容历史页面
- 承接尚未完全迁移到 `Qy*` 的能力
- 提供更低层的基础原语

如果你新增的是长期公共能力，优先考虑落在 `components/`；如果你只是补一个迁移期过渡点，再考虑兼容层。

### 3. 业务语义不要塞进 design-system

design-system 不应拥有：

- writer/ai 的业务字段语义
- 接口流程、权限规则、默认文案真相
- 页面级状态管理

这些应继续留在 `src/modules/*`。

## 常见工作流

### 新增一个基础组件

建议至少补齐以下内容：

1. 组件实现
2. 类型定义
3. `index.ts` 导出
4. `README.md`
5. `*.stories.ts`
6. 必要测试

### 修复一个跨页面的交互问题

优先判断问题属于哪一层：

- 视觉/交互基线问题：收口到 design-system
- 业务页面编排问题：收口到对应模块组件
- 主题变量漂移：收口到 `tokens/` 或 `themes/`

### 调整主题或令牌

先看：

- [tokens/README.md](./tokens/README.md)
- [MODULE.md](./MODULE.md)
- `tokens/theme.ts`
- `tokens/theme.css`

避免在业务页面通过大量局部覆盖来“临时修好”主题问题。

## Storybook 与验证

当设计系统发生变更时，常用验证方式包括：

```bash
# 启动 Storybook
npm run storybook

# 构建 Storybook
npm run build-storybook

# 前端单测
npm run test:vitest:run

# 类型检查
npm run type-check
```

如果改动影响多个页面，但你没有同步 story 或测试，这通常说明改动还没有真正收口到基础层。

## 你改这里时要记住

- `src/design-system` 是基础 UI owner，不是业务页面拼装区
- 新能力先查现有导出面，避免造第二套 `Button` / `Dialog` / `Select`
- 兼容层不是长期扩张目标，长期复用能力优先回收到 `Qy*` 组件面
- `shared/components` 不是新的基础控件 owner

## 相关文档

- [MODULE.md](./MODULE.md)
- [tokens/README.md](./tokens/README.md)
- [../../README.md](../../README.md)
- [../../../docs/developer-guide.md](../../../docs/developer-guide.md)
