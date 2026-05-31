package agent

import (
	"context"
	"testing"
)

// --- 测试用 fake 工具 ---

type fakeTool struct {
	name        string
	description string
	parameters  map[string]any
	calledWith  map[string]any
	returnVal   string
	returnErr   error
	executeFunc func(ctx context.Context, params map[string]any) (string, error)
}

func (f *fakeTool) Name() string        { return f.name }
func (f *fakeTool) Description() string { return f.description }
func (f *fakeTool) Parameters() map[string]any {
	return f.parameters
}

func (f *fakeTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	f.calledWith = params
	if f.executeFunc != nil {
		return f.executeFunc(ctx, params)
	}
	return f.returnVal, f.returnErr
}

// --- ToolRouter 测试 ---

func TestToolRouter_RegisterAndDispatch(t *testing.T) {
	router := NewToolRouter()

	tool := &fakeTool{
		name:        "get_character",
		description: "获取角色详情",
		returnVal:   `{"name":"林雪","role":"主角"}`,
	}

	router.Register(tool)

	result, err := router.Dispatch(context.Background(), "get_character", map[string]any{
		"character_id": "char_001",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result != `{"name":"林雪","role":"主角"}` {
		t.Fatalf("expected json result, got %q", result)
	}
	if tool.calledWith["character_id"] != "char_001" {
		t.Fatalf("expected character_id=char_001, got %v", tool.calledWith["character_id"])
	}
}

func TestToolRouter_DispatchUnknownTool(t *testing.T) {
	router := NewToolRouter()

	_, err := router.Dispatch(context.Background(), "nonexistent", nil)
	if err == nil {
		t.Fatal("expected error for unknown tool, got nil")
	}
}

func TestToolRouter_ListTools(t *testing.T) {
	router := NewToolRouter()

	router.Register(&fakeTool{name: "get_character", description: "获取角色"})
	router.Register(&fakeTool{name: "list_characters", description: "列出角色"})
	router.Register(&fakeTool{name: "get_chapter", description: "获取章节"})

	tools := router.ListTools()
	if len(tools) != 3 {
		t.Fatalf("expected 3 tools, got %d", len(tools))
	}

	names := map[string]bool{}
	for _, tool := range tools {
		names[tool.Name()] = true
	}
	if !names["get_character"] || !names["list_characters"] || !names["get_chapter"] {
		t.Fatalf("expected all 3 tool names, got %v", names)
	}
}

func TestToolRouter_ToolDefinitions(t *testing.T) {
	router := NewToolRouter()

	router.Register(&fakeTool{
		name:        "list_characters",
		description: "列出项目中的角色摘要",
		parameters: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"project_id": map[string]any{
					"type":        "string",
					"description": "项目ID",
				},
			},
			"required": []string{"project_id"},
		},
	})

	defs := router.ToolDefinitions()
	if len(defs) != 1 {
		t.Fatalf("expected 1 definition, got %d", len(defs))
	}

	def := defs[0]
	if def["type"] != "function" {
		t.Fatalf("expected type=function, got %v", def["type"])
	}

	fn, ok := def["function"].(map[string]any)
	if !ok {
		t.Fatal("expected function to be a map")
	}
	if fn["name"] != "list_characters" {
		t.Fatalf("expected name=list_characters, got %v", fn["name"])
	}
	if fn["description"] != "列出项目中的角色摘要" {
		t.Fatalf("expected description, got %v", fn["description"])
	}
	if fn["parameters"] == nil {
		t.Fatal("expected parameters to be set")
	}
}

func TestToolRouter_DispatchPropagatesError(t *testing.T) {
	router := NewToolRouter()

	tool := &fakeTool{
		name:      "failing_tool",
		returnErr: context.DeadlineExceeded,
	}
	router.Register(tool)

	_, err := router.Dispatch(context.Background(), "failing_tool", nil)
	if err != context.DeadlineExceeded {
		t.Fatalf("expected DeadlineExceeded, got %v", err)
	}
}
