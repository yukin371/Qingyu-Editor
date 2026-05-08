package ai

import "fmt"

// Provider AI 提供商接口
type Provider interface {
	Name() string
	Call(prompt string, context string) (string, error)
}

// Config AI 配置
type Config struct {
	Provider string `json:"provider"` // openai / anthropic / ollama / custom
	APIKey   string `json:"apiKey"`
	BaseURL  string `json:"baseUrl"`
	Model    string `json:"model"`
}

// NewProvider 根据 config 创建对应 Provider
func NewProvider(cfg Config) (Provider, error) {
	switch cfg.Provider {
	case "openai":
		return &OpenAIProvider{cfg: cfg}, nil
	case "anthropic":
		return &AnthropicProvider{cfg: cfg}, nil
	case "ollama":
		return &OllamaProvider{cfg: cfg}, nil
	default:
		return nil, fmt.Errorf("未知的 AI 提供商: %s", cfg.Provider)
	}
}
