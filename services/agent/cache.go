package agent

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"sync"
)

// ToolCache 工具结果缓存
type ToolCache struct {
	mu    sync.RWMutex
	store map[string]string // cacheKey -> result
}

// NewToolCache 创建工具缓存
func NewToolCache() *ToolCache {
	return &ToolCache{
		store: make(map[string]string),
	}
}

// Get 获取缓存
func (c *ToolCache) Get(toolName string, params map[string]any) (string, bool) {
	key := cacheKey(toolName, params)
	c.mu.RLock()
	defer c.mu.RUnlock()
	val, ok := c.store[key]
	return val, ok
}

// Set 设置缓存
func (c *ToolCache) Set(toolName string, params map[string]any, result string) {
	key := cacheKey(toolName, params)
	c.mu.Lock()
	defer c.mu.Unlock()
	c.store[key] = result
}

// InvalidateEntity 失效与指定实体相关的缓存
func (c *ToolCache) InvalidateEntity(entityType string, entityID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	// 简单策略：清除所有包含该 entityID 的缓存条目
	// cacheKey 格式为 toolName:hash(params)，无法直接匹配
	// 所以这里清除全部缓存（保守策略）
	// TODO: Phase 5 精确失效
	c.store = make(map[string]string)
}

// InvalidateAll 清除全部缓存
func (c *ToolCache) InvalidateAll() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.store = make(map[string]string)
}

// 读工具名称前缀列表（只有这些工具会被缓存）
var cachableTools = map[string]bool{
	"list_characters":          true,
	"get_character":            true,
	"get_character_relations":  true,
	"list_volumes_chapters":    true,
	"get_chapter_content":      true,
	"get_project_summary":      true,
	"get_world_settings":       true,
	"list_locations":           true,
	"get_location":             true,
	"get_location_relations":   true,
	"list_timelines":           true,
	"list_timeline_events":     true,
	"get_timeline_event":       true,
	"get_inspiration_notes":    true,
}

// CachedToolRouter 带缓存的路由器
type CachedToolRouter struct {
	inner *ToolRouter
	cache *ToolCache
}

// NewCachedToolRouter 创建带缓存的路由器
func NewCachedToolRouter(inner *ToolRouter, cache *ToolCache) *CachedToolRouter {
	return &CachedToolRouter{inner: inner, cache: cache}
}

// Dispatch 调用工具（读工具带缓存）
func (r *CachedToolRouter) Dispatch(ctx context.Context, toolName string, params map[string]any) (string, error) {
	if cachableTools[toolName] {
		if cached, ok := r.cache.Get(toolName, params); ok {
			return cached, nil
		}

		result, err := r.inner.Dispatch(ctx, toolName, params)
		if err != nil {
			return "", err
		}

		r.cache.Set(toolName, params, result)
		return result, nil
	}

	// 写工具不缓存
	return r.inner.Dispatch(ctx, toolName, params)
}

// ToolDefinitions 委托给内部 router
func (r *CachedToolRouter) ToolDefinitions() []map[string]any {
	return r.inner.ToolDefinitions()
}

func cacheKey(toolName string, params map[string]any) string {
	paramsJSON, _ := json.Marshal(params)
	hash := sha256.Sum256(paramsJSON)
	return fmt.Sprintf("%s:%x", toolName, hash[:8])
}
