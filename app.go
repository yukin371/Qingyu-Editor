package main

import (
	"context"

	"Qingyu-Editor/ai"
	"Qingyu-Editor/database"
)

// App 主应用结构
type App struct {
	ctx context.Context
}

// NewApp 创建应用实例
func NewApp() *App {
	return &App{}
}

// startup 应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// shutdown 应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	database.Close()
}

// InitDatabase 初始化数据库（前端可调用）
func (a *App) InitDatabase() error {
	return database.Init("Qingyu-Editor")
}

// --- AI 相关 ---

// AICall 调用 AI 提供商
func (a *App) AICall(cfg ai.Config, prompt string, context string) (string, error) {
	provider, err := ai.NewProvider(cfg)
	if err != nil {
		return "", err
	}
	return provider.Call(prompt, context)
}
