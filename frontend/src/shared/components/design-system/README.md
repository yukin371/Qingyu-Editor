# shared/components/design-system（Legacy Archive）

> 该目录的运行时代码壳已于 2026-05-11 退场。

## 当前状态

- `src/shared/components/design-system` 不再提供运行时组件或 token 出口。
- canonical owner 已收口到：
  - `@/design-system`
  - `@/design-system/components`
  - `@/design-system/tokens`
  - `@/design-system/services`

## 归档位置

- 第一批 legacy 兼容文件：`frontend/.cleanup-backups/2026-05-11-legacy-compat/`
- shared 设计系统运行时代码壳：`frontend/.cleanup-backups/2026-05-11-shared-design-system-runtime-shell/`

## 迁移规则

- 新代码禁止再使用 `@/shared/components/design-system` 路径。
- 如需恢复历史 wrapper，只能从备份目录显式取回，并先确认 canonical owner 仍无法满足需求。
- 若未来仍发现运行时代码引用这个目录，说明存在回退，应先纠正依赖路径，再继续开发。
