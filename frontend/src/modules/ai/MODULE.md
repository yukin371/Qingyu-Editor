# AI 模块

> 最后更新：2026-05-18

## 职责

独立编辑器中的 AI 接入层，目标是成为可拔插、可替换的通用执行系统。负责：

- 对接 `/api/v1/ai/*` 与用户 OpenAI 兼容 provider
- 提供领域无关的 AI executable plan、工具注册表描述和 orchestration prompt 格式化能力
- 保持 system remote / 用户 API / legacy direct 的运行时适配
- 统一 provider 健康检查、错误状态、超时/取消与 provider 选择边界

## Owns

- `api/ai.ts`：通用 AI 写作能力 facade
- `types/agent.ts`：领域无关的可执行 plan、工具 registry 与 orchestration prompt 协议
- `api/workbench.ts`：历史 workbench 兼容封装；只能消费通用 plan，不得反向依赖 writer 类型
- `api/request.ts`、`api/ai-direct.ts`、`api/ai-user-provider.ts`：请求与 provider 适配
- `config/provider.ts`、`stores/aiProviderStore.ts`：AI 接入模式与本地配置
- `utils/apikey.ts`：本地 AI key 相关辅助

## Must not own

- 不再承载历史平台 AI 管理后台页面、路由、store、types
- 不再把 Orval generated API 作为默认导出层
- 不直接拥有 writer 状态、写作 prompt、项目 Brief、用户偏好、页面布局或正文 diff owner
- 不从 `@/modules/writer/*` 导入写作语义；writer 只能通过 `AIExecutablePlan.orchestration`、`context` 和通用工具 registry 把领域语义交给 AI 执行层

## 约定

- 运行态默认从 `api/index.ts` 暴露手写 facade，不依赖 `generated/`
- writer 侧主链路（聊天、分析、单章编辑 diff）应先在 writer 模块生成 `WriterAIPlan`，再经 `requestWriterOrchestratedAI(plan)` 注入 writer-owned prompt / skill / tool registry，最后调用 AI 模块的 `requestWriterAI(plan)`。
- `requestWriterAI(plan)` 只认识 `AIExecutablePlan`、provider、history、intent 和 orchestration prompt；不得 import writer prompt preset、项目 Brief service 或用户偏好 service。
- `requestWriterAI(plan)` 只返回候选结果或计划结果；单章节正文修改仍必须交给 writer 编辑器 diff owner 挂载，多章节/新章节计划不得在 AI API 层静默写入。
- `requestWriterAI(plan)` 可携带 `intent` 与 `history`；`intent` 只用于选择续写/扩写/改写/总结/审校的生成路径，`history` 只用于普通聊天，不允许把当前发送内容重复写入历史。
- `workflow / skillId / toolHintIds` 在 AI 层只是通用字符串元数据；真正的写作 skill、阶段提示词和工具说明由 writer orchestration 写入 `plan.orchestration`。
- 分析类请求（总结、审校、风控）也必须通过 `orchestration.contextPrompt` 或 plan context 接收领域摘要；AI 层只格式化和转发，不成为领域事实 owner。
- `api/ai-direct.ts` 只允许复用 `src/utils/runtimeHost.ts` 这类中立宿主 helper，不能为了判断桌面/远端运行态去依赖 `@/modules/writer/*`。
- `api/ai-direct.ts` 在 Wails / 本地桌面宿主下默认优先本地 `Qingyu-Ai-Service`（缺省 `http://127.0.0.1:8000`）；只有显式 `?remote=true` 时才禁止这条本地直连兜底。
- 用户 API 模式当前以 OpenAI 兼容接口为准，最小配置为 `服务地址 + 接口路径 + 模型`
- 用户 API Provider 可通过预设快速填入常见 baseURL / endpoint / model，但预设只服务设置页体验，不改变请求 facade owner；模型必须继续允许手动输入。
- 设置页现在还提供常见 provider 模板与“自定义”模板，用于快速切换 Qwen / DeepSeek / Kimi / GLM / Gemini / GPT / Claude / 本地兼容服务；模板只填充当前激活的 provider 配置槽，不改变请求 facade owner。
- 用户 API 支持多个 `providerProfiles` 配置槽；当前运行时只读取 `activeProviderProfileId` 指向的配置槽，后续按写作/审查/整理分配 provider 时仍必须先经 AI 模块配置层收口。
- `roleModels` 只是未来按功能分配模型的配置槽位，当前跟随各 provider profile 保存“写作 / 审查 / 整理”的偏好，不直接改写 `requestWriterAI` 的运行时路由。
- Wails 桌面宿主下，用户 API 的真实 API Key 通过系统 secret store 持久化；每个 provider profile 使用独立 secret key，`localStorage` / SQLite settings 只保留掩码和非敏感配置，浏览器环境仍退回 `sessionStorage`
- Provider 配置文件只作为导入/导出载体：导入时允许 JSON 临时包含 `apiKey` 以便快速初始化，应用后真实 key 仍写入 secret store 或 session；导出与持久化必须清空明文 key，只保留非敏感 provider 参数和配置槽结构。
- provider 设置页的“检测连接”只暴露当前模式、配置完整性、运行时 secret 是否可用和失败原因；API Key 对本地 OpenAI 兼容 provider 可为空，连接测试不得仅因无 key 失败；不得展示明文 API Key。
- 任何新增 AI 能力都先判断是否属于 writer 工作区主链路；如果不是，标记 `TBD` 并补确认路径
