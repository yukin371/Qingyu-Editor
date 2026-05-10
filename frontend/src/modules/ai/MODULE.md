# AI 模块

> 最后更新：2026-05-10

## 职责

独立编辑器中的 AI 接入层，只服务 writer 工作区。负责：

- 对接 `/api/v1/ai/*` 写作辅助接口
- 提供 writer 可直接消费的 facade 与 workbench 工具函数
- 保持 direct mode / request 封装等运行时适配

## Owns

- `api/ai.ts`：通用 AI 写作能力 facade
- `api/workbench.ts`：工作区工具化封装
- `api/request.ts`、`api/ai-direct.ts`：请求与直连适配
- `utils/apikey.ts`：本地 AI key 相关辅助

## Must not own

- 不再承载历史平台 AI 管理后台页面、路由、store、types
- 不再把 Orval generated API 作为默认导出层
- 不直接拥有 writer 状态或页面布局，只提供能力接口

## 约定

- 运行态默认从 `api/index.ts` 暴露手写 facade，不依赖 `generated/`
- 任何新增 AI 能力都先判断是否属于 writer 工作区主链路；如果不是，标记 `TBD` 并补确认路径
