# Qingyu-Editor 创作流程设计

**日期**: 2026-05-09
**状态**: 设计完成，待实施
**范围**: Qingyu-Editor 独立编辑器宿主
**前置**:
- `docs/plans/2026-05-09-writer-right-sidebar-dual-mode-design.md`（右侧工具栏）
- `docs/plans/2026-05-08-writer-capability-migration-checklist.md`（迁移清单）
- `story-harness-cli` 的 workflow_engine.py（Gate 门禁参考）

---

## 一、设计目标

把编辑器从"正文编辑器"升级为"创作工程"。主导航围绕作者实际创作路径组织为五个阶段，每个阶段有明确的门禁标准和产出物。

### 核心原则

1. **阶段优先于页面** — 导航以创作阶段为主，不以文件类型或数据表为主
2. **星型结构而非线性流水线** — 以阶段4（逐章施工）为核心锚点，其他阶段以"提供输入"的形式存在
3. **AI 是可选增强** — 没有 AI 也能完成核心写作流程，AI 是增强层而非必须层
4. **Gate 门禁驱动** — 每个阶段有显式的完成条件，系统可自动推断状态并建议下一步
5. **数据驱动而非页面驱动** — 阶段间切换不丢失上下文，前阶段产出自动成为后阶段输入

---

## 二、双层架构

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│  产品导航层（用户看到的 — 左侧步骤条）                         │
│                                                             │
│  阶段1 灵感 ──→ 阶段2 设定 ──→ 阶段3 蓝图 ──→ ★阶段4 施工   │
│                                                             │
│  阶段5 复盘（完本后回顾）                                     │
├─────────────────────────────────────────────────────────────┤
│  工程门禁层（系统内部 — Gate State Machine）                  │
│                                                             │
│  章节级: inspiration → worldbuilding → outline →             │
│          draft → review → export                            │
│                                                             │
│  卷级:   volume_preflight → volume_tooling → volume_review  │
└─────────────────────────────────────────────────────────────┘
```

- **产品导航层**：创作者视角的五阶段步骤条，回答"你在做什么"
- **工程门禁层**：系统视角的 Gate 状态机，回答"你是否准备好进入下一步"

### 2.2 产品导航：五阶段

| 阶段 | 名称 | 核心目标 | 关键产出 |
|------|------|---------|---------|
| 1 | 灵感捕捉 | 把模糊想法收敛成明确方向 | 定位声明、题材选择、黄金三章方向 |
| 2 | 地基构建 | 建立世界、角色、冲突的骨架 | 角色卡、世界法则、关系图、实体图谱 |
| 3 | 蓝图绘制 | 完成大纲、节奏和伏笔规划 | 幕/卷结构、章节大纲、伏笔链、爽点密度 |
| 4 | 逐章施工 | 按章写作，设定和伏笔动态生长 | 成文章节、实体 Wiki、伏笔追踪、节奏对比 |
| 5 | 复盘成长 | 完本后复盘，积累创作方法 | 复盘报告、成长档案、改进建议 |

**星型结构**：阶段 4 是核心锚点，作者大部分时间在此。其他阶段以"向阶段 4 提供输入"的形式存在，可随时回到任何阶段补充或修改。

### 2.3 工程门禁：Gate 状态机

每个章节和卷都有 Story Harness 风格的 Gate 检查。

#### 章节级 Gate

| Gate | 检查内容 | AI 依赖 | 对应阶段 |
|------|---------|---------|---------|
| `inspiration_gate` | 题材定位、核心卖点、节奏策略是否明确 | 弱（AI 可建议） | 阶段1 |
| `worldbuilding_gate` | 核心角色卡完整、世界法则、关系图初版 | 无 | 阶段2 |
| `outline_gate` | 章节方向、beats、scenePlans 齐备 | 弱（AI 可建议 beats） | 阶段3 |
| `draft_gate` | 章节正文存在、字数达标 | 无 | 阶段4 |
| `review_gate` | 章节评审通过、场景评审通过、一致性检查 | 强（评审需 AI） | 阶段4 |
| `export_gate` | review 信号齐备、导出前检查 | 无 | 阶段4 |

#### 卷级 Gate

| Gate | 检查内容 | AI 依赖 |
|------|---------|---------|
| `volume_preflight` | 全卷章节文件齐备 | 无 |
| `volume_tooling` | 实体引用闭环、伏笔处理、设定一致性、战力系统无冲突 | 无 |
| `volume_review` | 卷级 AI 自审通过、独立编辑审查通过 | 强 |

#### Gate 状态值

每个 Gate 有统一的状态枚举：

```typescript
type GateStatus =
  | 'ready'                    // 条件满足，可推进
  | 'blocked'                  // 有阻塞项
  | 'not_applicable'           // 不适用于当前上下文
  | 'pending_review'           // 等待人工确认

