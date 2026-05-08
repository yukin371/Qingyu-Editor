/**
 * 发布计划相关的逻辑
 */
import { ref, reactive, type Ref } from 'vue'
import { message } from '@/design-system/services'
import {
  getPublishPlan,
  createPublishPlan,
  updatePublishPlan,
  pausePublishPlan,
  resumePublishPlan,
  type PublishPlan,
  type PublishPlatform,
  publishTypeOptions,
  publishPlatformOptions,
} from '@/modules/writer/api'

// 类型导出
export type { PublishPlan }
export { publishTypeOptions, publishPlatformOptions }

// 计划表单类型
export interface PlanForm {
  name: string
  type: 'free' | 'paid' | 'vip' | 'limited'
  platforms: string[]
  scheduleType: 'immediate' | 'scheduled' | 'manual'
  intervalDays: number
  chaptersPerRelease: number
  isFree: boolean
  price: number
  vipDiscount: number
}

// 发布记录类型（用于回调）
interface PublishRecordItem {
  id: string
  book_id: string
  chapter_id: string
  chapter_title: string
  chapter_number: number
  status: string
  published_at?: string
  created_at: string
}

// 创建默认计划表单
const createDefaultPlanForm = (): PlanForm => ({
  name: '',
  type: 'free',
  platforms: ['all'],
  scheduleType: 'immediate',
  intervalDays: 1,
  chaptersPerRelease: 1,
  isFree: true,
  price: 10,
  vipDiscount: 80,
})

