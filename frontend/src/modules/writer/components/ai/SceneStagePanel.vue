<template>
  <div class="scene-stage-panel">
    <div class="panel-header">
      <h4>场景状态</h4>
      <el-button text size="small" @click="refreshFromDocument"> 同步 </el-button>
    </div>

    <el-form label-position="top" size="small">
      <el-form-item label="场景目标">
        <el-input
          v-model="sceneGoal"
          type="textarea"
          :rows="2"
          placeholder="这个场景要达成什么？"
          maxlength="300"
          show-word-limit
          @blur="saveSceneState"
        />
      </el-form-item>

      <el-form-item label="活跃冲突">
        <el-input
          v-model="activeConflict"
          type="textarea"
          :rows="2"
          placeholder="当前场景的核心冲突是什么？"
          maxlength="300"
          show-word-limit
          @blur="saveSceneState"
        />
      </el-form-item>

      <el-form-item label="在场人物">
        <div class="entity-tags">
          <el-tag v-for="char in characters" :key="char.id" size="small" class="entity-tag">
            {{ char.name }}
          </el-tag>
          <span v-if="!characters.length" class="empty-hint"> 由文档关联自动填充 </span>
        </div>
      </el-form-item>

      <el-form-item label="当前地点">
        <div class="entity-tags">
          <el-tag
            v-for="loc in locations"
            :key="loc.id"
            type="success"
            size="small"
            class="entity-tag"
          >
            {{ loc.name }}
          </el-tag>
          <span v-if="!locations.length" class="empty-hint"> 由文档关联自动填充 </span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSceneState } from '@/modules/ai/api/ai'

interface Entity {
  id: string
  name: string
}

const props = defineProps<{
  documentId: string
  initialSceneGoal?: string
  initialActiveConflict?: string
  characters?: Entity[]
  locations?: Entity[]
}>()

const sceneGoal = ref(props.initialSceneGoal || '')
const activeConflict = ref(props.initialActiveConflict || '')
const characters = computed<Entity[]>(() => props.characters ?? [])
const locations = computed<Entity[]>(() => props.locations ?? [])

// 同步外部传入的初始值
watch(
  () => props.initialSceneGoal,
  (val) => {
    if (val !== undefined) sceneGoal.value = val
  },
)
watch(
  () => props.initialActiveConflict,
  (val) => {
    if (val !== undefined) activeConflict.value = val
  },
)

async function saveSceneState() {
  if (!props.documentId) return
  try {
    await updateSceneState(props.documentId, {
      sceneGoal: sceneGoal.value,
      activeConflict: activeConflict.value,
    })
  } catch (e: any) {
    ElMessage.warning('场景状态保存失败')
  }
}

function refreshFromDocument() {
  // 由父组件处理刷新逻辑
  sceneGoal.value = props.initialSceneGoal || ''
  activeConflict.value = props.initialActiveConflict || ''
}
</script>

<style scoped>
.scene-stage-panel {
  padding: 12px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.panel-header h4 {
  margin: 0;
  font-size: 14px;
}
.entity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.entity-tag {
  cursor: default;
}
.empty-hint {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>
