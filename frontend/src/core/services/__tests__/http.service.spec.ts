import { beforeAll, describe, expect, it, vi } from 'vitest'

let buildAuthRedirectPath: typeof import('../http.service').buildAuthRedirectPath
let resolveSafeAuthRedirectTarget: typeof import('../http.service').resolveSafeAuthRedirectTarget

beforeAll(async () => {
  const actual = await vi.importActual<typeof import('../http.service')>('../http.service')
  buildAuthRedirectPath = actual.buildAuthRedirectPath
  resolveSafeAuthRedirectTarget = actual.resolveSafeAuthRedirectTarget
})

describe('http.service', () => {
  describe('buildAuthRedirectPath', () => {
    it('应该保留当前页面的 query 参数', () => {
      expect(buildAuthRedirectPath('/admin/quota/alerts', '?status=all&page=2')).toBe(
        '/writer?redirect=%2Fadmin%2Fquota%2Falerts%3Fstatus%3Dall%26page%3D2',
      )
    })

    it('应该在 auth 页面回到编辑器入口', () => {
      expect(buildAuthRedirectPath('/auth', '?redirect=%2Fadmin')).toBe('/writer')
    })

    it('应该在首页回到编辑器入口', () => {
      expect(buildAuthRedirectPath('/', '?from=home')).toBe('/writer')
    })

    it('应该在编辑器路径保持编辑器入口', () => {
      expect(buildAuthRedirectPath('/writer', '?redirect=%2Fwriter')).toBe('/writer')
    })
  })

  describe('resolveSafeAuthRedirectTarget', () => {
    it('应该接受站内相对路径并保留 query', () => {
      expect(resolveSafeAuthRedirectTarget('/admin/quota/alerts?status=all&page=2')).toBe(
        '/admin/quota/alerts?status=all&page=2',
      )
    })

    it('应该把数组 query 归一到首个值', () => {
      expect(resolveSafeAuthRedirectTarget(['/admin/quota/alerts?status=open', '/writer'])).toBe(
        '/admin/quota/alerts?status=open',
      )
    })

    it('应该拒绝 auth 自身地址并回退默认页', () => {
      expect(resolveSafeAuthRedirectTarget('/auth?redirect=%2Fadmin')).toBe('/writer')
    })

    it('应该拒绝非站内路径并回退默认页', () => {
      expect(resolveSafeAuthRedirectTarget('//evil.example.com')).toBe('/writer')
      expect(resolveSafeAuthRedirectTarget('https://evil.example.com')).toBe('/writer')
      expect(resolveSafeAuthRedirectTarget('javascript:alert(1)')).toBe('/writer')
    })
  })
})
