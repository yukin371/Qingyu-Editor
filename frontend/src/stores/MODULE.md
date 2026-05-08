# Pinia Stores

> 最后更新：2026-03-29

## 职责

全局状态管理层，使用 Pinia 管理跨组件共享的业务状态（auth/writer/bookstore/reader/social/wallet/notification 等）。不管理组件内部状态。

## 数据流

```
Vue Component → useXxxStore() → State/Getters/Actions → http.service → 后端 API
                                      ↓
                              localStorage（离线模式降级）
```

## 约定 & 陷阱

- **双模式支持**：Writer Store 支持 `online`（API）和 `offline`（IndexedDB/localStorage）两种模式，通过 `StorageMode` 切换
- **测试模式 Mock**：`isTestModeActive()` 检测 URL 参数 `?test=true`，激活时注入 Mock 数据（云岚纪事等）
- **WebSocket Store**：`websocket.store.ts` 使用独立的 WebSocket 连接管理，不经过 http.service
- **命名约定**：Store 文件名 = 业务域.ts，导出 `useXxxStore`
- **API 前缀**：Store 调用 http.service 时不需要加 `/api/v1`，拦截器自动添加
