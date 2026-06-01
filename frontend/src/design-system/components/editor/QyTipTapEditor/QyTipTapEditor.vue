<template>
  <SharedQyTipTapEditor
    v-bind="props"
    :image-upload-handler="imageUploadHandler"
    :entity-create-handler="entityCreateHandler"
    :keyword-search-handler="keywordSearchHandler"
    :entity-extract-handler="extractEntitiesFromTipTapContent"
    @update:model-value="emit('update:modelValue', $event)"
    @save="emit('save', $event)"
    @keyword-click="emit('keyword-click', $event)"
    @ready="emit('ready', $event)"
    @selection-change="emit('selection-change', $event)"
    @entity-scan="emit('entity-scan', $event)"
    @open-tool-overlay="emit('open-tool-overlay')"
  />
</template>

<script setup lang="ts">
import type { Editor as CoreEditor } from '@tiptap/core'
import SharedQyTipTapEditor from '@editor-shared/components/QyTipTapEditor/QyTipTapEditor.vue'
import type { KeywordInfo } from '@editor-shared/extensions/SmartKeyword'
import type { ProofreadHighlightRange } from '@editor-shared/extensions/ProofreadHighlightExtension'
import { searchProjectKeywords, type ParagraphContent } from '@/modules/writer/api/wrapper'
import { characterApi } from '@/modules/writer/api/character'
import { conceptApi } from '@/modules/writer/api/concept'
import { createLocalEntity } from '@/modules/writer/api/entities'
import { locationApi } from '@/modules/writer/api/location'
import { createEmbeddedEditorImage } from '@/modules/writer/services/editorImageAsset.service'
import { extractEntitiesFromTipTapContent } from '@/modules/writer/utils/entityParser'

const props = defineProps<{
  modelValue: string
  projectId: string
  readonly?: boolean
  documentId?: string
  placeholder?: string
  toolbarPreset?: 'default' | 'writer'
  proofreadHighlights?: ProofreadHighlightRange[]
  focusedProofreadIssueId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', contents: ParagraphContent[]): void
  (e: 'keyword-click', keyword: KeywordInfo): void
  (e: 'ready', editor: CoreEditor): void
  (
    e: 'selection-change',
    payload: { text: string; from: number; to: number; x: number; y: number; visible: boolean },
  ): void
  (e: 'entity-scan', refs: Array<{ id?: string; name: string; type: string }>): void
  (e: 'open-tool-overlay'): void
}>()

function normalizeKeywordType(
  rawType: string | undefined,
  fallback: KeywordInfo['type'],
): KeywordInfo['type'] {
  if (
    rawType === 'character' ||
    rawType === 'location' ||
    rawType === 'item' ||
    rawType === 'concept' ||
    rawType === 'organization'
  ) {
    return rawType
  }
  return fallback
}

async function imageUploadHandler(file: File) {
  return createEmbeddedEditorImage(file)
}

async function entityCreateHandler(entity: {
  name: string
  type: string
  summary?: string
  alias?: string[]
  traits?: string[]
  roleTag?: string
  category?: string
}): Promise<string | undefined> {
  switch (entity.type) {
    case 'character': {
      const resp = await characterApi.create(props.projectId, {
        projectId: props.projectId,
        name: entity.name,
        alias: entity.alias,
        traits: [...(entity.traits || []), ...(entity.roleTag ? [entity.roleTag] : [])],
        summary: entity.summary,
      })
      return (resp as any)?.data?.id || (resp as any)?.id
    }
    case 'location': {
      const resp = await locationApi.create(props.projectId, {
        projectId: props.projectId,
        name: entity.name,
        description: entity.summary,
      })
      return (resp as any)?.data?.id || (resp as any)?.id
    }
    case 'concept': {
      const resp = await conceptApi.create(props.projectId, {
        projectId: props.projectId,
        name: entity.name,
        summary: entity.summary,
        category: entity.category,
        alias: entity.alias,
      })
      return (resp as any)?.data?.id || (resp as any)?.id
    }
    case 'item': {
      const resp = await createLocalEntity({
        projectId: props.projectId,
        type: 'item',
        name: entity.name,
        alias: entity.alias,
        summary: entity.summary,
      })
      return resp.id
    }
    case 'organization': {
      const resp = await createLocalEntity({
        projectId: props.projectId,
        type: 'organization',
        name: entity.name,
        alias: entity.alias,
        summary: entity.summary,
      })
      return resp.id
    }
    default:
      console.warn('[QyTipTapEditor] 不支持的实体类型:', entity.type)
      return undefined
  }
}

async function keywordSearchHandler(
  projectId: string,
  query: string,
  limit: number,
): Promise<KeywordInfo[]> {
  const keyword = `@${query}`
  const resp = await searchProjectKeywords(projectId, keyword, limit)
  const payload = resp as unknown as {
    data?: {
      suggestions?: Array<{ type?: string; id?: string; name?: string; summary?: string }>
    }
    suggestions?: Array<{ type?: string; id?: string; name?: string; summary?: string }>
  }
  const suggestions = payload.data?.suggestions || payload.suggestions || []
  return suggestions
    .map((item) => ({
      id: item.id,
      type: normalizeKeywordType(item.type, 'character'),
      name: item.name || '',
      summary: item.summary,
    }))
    .filter((item) => item.name)
    .slice(0, 10)
}
</script>