export function usePublishSchedule(bookId: Ref<string>, isMockProjectContext: Ref<boolean>) {
  // 发布计划状态
  const publishPlan = ref<PublishPlan | null>(null)
  const showPublishPlanDialog = ref(false)
  const planForm = reactive<PlanForm>(createDefaultPlanForm())

  // Mock 数据存储
  const mockPlanMap = reactive<Record<string, PublishPlan>>({})

  // 当前项目标题（用于 mock 数据）
  let currentProjectTitle = ''

  const setCurrentProjectTitle = (title: string) => {
    currentProjectTitle = title
  }

  // 确保 Mock 计划存在
  const ensureMockPlan = (projectId: string) => {
    if (mockPlanMap[projectId]) return mockPlanMap[projectId]
    const plan: PublishPlan = {
      id: projectId,
      book_id: projectId,
      name: `${currentProjectTitle || '作品'}发布计划`,
      description: '',
      type: 'free',
      status: 'active',
      platforms: ['all'],
      schedule: { type: 'manual', interval_days: 1, chapters_per_release: 1 },
      pricing: { is_free: true, price: 0, vip_discount: 100 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockPlanMap[projectId] = plan
    return plan
  }

  // 加载发布计划
  const loadPublishPlan = async () => {
    if (!bookId.value) return
    try {
      if (isMockProjectContext.value) {
        publishPlan.value = { ...ensureMockPlan(bookId.value) }
        return
      }
      publishPlan.value = await getPublishPlan(bookId.value)
    } catch (error: unknown) {
      console.error('加载发布计划失败', error)
    }
  }

  // 编辑发布计划
  const editPublishPlan = () => {
    if (!publishPlan.value) return
    Object.assign(planForm, {
      name: publishPlan.value.name,
      type: publishPlan.value.type,
      platforms: publishPlan.value.platforms,
      scheduleType: publishPlan.value.schedule.type,
      intervalDays: publishPlan.value.schedule.interval_days || 1,
      chaptersPerRelease: publishPlan.value.schedule.chapters_per_release || 1,
      isFree: publishPlan.value.pricing.is_free,
      price: publishPlan.value.pricing.price || 10,
      vipDiscount: publishPlan.value.pricing.vip_discount || 80,
    })
    showPublishPlanDialog.value = true
  }

  // 保存发布计划
  const savePublishPlan = async () => {
    try {
      if (isMockProjectContext.value) {
        const existed = !!publishPlan.value
        const plan: PublishPlan = {
          id: publishPlan.value?.id || bookId.value,
          book_id: bookId.value,
          name: planForm.name,
          description: '',
          type: planForm.type,
          status: publishPlan.value?.status || 'active',
          platforms: [...planForm.platforms] as PublishPlatform[],
          schedule: {
            type: planForm.scheduleType,
            interval_days: planForm.intervalDays,
            chapters_per_release: planForm.chaptersPerRelease,
          },
          pricing: {
            is_free: planForm.isFree,
            price: planForm.price,
            vip_discount: planForm.vipDiscount,
          },
          created_at: publishPlan.value?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockPlanMap[bookId.value] = plan
        publishPlan.value = { ...plan }
        message.success(existed ? '更新成功' : '创建成功')
        showPublishPlanDialog.value = false
        return
      }

      if (publishPlan.value) {
        await updatePublishPlan(publishPlan.value.id, {
          name: planForm.name,
          type: planForm.type,
          platforms: planForm.platforms as PublishPlatform[],
          schedule: {
            type: planForm.scheduleType,
            interval_days: planForm.intervalDays,
            chapters_per_release: planForm.chaptersPerRelease,
          },
          pricing: {
            is_free: planForm.isFree,
            price: planForm.price,
            vip_discount: planForm.vipDiscount,
          },
        })
        message.success('更新成功')
      } else {
        await createPublishPlan(bookId.value, {
          name: planForm.name,
          type: planForm.type,
          platforms: planForm.platforms as PublishPlatform[],
          schedule: {
            type: planForm.scheduleType,
            interval_days: planForm.intervalDays,
            chapters_per_release: planForm.chaptersPerRelease,
          },
          pricing: {
            is_free: planForm.isFree,
            price: planForm.price,
            vip_discount: planForm.vipDiscount,
          },
        })
        message.success('创建成功')
      }
      showPublishPlanDialog.value = false
      loadPublishPlan()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '操作失败')
    }
  }

  // 暂停计划
  const pausePlan = async () => {
    if (!publishPlan.value) return
    try {
      if (isMockProjectContext.value) {
        publishPlan.value.status = 'paused'
        publishPlan.value.updated_at = new Date().toISOString()
        mockPlanMap[bookId.value] = { ...publishPlan.value }
        message.success('已暂停')
        return
      }
      await pausePublishPlan(publishPlan.value.id)
      message.success('已暂停')
      loadPublishPlan()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '操作失败')
    }
  }

  // 恢复计划
  const resumePlan = async () => {
    if (!publishPlan.value) return
    try {
      if (isMockProjectContext.value) {
        publishPlan.value.status = 'active'
        publishPlan.value.updated_at = new Date().toISOString()
        mockPlanMap[bookId.value] = { ...publishPlan.value }
        message.success('已恢复')
        return
      }
      await resumePublishPlan(publishPlan.value.id)
      message.success('已恢复')
      loadPublishPlan()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '操作失败')
    }
  }

  // 提交审核
  const submitReview = async (
    ensureMockRecords: (projectId: string) => PublishRecordItem[],
    persistMockPublication: (projectId: string) => void,
    loadPublishRecords: () => void,
    loadStats: () => void,
    submitRealReview: () => Promise<void>,
  ) => {
    try {
      if (isMockProjectContext.value) {
        const records = ensureMockRecords(bookId.value)
        const draft = records.filter((r) => r.status === 'draft')
        draft.slice(0, 2).forEach((r) => {
          r.status = 'pending_review'
        })
        persistMockPublication(bookId.value)
        message.success('已提交审核（Mock）')
        loadPublishRecords()
        loadStats()
        return
      }
      await submitRealReview()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '提交失败')
    }
  }

  // 重置计划表单
  const resetPlanForm = () => {
    Object.assign(planForm, createDefaultPlanForm())
  }

  return {
    publishPlan,
    showPublishPlanDialog,
    planForm,
    mockPlanMap,
    setCurrentProjectTitle,
    loadPublishPlan,
    editPublishPlan,
    savePublishPlan,
    pausePlan,
    resumePlan,
    submitReview,
    resetPlanForm,
    ensureMockPlan,
  }
}
