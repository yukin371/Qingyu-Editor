#!/usr/bin/env sh
#
# validate-commit-msg.sh — 提交信息验证
#
# 拦截规则：
#   1. Co-Authored-By 行包含 AI 标识（Claude / Anthropic / GPT / OpenAI / Gemini）
#   2. 提交信息包含 AI 协作邮箱（noreply@anthropic.com 等）
#   3. 空提交信息
#
# 用法：在 commit-msg hook 中调用
#   . "$(git rev-parse --show-toplevel)/scripts/validate-commit-msg.sh" "$1"
#   或对于子模块，将此脚本复制到子模块 scripts/ 目录
#

set -e

COMMIT_MSG_FILE="$1"

if [ -z "$COMMIT_MSG_FILE" ]; then
  echo "❌ commit-msg hook: 未收到提交信息文件路径"
  exit 1
fi

# 读取提交信息（去除注释行）
COMMIT_MSG=$(sed '/^#/d' "$COMMIT_MSG_FILE")

# ---- 规则 1：空提交信息 ----
if [ -z "$COMMIT_MSG" ]; then
  echo "❌ 提交信息不能为空"
  exit 1
fi

# ---- 规则 2：Co-Authored-By 包含 AI 标识 ----
# 匹配 Co-Authored-By 行中包含 AI 相关标识
AI_PATTERNS="Claude|Anthropic|GPT|OpenAI|Gemini|Copilot|noreply@anthropic|noreply@openai"

COAUTHOR_LINES=$(echo "$COMMIT_MSG" | grep -iE "^[Cc]o-?[Aa]uthored-?[Bb]y:" || true)

if [ -n "$COAUTHOR_LINES" ]; then
  AI_COAUTHOR=$(echo "$COAUTHOR_LINES" | grep -iE "$AI_PATTERNS" || true)
  if [ -n "$AI_COAUTHOR" ]; then
    echo "❌ 提交信息包含 AI 协作者标识，已被拦截："
    echo "$AI_COAUTHOR" | sed 's/^/   /'
    echo ""
    echo "请移除 Co-Authored-By 行中的 AI 相关标识后重新提交。"
    exit 1
  fi
fi

# ---- 规则 3：提交信息正文含 AI 协作邮箱 ----
EMAIL_PATTERNS="noreply@anthropic\.com|noreply@openai\.com"
AI_EMAIL=$(echo "$COMMIT_MSG" | grep -iE "$EMAIL_PATTERNS" || true)

if [ -n "$AI_EMAIL" ]; then
  echo "❌ 提交信息包含 AI 服务邮箱，已被拦截："
  echo "$AI_EMAIL" | sed 's/^/   /'
  exit 1
fi

echo "✅ 提交信息验证通过"
exit 0
