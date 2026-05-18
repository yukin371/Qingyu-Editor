# Writer Module

> 最后更新：2026-05-16

## 职责

承接作者工作台、写作工作区、Editor V3、Story Harness、AI 工作台与辅助工具的一体化前端宿主。`src/modules/writer` 负责把项目入口调度、模板起步、章节编辑、建议生成、提案暂存、工具查看与 AI handoff 串成同一条作者工作流；不负责后端事实真相，也不在主编辑区再维护第二套工具页宿主。独立编辑器宿主默认首屏现在是作者工作台，`/writer/project/:projectId` 才是项目内正文工作区，旧 `dashboard / projects` 语义不再允许继续扩张成主导航壳。

## 数据流

```
章节/项目路由 → ProjectWorkspace → WorkspaceShell（上/中/下宿主）
                               ├→ TipTap + Story Harness（主写作面）
                               ├→ WorkspaceToolOverlay（关系图谱/时间线/分支/结构舞台）
                               ├→ WorkspaceRightPanel（AI / 设定 / 校对 / 灵感常驻右栏）
                               └→ WorkspaceBottomPanel（场景舞台）

工具交互/选区动作 → trigger-ai-action → handleWorkflowAction → 右侧 AI 工作台
快捷键配置 → useShortcutConfig → useWorkspaceShortcuts → overlay / workspace action
旧 encyclopedia deep-link → ProjectWorkspace 兼容层 → 打开 overlay → 主路由回收为 writing
```

## 约定 & 陷阱

