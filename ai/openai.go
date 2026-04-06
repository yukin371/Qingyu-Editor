package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// OpenAIProvider OpenAI 实现
type OpenAIProvider struct {
	cfg Config
}

func (p *OpenAIProvider) Name() string { return "openai" }

func (p *OpenAIProvider) Call(prompt string, context string) (string, error) {
	return callChatCompletion(p.cfg, prompt, context)
}

// AnthropicProvider Anthropic 实现
type AnthropicProvider struct {
	cfg Config
}

func (p *AnthropicProvider) Name() string { return "anthropic" }

func (p *AnthropicProvider) Call(prompt string, context string) (string, error) {
	// TODO: Anthropic API 格式不同，后续实现
	return "", fmt.Errorf("Anthropic 提供商尚未实现")
}

// OllamaProvider Ollama 本地模型实现
type OllamaProvider struct {
	cfg Config
}

func (p *OllamaProvider) Name() string { return "ollama" }

func (p *OllamaProvider) Call(prompt string, context string) (string, error) {
	return callChatCompletion(p.cfg, prompt, context)
}

// callChatCompletion 通用 ChatCompletion 调用（OpenAI 兼容格式）
func callChatCompletion(cfg Config, prompt string, context string) (string, error) {
	messages := []map[string]string{}
	if context != "" {
		messages = append(messages, map[string]string{"role": "system", "content": context})
	}
	messages = append(messages, map[string]string{"role": "user", "content": prompt})

	body, _ := json.Marshal(map[string]interface{}{
		"model":    cfg.Model,
		"messages": messages,
	})

	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	req, err := http.NewRequest("POST", baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if cfg.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+cfg.APIKey)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI API 返回错误 (%d): %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", err
	}
	if len(result.Choices) == 0 {
		return "", fmt.Errorf("AI API 未返回内容")
	}
	return result.Choices[0].Message.Content, nil
}
