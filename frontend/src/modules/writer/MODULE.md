# Writer Module

> 最后更新：2026-04-30

## 职责

承接写作工作区、Editor V3、Story Harness、AI 工作台与辅助工具的一体化前端宿主。`src/modules/writer` 负责把章节编辑、建议生成、提案暂存、工具查看与 AI handoff 串成同一条作者工作流；不负责后端事实真相，也不在主编辑区再维护第二套工具页宿主。独立编辑器宿主默认首屏应直接进入编辑器工作区，`dashboard / projects` 只允许作为兼容遗留视图存在，不能继续充当主导航壳。

## 数据流

```
章节/项目路由 → ProjectWorkspace → WorkspaceShell（上/中/下宿主）
                               ├→ TipTap + Story Harness（主写作面）
                               ├→ WorkspaceToolOverlay（关系图谱/时间线/分支/结构舞台）
                               └→ WorkspaceRightPanel（AI 工作台 / proposal / apply feedback）

工具交互/选区动作 → trigger-ai-action → handleWorkflowAction → 右侧 AI 工作台
快捷键配置 → useShortcutConfig → useWorkspaceShortcuts → overlay / workspace action
旧 encyclopedia deep-link → ProjectWorkspace 兼容层 → 打开 overlay → 主路由回收为 writing
```

## 约定 & 陷阱

