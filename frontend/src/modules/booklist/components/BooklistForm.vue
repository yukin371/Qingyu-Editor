<template>
  <form class="booklist-form" @submit.prevent="handleSubmit">
    <!-- 标题 -->
    <div class="form-item">
      <label class="form-label">
        书单标题
        <span class="required">*</span>
      </label>
      <Input
        v-model="formData.title"
        placeholder="给你的书单起个名字"
        :maxlength="50"
        show-count
      />
    </div>

    <!-- 描述 -->
    <div class="form-item">
      <label class="form-label">书单描述</label>
      <Textarea
        v-model="formData.description"
        placeholder="简单介绍一下这个书单..."
        :rows="4"
        :maxlength="200"
        show-count
      />
    </div>

    <!-- 封面 -->
    <div class="form-item">
      <label class="form-label">书单封面</label>
      <div class="cover-upload">
        <div
          v-if="formData.cover"
          class="cover-preview"
          :style="{ backgroundImage: `url(${formData.cover})` }"
        >
          <QyButton
            variant="ghost"
            size="sm"
            class="remove-cover"
            @click="removeCover"
          >
            <QyIcon name="Close" :size="16" />
          </QyButton>
        </div>
        <div v-else class="cover-upload-placeholder" @click="triggerUpload">
          <QyIcon name="Plus" :size="32" />
          <span>上传封面</span>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- 标签 -->
    <div class="form-item">
      <label class="form-label">标签</label>
      <div class="tags-input">
        <Badge
          v-for="tag in formData.tags"
          :key="tag"
          variant="secondary"
          closable
          @close="removeTag(tag)"
        >
          {{ tag }}
        </Badge>
        <Input
          v-if="inputVisible"
          ref="tagInputRef"
          v-model="inputValue"
          size="sm"
          placeholder="输入标签"
          @keyup.enter="confirmTag"
          @blur="confirmTag"
        />
        <QyButton
          v-else
          variant="secondary"
          size="sm"
          @click="showTagInput"
        >
          <QyIcon name="Plus" :size="14" />
          添加标签
        </QyButton>
      </div>
      <!-- 推荐标签 -->
      <div v-if="popularTags.length" class="popular-tags">
        <span class="popular-tags-label">推荐标签：</span>
        <Badge
          v-for="tag in popularTags.slice(0, 8)"
          :key="tag"
          variant="ghost"
          size="sm"
          class="popular-tag"
          @click="addTag(tag)"
        >
          {{ tag }}
        </Badge>
      </div>
    </div>

    <!-- 公开设置 -->
    <div class="form-item">
      <label class="form-label">隐私设置</label>
      <div class="privacy-options">
        <label class="privacy-option" :class="{ active: formData.isPublic }">
          <input
            v-model="formData.isPublic"
            type="radio"
            :value="true"
          />
          <QyIcon name="Unlock" :size="20" />
          <div class="option-content">
            <span class="option-title">公开</span>
            <span class="option-desc">所有人都可以看到</span>
          </div>
        </label>
        <label class="privacy-option" :class="{ active: !formData.isPublic }">
          <input
            v-model="formData.isPublic"
            type="radio"
            :value="false"
          />
          <QyIcon name="Lock" :size="20" />
          <div class="option-content">
            <span class="option-title">私密</span>
            <span class="option-desc">仅自己可见</span>
          </div>
        </label>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="form-actions">
      <QyButton variant="secondary" @click="handleCancel">
        取消
      </QyButton>
      <QyButton
        variant="primary"
        type="submit"
        :loading="loading"
        :disabled="!isValid"
      >
        {{ isEdit ? '保存' : '创建' }}
      </QyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { QyButton, QyIcon } from '@/design-system/components'
import { Badge, Textarea, Input } from '@/design-system/base'
import type { BookList } from '@/types/booklist'

interface Props {
  booklist?: BookList
  loading?: boolean
  popularTags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  popularTags: () => []
})

const emit = defineEmits<{
  submit: [data: {
    title: string
    description: string
    cover: string
    isPublic: boolean
    tags: string[]
  }]
  cancel: []
}>()

const isEdit = computed(() => !!props.booklist)

const formData = ref({
  title: '',
  description: '',
  cover: '',
  isPublic: true,
  tags: [] as string[]
})

// 初始化表单数据
watch(() => props.booklist, (booklist) => {
  if (booklist) {
    formData.value = {
      title: booklist.title || '',
      description: booklist.description || '',
      cover: booklist.cover || '',
      isPublic: booklist.isPublic ?? true,
      tags: [...(booklist.tags || [])]
    }
  }
}, { immediate: true })

const isValid = computed(() => {
  return formData.value.title.trim().length >= 2
})

// 标签输入
const inputVisible = ref(false)
const inputValue = ref('')
const tagInputRef = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

function showTagInput() {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function confirmTag() {
  const tag = inputValue.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  inputVisible.value = false
  inputValue.value = ''
}

function removeTag(tag: string) {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  }
}

function addTag(tag: string) {
  if (!formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
}

// 封面上传
function triggerUpload() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 这里应该上传到服务器，暂时使用本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.cover = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeCover() {
  formData.value.cover = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 提交
function handleSubmit() {
  if (!isValid.value) return
  emit('submit', {
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    cover: formData.value.cover,
    isPublic: formData.value.isPublic,
    tags: [...formData.value.tags]
  })
}

function handleCancel() {
  emit('cancel')
}

// 暴露内部状态供测试使用
defineExpose({
  formData,
  inputVisible,
  inputValue,
  isValid,
  isEdit
})
</script>

<style scoped lang="scss">
.booklist-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;

  .required {
    color: #ff4d4f;
    margin-left: 4px;
  }
}

.cover-upload {
  .cover-preview {
    position: relative;
    width: 200px;
    height: 260px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;

    .remove-cover {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 50%;
      padding: 4px;
    }
  }

  .cover-upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 200px;
    height: 260px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    color: #999;
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
    }

    span {
      font-size: 14px;
    }
  }
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .qy-input {
    width: 120px;
  }
}

.popular-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;

  .popular-tags-label {
    font-size: 13px;
    color: #999;
  }

  .popular-tag {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e6f7ff;
      color: #1890ff;
    }
  }
}

.privacy-options {
  display: flex;
  gap: 16px;
}

.privacy-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  input {
    display: none;
  }

  i {
    color: #999;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .option-title {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .option-desc {
      font-size: 12px;
      color: #999;
    }
  }

  &.active {
    border-color: #1890ff;
    background: #e6f7ff;

    i {
      color: #1890ff;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}
</style>
