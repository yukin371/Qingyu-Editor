# Reader模块Generated API切换 - 回滚方案

**日期**: 2026-01-28
**状态**: ✅ 已成功切换

## 回滚方案

如果generated API出现问题，可以立即回滚到旧版本喵~

### 方案1：快速回滚（推荐）

修改文件：`src/modules/reader/api/index.ts`

```typescript
// 从（当前使用wrapper）
export * from './wrapper'

// 改为（使用manual目录的旧代码）
export * from './manual/books'
export * from './manual/bookmarks'
export * from './manual/chapters'
export * from './manual/collections'
export * from './manual/comments'
export * from './manual/fonts'
export * from './manual/history'
export * from './manual/likes'
export * from './manual/progress'
export * from './manual/rating'
export * from './manual/reader'
export * from './manual/themes'
```

### 方案2：恢复旧文件结构

```bash
cd /e/Github/Qingyu/Qingyu_fronted/src/modules/reader/api
mv manual/*.ts .
rm -rf manual/ generated/ __tests__/
```

## 验证清单

切换后需要验证：

- [ ] `npm run type-check` 无错误
- [ ] `npm run test` 相关测试通过
- [ ] 页面功能正常（书架、阅读、书签等）
- [ ] API调用无错误

## 当前状态

✅ **已成功切换**：
- 旧API文件：`manual/`目录
- 新API系统：`wrapper.ts` → `generated/reader.ts`
- 测试：4/4通过
- 类型检查：通过（reader模块无错误）

## 备份说明

所有旧代码都保留在`manual/`目录中，可以随时恢复喵~

如果手动删除了manual目录，可以通过git恢复喵~
```bash
git checkout HEAD -- src/modules/reader/api/manual/
```
