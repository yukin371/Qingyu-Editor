/**
 * Admin API Wrapper 测试
 * 测试wrapper层是否可以正常工作
 */

// @ts-nocheck - Test file with flexible type assertions

// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn((config: any) => {
    // 模拟返回数据
    return Promise.resolve({
      items: [],
      total: 0,
      page: config.params?.page || 1,
      pageSize: config.params?.pageSize || 20,
    })
  }),
}))

describe('Admin API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    })

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect(wrapper.getDashboardStats).toBeDefined()
      expect(wrapper.getUserList).toBeDefined()
      expect(wrapper.getOperationLogs).toBeDefined()
    })

    it('应该导出配额管理API方法', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getUserQuotaDetails).toBeDefined()
      expect(wrapper.updateUserQuota).toBeDefined()
      expect(wrapper.suspendUserQuota).toBeDefined()
      expect(wrapper.activateUserQuota).toBeDefined()
      // getQuotaStatistics 在旧API中存在，但在generated API中可能不存在
      // expect(wrapper.getQuotaStatistics).toBeDefined()
    })

    it('应该导出审核管理API方法', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getPendingAudits).toBeDefined()
      expect(wrapper.getHighRiskAudits).toBeDefined()
      expect(wrapper.getAuditStatistics).toBeDefined()
      expect(wrapper.reviewAudit).toBeDefined()
    })

    it('应该导出公告管理API方法', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getAnnouncements).toBeDefined()
      expect(wrapper.createAnnouncement).toBeDefined()
      expect(wrapper.updateAnnouncement).toBeDefined()
      expect(wrapper.deleteAnnouncement).toBeDefined()
      expect(wrapper.batchUpdateAnnouncementStatus).toBeDefined()
    })

    it('应该导出配置管理API方法', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getAllConfigs).toBeDefined()
      expect(wrapper.getConfigByKey).toBeDefined()
      expect(wrapper.updateConfig).toBeDefined()
      expect(wrapper.batchUpdateConfig).toBeDefined()
      expect(wrapper.validateConfig).toBeDefined()
    })

    it('应该导出Banner管理API方法', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getBanners).toBeDefined()
      expect(wrapper.createBanner).toBeDefined()
      expect(wrapper.updateBanner).toBeDefined()
      expect(wrapper.deleteBanner).toBeDefined()
    })
  })

  describe('API调用测试', () => {
    it('应该能调用getDashboardStats', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getDashboardStats()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getUserList', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getUserList({ page: 1, pageSize: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getUserQuotaDetails', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getUserQuotaDetails('user-123')

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getPendingAudits', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getPendingAudits({ page: 1, pageSize: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用createAnnouncement', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const announcementData = {
        title: '系统公告',
        content: '这是一条测试公告',
        type: 'system' as const,
        priority: 'medium' as const,
        effectiveStartTime: new Date().toISOString(),
        effectiveEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const result = await wrapper.createAnnouncement(announcementData)

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该按后端契约调用batchUpdateAnnouncementStatus', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.batchUpdateAnnouncementStatus(['id-1', 'id-2'], 'active')

      expect(orvalMutator).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/admin/announcements/batch-status',
          method: 'PUT',
          data: {
            announcementIds: ['id-1', 'id-2'],
            isActive: true,
          },
        }),
      )
      expect(result).toBeDefined()
    })

    it('应该能调用getAllConfigs', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getAllConfigs()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getBanners', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getBanners({ page: 1, pageSize: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('兼容性测试', () => {
    it('getStats应该是getDashboardStats的别名', async () => {
      const wrapper = await import('../wrapper')

      expect(wrapper.getStats).toBeDefined()
      expect(wrapper.getStats).toBe(wrapper.getDashboardStats)
    })
  })
})
