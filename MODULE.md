# Qingyu-Editor 模块上下文

## 模块职责

- 提供独立桌面写作工具的本地运行时，承接 `Wails -> Go services -> SQLite` 主链。
- 维护项目、卷、章节、角色、地点等本地写作资产的持久化与业务规则。
- 向前端 `wailsjs/go/main/App` 暴露稳定的本地数据桥接接口。

## Owns

- `app.go`、`main.go` 的桌面端 Wails 绑定入口。
- `database/` 下的 SQLite 连接、schema、`sqlc` 查询定义与生成代码。
- `services/` 下的本地 CRUD、排序、关系校验、字数刷新等业务编排。

## Must not own

- 不直接拥有云端 REST API、主站后端 Mongo 数据真相或跨仓库治理规则。
- 不把前端页面状态、组件表现或 design-system 约束下沉到 Go service。
- 不在 `services/` 中重新扩散一套手写 SQL 拼接风格；本地查询统一收口到 `database/queries` + `sqlc`。

## 关键依赖

- `github.com/mattn/go-sqlite3` 负责本地 SQLite 驱动。
- `sqlc.yaml` + `database/schema.sql` + `database/queries/*.sql` 生成 `database/sqlc` 查询层。
- `frontend/src/modules/writer/data-bridge/wails.ts` 消费 Wails 暴露的方法。

## 不变量

- Wails 对外方法签名应尽量稳定，避免无必要破坏前端桥接层。
- schema 真相在 `database/schema.sql`，`database/db.go` 只负责嵌入和执行迁移。
- `services/` 负责业务校验、默认值、事务和结果映射，不直接散落 SQL 字符串。

## 常见坑

1. SQLite 可空列在 `sqlc` 中会生成 `sql.NullString` / `sql.NullInt64`，service 侧必须显式转换。
2. `COUNT`/聚合列若不做类型收窄，生成代码可能退化成 `interface{}`。
3. 涉及排序重写或跨作用域移动时，事务要通过 `queries.WithTx(tx)` 复用同一套生成查询。

## 文档同步触发条件

- 新增或修改本地持久化表、索引、关系约束。
- 调整 `sqlc` 生成路径、schema 管理方式或 service/repository 边界。
- Wails 数据桥方法签名变化，或本地资产 owner 从桌面端切换到其他链路。
