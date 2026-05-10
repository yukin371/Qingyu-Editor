# Qingyu-Editor Frontend

> 最后更新：2026-05-10

## 模块职责

- 独立编辑器桌面宿主的 Vue 3 前端。
- 默认运行态只服务 writer 工作区，并通过 `src/modules/ai` 提供写作辅助能力。
- 承担桌面壳内的 UI、状态、路由与本地调用桥接，不拥有后端业务真相。

## Owns

- `src/modules/writer`：编辑器工作区、项目/章节工作流、布局状态、Story Harness UI。
- `src/modules/ai`：writer 使用的 AI facade、workbench 工具和本地请求适配。
- `src/design-system`：本仓前端基础组件、设计令牌与主题。
- `src/router`、`src/main.ts`、`src/App.vue`：桌面宿主入口与路由编排。

## Must not own

- 不再承载旧平台页面级运行态。
- 不再把历史 generated API 或平台 demo 当作默认 facade。
- 不直接承担服务端持久化、鉴权真相或 AI runtime owner。

## 当前边界

- `src/modules` 仍然保留，原因是 writer 与 ai 仍是独立编辑器的真实业务 owner。
- `src/modules/*/api` 的定位是业务 facade；`src/api/generated` 只是历史生成产物共享模型层，暂未完全退场。
- 当前路由只注册 writer 入口；未接入路由的历史模块视为待清理残留，不应继续扩张。

## 不变量

- 默认首屏和主链路必须围绕 writer 工作区，不回退到平台首页思路。
- AI 能力只能以 writer 工具链配角存在，不能在独立编辑器内重新长出管理后台。
- 新增共享层前必须先确认现有 owner，避免在 `src/shared`、`src/stores`、`src/api` 再造影子实现。

## 文档同步触发条件

- writer/ai owner 边界变化。
- 路由入口或默认宿主链路变化。
- `src/modules/*/api` 与 `src/api/generated` 的职责再次调整。
