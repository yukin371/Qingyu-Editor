<template>
  <el-dialog
    :model-value="visible"
    title="批量添加用户"
    width="500px"
    class="admin-modal-card"
    append-to-body
    align-center
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :model="formData" label-width="100px">
      <el-form-item label="添加数量" required>
        <el-input-number v-model="formData.count" :min="1" :max="100" />
        <span class="form-hint">一次最多添加100个用户</span>
      </el-form-item>
      <el-form-item label="用户名前缀">
        <el-input v-model="formData.prefix" placeholder="批量用户名前缀" />
      </el-form-item>
      <el-form-item label="默认角色">
        <el-select popper-class="admin-select-popper" v-model="formData.role">
          <el-option label="管理员" value="admin" />
          <el-option label="作者" value="author" />
          <el-option label="读者" value="reader" />
        </el-select>
      </el-form-item>
      <el-form-item label="默认状态">
        <el-select popper-class="admin-select-popper" v-model="formData.status">
          <el-option label="正常" value="active" />
          <el-option label="未激活" value="inactive" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        <el-icon><UserFilled /></el-icon>
        确认添加
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import type { BatchAddFormData } from './types'

interface Props {
  /** 对话框是否可见 */
  visible: boolean
}

interface Emits {
  /** 更新可见状态 */
  (e: 'update:visible', value: boolean): void
  /** 确认添加 */
  (e: 'confirm', data: BatchAddFormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/** 表单数据 */
const formData = reactive<BatchAddFormData>({
  count: 10,
  role: 'reader',
  status: 'active',
  prefix: 'batch_user',
})

/** 监听对话框打开，重置表单 */
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      formData.count = 10
      formData.role = 'reader'
      formData.status = 'active'
      formData.prefix = 'batch_user'
    }
  },
)

/** 确认添加 */
const handleConfirm = () => {
  emit('confirm', { ...formData })
}
</script>

<style scoped lang="scss">
.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
