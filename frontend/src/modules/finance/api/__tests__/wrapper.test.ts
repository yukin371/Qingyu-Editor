/**
 * Finance API Wrapper 测试
 * 测试wrapper层是否可以正常工作
 */



// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn((_config) => {
    // 模拟返回数据
    return Promise.resolve({
      data: {},
      status: 200,
    })
  }),
}))

describe('Finance API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    })

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect(wrapper.getWallet).toBeDefined()
      expect(wrapper.getWalletBalance).toBeDefined()
      expect(wrapper.getWalletTransactions).toBeDefined()
      expect(wrapper.getMembershipStatus).toBeDefined()
      expect(wrapper.getMembershipPlans).toBeDefined()
    })
  })

  describe('Wallet API调用测试', () => {
    it('应该能调用getWallet', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getWallet()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getWalletBalance', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getWalletBalance()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getWalletTransactions', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getWalletTransactions({ page: 1 } as any)

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('Membership API调用测试', () => {
    it('应该能调用getMembershipStatus', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getMembershipStatus()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getMembershipPlans', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getMembershipPlans()

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('Author Finance API调用测试', () => {
    it('应该能调用getAuthorEarnings', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getAuthorEarnings({ page: 1 } as any)

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用getAuthorSettlements', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getAuthorSettlements({ page: 1 } as any)

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })
})