interface GateResult {
  gateId: string
  status: GateStatus
  missing: string[]            // 阻塞项列表
  nextActions: string[]        // 系统建议的下一步操作
  completedAt?: string         // ISO timestamp
}
```

#### 决策机制

阶段推进需人工确认：

| 决策 | 含义 |
|------|------|
| `accept` | 接受当前状态，推进到下一 Gate |
| `modify` | 修改后重新检查（标记为 needs_changes） |
| `reject` | 拒绝推进，回到前一阶段 |

---

## 三、AI 依赖分级

### 3.1 分级定义

| 级别 | 含义 | 无 AI 时行为 |
|------|------|-------------|
| **无依赖** | 纯结构化数据或本地计算 | 完全可用 |
| **弱依赖** | AI 可增强体验，但手动操作也能完成 | 降级为手动填写 |
| **强依赖** | 核心功能需要 AI 生成 | 功能不可用，显示提示 |

### 3.2 功能 AI 依赖矩阵

| 功能 | AI 依赖 | 说明 |
|------|---------|------|
| 灵感记录 | 无 | 本地存储即可 |
| 题材模板选择 | 无 | 预置模板库 |
| 选题定位向导 | 弱 | AI 可建议流派/爽点，手动填写也可 |
| 角色卡创建 | 无 | 结构化表单 |
| 世界法则模板 | 无 | 预置模板 |
| 关系网可视化 | 无 | 本地数据 + 图渲染 |
| 一致性预检 | 弱 | 规则检查可离线，深度分析需 AI |
| 大纲编写 | 无 | 文本编辑 |
| beats 建议 | 弱 | AI 可生成，手动编写也行 |
| 章节写作 | 无 | 编辑器核心能力 |
| AI 续写/润色 | 强 | 核心 AI 功能 |
| 章节评审 | 强 | 需要 AI 评审 |
| 场景评审 | 强 | 需要 AI 评审 |
| 校对 | 强 | 需要 AI 校对 |
| 卷级自审 | 强 | 需要独立 AI 代理 |
| 导出 | 无 | 本地文件操作 |
| 复盘报告 | 强 | 需要数据分析 + AI 总结 |

### 3.3 设计约束

- **核心写作流程不得依赖 AI** — 即使没有 AI key，作者也必须能完成：灵感记录 → 角色创建 → 大纲编写 → 正文写作 → 导出
- **AI 增强必须可降级** — 所有 AI 功能都应有"无 AI 时的备用交互方案"
- **AI 结果必须可审查** — 所有 AI 生成的建议、评审、修改都必须经过人工 accept/modify/reject

---

## 四、各阶段详细设计

### 阶段 1：灵感捕捉

**目标**：把模糊想法收敛成明确方向。

#### 1.1 核心任务

- 记录碎片化灵感（一句话、标签分类）
- 选择题材模板（决定后续实体优先级和节奏参数）
- 做选题定位（流派、爽点、目标读者）
- 形成创作方向声明
- 进入黄金三章构建入口

#### 1.2 产出物

| 产出 | 存储位置 | 对应 Gate 字段 |
|------|---------|---------------|
| 一句话梗概 | project.meta | `pitchLine` |
| 题材模板选择 | project.template | `primaryGenre` |
| 核心卖点承诺 | project.promises | `corePromises[]` |
| 目标读者 | project.audience | `targetAudience[]` |
| 节奏策略 | project.pace | `paceContract` |
| 灵感便签集合 | inspirations[] | — |

#### 1.3 `inspiration_gate` 门禁

```typescript
interface InspirationGate {
  has_primary_genre: boolean      // primaryGenre 非空
  has_target_audience: boolean    // targetAudience 非空
  has_core_promises: boolean      // corePromises 非空
  has_pace_contract: boolean      // paceContract 非空
}
// completed = 全部 true
// AI 依赖：弱（可手动填写所有字段）
```

#### 1.4 UI 入口

- 右侧工具栏 → **灵感面板**（日常随时记录灵感）
- 阶段1 专属页 → **选题向导**（首次创建项目时的引导流程）

### 阶段 2：地基构建

**目标**：建立世界、角色、冲突的底层骨架。

#### 2.1 核心任务

- 创建核心角色卡
- 建立世界法则
- 梳理势力/组织框架
- 定义主角欲望与阻碍
- 构建实体关系图

#### 2.2 产出物

| 产出 | 存储位置 | 对应 Gate 字段 |
|------|---------|---------------|
| 核心角色卡 | entities.characters[] | `has_core_characters` |
| 世界法则 | worldbook.rules[] | `has_world_rules` |
| 势力/组织 | entities.factions[] | `has_factions` |
| 关系图初版 | relations[] | `has_relation_map` |

#### 2.3 `worldbuilding_gate` 门禁

```typescript
interface WorldbuildingGate {
  has_core_characters: boolean    // 至少1张核心角色卡（身份、欲望、缺陷）
  has_world_rules: boolean        // 至少1条世界法则（如果题材需要）
  has_relation_map: boolean       // 至少有角色间的初始连接
}
// completed = has_core_characters && has_relation_map
// AI 依赖：无
```

#### 2.4 题材实体优先级

不同题材应优先填充不同实体：

| 题材 | 优先实体 | 原因 |
|------|---------|------|
| 逆袭打脸 | 角色关系网 + 势力等级表 | 打脸依赖阶层对比 |
| 升级碾压 | 力量体系 + 地图势力分布 | 境界决定升级路径 |
| 求知解谜 | 世界法则（规则）+ 关键物品 | 规则是玩法，物品是钥匙 |
| 建设养成 | 资源清单 + 地点/建筑树 | 建设需要资源节点 |
| 情感共鸣 | 角色创伤 + 关系发展节点 | 情感线是主线 |

#### 2.5 UI 入口

- 右侧工具栏 → **设定面板**（双栏：分类列表 + 详情卡片）
- 阶段2 专属页 → **实体构建系统**（角色创建向导、世界法则模板）

### 阶段 3：蓝图绘制

**目标**：完成全书或全卷的大纲、节奏和伏笔规划。

#### 3.1 核心任务

- 选择幕结构（三幕/五幕/流派模板）
- 划分卷与幕
- 安置爽点和高潮
- 规划伏笔埋收链
- 生成章节级细纲和节奏表

#### 3.2 产出物

| 产出 | 存储位置 | 对应 Gate 字段 |
|------|---------|---------------|
| 幕/卷结构 | outline.acts[] | `has_act_structure` |
| 章节方向 | outline.chapters[].direction | `has_direction` |
| 章节节拍 | outline.chapters[].beats[] | `has_beats` |
| 场景计划 | outline.chapters[].scenePlans[] | `has_scene_plans` |
| 伏笔链 | foreshadowing[] | `has_foreshadow_plan` |
| 爽点排布 | outline.paceProfile | `has_pace_profile` |

#### 3.3 `outline_gate` 门禁

```typescript
interface OutlineGate {
  has_direction: boolean          // 章节有方向/目标
  has_beats: boolean              // 章节有 beats 拆解
  has_scene_plans: boolean        // 章节有场景计划
  inspiration_gate_passed: boolean // 阶段1 gate 通过（可选前置）
}
// completed = has_direction && has_beats
// AI 依赖：弱（beats 可手动编写）
```

#### 3.4 题材爽点频率建议

| 题材 | 小爽点频率 | 大爽点频率 |
|------|-----------|-----------|
| 逆袭打脸 | 5-8 章 | 20 章左右 |
| 升级碾压 | 3-5 章 | 每卷末 |
| 求知解谜 | 按副本节奏 | 可能一章一次智斗 |
| 建设养成 | 10-15 章 | 建设里程碑 |
| 情感共鸣 | 按情感推进节点 | 爆发时密度可高 |

#### 3.5 UI 入口

- 左侧面板 → **大纲/章节树**（已有）
- Overlay → **结构舞台**（幕结构可视化）
- 阶段3 专属页 → **大纲推导向导**

### 阶段 4：逐章施工

**目标**：按章写作，世界和伏笔在写作中动态生长。

#### 4.1 核心任务

- 按细纲逐章写作
- 标记实体并自动沉淀到设定
- 管理伏笔（新埋/回收/加强）
- 章节级质量评审和节奏反馈

#### 4.2 产出物

| 产出 | 存储位置 | 对应 Gate 字段 |
|------|---------|---------------|
| 成文章节 | chapters[].content | `chapter_exists` |
| 字数达标 | chapters[].wordCount | `word_count_met` |
| 实体标记 | entity_mentions[] | — |
| 章节评审 | reviews.chapter[] | `chapter_review_count > 0` |
| 场景评审 | reviews.scene[] | `scene_review_count > 0` |

#### 4.3 `draft_gate` + `review_gate` 门禁

```typescript
interface DraftGate {
  chapter_exists: boolean         // 章节正文文件存在
  word_count_met: boolean         // 字数达到目标（可配置）
}
// completed = chapter_exists && word_count_met
// AI 依赖：无

