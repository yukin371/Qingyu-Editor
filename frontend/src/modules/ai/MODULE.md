# AI 模块

> 最后更新：2026-05-10

## 职责

独立编辑器中的 AI 接入层，只服务 writer 工作区。负责：

- 对接 `/api/v1/ai/*` 写作辅助接口
- 提供 writer 可直接消费的 facade 与 workbench 工具函数
- 保持 system remote / 用户 API / legacy direct 的运行时适配

## Owns

- `api/ai.ts`：通用 AI 写作能力 facade
- `api/workbench.ts`：工作区工具化封装
- `api/request.ts`、`api/ai-direct.ts`、`api/ai-user-provider.ts`：请求与 provider 适配
- `config/provider.ts`、`stores/aiProviderStore.ts`：AI 接入模式与本地配置
- `utils/apikey.ts`：本地 AI key 相关辅助

## Must not own

- 不再承载历史平台 AI 管理后台页面、路由、store、types
- 不再把 Orval generated API 作为默认导出层
- 不直接拥有 writer 状态或页面布局，只提供能力接口

## 约定

- 运行态默认从 `api/index.ts` 暴露手写 facade，不依赖 `generated/`
- 用户 API 模式当前以 OpenAI 兼容接口为准，最小配置为 `服务地址 + 接口路径 + 模型`
- 用户 API 的真实 API Key 当前仅保留在 `sessionStorage`，`localStorage` 只保留掩码和非敏感配置，避免长期明文落盘
- 任何新增 AI 能力都先判断是否属于 writer 工作区主链路；如果不是，标记 `TBD` 并补确认路径
