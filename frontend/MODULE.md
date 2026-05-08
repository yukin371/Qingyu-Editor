# Qingyu_fronted 模块上下文

## 模块职责

- 实现 Vue 3 + Vite 前端用户体验，承接书店、阅读器、写作、社交、财务等面向用户的交互面。
- 提供 Editor V3 / Story Harness 工具链，聚焦写作流程闭环与 AI 建议展现。
- 维护与后端的 API contract（Writer Studio、Reader Flow、AI Workbench）和 Playwright/Vitest 验证脚本。

## Owns

- `src/modules/writer`、`reader`、`bookstore` 等核心业务模块的界面与 state 管理。
- Editor V3 相关的工作流、组件、Story Lab 等界面逻辑以及与 AI 建议的交互边界。
- `src/design-system` 作为前端基础组件、设计令牌、主题和 Storybook 展示基线的唯一 owner。
- 前端本地开发/构建说明（`README`、`docs/QUICK_START.md`、`docs/USER_GUIDE.md` 等）。
- 包含自己运行的测试/可视化脚本（如 Playwright smoke、Vitest coverage）以及 `pnpm`/`npm` 工作流，用于本地验证。

## Must not own

- 不将跨仓库治理文档写回子模块 `docs/plans/`；跨仓库规划应迁回父仓库并参考 `docs/plans/submodules/frontend/` 的迁移要求。
- 不直接担当后端 API 或 AI Agent 的权威，所有接口改动必须与 `Qingyu_backend` 唯一同步。
- 不直接承担后端数据持久化、中间件、AI 运行时等关注点，仅在边界明确的情况下消费暴露的能力。
- 不在 `shared/components`、页面 `views` 或各业务模块中继续扩散第二套基础 UI 组件 owner；基础控件统一收口到 `src/design-system`。

## 关键依赖

- 后端 Go 服务提供的 API、Reader/Writer/Notification/AI 接口。
- `Qingyu_backend` 与 `Qingyu-Ai-Service` 约定的 DTO、错误规则与响应格式。
- Editor V3 相关的 story harness 设计文档（`docs/plans/v3`）与 `docs/analysis` 中的迁移审计。
- Node/Vite 工具链（`package.json` 脚本、 Playwright/Vitest 工作流）用于快速验证与构建。

## 不变量

- Editor V3 目前仍在 Phase 1/Phase 2 迭代，任何体验改动应保留“轻量建议 → 作者确认 → 状态投影”闭环。
- `docs/plans/v3` 目录只承载当前活跃专题，新增内容必须遵循目录分类与 `README` 维护规则。
- Playwright/Vitest 作为主验证路径，不得跳过，改动后必须通过对应 smoke/check scripts。
- 与后端约定的 API contract（包括命名、错误码）必须保持一致，任何不确定项标注 `TBD` 并列出验证/确认路径。
- 钱包、充值、提现、作者收益等财务前端能力统一归 `src/modules/finance` owner，`shared` 只允许承载真正跨域复用的 UI/基础设施，不再继续扩展历史 `wallet` 业务逻辑。
- 阅读器的付费章节展示与购买入口属于 `reader/bookstore` 体验层，但余额、交易、提现数据必须复用 `finance` 契约，不能各自维护影子账本或第二套钱包适配层。
- Storybook 中已展示的 design-system 组件视为前端基础交互基线；新增页面默认先复用这些组件，再在 `modules/*/components` 中封装业务专有组合。
- `modules/*/views` 只做页面编排；如果某个筛选条、表格工具栏、表单片段会在同一模块内重复出现，必须沉淀到该模块的 `components/`，而不是继续散落在页面里。

## 常见坑

1. 不清晰的 boundary 常导致重复实现 shared helper，修改前需确认是否已有 backend API/AI 事件。
2. Editor V3 尚在热迭代，要避免把功能需求写成长期计划并留在子模块 `docs/plans/`；活跃 track 需在父仓库 roadmap/plan 明确。
3. 由于命名 drift（如 `writer`, `writer-v2` 等）仍存在，组件命名与 API 请求必须统一 vocab，以免 contract 失配。
4. Playwright smoke 依赖 root `package-lock.json` + submodule env，忽略安装/版本管理会导致验证提前失败。
5. 页面层直接混用 Element Plus、design-system 和手写样式，通常会造成输入框、分页、弹窗 footer/header 等交互不一致；这类问题应优先回收到 design-system 或模块专有组件，而不是继续在页面打补丁。

## 文档同步触发条件

- Editor V3 任何体验边界、AI 交互、验证策略、phase 交付定义变化必须更新 `docs/plans/v3/` 的专题 `implementation`/`overview` 文档并同步父仓库 roadmap。
- 出现新的 shared UI 能力、状态管理抽象，需在父仓库 roadmap/architecture 说明 owner 与依赖边界。
- 新增或调整 design-system 基础组件复用规则、Storybook 作为基线的约定、`shared/components` 与 `modules/*/components` 的 owner 边界时，必须同步本文件和父仓库前端标准。
- 与后端接口 contract、AI 服务交互定义更新时，需同步 `README`、`docs/api` 以及 `docs/plans/submodules/frontend/` 对应迁移说明。
