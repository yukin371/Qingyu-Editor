# design-system 模块上下文

## 模块职责

- 作为前端基础 UI 的 canonical owner，维护基础组件、反馈组件、表单控件、数据展示、导航原语、设计令牌、主题和通用交互约定。
- 通过 Storybook stories 提供可视化展示、验收基线和复用入口，让页面开发先从已有组件能力出发，而不是从页面临时拼装开始。
- 为业务模块提供稳定、统一的视觉和交互底座，减少在 `modules/*/views` 中重复实现按钮、输入框、分页、弹窗、下拉等基础能力。

## Owns

- `src/design-system/base`、`components`、`data`、`feedback`、`form`、`navigation`、`layout`、`other` 中的通用基础组件。
- `src/design-system/tokens`、`themes`、`utils`、`assets` 中的设计令牌、主题和辅助能力。
- `src/design-system/stories` 以及各组件目录下的 `*.stories.ts`，用于表达组件 API、状态和验收基线。
- 跨模块通用的视觉语义和基础交互 API，例如输入框、下拉、表格、分页、弹窗、加载态、空状态。

## Must not own

- 不拥有任何业务域的字段语义、默认文案、接口流程、权限规则和模块状态真相。
- 不直接承担某个业务模块的页面编排；复杂业务流程应在 `src/modules/*/components` 中基于 design-system 组合实现。
- 不把 Storybook 组件演示写成脱离真实使用场景的“展示壳”；story 必须服务于复用和验收，而不是生成第二套说明体系。

## 关键依赖

- Vue 3、TypeScript、Tailwind CSS，以及前端当前启用的 Storybook 配置（`.storybook/`）。
- `src/design-system/services` 暴露的交互服务能力。
- `docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md` 与父仓库 `docs/ARCHITECTURE_GUARDRAILS.md` 中定义的 owner 边界。

## 不变量

- Storybook 中展示的基础组件是前端复用基线；新增页面或模块专有组件前，必须先确认是否已有可复用的 design-system 能力。
- design-system 负责“通用 UI 能力”，module components 负责“业务语义封装”；两者不能互相吞并职责。
- 如果某个页面修复需要反复通过局部样式覆盖来维持一致性，说明问题通常不该停留在页面层，而应回收到 design-system 或模块专有组件。
- `shared/components` 不是新的基础 UI owner；真正的基础控件收口在 `src/design-system`。

## 常见坑

1. 直接在页面中混用 Element Plus、design-system 和手写样式，会让输入框、分页、弹窗和下拉的交互细节迅速漂移。
2. 把模块专有字段映射、默认文案和权限逻辑塞进 design-system，会让基础组件 API 被业务污染，后续难以复用。
3. 只改组件实现不补 story，会让后续页面无法从 Storybook 判断正确用法，也无法稳定回归验收。

## 文档同步触发条件

- 新增或调整基础组件分类、设计令牌体系、主题切换机制、Storybook 组织方式时，需同步本文件与父仓库前端标准。
- 当某类页面问题被证明是通用基础交互缺陷，而不是单模块专有问题时，应在 design-system 收口并补 story，再更新本文件中的边界说明。