- **工具唯一入口**：`relations / timeline / branches / structure` 只允许通过 `WorkspaceToolOverlay` 承载；不要再让 `WorkspaceEditorContent` 主内容区直接切成工具页。
- **工作台是默认首页，编辑器是项目内主工作区**：独立编辑器的 `/` 与 `/writer` 现在应先进入作者工作台，继续创作、项目列表、模板中心都从这里分流；真正的正文编辑只允许落到 `writer-project`，不要再把工作台页面做回第二个编辑器宿主。
- **五阶段流程配置 owner 是 `config/creativeFlow.ts`**：灵感捕捉、地基构建、蓝图绘制、逐章施工、复盘成长的阶段名称、任务、产出和入口动作统一从该配置读取；工作台首页和项目内阶段导航不得各自复制一套流程文案。
- **灵感阶段留在项目内创作流**：工作台“灵感捕捉”只负责打开项目内右栏灵感池；题材模板只是灵感工具内部可选输入，不允许把阶段入口直接跳到模板中心，避免作者从流程里被带到新建项目工具页。
- **编辑器内不再展示五阶段步骤提示**：五阶段流程只保留在工作台首页和项目入口分流层，正文编辑面保持纯写作壳，不在主编辑区再渲染阶段 tab、说明卡或任务面板。
- **项目列表与模板中心必须保持独立页职责**：工作台首页只展示最近项目和快捷动作；完整项目筛选、模板浏览与模板详情预览分别落到独立项目页与模板中心，不要把这些控件重新塞回首页。
- **入口动作 owner 是 `useWriterProjectEntryActions`**：工作台、项目列表、模板中心涉及“进入项目 / 继续创作 / 新建后进入 / 导入后进入”时，应复用这个 composable；不要在页面里各自拼 `writer-project` 路由或复制 ZIP 导入成功跳转逻辑。
- **模板中心的 owner 是“新建项目工具”，不是模板后台**：模板页允许浏览分类、打开 `大纲 / 角色 / 设定` 抽屉，并把模板应用到新建项目；不要在这里偷偷长出模板编辑器、模板发布系统或第二套项目创建协议。
- **模板可携带商业机制与 AI prompt 协议**：`templateCatalog.fallback` / Wails template 可提供主角原型、核心驱动、世界压力、章节循环、读者收益、质量约束和推荐 prompt preset；模板中心只展示和应用这些协议，不在模板页直接生成正文。
- **模板创建项目只生成骨架，不预写正文**：模板应用可以创建默认卷、黄金三章标题和 sidecar 蓝图，但章节正文必须保持空白，由作者进入章节后再写；不要把模板大纲、钩子或兑现点复制进正文区。
- **AI prompt preset owner 是 `config/writerAIPromptPresets.ts`**：右栏快捷入口、模板推荐提示词和后续回审工具应复用该 preset，不要继续把写/审/整理提示词散落在组件或 mock helper 中。
- **工作台壳必须保持模块化和简洁**：`WorkbenchShell` 负责左侧主导航和右侧主内容区的基础骨架；首页、项目页、模板页优先复用 `QyCard / QyButton / QyInput / QySelect / QyDrawer / QyModal` 等设计系统原件，不要再堆叠装饰性卡片、大段说明或自定义平台式大壳。
- **工作台壳桌面端必须分离滚动**：`WorkbenchShell` 在 `lg` 及以上视口下应保持“左侧导航整列固定高度 + 右侧主内容独立滚动”；不要再让 `/writer`、`/writer/projects`、`/writer/templates` 通过整页文档滚动把左侧导航一起带走。
- **双壳模型要显式，不要伪装成同一页抖动**：顶层页壳只服务 `/writer`、`/writer/projects`、`/writer/templates`，并由页面显式传入 `activeNavId`；`/writer/project/:projectId` 只走 `WorkspaceShell` 编辑器壳。不要再让壳层通过路由猜测去兼容另一条主链。
- **新建章节走“先创建再命名”**：`新建章节` 不再弹标题弹窗，而是按当前上下文直接创建默认中文序数标题（如 `第一章`、`第二章`），创建后自动跳转到新章节并聚焦主编辑区标题行；章节标题的细化命名应在页内标题行完成，避免创建前表单打断写作流。
- **新建章节按同父级压栈追加**：当前选中卷或卷内章节时，新章节必须落在该卷末尾，排序使用同父级章节 `max(order)+1`；不要用全书位置或简单兄弟数量推断插入点，避免第二卷、多卷和删除后空洞场景出现顺序混乱。
- **历史入口直接收敛到路由兼容层**：旧 `dashboard / editor / publish` 页面不再保留独立运行时壳；兼容只允许留在 `routes.ts` 的重定向层，不再保留会继续腐化的空页面文件。
- **桌面启动链保持最小化**：`frontend/src/main.ts` 与 `router/*` 不应再强制注入 auth session、websocket 或全局 mock 状态；mock/test-mode 只允许通过显式 `?test=true` 进入，避免桌面宿主继续背在线平台启动逻辑。
- **独立编辑器宿主默认不探测原后端**：`main.ts`、`utils/api-health.ts`、`utils/syncService.ts` 在独立编辑器运行态下不得默认请求原 `/api/v1/system/health` 或 `/health`；宿主应直接把本地桥接或本地宿主视为在线，只有显式 `?remote=true` 联调模式才允许恢复远端健康探测。
- **remote mode 是唯一远端 writer 开关**：`data-bridge/wails.ts` 里的 `isRemoteWriterMode()` 现在是 writer 远端联调的唯一显式入口；浏览器独立宿主默认走本地 owner，不允许再靠端口猜测或“没有 Wails 就回退 HTTP”维持隐式远端模式。
- **快捷键配置在独立宿主默认本地优先**：`useShortcutConfig` 在独立编辑器运行态下只允许使用 `localStorage + 默认值`，不得为了加载或重置快捷键再访问 `/writer/user/shortcuts*`，避免设置面板继续隐式依赖原后端。
- **Story Harness 已切到桌面本地 owner**：`storyHarnessService.getLatestBatch / persistBatch / fetchChapterContext / fetchChangeRequests / triggerIndex / rebuildProjection` 在有 Wails bridge 时统一走 `Wails -> Go services -> SQLite`；浏览器独立宿主才允许保留本地缓存级 fallback，不得再把原在线 writer API 当默认真相源。
- **writer 模块组件已完成去全局 UI 插件依赖**：`main.ts` 已移除历史全局组件注册，writer 现有组件链已迁到 Tailwind + `Qy*`。若未来重新接入 legacy 组件或新建编辑器子面板，必须在组件内完成迁移，不能再恢复全局注册兜底。
- **非 writer 平台模块已物理退场**：`frontend/src` 下的书城/社区/阅读/财务/用户/通知/后台等历史平台模块已从桌面宿主移除；新增能力若不属于写作闭环，不应再放回这个仓库的运行时主链。
- **writer 内部历史孤岛也已开始物理退场**：旧 `components/ai/*`、模板工作流组件、废弃 `OutlineView*`、旧 `WorkspaceFullscreenOverlay` 与一批 legacy editor 组件已经删除；不要再从这些历史目录恢复入口，而应继续收敛到 `ProjectWorkspace / WorkspaceToolOverlay / WorkspaceRightPanel` 主链。
- **布局壳 owner 单一**：`WorkspaceShell` 负责上/中/下区域的视口壳，`EditorLayout` 负责左/主/右分栏；`ProjectWorkspace` 只做数据编排、事件桥接和 slot 装配。
- **`EditorLayout` 不要再偷拿 writer 业务数据**：这个组件应保持纯布局壳，只消费 slot 与响应式布局状态；项目、章节、树节点等真实数据必须由 `ProjectWorkspace` 之类上层宿主装配后传入插槽，而不是在 `EditorLayout` 内再走 route/store 补第二份默认内容。
- **`EditorLayout` 主区模式只读 `editorStore`**：`EditorLayout` 不再暴露 `activeTool` prop、`update:activeTool` emit 或 `#editor` slot prop；主区 `writing / immersive` 状态统一由 `editorStore.activeTool` 提供，避免布局壳再维护一层影子同步状态。
- **资产总览也走 overlay owner**：`assets` 与 `structure / relations / timeline / branches` 一样，只允许通过 `WorkspaceToolOverlay` 承载；分类状态 owner 在 overlay，自身视图只负责展示与发事件，避免路由、宿主、视图三处各维护一套资产分类状态。
- **桌面数据路径以 Wails-first + standalone-local fallback 为准**：当前 `project / document / editor / outline` 已有 `Wails bridge -> standalone-local(localStorage) -> 显式 remote=true` 三段式 owner。浏览器独立宿主即使没有 `window.go`，也必须优先走 `standalone-local`，不能回退成默认 HTTP writer API。
- **核心 facade 的默认 HTTP 债务已收口**：`api/document.ts` 的复制/重排、`api/wrapper.ts` 的关键词检索、`api/editor.ts` 的字数统计、`api/project.ts` 的统计刷新，当前都已具备本地 owner 或本地 no-op 语义；这些能力不允许再作为“默认工作区缺口”回退远端。
- **writer API 不再通过根 barrel 中转**：`api/index.ts`、`api/writer.ts` 这类兼容出口已退场；组件、store、service 应直接依赖 `api/wrapper.ts`、`api/document.ts`、`api/character.ts`、`api/timeline.ts` 等具体 facade，避免再次长回目录级影子 owner。
- **大纲树已开始回收到文档 owner**：`api/outline.ts` 在桌面端默认从本地文档树派生大纲树，卷/章节型节点的增删改优先委托 `wailsWriterBridge.document`；只有还无法本地表达的 planning-only 大纲节点才允许保留显式兼容 fallback，不要再把 outline 当成独立在线真相源扩写。
- **概念与时间线已补桌面本地 owner**：`api/concept.ts`、`api/timeline.ts` 在桌面运行态下不再默认降级为空列表或 TODO；当前统一走本地 owner，其中时间线会按项目自动自举 `主时间线`，事件增删改也留在本地宿主。
- **统一实体 facade 在桌面端只做本地聚合**：`api/entities.ts` 在桌面运行态下应聚合本地角色/地点/概念与 `standaloneLocalBridge.entity`，优先服务资产总览与图谱速查；不要再请求在线统一实体接口，也不要在 writer 内复制第二套资产 store。
- **物件/组织建档已并回统一实体本地口径**：`CharacterGraphView` 里的物件、组织候选建档都不再借道历史 `writerItems`；当前桌面端统一通过 `api/entities.ts` 本地落盘，并继续被资产总览/候选绑定链路消费。
- **历史 `qingyu_writer_items:*` 只剩迁移兼容键**：旧桌面物件存储现在仅由 `standaloneLocalBridge.entity` 在首次访问项目时懒迁移读取；新的物件/组织写入不得再恢复独立 helper 或第二条本地写路径。
- **角色与地点在桌面端已改为双本地 owner**：有 `Wails bridge` 时，`api/character.ts`、`api/location.ts` 走 `wailsWriterBridge.character/location`；无 bridge 的 standalone-local 宿主里，读写与关系数据都走 `standaloneLocalBridge` 的 `localStorage` 持久化。两档桌面运行态都不得再把云端 REST 当成隐式 fallback。
- **结构舞台跳资产总览也只走 overlay 切换**：`StructureInspectorPanel` 里的“查看全局资产”只允许发 `switch-tool('assets')`，再由 `StructureStageView -> WorkspaceToolOverlay` 透传；不要在结构舞台内部内嵌资产列表、复制分类状态，或新增第二套资产宿主。
- **主区优先写作**：即使从旧 `tool=encyclopedia&encyclopediaView=*` 链接进入，也应自动转成 overlay 打开，并让主工作区保持写作态。
- **主区模式 owner 已收窄**：`editorStore.activeTool` 现在只承担 `writing / immersive` 两种主区状态；`ai / encyclopedia / chapters` 这类历史模式只能留在路由兼容或侧栏/overlay owner 中，不能再写回主编辑区状态机。
- **快捷键 owner 已收口**：`useToolOverlay` 只做状态管理；快捷键动作定义在 `workspaceShortcutActions.ts`，配置由 `useShortcutConfig` 承接，行为绑定由 `useWorkspaceShortcuts` 承接。
- **快捷键锁定规则按 action id**：快捷键设置面板不得再按 `Tab`、`Escape` 这类具体键名推断“系统键”；是否可编辑必须复用 `workspaceShortcutActions.ts` 中声明的 action 级锁定口径，避免编辑器宿主拆分后再次回到键位硬编码。
- **AI handoff 不要断链**：工具页、Story Harness、编辑器选区发出的 `trigger-ai-action` 必须继续落到 `ProjectWorkspace.handleWorkflowAction`，否则右栏 AI 工作台会失去上下文注入。
- **正文改写 diff owner 在编辑器，不在右栏审批**：`AIWorkbench` / `AIPanel` / `RewriteWorkbenchTool` 产生的 `apply-generated-text` 必须立刻转交 `ProjectWorkspace.handleAIApplyGeneratedText`，由正文编辑器注册 inline diff 并在正文内接受/放弃；右栏只允许展示候选摘要与“继续修改”入口，不能再次拦截成第二套侧栏审批流。
- **AI 对话要先判别“聊天”还是“正文操作”**：`AIPanel` 对自由输入的“扩写 / 改写 / 续写 / 总结 / 审校”必须先做意图识别。`rewrite / expand / continue` 属于编辑类意图，应直接走正文 diff 链路；`summarize / proofread` 属于分析类意图，只能产出候选卡或建议，不得伪装成正文已改写。
- **编辑类意图的 apply mode 要跟上下文匹配**：无选区时，`expand / rewrite` 默认面向整章正文，`continue` 默认追加到正文末尾；有选区时，`expand / rewrite` 替换选区，`continue` 插到选区后。不要再把“续写整章”错误路由成整章替换。
- **候选稿上下文不能劫持“当前章节全文”**：`AIWorkbench` 注入的 `revisionSeed` 只代表“继续修改当前候选稿”，不能因为输入框仍挂着候选稿上下文，就覆盖用户显式提到的“当前章节 / 本章 / 整章 / 全文”。`AIPanel` 必须先解析 target，再决定 source，避免“扩写当前章节”误改候选稿。
- **自然语言跨章节编辑也要复用 document tools**：自由输入若显式提到其它章节（标题、上一章/下一章、搜索命中的章节），应先通过 `writerDocumentAgent` 复用 `list/read/search` 解析目标，再走 `applyGeneratedText -> ProjectWorkspace.handleAIApplyGeneratedText`。自然语言跨章节修改不允许绕过现有 `targetDocumentId/targetDocumentTitle` diff 挂载协议；当检索命中多个章节时，右栏应先展示候选章节选择卡，待用户确认后再继续读取/改写。
- **跨章节自然语言链路要给出可见状态反馈**：`AIPanel` 在异章节读文、生成结果、提交 diff 时，应通过 `AIChatMessages` 渲染统一状态卡，至少让用户看见“命中候选”“正在生成”“已提交切章挂 diff”这三类阶段，避免误判 AI 仍在当前章节工作。
- **AI 编辑计划层已成为右栏编排边界**：`writerDocumentAgent` 现在不只解析 target，还承担 `WriterEditorPlan` 的计划层语义；`AIPanel` 应先拿计划再执行，聊天 / 分析 / 单章 diff / 检索后编辑 / plan-only 都要走同一套 route 与 mutationMode 口径，避免继续把新分支塞回自由输入的大 if/else。
- **目标范围提示条是发送前安全阀**：`AIInputArea` 的 target scope bar 用来展示“本章全文 / 选区 / 候选稿 / 目标章节 / 待确认候选”等范围；任何会影响正文 source 的改动都必须同步维护这层提示，避免候选稿上下文、选区上下文和当前章节全文互相劫持。
- **检索 / 计划 / 检查点消息卡是统一反馈层**：`AIChatMessages` 已承接 `writer_retrieval_summary`、`writer_plan_preview`、`writer_apply_checkpoint` 等结构化消息；自然语言检索、`/doc search`、多章计划、章节创建计划和异章节挂 diff 状态都应优先复用这些 meta，不要回退成大段纯文本说明。
- **多章与新增章节默认降级为计划**：multi-chapter 请求、目标章节不存在的新增章节请求，都只能先返回计划卡或创建计划卡；不得串行生成多个 applyPayload，也不得直接创建章节节点或静默保存正文。已有章节内“补一段 / 新增内容”仍可按单章 diff 处理。
- **右栏不要重复渲染正文前后对比**：当正文编辑器已经挂起 inline diff 时，`AIWorkbench` 的 workflow rail 只保留“已同步到正文编辑器”的轻量状态与继续修改/存提案入口，不再在侧栏重复展示“修改前 / 修改后”正文块，交互对齐 Cursor / Trae 类编辑器。
- **AI 工作台头部只保留一层模式切换**：`AIWorkbench` 不再渲染独立“AI 助手”标题，`AIPanel` 也不再额外渲染“对话协作”子头；聊天、改写、总结、审校统一收敛到 `AIWorkbench` 的 tab row，避免右栏出现双头部与重复层级。
- **对话、改写、总结、审校要共享同一套工作台视觉语言**：`AIPanel`、`RewriteWorkbenchTool`、`SummaryWorkbenchTool`、`ReviewWorkbenchTool` 的 header、说明文案、状态栏和主按钮布局应复用统一样式 token，不要让右栏看起来像四套不同产品拼接。
- **`/doc patch` 预览也要走统一右栏视觉语言**：命令桥返回的章节 patch 预览不能只是一大段 markdown 说明；`AIChatMessages` 应把它渲染成与当前简约主题一致的状态条 + 变更块卡片，至少展示目标章节、执行状态、变更块摘要与 before/after 片段。
- **writer 侧 AI 主链路必须走统一 API facade**：右栏聊天、自然语言单章编辑、跨章节单目标编辑、总结与审校都应先构造 `WriterAIPlan` 并调用 `requestWriterAI(plan)`，再由 `src/modules/ai/api` 决定 provider 与具体生成路径。Workbench 兼容工具若暂时保留旧 facade，也不得在组件里各自直接 new axios、各自写 timeout，避免再次出现 15s / 60s / 默认值混杂。
- **普通聊天历史由 plan 显式携带**：`WriterAIPlan.history` 只保留已存在的 user/assistant 往返，不包含当前发送内容；这样既能走统一 facade，又不会把当前 prompt 重复塞进 provider history。
- **AI 上下文包 owner 是 `utils/writerAIContext.ts`**：右栏聊天、Workbench 工具、资产摘要和结构/时间线/分支简化摘要都应先构造成 `WriterAIContextPacket`，再进入 prompt 或 `modules/ai/api` facade；不要在组件内各自拼全量 prompt。
- **AI 默认只消费简化上下文**：上下文包默认包含当前章节正文、选区/候选稿、目标条、资产简表、创作蓝图/节奏摘要和证据卡，并受字符预算截断；禁止默认把全书全文或深度资产详情塞进 prompt。
- **场景舞台只进入 AI 摘要上下文**：底栏当前场景与当前拍仍由 `useWriterSceneStage` 本地 sidecar 持有；当前草稿以项目级 `activeSceneId + scenes` 结构持续保存，覆盖章节会随当前工作章节自动累积，点击“新场景”才归档当前场景并切到新场景。AI 只能通过 `WriterAISceneStageSummary` 消费场景、覆盖章节、目标、冲突、完成条件、下一拍和在场资产摘要，不得把场景舞台状态复制成 AI store 或让 AI 静默推进节拍。
- **AI 创作辅助采用“双节拍”入口**：右栏快捷入口按“写 / 审 / 整理”组织；写作冲刺入口可进入当前章节/选区 diff，回审和整理入口只输出分析、任务卡或资产候选，不静默改剧情、不批量改章。
- **本章任务卡只进入上下文包，不成为新持久化 owner**：`WriterChapterTaskCard` 用于约束创作冲刺与质量回审，可从阶段摘要或显式上下文推导；持久化仍归结构舞台、章节/工作流 sidecar 或后续明确 owner。
- **跨章节 resolved target 必须覆盖当前章节上下文**：当 `writerDocumentAgent` 已解析到目标章节时，AI prompt 和结果证据条必须使用目标章节标题与正文；不要继续把当前打开章节误作为主要正文上下文。
- **上下文证据只做可见提示，不替代 owner**：`AIInputArea` 的发送前提示和 `AIChatMessages` 的结果证据条只说明本次 AI 可见了哪些上下文来源；正文 diff、资产 CRUD、结构舞台/时间线/分支数据仍分别由原 owner 处理。
- **资产进入 AI 只能走摘要投影**：AI 使用 `WriterAIAssetSummary` 的类型、名称、摘要、最近章节、引用次数与 unresolved 标记；需要详情时跳转资产工具或专业 overlay，不在 AI 面板复制第二套资产编辑/删除逻辑。
- **文档工具协议优先复用 writer 文档树与内容接口**：`list_documents / read_document / search_document / patch_document` 这类 agent 能力，优先复用 `getDocumentTree / getDocumentContent(s) / updateDocumentContent` 及其 service 封装，不要再造第二套“AI 文件系统”。`patch_document` 即使后续接入真实 tool calling，也必须保留版本校验，并继续走正文 diff / 编辑器确认链路，不能让 AI 直接静默落盘。
- **`/doc` 命令桥只做轻量演示接入**：`AIPanel` 内的 `/doc list/read/search/patch` 目前是面向当前 writer 工作区的本地命令桥。`list/read/search` 可直接返回文本结果；`patch` 必须统一转换成 `applyGeneratedText -> ProjectWorkspace.handleAIApplyGeneratedText` 的正文 diff。若目标不是当前章节，只允许先读取目标章节内容、生成预览，再通过 `targetDocumentId/targetDocumentTitle` 让宿主切章后挂起 diff，不允许绕过编辑器直接静默保存。
- **会话操作应并入工具栏，不再回到独立头部**：清空当前对话、重命名、新建会话等动作统一放在 `AIConversationToolbar`，不要为了单个会话动作再长回额外标题栏。
- **右栏是“双模式速查”宿主，不再只挂 AI/Harness**：`WorkspaceRightPanel` 现在承接 `AI / 设定 / 审查 / 校对 / 灵感` 五种常驻工具；设定采用“列表 + 详情”双栏，审查/AI/校对/灵感采用单栏。不要再把轻量查阅能力做回全屏覆盖层或主编辑区切页。
- **阶段 1 创作流元数据已改为 Wails-first owner**：`题材模板 / 目标读者 / 核心承诺 / 节奏合约 / 黄金三章` 当前由 `services/creativeWorkflow.service.ts` 优先通过 `wailsWriterBridge.creativeWorkflow` 落到本地 SQLite；`localStorage` 只保留无 bridge 的浏览器 fallback，不得再把这批字段写回旧在线 REST schema，也不要在页面里各自维护第二套 sidecar。
- **模板目录和详情已改为本地 API owner**：作者工作台、模板中心消费的模板列表/详情统一走 `wailsWriterBridge.template`，由 Go `TemplateService` 提供稳定结构；前端静态模板数据只允许作为无 Wails 的开发 fallback，不再是默认运行态真相，且统一收口到 `services/templateCatalog.fallback.ts`，不要在页面或其他 service 再复制第三份模板定义。
- **灵感笔记已改为本地 API owner**：`InspirationPanel` 的笔记列表、创建、删除统一走 `wailsWriterBridge.inspiration`；本地缓存只作为浏览器 fallback 和读失败兜底，不允许再直接在组件里操作 `localStorage`。
- **时间线本地 owner 已补齐 CRUD**：`api/timeline.ts` 在 Wails 运行态下统一走 `wailsWriterBridge.timeline`，包含时间线、事件和可视化读取；仅显式 `?test=true` 才允许命中旧 mock 工具链。
- **结构舞台只读消费阶段 1 sidecar，不接管持久化**：`StructureStageView` 当前可以读取 `creativeWorkflow` sidecar 作为阶段 3 接力卡与 AI handoff 输入，但它只能消费和展示，不得反向成为模板/黄金三章的新 owner。
- **黄金三章导入必须复用现有结构草案链**：从阶段 3 接力卡导入黄金三章时，只能发 `create-structure-plan` 交给 `ProjectWorkspace.handleCreateStructurePlan` 统一创建章节与 outline 节点；不要在 `StructureStageView` 里直接写文档或大纲。
- **黄金三章导入控制项仍由宿主兜底**：阶段 3 接力卡可以补 `导入位置（当前卷 / 项目根目录）` 与 `重复策略（跳过 / 允许重复）`，但最终 parent 解析、同名跳过与成功提示都必须落在 `ProjectWorkspace.handleCreateStructurePlan`，不要在结构舞台局部自行分叉创建逻辑。
- **结构舞台默认层是章节级全局管理视图**：`StructureStageView` 默认只展示章节范围、附近章节卡片、字数、入纲状态和写作 handoff；结构节点、资产、图谱、时间线、分支等深层信息只在检视面板或专业 overlay 中展开，不允许把默认层重新做成长表格或第二套深度编辑 owner。
- **长篇结构舞台必须用范围地图和附近窗口承载**：几百章以上的作品不得默认铺开完整顺序列表；`StructureStageView` 应按卷或固定章节范围展示全局地图，并只渲染当前/定位章节附近的少量章节卡片，章节号/标题定位和问题筛选只改变当前窗口，不改变章节原始顺序。
- **长篇深度工具也必须按区段定位**：`TimelineOutlineView` 和 `StoryBranchView` 不得默认渲染全量事件/全量分支节点；时间线应按事件窗口工作，互动分支应优先展示路线列表、当前章节附近节点和定位窗口，避免几千章作品在辅助工具中重新变成长列表或全量画布。
- **右栏不再伪装成通用 layout area**：布局 store 里的通用区域只剩 `left / bottom / overlay`，右侧常驻工具单独归 `rightToolArea` owner。不要再往 `workspaceLayoutStore.areas` 恢复历史 `right` 区域状态。
- **Overlay 继续承接深度工具，不回流常驻右栏**：`structure / assets-fullscreen / relations / timeline / branches` 仍由 `WorkspaceToolOverlay` owner 管理；右栏只负责快速查阅和“展开全屏 →” handoff，不要复制第二套全屏宿主状态。
- **Story Harness 已切到右侧常驻工具**：右侧 activity bar 现在提供 `审查` 入口，`StoryHarnessPanel` 直接作为右侧工具展开；若未来要再回到其他宿主，必须先补对应 plan 和交互边界。
- **底栏只做可编辑场景舞台**：底部区域现在只承接当前场景、在场资产和当前拍管理；状态栏保留显性的“场景舞台”入口，状态 / 上下文 / 审查等旧底栏内容不得再作为默认面板扩张，深度审查和资产整理继续放在右侧工具或 overlay。底栏高度由 `workspaceLayoutStore.bottomPanel.height` 持久化，拖拽把手只调整场景舞台高度，不引入新的底栏工具宿主。场景舞台默认展示当前章节、系统覆盖、纳入状态和动作按钮，核心编辑字段常驻三栏区域，不要求作者先点“编辑”；三栏是结构分区，外层不滚动，每列自己滚动，不用卡片套卡片。场景名只有作者手动填写才成立，章节名只能出现在“当前章节 / 系统覆盖”里，不得被当成默认场景名。当前拍可跨越多个章节，覆盖范围只能从当前章节向前选择连续倒数窗口（如 `第三章`、`第二章 - 第三章`），不得由切章历史累积出断档范围。字段包括当前拍、覆盖章节、状态、目标、冲突、完成条件和下一拍预告；只有用户点击“进入下一拍”才推进节拍，点击“新场景”才切换叙事段，不按章节自动切换。节拍草稿由 `useWriterSceneStage` 作为项目级本地 sidecar 保存，不写正文、不接管结构舞台。
- **Review Packet 预览只做前端只读聚合**：`StoryHarnessReviewPacketDrawer` 当前只聚合章节正文、Context Lens、活跃实体/关系、Change Request 和轻量 gate 摘要，服务人类审查，不写后端、不导入外部 Story Canvas 文件，也不替代后续后端正式 review packet owner。
- **Workflow Gate Panel 只做可见审查门槛**：`StoryHarnessWorkflowGatePanel` 复用 `storyHarnessWorkflowGates.ts` 的章节级判断，展示写前目标、写后正文、修后建议、卷级审查状态；它只负责打开审查包、建议队列或触发已有索引入口，不持久化 gate decision，不引入自动 runner，也不阻塞作者继续写作。
- **互动分支是特殊叙事工具，不是通用章节树**：`StoryBranchView` 主要服务视觉小说、互动小说和叙事游戏，默认应以“路线列表 + 分支流 + 节点检视”展示 `剧情 / 选择 / 条件 / 汇合 / 结局`；普通小说只把它当多结局/平行线草案工具，不要再做回泛用大纲组织图。
- **全屏工具 handoff 要复用共享实体上下文**：`CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 发给 AI 的 `add_to_chat` 文本不能只带局部节点名；应优先复用 `useWorkflowContext` 产出的 `activeEntities` / `workflowContext`，把当前章节的活跃角色、物品、地点等上下文一起带过去，避免工具页再次回到各自拼接一套孤立上下文。
- **全屏工具可见上下文由 overlay 统一展示**：`WorkspaceToolOverlay` 应使用 `useWorkflowContext` 同 owner 的摘要能力，把章节 / 场景 / 活跃实体显示在工具层顶部；不要再让 `CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 各自维护一份独立的“当前上下文”条。
- **资产总览优先复用统一实体口径**：`EncyclopediaView` 当前已被复用为 Phase 4 资产总览 MVP，数据源应优先拼接 `writerStore.characters / locations`、统一实体接口 `api/entities.ts`（至少 item / organization）与 `conceptApi`，不要再额外新建影子资产 store。若后续要升级为独立 `AssetsOverviewView`，也必须先保持这套聚合口径不变。
- **右栏设定速查与 overlay 资产总览共用同一套资产聚合口径**：右栏 `AssetListPanel / AssetDetailPanel` 与 `EncyclopediaView` 必须继续复用统一资产数据来源和分类口径；不要让右栏为了方便再维护一套单独的资产 store 或分类枚举。
- **右栏设定区与项目资产共用同一口径**：`ToolRightPanel` 的设定列表、详情和快速 CRUD 必须继续复用 `useWriterAssetCatalog` 与现有本地资产 API；允许做当前分类下的新建 / 编辑 / 删除，但不得在右栏再维护第二套资产 store、分类枚举或脱离项目资产的表单协议。
- **资产总览与右栏 CRUD 共用同一套能力**：`EncyclopediaView` 的全局资产增删改查必须继续复用 `useWriterAssetCatalog`、`AssetQuickEditorDialog` 与统一确认流程；overlay 只是在更大视图里消费同一套 owner，不得再分裂出第二套资产编辑协议。
- **`@资产` 是正文内的统一轻量引用格式**：`QyTipTapEditor` 的自动补全、创建实体、章节资产自动检测都必须优先支持统一 `@名称`，并能覆盖 `角色 / 地点 / 物件 / 组织 / 概念`；`#地点`、`%物件` 只作为兼容输入保留，不能再成为默认主路径。
- **编辑器外观偏好 owner 是 `editorAppearanceStore`**：字号、行距、版心、字体族与紧凑工具栏都应统一走 `editorAppearanceStore` 本地偏好；`TipTapEditorView` 只负责输出 CSS variables，`QyTipTapEditor` 只消费 `toolbarPreset`，不要再在组件内各自维护一份主题/排版状态。
- **颜色主题 owner 已收口到 design-system**：writer 工作区的 `WorkspaceSettingsPanel`、`WorkspaceShell` 与 overlay/tool 视图只消费 `src/design-system/tokens/theme.ts` 的统一主题；`editorThemeStore` 只做设置面板状态接线，不再定义第二套 `light/sepia/dark/focus` 独立主题真相。
- **编辑器图片先走本地嵌入，不走在线存储**：`QyTipTapEditor` 当前应通过 writer 自己的图片适配层把 PNG/JPG/GIF 转成 data URL 直接写入正文，避免依赖 `/shared/storage/*` 这类在线平台 API；若未来要改成本地资产目录，也应由 writer/Wails owner 接管，而不是回退到 shared online storage。
- **资产总览图谱深链由 overlay 接管**：`EncyclopediaView` 只负责发 `focus-graph-asset + switch-tool` 事件，不自己持有图谱 focus 状态；`WorkspaceToolOverlay` 是这条 focus payload 的 owner，并只把一次性聚焦参数透传给 `CharacterGraphView`。不要把图谱定点跳转状态再塞回路由、store 或资产视图本身。
- **最近章节/节点数属于前端聚合口径**：资产总览里的“最近出现章节 / 关联结构节点数”目前由 `writerAssetRefs` 与 `OutlineNode.documentId` 绑定推导，只代表当前前端已知引用，不等同于后端统一事实。若未来后端补正式字段，必须先明确新 owner，再替换这层前端聚合逻辑。
- **资产深链当前默认落全局图谱**：从资产总览点进“关系图谱”时，`CharacterGraphView` 当前会切到全局图谱并高亮目标节点，以保证角色/地点/物件最小可达；组织/概念若尚无图谱节点，只允许提示“未接入”，不要伪造成已接线成功。
- **关系图谱节点消费资产引用投影**：`CharacterGraphView` 的全局/卷级/章节级角色节点应优先由 `writerAssetRefs` 的已建档角色引用自动推导；进入图谱不再要求用户选择“从零开始 / 继承全局”，拖拽连线时再自动写入现有全局关系或章节/卷草稿关系，不得新增第二套“图谱资产”存储。
- **概念优先复用 smart keyword 类型，不走纯文本猜测**：`writerAssetRefs` 当前已支持 `organization/concept`，但章节候选里这两类只应优先来自 TipTap smart keyword 的已解析类型或已确认绑定，避免把普通 `@文本` 误判成概念/组织。纯文本模糊提取当前仍只覆盖角色/地点/物件。
- **未建档 `@名称` 不默认推断为角色**：纯文本 `@名称` 未命中任何已建档资产时，只能进入 `unresolved + requiresTypeSelection` 候选；建档绑定前必须由补全推断或作者最小选择 `角色 / 地点 / 物品 / 组织 / 概念`，避免资产闭环从第一步就分类错误。
- **组织当前只进引用链路，不补创建器**：`CharacterGraphView` 已能展示并绑定已建档组织节点，但“组织建档”不在当前 writer 图谱面板 owner 范围内；不要在这里临时发散出第二套组织创建流程。
- **伏笔与未确认候选不进资产总览**：资产总览当前只展示已建档的 `角色 / 地点 / 物件 / 组织 / 概念` 五类资产。`foreshadowing` 虽已出现在实体类型枚举与 Story Harness 内部映射里，但当前没有稳定的统一实体列表 owner；未确认候选继续留在 `CharacterGraphView` 的候选绑定面板，不要在资产总览里临时扩出第六类或 pending 列表。
- **对话上下文提示只保留一处**：`add_to_chat` 注入的片段上下文只允许在 `AIInputArea` 的 prompt 提示条展示；`AISelectionNotice` 只用于 `continue/polish/expand/rewrite` 这类执行态，避免同一条 handoff 在右栏重复提示两次。
- **画布框选坐标按容器内容框与缩放比计算**：`CanvasCore/useCanvasInteraction` 的选区框必须使用容器相对坐标，并按 `getBoundingClientRect()` 与 `clientWidth/clientHeight` 的比例做归一化；平移可继续使用 viewport 坐标，但框选矩形若直接复用 `clientX/clientY`，或忽略宿主缩放比，在工具 overlay、多栏布局或后续外层 `transform: scale(...)` 下会出现框选区域与鼠标实际位置偏移。
- **test=true 兼容**：writer 模块保留 mock/test-mode 工作区入口，新增宿主或工具边界时要同时确认真实 API 路径和 mock 路径都能跑通。
- **文档同步触发条件**：只要修改工作区宿主边界、工具入口策略、快捷键 owner 或 AI handoff 主链，就必须同步本文件和 `docs/plans/v3/implementation/*` 的对应检查点文档。
- **工具联动原则以父仓 guides 为准**：大纲、节拍、资产、图谱、时间线、分支与 AI 的低负担联动口径统一参考 `docs/guides/writer-tool-ai-linkage-principles.md`；后续实现若要新增入口，先对照这份原则判断是否会增加默认复杂度。
