<template>
  <div class="membership-container">
    <el-row :gutter="20">
      <!-- 左侧：会员套餐 -->
      <el-col :span="16">
        <el-card class="membership-plans-card">
          <template #header>
            <div class="card-header">
              <h3>会员套餐</h3>
              <el-tag :type="userMembership?.status === 'active' ? 'success' : 'info'">
                {{ userMembership?.status === 'active' ? '已开通' : '未开通' }}
              </el-tag>
            </div>
          </template>

          <el-row :gutter="16">
            <el-col
              v-for="plan in membershipPlans"
              :key="plan.id"
              :span="8"
            >
              <el-card
                :class="[
                  'plan-card',
                  { 'plan-card--active': userMembership?.plan_id === plan.id }
                ]"
                shadow="hover"
              >
                <div class="plan-header">
                  <h4>{{ plan.name }}</h4>
                  <div class="plan-price">
                    <template v-if="hasAuthorDiscount">
                      <span class="price-discounted">¥{{ getDiscountedPrice(plan) }}</span>
                      <span class="price-original">¥{{ plan.price }}</span>
                    </template>
                    <template v-else>
                      <span class="price">¥{{ plan.price }}</span>
                    </template>
                    <span class="duration">/{{ plan.duration_unit || '月' }}</span>
                  </div>
                  <el-tag v-if="hasAuthorDiscount" type="warning" size="small" class="author-discount-tag">
                    作者优惠 {{ Math.round((1 - authorDiscountRate) * 100) }}%
                  </el-tag>
                </div>
                <div class="plan-body">
                  <p class="plan-description">{{ plan.description }}</p>
                  <ul class="plan-benefits">
                    <li v-for="benefit in plan.benefits" :key="benefit">
                      <QyIcon name="Check"  />
                      {{ benefit }}
                    </li>
                  </ul>
                </div>
                <div class="plan-footer">
                  <el-button
                    v-if="userMembership?.plan_id === plan.id"
                    type="success"
                    disabled
                    plain
                  >
                    当前套餐
                  </el-button>
                  <el-button
                    v-else
                    type="primary"
                    @click="handleSubscribe(plan)"
                  >
                    立即开通
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 右侧：会员信息 -->
      <el-col :span="8">
        <!-- 当前会员信息 -->
        <el-card class="membership-info-card" v-if="userMembership">
          <template #header>
            <h3>我的会员</h3>
          </template>
          <div class="info-item">
            <span class="label">当前套餐：</span>
            <span class="value">{{ userMembership.plan_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <el-tag :type="getStatusType(userMembership.status)">
              {{ getStatusText(userMembership.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">开始时间：</span>
            <span class="value">{{ formatDate(userMembership.start_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">到期时间：</span>
            <span class="value">{{ formatDate(userMembership.end_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">自动续费：</span>
            <el-switch
              v-model="userMembership.auto_renew"
              @change="handleAutoRenewChange"
            />
          </div>
          <el-button
            v-if="userMembership.status === 'active'"
            type="warning"
            plain
            style="width: 100%; margin-top: 16px"
            @click="handleCancelMembership"
          >
            取消会员
          </el-button>
        </el-card>

        <!-- 会员卡激活 -->
        <el-card class="membership-card-activate" style="margin-top: 20px">
          <template #header>
            <h3>会员卡激活</h3>
          </template>
          <el-form :model="cardForm" @submit.prevent="handleActivateCard">
            <el-form-item label="会员卡码">
              <el-input
                v-model="cardForm.code"
                placeholder="请输入会员卡码"
                clearable
              />
            </el-form-item>
            <el-button type="primary" style="width: 100%" @click="handleActivateCard">
              激活会员卡
            </el-button>
          </el-form>
        </el-card>

        <!-- 会员权益 -->
        <el-card class="membership-benefits" style="margin-top: 20px">
          <template #header>
            <h3>会员权益</h3>
          </template>
          <el-scrollbar max-height="300px">
            <div
              v-for="usage in benefitsUsage"
              :key="usage.benefit_code"
              class="benefit-item"
            >
              <div class="benefit-name">{{ getBenefitName(usage.benefit_code) }}</div>
              <el-progress
                :percentage="getUsagePercentage(usage)"
                :color="getUsageColor(usage)"
              />
              <div class="benefit-usage">
                {{ usage.used_count }} / {{ usage.limit_count }}
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订阅对话框 -->
    <el-dialog
      v-model="subscribeDialogVisible"
      title="确认订阅"
      width="500px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="套餐名称">
          {{ selectedPlan?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="价格">
          ¥{{ selectedPlan?.price }} / {{ selectedPlan?.duration_unit || '月' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form :model="subscribeForm" style="margin-top: 20px">
        <el-form-item label="支付方式">
          <el-radio-group v-model="subscribeForm.payment_method">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="balance">余额支付</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="subscribeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShowSubscribeConfirm">
          确认支付
        </el-button>
      </template>
    </el-dialog>

    <!-- 订阅二次确认对话框 -->
    <QyConfirmDialog
      v-model:visible="subscribeConfirmDialogVisible"
      title="确认订阅"
      message="请确认订阅信息"
      type="warning"
      :details="subscribeConfirmDetails"
      :loading="subscribeLoading"
      @confirm="handleConfirmSubscribe"
    />

    <!-- 取消会员确认对话框 -->
    <QyConfirmDialog
      v-model:visible="cancelConfirmDialogVisible"
      title="取消会员"
      message="确定要取消会员吗？取消后将无法享受会员权益"
      type="danger"
      confirm-text="确定取消"
      :loading="cancelLoading"
      @confirm="handleConfirmCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon, QyConfirmDialog } from '@/design-system/components'
import type { ConfirmDetail } from '@/design-system/components'
import { useAuthStore } from '@/stores/auth'
import {
  getMembershipPlans,
  getUserMembership,
  subscribeMembership,
  cancelMembership,
  getMembershipBenefits,
  getMembershipBenefitsUsage,
  activateMembershipCard
} from '@/modules/finance/api'

// 定义本地类型，使用 duration_unit 字段
interface LocalMembershipPlan {
  id: string
  name: string
  type: string
  price: number
  duration: number
  duration_unit: string
  is_enabled?: boolean
  sort_order?: number
  description?: string
  benefits?: string[]
  created_at?: string
  updated_at?: string
}

// 本地 MembershipBenefit 类型
interface LocalMembershipBenefit {
  id: string
  code: string
  name: string
  level?: string
  description?: string
  type?: string
  value?: number
  unit?: string
  is_enabled?: boolean
}

// 本地 MembershipUsage 类型
interface LocalMembershipUsage {
  id: string
  user_id: string
  benefit_code: string
  used_count: number
  limit_count: number
  reset_period?: string
  last_reset_at?: string
}

// 从 membership.ts 导入 UserMembership 类型
type UserMembership = {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}
import { validateAmount } from '@/utils/validation'

const membershipPlans = ref<LocalMembershipPlan[]>([])
const userMembership = ref<UserMembership | null>(null)
const benefitsUsage = ref<LocalMembershipUsage[]>([])
const benefitsMap = ref<Record<string, string>>({})

const subscribeDialogVisible = ref(false)
const subscribeConfirmDialogVisible = ref(false)
const cancelConfirmDialogVisible = ref(false)
const selectedPlan = ref<LocalMembershipPlan | null>(null)
const subscribeLoading = ref(false)
const cancelLoading = ref(false)

const cardForm = ref({
  code: ''
})

const subscribeForm = ref({
  payment_method: 'alipay'
})
const authStore = useAuthStore()
const hasAuthorDiscount = computed(() => authStore.hasAuthorRole)
const authorDiscountRate = computed(() => authStore.authorAIPackageDiscountRate)

const getDiscountedPrice = (plan: LocalMembershipPlan) => {
  const finalPrice = Number((plan.price * authorDiscountRate.value).toFixed(2))
  return finalPrice.toFixed(2)
}

// 支付方式名称映射
const paymentMethodMap: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
  balance: '余额支付'
}

// 订阅确认详情
const subscribeConfirmDetails = computed<ConfirmDetail[]>(() => [
  {
    label: '套餐名称',
    value: selectedPlan.value?.name || ''
  },
  {
    label: '价格',
    value: selectedPlan.value
      ? (hasAuthorDiscount.value
        ? `¥${getDiscountedPrice(selectedPlan.value)}（原价¥${selectedPlan.value.price}）/ ${selectedPlan.value.duration_unit || '月'}`
        : `¥${selectedPlan.value.price} / ${selectedPlan.value.duration_unit || '月'}`)
      : ''
  },
  {
    label: '支付方式',
    value: paymentMethodMap[subscribeForm.value.payment_method] || subscribeForm.value.payment_method
  }
])

// 获取会员套餐列表
const loadMembershipPlans = async () => {
  try {
    const res = await getMembershipPlans()
    // API 已经返回正确类型 MembershipPlan[]，直接使用
    membershipPlans.value = Array.isArray(res) ? res : []
  } catch (error) {
    message.error('获取套餐列表失败')
  }
}

// 获取用户会员信息
const loadUserMembership = async () => {
  try {
    const res = await getUserMembership()
    // API 返回 UserMembership 类型，如果存在则赋值
    userMembership.value = res || null
  } catch (error) {
    // 未开通会员不算错误
    userMembership.value = null
  }
}

// 获取会员权益
const loadMembershipBenefits = async () => {
  try {
    const [usageRes, benefitsRes] = await Promise.all([
      getMembershipBenefitsUsage(),
      getMembershipBenefits()
    ])
    // API 已经返回正确的数组类型，直接使用
    benefitsUsage.value = Array.isArray(usageRes) ? usageRes : []

    // 建立权益代码到名称的映射
    const benefits: LocalMembershipBenefit[] = Array.isArray(benefitsRes) ? benefitsRes : []
    benefitsMap.value = benefits.reduce((map: Record<string, string>, benefit: LocalMembershipBenefit) => {
      map[benefit.code] = benefit.name
      return map
    }, {} as Record<string, string>)
  } catch (error) {
    console.error('获取会员权益失败', error)
  }
}

// 订阅会员
const handleSubscribe = (plan: LocalMembershipPlan) => {
  // 验证价格
  if (!validateAmount(plan.price.toString())) {
    message.error('套餐价格无效')
    return
  }
  selectedPlan.value = plan
  subscribeDialogVisible.value = true
}

// 显示订阅二次确认
const handleShowSubscribeConfirm = () => {
  if (!selectedPlan.value) return
  subscribeConfirmDialogVisible.value = true
}

// 确认订阅
const handleConfirmSubscribe = async () => {
  if (!selectedPlan.value) return

  try {
    subscribeLoading.value = true
    await subscribeMembership({
      plan_id: selectedPlan.value.id,
      payment_method: subscribeForm.value.payment_method
    })
    message.success('订阅成功')
    subscribeDialogVisible.value = false
    subscribeConfirmDialogVisible.value = false
    loadUserMembership()
    loadMembershipBenefits()
  } catch (error: any) {
    message.error(error.response?.data?.message || '订阅失败')
  } finally {
    subscribeLoading.value = false
  }
}

// 显示取消会员确认
const handleCancelMembership = () => {
  cancelConfirmDialogVisible.value = true
}

// 确认取消会员
const handleConfirmCancel = async () => {
  try {
    cancelLoading.value = true
    await cancelMembership()
    message.success('已取消会员')
    cancelConfirmDialogVisible.value = false
    loadUserMembership()
    loadMembershipBenefits()
  } catch (error: any) {
    message.error(error.response?.data?.message || '取消失败')
  } finally {
    cancelLoading.value = false
  }
}

// 自动续费开关
const handleAutoRenewChange = (value: boolean) => {
  message.success(value ? '已开启自动续费' : '已关闭自动续费')
}

// 激活会员卡
const handleActivateCard = async () => {
  if (!cardForm.value.code) {
    message.warning('请输入会员卡码')
    return
  }

  try {
    await activateMembershipCard({ code: cardForm.value.code })
    message.success('会员卡激活成功')
    cardForm.value.code = ''
    loadUserMembership()
    loadMembershipBenefits()
  } catch (error: any) {
    message.error(error.response?.data?.message || '激活失败')
  }
}

// 获取权益名称
const getBenefitName = (code: string) => {
  return benefitsMap.value[code] || code
}

// 获取使用百分比
const getUsagePercentage = (usage: LocalMembershipUsage) => {
  if (usage.limit_count === 0) return 0
  return Math.min(100, Math.round((usage.used_count / usage.limit_count) * 100))
}

// 获取使用进度条颜色
const getUsageColor = (usage: LocalMembershipUsage) => {
  const percentage = getUsagePercentage(usage)
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    expired: 'info',
    cancelled: 'warning'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '正常',
    expired: '已过期',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadMembershipPlans()
  loadUserMembership()
  loadMembershipBenefits()
})
</script>

<style scoped lang="scss">
.membership-container {
  padding: 20px;
}

.membership-plans-card,
.membership-info-card,
.membership-card-activate,
.membership-benefits {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.plan-card {
  height: 100%;
  transition: all 0.3s;

  &--active {
    border: 2px solid var(--el-color-primary);
    box-shadow: 0 0 12px rgba(var(--el-color-primary-rgb), 0.3);
  }

  .plan-header {
    text-align: center;
    margin-bottom: 16px;

    h4 {
      margin: 0 0 12px;
      font-size: 20px;
    }

    .plan-price {
      .price {
        font-size: 32px;
        font-weight: bold;
        color: var(--el-color-danger);
      }

      .price-discounted {
        font-size: 32px;
        font-weight: bold;
        color: var(--el-color-danger);
      }

      .price-original {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        text-decoration: line-through;
        margin-left: 8px;
      }

      .duration {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .author-discount-tag {
      margin-top: 8px;
    }
  }

  .plan-body {
    .plan-description {
      min-height: 40px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
      font-size: 14px;
    }

    .plan-benefits {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        padding: 6px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .el-icon {
          margin-right: 8px;
          color: var(--el-color-success);
        }
      }
    }
  }

  .plan-footer {
    margin-top: 16px;

    .el-button {
      width: 100%;
    }
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: var(--el-text-color-secondary);
  }

  .value {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

.benefit-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .benefit-name {
    margin-bottom: 8px;
    font-size: 14px;
  }

  .benefit-usage {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: right;
  }
}
</style>
