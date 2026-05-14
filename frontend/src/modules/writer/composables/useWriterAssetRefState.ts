import { computed, getCurrentInstance, onBeforeUnmount, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import * as writerAssetRefUtils from '@/modules/writer/utils/writerAssetRefs'
import type { WriterAssetRefState } from '@/modules/writer/utils/writerAssetRefs'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

const EMPTY_ASSET_REF_STATE: WriterAssetRefState = {
  chapterRefs: {},
  volumeRefs: {},
}

export function useWriterAssetRefState(projectId: MaybeRef<string>) {
  const assetRefState = ref<WriterAssetRefState>(EMPTY_ASSET_REF_STATE)

  const reload = () => {
    const currentProjectId = String(unref(projectId) || '')
    assetRefState.value = currentProjectId
      ? writerAssetRefUtils.loadWriterAssetRefState(currentProjectId)
      : EMPTY_ASSET_REF_STATE
  }

  const handleAssetRefUpdate = (event: Event) => {
    const currentProjectId = String(unref(projectId) || '')
    const updatedProjectId =
      event instanceof CustomEvent ? String(event.detail?.projectId || '') : ''
    if (!currentProjectId || currentProjectId !== updatedProjectId) return
    reload()
  }

  const handleStorage = (event: StorageEvent) => {
    const currentProjectId = String(unref(projectId) || '')
    if (!currentProjectId) return
    if (!event.key || event.key.endsWith(`:${currentProjectId}`)) {
      reload()
    }
  }

  watch(
    () => String(unref(projectId) || ''),
    () => {
      reload()
    },
    { immediate: true },
  )

  const currentInstance = getCurrentInstance()

  if (currentInstance && typeof window !== 'undefined') {
    const updatedEventName = Reflect.get(
      writerAssetRefUtils as object,
      'WRITER_ASSET_REFS_UPDATED_EVENT',
    )
    if (typeof updatedEventName === 'string' && updatedEventName) {
      window.addEventListener(updatedEventName, handleAssetRefUpdate as EventListener)
    }
    window.addEventListener('storage', handleStorage)
    onBeforeUnmount(() => {
      if (typeof updatedEventName === 'string' && updatedEventName) {
        window.removeEventListener(updatedEventName, handleAssetRefUpdate as EventListener)
      }
      window.removeEventListener('storage', handleStorage)
    })
  }

  return {
    assetRefState: computed(() => assetRefState.value),
    reloadWriterAssetRefs: reload,
  }
}
