/**
 * sanitize.ts 单元测试
 * 测试HTML清理功能和XSS防护
 */


import {
  sanitizeHtml,
  sanitizeMarkdownHtml,
  sanitizeText,
  sanitizeUrl,
  isHtmlSafe,
  initSanitize,
} from '../sanitize'

describe('sanitize', () => {
  beforeEach(() => {
    // 初始化清理钩子
    initSanitize()
  })

  describe('sanitizeHtml', () => {
    it('应该移除script标签', () => {
      const dirty = '<script>alert("XSS")</script><p>安全内容</p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).toContain('<p>安全内容</p>')
    })

    it('应该移除onclick等事件处理器', () => {
      const dirty = '<p onclick="alert(\'XSS\')">点击我</p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('onclick')
    })

    it('应该保留允许的HTML标签', () => {
      const dirty = '<p>段落<strong>粗体</strong><em>斜体</em></p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).toContain('<p>')
      expect(clean).toContain('<strong>')
      expect(clean).toContain('<em>')
    })

    it('应该处理空输入', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })

    it('应该移除iframe标签', () => {
      const dirty = '<iframe src="http://evil.com"></iframe><p>内容</p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<iframe')
      expect(clean).toContain('<p>内容</p>')
    })

    it('应该移除object和embed标签', () => {
      const dirty = '<object data="evil.swf"></object><p>内容</p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<object')
      expect(clean).toContain('<p>内容</p>')
    })

    it('应该清理javascript:协议的链接', () => {
      const dirty = '<a href="javascript:alert(\'XSS\')">点击</a>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('javascript:')
    })
  })

  describe('sanitizeMarkdownHtml', () => {
    it('应该允许Markdown相关的标签', () => {
      const dirty =
        '<h1>标题</h1><p>段落</p><pre><code>代码</code></pre><ul><li>列表</li></ul>'
      const clean = sanitizeMarkdownHtml(dirty)
      expect(clean).toContain('<h1>')
      expect(clean).toContain('<pre>')
      expect(clean).toContain('<code>')
      expect(clean).toContain('<ul>')
      expect(clean).toContain('<li>')
    })

    it('应该移除Markdown中的script标签', () => {
      const dirty =
        '<script>alert("XSS")</script><h1>标题</h1><p>段落</p>'
      const clean = sanitizeMarkdownHtml(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).toContain('<h1>')
    })

    it('应该允许表格标签', () => {
      const dirty =
        '<table><thead><tr><th>列1</th></tr></thead><tbody><tr><td>数据</td></tr></tbody></table>'
      const clean = sanitizeMarkdownHtml(dirty)
      expect(clean).toContain('<table>')
      expect(clean).toContain('<thead>')
      expect(clean).toContain('<tbody>')
    })

    it('应该允许img标签', () => {
      const dirty = '<img src="https://example.com/image.jpg" alt="图片">'
      const clean = sanitizeMarkdownHtml(dirty)
      expect(clean).toContain('<img')
      expect(clean).toContain('src=')
    })
  })

  describe('sanitizeText', () => {
    it('应该转义HTML特殊字符', () => {
      const text = '<script>alert("XSS")</script>普通文本'
      const safe = sanitizeText(text)
      expect(safe).toContain('&lt;script&gt;')
      expect(safe).toContain('&lt;/script&gt;')
      expect(safe).not.toContain('<script>')
    })

    it('应该转义所有HTML标签', () => {
      const text = '<p>段落</p><strong>粗体</strong>'
      const safe = sanitizeText(text)
      expect(safe).toContain('&lt;p&gt;')
      expect(safe).toContain('&lt;/p&gt;')
      expect(safe).not.toContain('<p>')
    })

    it('应该处理空输入', () => {
      expect(sanitizeText('')).toBe('')
      expect(sanitizeText(null as any)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('应该允许http协议', () => {
      const url = 'http://example.com'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('应该允许https协议', () => {
      const url = 'https://example.com'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('应该允许mailto协议', () => {
      const url = 'mailto:test@example.com'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('应该允许tel协议', () => {
      const url = 'tel:+1234567890'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('应该拒绝javascript协议', () => {
      const url = 'javascript:alert("XSS")'
      expect(sanitizeUrl(url)).toBe('')
    })

    it('应该拒绝data协议（除特殊情况）', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>'
      expect(sanitizeUrl(url)).toBe('')
    })

    it('应该处理无效URL', () => {
      expect(sanitizeUrl('not a url')).toBe('')
      expect(sanitizeUrl('')).toBe('')
    })
  })

  describe('isHtmlSafe', () => {
    it('应该检测安全的HTML', () => {
      const safeHtml = '<p>安全段落</p><strong>粗体</strong>'
      expect(isHtmlSafe(safeHtml)).toBe(true)
    })

    it('应该检测不安全的HTML', () => {
      const unsafeHtml = '<script>alert("XSS")</script><p>内容</p>'
      expect(isHtmlSafe(unsafeHtml)).toBe(false)
    })

    it('应该检测包含事件处理器的HTML', () => {
      const unsafeHtml = '<p onclick="alert(\'XSS\')">点击</p>'
      expect(isHtmlSafe(unsafeHtml)).toBe(false)
    })
  })

  describe('XSS攻击向量测试', () => {
    it('应该阻止常见的XSS攻击', () => {
      const attacks = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<body onload="alert(\'XSS\')">',
        '<input onfocus="alert(\'XSS\')" autofocus>',
        '<select onfocus="alert(\'XSS\')" autofocus>',
        '<textarea onfocus="alert(\'XSS\')" autofocus>',
        '<details open ontoggle="alert(\'XSS\')">',
        '<marquee onstart="alert(\'XSS\')">',
      ]

      attacks.forEach((attack) => {
        const clean = sanitizeHtml(attack)
        expect(clean).not.toContain('alert')
        expect(clean).not.toContain('onerror')
        expect(clean).not.toContain('onload')
        expect(clean).not.toContain('onfocus')
        expect(clean).not.toContain('ontoggle')
        expect(clean).not.toContain('onstart')
      })
    })

    it('应该阻止IMG标签的XSS', () => {
      const attack = '<img src="x" onerror="alert(1)">'
      const clean = sanitizeHtml(attack)
      expect(clean).not.toContain('onerror')
    })

    it('应该阻止SVG标签的XSS', () => {
      const attack = '<svg><script>alert(1)</script></svg>'
      const clean = sanitizeHtml(attack)
      expect(clean).not.toContain('<script>')
    })
  })
})
