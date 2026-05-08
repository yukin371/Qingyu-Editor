<template>
  <div class="publish-schedule">
    <div v-if="!publishPlan" class="empty-plan">
      <Empty description="暂无发布计划">
        <template #action>
          <el-button type="primary" @click="$emit('create')">
            创建发布计划
          </el-button>
        </template>
      </Empty>
    </div>
    <div v-else class="plan-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划名称">
          {{ publishPlan.name }}
        </el-descriptions-item>
        <el-descriptions-item label="发布类型">
          <el-tag :type="getTypeTagType(publishPlan.type)">
            {{ getTypeLabel(publishPlan.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="getStatusTagType(publishPlan.status)">
            {{ publishPlan.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布平台">
          <el-tag
            v-for="platform in publishPlan.platforms"
            :key="platform"
            style="margin-right: 4px"
          >
            {{ getPlatformLabel(platform) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布方式">
          {{ getScheduleTypeLabel(publishPlan.schedule.type) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="发布间隔"
          v-if="publishPlan.schedule.interval_days"
        >
          每 {{ publishPlan.schedule.interval_days }} 天
        </el-descriptions-item>
        <el-descriptions-item
          label="每次发布"
          v-if="publishPlan.schedule.chapters_per_release"
        >
          {{ publishPlan.schedule.chapters_per_release }} 章
        </el-descriptions-item>
        <el-descriptions-item label="定价" v-if="!publishPlan.pricing.is_free">
          {{ publishPlan.pricing.price }} 书币/章
        </el-descriptions-item>
        <el-descriptions-item label="VIP折扣" v-if="publishPlan.pricing.vip_discount">
          {{ publishPlan.pricing.vip_discount }}%
        </el-descriptions-item>
      </el-descriptions>

      <div class="plan-actions">
        <el-button @click="$emit('edit')">编辑计划</el-button>
        <el-button
          v-if="publishPlan.status === 'active'"
          type="warning"
          @click="$emit('pause')"
        >
          暂停
        </el-button>
        <el-button v-else type="success" @click="$emit('resume')">
          恢复
        </el-button>
        <el-button type="primary" @click="$emit('submit-review')">
          提交审核
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublishPlan } from '@/modules/writer/api'
import { Empty } from '@/design-system/base'
import {
  publishTypeOptions,
  publishPlatformOptions,
} from '@/modules/writer/api'

defineProps<{
  publishPlan: PublishPlan | null
}>()

defineEmits<{
  (e: 'create'): void
  (e: 'edit'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'submit-review'): void
}>()

// 辅助函数
const getTypeLabel = (type: string) => {
  return publishTypeOptions.find((o) => o.value === type)?.label || type
}

const getTypeTagType = (type: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    free: 'success',
    paid: 'warning',
    vip: 'danger',
    limited: 'info',
  }
  return map[type] || 'info'
}

const getStatusTagType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'info',
    pending_review: 'warning',
    scheduled: 'info',
    published: 'success',
    rejected: 'danger',
    unpublished: 'info',
  }
  return map[status] || 'info'
}

const getPlatformLabel = (platform: string) => {
  return publishPlatformOptions.find((o) => o.value === platform)?.label || platform
}

const getScheduleTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    immediate: '立即发布',
    scheduled: '定时发布',
    manual: '手动发布',
  }
  return map[type] || type
}
</script>

<style scoped lang="scss">
.empty-plan {
  padding: 40px 0;
}

.plan-detail {
  .plan-actions {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 2px solid #e2e8f0;
    display: flex;
    gap: 12px;
  }
}
</style>
