package agent

import (
	"context"
	"fmt"
)

// Tool 智能体可调用的工具接口
type Tool interface {
	Name() string
	Description() string
	Parameters() map[string]any
	Execute(ctx context.Context, params map[string]any) (string, error)
}

// ToolRouter 工具注册与分发
type ToolRouter struct {
	tools map[string]Tool
}

// NewToolRouter 创建工具路由器
func NewToolRouter() *ToolRouter {
	return &ToolRouter{
		tools: make(map[string]Tool),
	}
}

// Register 注册工具
func (r *ToolRouter) Register(tool Tool) {
	r.tools[tool.Name()] = tool
}

// Dispatch 按名称调用工具
func (r *ToolRouter) Dispatch(ctx context.Context, toolName string, params map[string]any) (string, error) {
	tool, ok := r.tools[toolName]
	if !ok {
		return "", fmt.Errorf("工具不存在: %s", toolName)
	}
	return tool.Execute(ctx, params)
}

// ListTools 返回所有注册工具
func (r *ToolRouter) ListTools() []Tool {
	tools := make([]Tool, 0, len(r.tools))
	for _, tool := range r.tools {
		tools = append(tools, tool)
	}
	return tools
}

// ToolDefinitions 返回 OpenAI function calling 格式的工具定义
func (r *ToolRouter) ToolDefinitions() []map[string]any {
	defs := make([]map[string]any, 0, len(r.tools))
	for _, tool := range r.tools {
		defs = append(defs, map[string]any{
			"type": "function",
			"function": map[string]any{
				"name":        tool.Name(),
				"description": tool.Description(),
				"parameters":  tool.Parameters(),
			},
		})
	}
	return defs
}
