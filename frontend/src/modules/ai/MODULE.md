# AI 模块

> 最后更新：2026-05-16

## 职责

独立编辑器中的 AI 接入层，只服务 writer 工作区。负责：

- 对接 `/api/v1/ai/*` 写作辅助接口
- 提供 writer 可直接消费的 facade 与 workbench 工具函数
- 保持 system remote / 用户 API / legacy direct 的运行时适配
- 统一 writer AI 请求、provider 健康检查、错误状态与 provider 选择边界

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
- writer 侧主链路（聊天、分析、单章编辑 diff）必须优先走 `requestWriterAI(plan)`；`continueWriting / rewriteText / summarizeText / proofreadText` 只作为 facade 内部或兼容工具入口使用，组件不直接拼 provider 请求策略、超时或直连地址。
- `requestWriterAI(plan)` 只返回候选结果或计划结果；单章节正文修改仍必须交给 writer 编辑器 diff owner 挂载，多章节/新章节计划不得在 AI API 层静默写入。
- `requestWriterAI(plan)` 可携带 `intent` 与 `history`；`intent` 只用于选择续写/扩写/改写/总结/审校的生成路径，`history` 只用于普通聊天，不允许把当前发送内容重复写入历史。
- `requestWriterAI(plan)` 是 writer 极简 AI agent 的唯一执行入口；`workflow / skillId / toolHintIds` 只用于 prompt orchestration，不代表新增 LLM agent runtime、第二套 AI store 或组件级 provider 策略。
- 分析类请求（总结、审校、风控）也必须通过 `contextPrompt` 接收当前章节、场景舞台、资产与工作流摘要；provider 提示词必须声明这些上下文只供判断叙事语境，不作为待摘要/待审校正文。
- 用户 API 模式当前以 OpenAI 兼容接口为准，最小配置为 `服务地址 + 接口路径 + 模型`
- 用户 API Provider 可通过预设快速填入常见 baseURL / endpoint / model，但预设只服务设置页体验，不改变请求 facade owner；模型必须继续允许手动输入。
- Wails 桌面宿主下，用户 API 的真实 API Key 通过系统 secret store 持久化；`localStorage` / SQLite settings 只保留掩码和非敏感配置，浏览器环境仍退回 `sessionStorage`
- Provider 配置文件只作为导入/导出载体：导入时允许 JSON 临时包含 `apiKey` 以便快速初始化，应用后真实 key 仍写入 secret store 或 session；导出与持久化必须清空明文 key，只保留非敏感 provider 参数。
- provider 设置页的“检测连接”只暴露当前模式、配置完整性、运行时 secret 是否可用和失败原因；API Key 对本地 OpenAI 兼容 provider 可为空，连接测试不得仅因无 key 失败；不得展示明文 API Key。
- 任何新增 AI 能力都先判断是否属于 writer 工作区主链路；如果不是，标记 `TBD` 并补确认路径
