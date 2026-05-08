<template>
  <div v-if="selectedCount > 0" class="batch-actions-card">
    <div class="batch-info">
      <el-icon color="#3b82f6"><InfoFilled /></el-icon>
      <span>
        已选择 <strong>{{ selectedCount }}</strong> 个用户
      </span>
    </div>
    <div class="batch-btns">
      <el-button type="success" size="small" @click="emit('batchActivate')">
        <el-icon><CircleCheck /></el-icon>
        批量激活
      </el-button>
      <el-button type="warning" size="small" @click="emit('batchBan')">
        <el-icon><Lock /></el-icon>
        批量封禁
      </el-button>
      <el-button type="danger" size="small" @click="emit('batchDelete')">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button size="small" @click="emit('clearSelection')"> 取消选择 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, CircleCheck, Lock, Delete } from '@element-plus/icons-vue'

interface Props {
  /** 已选择的用户数量 */
  selectedCount: number
}

interface Emits {
  /** 批量激活 */
  (e: 'batchActivate'): void
  /** 批量封禁 */
  (e: 'batchBan'): void
  /** 批量删除 */
  (e: 'batchDelete'): void
  /** 清除选择 */
  (e: 'clearSelection'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped lang="scss">
.batch-actions-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #bfdbfe;

  .batch-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #3b82f6;

    strong {
      color: #2563eb;
    }
  }

  .batch-btns {
    display: flex;
    gap: 8px;
  }
}
</style>