- **工具唯一入口**：`relations / timeline / branches / structure` 只允许通过 `WorkspaceToolOverlay` 承载；不要再让 `WorkspaceEditorContent` 主内容区直接切成工具页。
- **编辑器是默认首页**：独立编辑器的 `/` 与 `/writer` 都应优先落到 `ProjectWorkspace`，不要再让 `WriterDashboard`、`ProjectListView` 或平台式头部导航充当默认宿主。
- **布局壳 owner 单一**：`WorkspaceShell` 负责上/中/下区域的视口壳，`EditorLayout` 负责左/主/右分栏；`ProjectWorkspace` 只做数据编排、事件桥接和 slot 装配。
- **资产总览也走 overlay owner**：`assets` 与 `structure / relations / timeline / branches` 一样，只允许通过 `WorkspaceToolOverlay` 承载；分类状态 owner 在 overlay，自身视图只负责展示与发事件，避免路由、宿主、视图三处各维护一套资产分类状态。
- **结构舞台跳资产总览也只走 overlay 切换**：`StructureInspectorPanel` 里的“查看全局资产”只允许发 `switch-tool('assets')`，再由 `StructureStageView -> WorkspaceToolOverlay` 透传；不要在结构舞台内部内嵌资产列表、复制分类状态，或新增第二套资产宿主。
- **主区优先写作**：即使从旧 `tool=encyclopedia&encyclopediaView=*` 链接进入，也应自动转成 overlay 打开，并让主工作区保持写作态。
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
- **writer 侧 AI 请求必须走统一 API facade**：聊天、续写、改写、扩写、总结、审校，以及 workbench 的章节总结/敏感词检测，都应先收敛到 `src/modules/ai/api` 下的统一 request helper，再决定是直连 AI 服务还是走后端 `/api/v1/ai/*`。不要在组件里各自直接 new axios、各自写 timeout，避免再次出现 15s / 60s / 默认值混杂。
- **文档工具协议优先复用 writer 文档树与内容接口**：`list_documents / read_document / search_document / patch_document` 这类 agent 能力，优先复用 `getDocumentTree / getDocumentContent(s) / updateDocumentContent` 及其 service 封装，不要再造第二套“AI 文件系统”。`patch_document` 即使后续接入真实 tool calling，也必须保留版本校验，并继续走正文 diff / 编辑器确认链路，不能让 AI 直接静默落盘。
- **`/doc` 命令桥只做轻量演示接入**：`AIPanel` 内的 `/doc list/read/search/patch` 目前是面向当前 writer 工作区的本地命令桥。`list/read/search` 可直接返回文本结果；`patch` 必须统一转换成 `applyGeneratedText -> ProjectWorkspace.handleAIApplyGeneratedText` 的正文 diff。若目标不是当前章节，只允许先读取目标章节内容、生成预览，再通过 `targetDocumentId/targetDocumentTitle` 让宿主切章后挂起 diff，不允许绕过编辑器直接静默保存。
- **会话操作应并入工具栏，不再回到独立头部**：清空当前对话、重命名、新建会话等动作统一放在 `AIConversationToolbar`，不要为了单个会话动作再长回额外标题栏。
- **Harness 入口走侧边 activity bar，不占顶部模式栏**：`WorkspaceRightPanel` 顶部不再为 `对话 / Harness` 单独保留一行 tabs；Story Harness 应通过右侧按钮显隐，正文协作区把垂直空间让给 AI 工作台本体。
- **Review Packet 预览只做前端只读聚合**：`StoryHarnessReviewPacketDrawer` 当前只聚合章节正文、Context Lens、活跃实体/关系、Change Request 和轻量 gate 摘要，服务人类审查，不写后端、不导入外部 Story Canvas 文件，也不替代后续后端正式 review packet owner。
- **Workflow Gate Panel 只做可见检查点**：`StoryHarnessWorkflowGatePanel` 复用 `storyHarnessWorkflowGates.ts` 的章节级判断，展示写前目标、写后正文、修后建议、卷级审查状态；它只负责打开审查包、建议队列或触发已有索引入口，不持久化 gate decision，不引入自动 runner，也不阻塞作者继续写作。
- **全屏工具 handoff 要复用共享实体上下文**：`CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 发给 AI 的 `add_to_chat` 文本不能只带局部节点名；应优先复用 `useWorkflowContext` 产出的 `activeEntities` / `workflowContext`，把当前章节的活跃角色、物品、地点等上下文一起带过去，避免工具页再次回到各自拼接一套孤立上下文。
- **全屏工具可见上下文由 overlay 统一展示**：`WorkspaceToolOverlay` 应使用 `useWorkflowContext` 同 owner 的摘要能力，把章节 / 场景 / 活跃实体显示在工具层顶部；不要再让 `CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 各自维护一份独立的“当前上下文”条。
- **资产总览优先复用统一实体口径**：`EncyclopediaView` 当前已被复用为 Phase 4 资产总览 MVP，数据源应优先拼接 `writerStore.characters / locations`、统一实体接口 `api/entities.ts`（至少 item / organization）与 `conceptApi`，不要再额外新建影子资产 store。若后续要升级为独立 `AssetsOverviewView`，也必须先保持这套聚合口径不变。
- **资产总览图谱深链由 overlay 接管**：`EncyclopediaView` 只负责发 `focus-graph-asset + switch-tool` 事件，不自己持有图谱 focus 状态；`WorkspaceToolOverlay` 是这条 focus payload 的 owner，并只把一次性聚焦参数透传给 `CharacterGraphView`。不要把图谱定点跳转状态再塞回路由、store 或资产视图本身。
- **最近章节/节点数属于前端聚合口径**：资产总览里的“最近出现章节 / 关联结构节点数”目前由 `writerAssetRefs` 与 `OutlineNode.documentId` 绑定推导，只代表当前前端已知引用，不等同于后端统一事实。若未来后端补正式字段，必须先明确新 owner，再替换这层前端聚合逻辑。
- **资产深链当前默认落全局图谱**：从资产总览点进“关系图谱”时，`CharacterGraphView` 当前会切到全局图谱并高亮目标节点，以保证角色/地点/物件最小可达；组织/概念若尚无图谱节点，只允许提示“未接入”，不要伪造成已接线成功。
- **概念优先复用 smart keyword 类型，不走纯文本猜测**：`writerAssetRefs` 当前已支持 `organization/concept`，但章节候选里这两类只应优先来自 TipTap smart keyword 的已解析类型或已确认绑定，避免把普通 `@文本` 误判成概念/组织。纯文本模糊提取当前仍只覆盖角色/地点/物件。
- **组织当前只进引用链路，不补创建器**：`CharacterGraphView` 已能展示并绑定已建档组织节点，但“组织建档”不在当前 writer 图谱面板 owner 范围内；不要在这里临时发散出第二套组织创建流程。
- **伏笔与未确认候选不进资产总览**：资产总览当前只展示已建档的 `角色 / 地点 / 物件 / 组织 / 概念` 五类资产。`foreshadowing` 虽已出现在实体类型枚举与 Story Harness 内部映射里，但当前没有稳定的统一实体列表 owner；未确认候选继续留在 `CharacterGraphView` 的候选绑定面板，不要在资产总览里临时扩出第六类或 pending 列表。
- **对话上下文提示只保留一处**：`add_to_chat` 注入的片段上下文只允许在 `AIInputArea` 的 prompt 提示条展示；`AISelectionNotice` 只用于 `continue/polish/expand/rewrite` 这类执行态，避免同一条 handoff 在右栏重复提示两次。
- **画布框选坐标按容器内容框与缩放比计算**：`CanvasCore/useCanvasInteraction` 的选区框必须使用容器相对坐标，并按 `getBoundingClientRect()` 与 `clientWidth/clientHeight` 的比例做归一化；平移可继续使用 viewport 坐标，但框选矩形若直接复用 `clientX/clientY`，或忽略宿主缩放比，在工具 overlay、多栏布局或后续外层 `transform: scale(...)` 下会出现框选区域与鼠标实际位置偏移。
- **test=true 兼容**：writer 模块保留 mock/test-mode 工作区入口，新增宿主或工具边界时要同时确认真实 API 路径和 mock 路径都能跑通。
- **文档同步触发条件**：只要修改工作区宿主边界、工具入口策略、快捷键 owner 或 AI handoff 主链，就必须同步本文件和 `docs/plans/v3/implementation/*` 的对应检查点文档。
