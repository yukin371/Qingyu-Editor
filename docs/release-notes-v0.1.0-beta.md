# Qingyu-Editor v0.1.0-beta 发布说明

## 版本定位

v0.1.0-beta 是 Qingyu-Editor 的第一个可试用 beta 版本，目标是验证“独立写作工作台 + 本地项目 + AI 辅助 + 基础工具联动”的最小闭环。

## 已包含能力

- 作者工作台与项目内正文工作区。
- 新项目默认第一卷、第一章骨架。
- 多卷、多章、章节栈式追加。
- TipTap 正文编辑、标题编辑、自动保存、防抖字数统计。
- 当前场景/节拍底栏。
- 结构舞台作为聚合入口。
- 右侧 AI、设定、审查、校对、灵感工具。
- 全局资产、本章/本卷引用投影。
- `@资产` 创建、正文引用、自动检出。
- 资产总览与右侧设定共享 CRUD 能力。
- AI provider 系统服务 / 用户 API 两种模式。
- 常见 provider 模板、多 provider 配置槽、用途模型偏好。
- AI 写作 inline diff 和分析建议。
- 工作台内置使用文档入口。

## 已知限制

- 浏览器 fallback 的 API Key 只在当前会话保存；桌面端使用 Wails secret store 长期保存。
- 多 provider 已可保存和切换，但按写作/审查/整理自动路由到不同 provider 仍是后续能力。
- 不引入 embedding 或全书语义检索，长篇定位以章节号、标题、窗口和工具摘要为主。
- 多章节批量修改和新建章节自动落盘仍保持计划卡或显式确认。
- 高级工具以辅助理解为主，不强制普通商业写作用户使用。
- 移动端不是 `v0.1.0-beta` 的主发布目标，但 Mobile Chrome 已覆盖目录、编辑、右侧设定、章节新增、资产引用和主题切换等核心冒烟；正式说明仍建议优先使用桌面端。
- 依赖安全审计已通过 `npm audit --audit-level=high`，当前结果为 `0 vulnerabilities`。

## 发布前必须通过

- `.\scripts\release-check.ps1 -Profile full`
- `npm run type-check`
- `npm run type-check:full`
- `npm run test:ci`
- `npm run test:e2e`
- `npm run lint:styles`
- `npm run build`
- `npm audit --audit-level=high`
- `wails build`
- Wails exe 启动存活检查
- `go test ./...`
- Provider / 设置页 / 工作台文档入口定向测试
- `git diff --check`
- 手工 smoke：按 [regression-v0.1.0-beta.md](/E:/Github/Qingyu/Qingyu-Editor/docs/regression-v0.1.0-beta.md:1) 执行完整发布冒烟，至少覆盖项目骨架、保存恢复、资产闭环、provider、AI diff、场景/结构工具和暗色主题。

## Tag 建议

- 子仓 tag：`v0.1.0-beta`
- 父仓同步 tag：`qingyu-editor-v0.1.0-beta`
