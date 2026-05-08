# Core Services

> 最后更新：2026-03-29

## 职责

前端基础设施层，提供 HTTP 通信、API 网关、错误上报、轮询服务、WebSocket 管理、本地存储、数据校验等底层能力。不包含任何业务逻辑。

## 数据流

```
Store/Composable → http.service → Axios → 后端 /api/v1/*
                      ↓
              api-gateway.service（API 路由聚合）
                      ↓
              error-reporter（错误上报）
```

## 约定 & 陷阱

- **API 前缀自动注入**：http.service 拦截器自动给不以 `/api/v1` 开头的请求加前缀，禁止在业务层手动拼接
- **snake_case → camelCase 自动转换**：响应拦截器自动将后端 snake_case 字段转为 camelCase，业务层统一用 camelCase
- **错误码映射**：后端 4 位业务错误码在前端 `errorCode.ts` 中映射为用户友好消息
- **测试模式**：`mock-data-manager` 通过 `isInTestMode()` 判断，生产环境应完全移除
- **取消请求**：http.service 支持通过 `CancelToken` 取消请求，页面切换时应在 `onUnmounted` 中取消未完成请求
- **统一 WebSocket**：`unified-websocket.service.ts` 管理所有 WebSocket 连接，避免多组件各自创建连接
