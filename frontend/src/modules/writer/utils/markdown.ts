/**
 * Markdown rendering utilities
 */

import { sanitizeMarkdownHtml } from '@/utils/sanitize'

/**
 * Simple markdown to HTML renderer
 * Note: In production, consider using a library like marked or markdown-it
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  // Escape HTML
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>')

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br />')

  const result = '<p>' + html + '</p>'

  // 使用DOMPurify清理Markdown生成的HTML，防止XSS攻击
  return sanitizeMarkdownHtml(result)
}