interface ReviewGate {
  chapter_review_count: number    // >= 1
  scene_review_count: number      // >= 1
  consistency_passed: boolean     // 一致性检查通过
}
// completed = 全部满足
// AI 依赖：强（评审需 AI）
```

#### 4.4 卷级 Gate

```typescript
interface VolumeToolingGate {
  mention_action_count: number      // 未闭环的实体引用 = 0
  due_foreshadow_count: number      // 到窗伏笔未处理 = 0
  overdue_foreshadow_count: number  // 逾期伏笔 = 0
  world_onboarding_gap_count: number // 世界设定缺口 = 0
}
// completed = 全部为 0
// AI 依赖：无（纯规则检查）

interface VolumeReviewGate {
  has_volume_self_review: boolean    // 卷级自审存在
  closure_status: 'open' | 'closed'  // 自审结论
  volume_closure_score: number       // >= 3
  chapter_handoff_score: number      // >= 3
  style_readability_score: number    // >= 3
}
// completed = 全部满足
// AI 依赖：强（卷级自审需 AI）
```

#### 4.5 UI 入口

- **编辑器主体** — 正文写作（核心工作区）
- 右侧工具栏 → **AI 面板**（续写/润色/对话）
- 右侧工具栏 → **设定面板**（查阅角色卡、世界法则）
- 右侧工具栏 → **校对面板**（错误列表 + 修正建议）
- Overlay → **关系图谱**（可视化）
- Overlay → **时间线**（可视化）
- Overlay → **结构舞台**（幕结构 + 爽点密度）

### 阶段 5：复盘成长

**目标**：完本后复盘，积累作者自己的创作方法。

#### 5.1 核心任务

- 检查伏笔回收情况
- 评估角色成长曲线
- 对比计划与实际节奏
- 形成下一本书的改进建议

#### 5.2 产出物

| 产出 | 存储位置 |
|------|---------|
| 复盘报告 | reviews.retrospective |
| 伏笔回收率 | foreshadowing.stats |
| 节奏偏差分析 | outline.paceDiff |
| 改进建议 | project.improvements |

#### 5.3 UI 入口

- 阶段5 专属页 → **复盘仪表盘**
- AI 依赖：强（数据分析 + 总结需要 AI）

---

## 五、题材模板库

题材模板是阶段 1-3 的核心输入。作者先选题材模板，再进入选题、实体和大纲构建。

### 5.1 黄金三章模板

#### 逆袭打脸型

- **适用**：赘婿、战神、神医、神豪、鉴宝逆袭
- **第一章**：屈辱现场，先建立共情再抛钩子
- **第二章**：身份揭露或能力初显，给出转折
- **第三章**：小范围打脸兑现，并埋更大冲突
- **情绪曲线**：压抑 → 转折 → 爆发
- **爽点重点**：身份反转、实力碾压、财富碾压

#### 升级碾压型

- **适用**：玄幻、仙侠、系统文、游戏异界、凡人流
- **第一章**：困境中的闪光
- **第二章**：金手指就位，触发条件要有因果
- **第三章**：第一次碾压
- **情绪曲线**：认知固有设定 → 获得超常优势 → 碾压不公
- **爽点重点**：实力展示、跨级突破、世界观扩张

#### 求知解谜型

- **适用**：悬疑、无限流、规则怪谈、灵异、盗墓
- **第一章**：踏入异常
- **第二章**：危险探索，试错触发惩罚并发现裂缝
- **第三章**：第一次破局
- **情绪曲线**：困惑好奇 → 获取线索 → 初见真相曙光
- **爽点重点**：智力破局、规则揭示、谜团推进

#### 建设养成型

- **适用**：种田、基建、领主、家族、经营
- **第一章**：绝境中的领地
- **第二章**：核心优势出现
- **第三章**：第一个建设成果
- **情绪曲线**：看到困局 → 获得工具 → 初见建设成果
- **爽点重点**：资源获取、建设成果、正向循环

#### 情感共鸣型

- **适用**：言情、救赎、群像羁绊、电竞群像、兄弟情
- **第一章**：展示孤独或遗憾
- **第二章**：闯入者登场
- **第三章**：因 TA 而改变的第一个举动
- **情绪曲线**：孤独/遗憾 → 特殊的人出现 → 因对方看见新可能
- **爽点重点**：关系推进、情感共鸣、人格魅力

#### 特殊处理：规则怪谈/微短剧

- 第一章直接亮规则，不铺日常
- 2000 字内完成规则验证和惩罚建立
- 3000 字结尾完成主角第一次破局
- 核心目标：极致压缩

### 5.2 模板对各阶段的作用

| 阶段 | 模板作用 |
|------|---------|
| 阶段1 | 选模板，定流派和开篇骨架 |
| 阶段2 | 按模板决定先填哪些实体字段（题材实体优先级） |
| 阶段3 | 按模板生成爽点密度、黄金三章和伏笔链 |
| 阶段4 | 根据模板的计划曲线和实际写作曲线做偏差提示 |

---

## 六、导航与 UI 设计

### 6.1 主导航：左侧步骤条 + 中央工作区 + 右侧工具栏

```
┌──────────┬──────────────────────┬──────────┬──┐
│          │                      │          │  │
│ 左侧面板  │      中央工作区       │ 右侧工具栏│Bar│
│          │                      │          │  │
│ [步骤条]  │  阶段专属工作内容     │ AI/设定  │AI│
│          │                      │ /校对    │设│
│ ★施工    │  （阶段4 = 编辑器）   │ /灵感    │校│
│  蓝图    │  （阶段1 = 向导）     │          │灵│
│  设定    │  （阶段2 = 实体构建） │          │  │
│  灵感    │  （阶段3 = 大纲推导） │          │  │
│  复盘    │  （阶段5 = 复盘仪表） │          │  │
│          │                      │          │  │
└──────────┴──────────────────────┴──────────┴──┘
```

- **左侧步骤条**：显示五阶段，当前阶段高亮，各阶段 Gate 状态指示
- **中央工作区**：根据当前阶段显示对应内容
- **右侧工具栏**：常驻工具（AI/设定/校对/灵感），不受阶段切换影响
- **Activity Bar**：最右侧，切换右侧工具内容

### 6.2 Gate 状态指示

步骤条中每个阶段旁显示 Gate 状态：

| 图标 | 含义 |
|------|------|
| ● 绿色 | Gate 通过（ready） |
| ● 黄色 | Gate 部分满足（有 missing 项） |
| ● 灰色 | Gate 未开始 |
| ● 红色 | Gate 阻塞（有严重问题） |

### 6.3 Next Actions 面板

当 Gate 未通过时，中央工作区顶部显示 Next Actions 卡片：

```
┌─────────────────────────────────────┐
│ 📋 下一步建议                        │
│                                     │
│ • 补充核心角色卡的"核心欲望"字段      │
│ • 至少建立2个角色间的关系连接         │
│ • 选择题材模板以获得实体填充建议       │
│                                     │
│ [忽略] [开始处理]                    │
└─────────────────────────────────────┘
```

---

## 七、数据模型

### 7.1 核心状态文件（SQLite）

| 表 | 用途 | 关键字段 |
|---|------|---------|
| `projects` | 项目元数据 | genre, template, pace_contract |
| `chapters` | 章节数据 | content, word_count, direction, beats |
| `entities` | 实体（角色/物品/地点/组织/概念） | type, name, attributes, relations |
| `worldbook` | 世界法则 | rules, factions, power_systems |
| `outlines` | 大纲 | acts, chapters[].beats, scenePlans |
| `inspirations` | 灵感卡片 | title, content, tags, chapter_ref |
| `foreshadowing` | 伏笔追踪 | type(埋/收), window, status |
| `reviews` | 评审结果 | chapter_id, type, scores, issues |
| `gate_status` | Gate 状态 | gate_id, status, missing, next_actions |

### 7.2 Gate 状态持久化

```typescript
interface GateStatusRecord {
  projectId: string
  chapterId?: string           // 章节级 gate 需要
  volumeId?: string            // 卷级 gate 需要
  gateId: string
  status: GateStatus
  missing: string[]
  nextActions: string[]
  completedAt?: string
  updatedAt: string
}
```

---

## 八、实施路径

### 8.1 Wave 规划

```
Wave 1 ──→ Wave 2 ──→ Wave 3 ──→ Wave 4
阶段4锚定   阶段2设定   阶段1+3灵感蓝图  卷级闭环+复盘
```

### Wave 1：阶段 4 锚定 + Gate 机制

**目标**：作者能在编辑器中流畅写作，同时查阅设定、记录灵感、使用 AI

**内容**：
- 右侧工具栏双模式（P0-P5，见 `writer-right-sidebar-dual-mode-design.md`）
- `draft_gate` + `review_gate` 实现
- Next Actions 面板
- Gate 状态 SQLite 持久化

**验收标准**：
- [ ] 作者能打开项目、切换章节、编辑正文、自动保存
- [ ] 右侧栏 AI/设定/校对/灵感面板正常工作
- [ ] draft_gate 能检测章节是否完成
- [ ] review_gate 能显示评审状态

### Wave 2：阶段 2 设定 + Gate

**目标**：构建完整的创作世界观

**内容**：
- 角色卡结构化表单（从右侧设定面板延伸）
- 世界法则模板
- 关系网可视化升级（从 Overlay 到嵌入面板）
- `worldbuilding_gate` 检查
- 题材实体优先级面板

**验收标准**：
- [ ] 可创建角色卡并填写身份/欲望/缺陷/关系
- [ ] worldbuilding_gate 能检测核心角色和关系图是否就绪
- [ ] 选择题材模板后显示实体填充建议

### Wave 3：阶段 1+3 灵感蓝图 + Gate

**目标**：从灵感到大纲的完整上游链路

**内容**：
- 题材模板库（5 类黄金三章模板）
- 选题定位向导
- 大纲推导向导
- 伏笔埋收规划板
- `inspiration_gate` + `outline_gate` 检查
- 爽点密度仪表

**验收标准**：
- [ ] 可选择题材模板并生成黄金三章方向
- [ ] inspiration_gate 能检测定位声明是否完整
- [ ] outline_gate 能检测章节方向和 beats
- [ ] 伏笔可标记为埋设/窗口/回收状态

### Wave 4：卷级闭环 + 阶段 5 复盘

**目标**：完本质量保障和方法论积累

**内容**：
- 卷级工具门禁（实体闭环、伏笔处理）
- 卷级 AI 自审
- 复盘报告生成
- 成长档案
- `volume_*` gates

**验收标准**：
- [ ] volume_tooling_gate 能检测未闭环实体和逾期伏笔
- [ ] 可生成卷级复盘报告
- [ ] 复盘报告包含伏笔回收率和节奏偏差分析

### 8.2 与现有设计的关系

| 现有设计 | 本文档中的位置 |
|---------|-------------|
| 右侧工具栏双模式 | Wave 1 的 UI 层实现 |
| Overlay 工具面板 | 阶段 4 的深度操作入口 |
| 题材模板库 | 阶段 1-3 的核心输入（保留原文档全部内容） |
| workspaceLayoutStore | Gate 状态的 UI 绑定层 |
| story-harness-cli workflow_engine | Gate 状态机的工程参考 |

---

## 九、与 Story Harness CLI 的关系

Story Harness CLI 是独立的 CLI 工具，本项目借鉴其 Gate 门禁机制但独立实现：

| 概念 | Story Harness | Qingyu-Editor |
|------|-------------|---------------|
| 存储格式 | YAML/JSON 文件 | SQLite 数据库 |
| 运行方式 | CLI 命令 | 桌面应用 GUI |
| Gate 定义 | Python workflow_engine | TypeScript state machine |
| AI Provider | OpenAI API | Wails AI bindings |
| 章节工作流 | 6 阶段 | 6 阶段（映射到 5 产品阶段） |
| 卷级工作流 | 3 阶段 | 3 阶段（直接借鉴） |
| 决策机制 | CLI 参数 | GUI accept/modify/reject |

**长期目标**：两者的 Gate 状态可通过文件协议互导，实现 CLI 批量处理 + GUI 精细编辑的互补工作流。

---

## 十、风险与注意事项

1. **Gate 不应成为创作枷锁** — Gate 是建议性的质量检查，不是强制的流程卡点。作者可以跳过任何 Gate 直接进入阶段 4 写作。
2. **AI 功能降级体验** — 所有强依赖 AI 的功能在无 AI 时必须优雅降级（显示"需要配置 AI 服务"提示，而非报错或白屏）。
3. **数据迁移** — Wave 2-4 引入的新数据模型（entities、worldbook、foreshadowing）需要考虑与现有 EncyclopediaView 数据的兼容。
4. **性能** — Gate 状态推断应增量计算，不应每次切换章节都全量扫描。
5. **SQLite 并发** — 桌面应用单用户场景，但需注意批量导入/导出时的写锁。
