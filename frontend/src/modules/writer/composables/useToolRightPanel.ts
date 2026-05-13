import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import { RIGHT_TOOL_CONFIG } from '@/modules/writer/config/workspacePanels'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import type { RightToolType } from '@/modules/writer/types/workspaceLayout'

const LIST_MIN_WIDTH = 168
const LIST_MAX_WIDTH = 320
const DETAIL_MIN_WIDTH = 260
const ACTIVITY_BAR_WIDTH = 56

export function useToolRightPanel(activeTool: Ref<RightToolType> | ComputedRef<RightToolType>) {
  const panelStore = usePanelStore()
  const workspaceLayoutStore = useWorkspaceLayoutStore()
  const detailPanelRef = ref<HTMLElement | null>(null)
  const isResizingList = ref(false)
  const listResizeStartX = ref(0)
  const listResizeStartWidth = ref(0)
  let detailObserver: ResizeObserver | null = null

  const activeConfig = computed(() => RIGHT_TOOL_CONFIG[activeTool.value])
  const showListPanel = computed(() => activeConfig.value.hasListPanel)
  const listWidth = computed(() => workspaceLayoutStore.rightToolArea.widths.list)

  const clampListWidth = (width: number) => {
    return Math.max(LIST_MIN_WIDTH, Math.min(LIST_MAX_WIDTH, Math.round(width)))
  }

  const syncMeasuredDetailWidth = (width: number) => {
    if (Number.isNaN(width) || width <= 0) return
    workspaceLayoutStore.updateRightToolPanelWidths({
      detail: Math.max(DETAIL_MIN_WIDTH, Math.round(width)),
    })
  }

  const attachDetailPanel = (element: HTMLElement | null) => {
    detailObserver?.disconnect()
    detailObserver = null
    detailPanelRef.value = element

    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    detailObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      syncMeasuredDetailWidth(entry.contentRect.width)
    })
    detailObserver.observe(element)
  }

  const stopListResize = () => {
    isResizingList.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('mousemove', onListResize)
    window.removeEventListener('mouseup', stopListResize)
    window.removeEventListener('blur', stopListResize)
  }

  const onListResize = (event: MouseEvent) => {
    if (!isResizingList.value) return
    const deltaX = event.clientX - listResizeStartX.value
    workspaceLayoutStore.updateRightToolPanelWidths({
      list: clampListWidth(listResizeStartWidth.value + deltaX),
    })
  }

  const startListResize = (event: MouseEvent) => {
    if (!showListPanel.value) return
    event.preventDefault()
    event.stopPropagation()
    isResizingList.value = true
    listResizeStartX.value = event.clientX
    listResizeStartWidth.value = listWidth.value
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onListResize)
    window.addEventListener('mouseup', stopListResize)
    window.addEventListener('blur', stopListResize)
  }

  watch(
    () => activeTool.value,
    (tool) => {
      if (!RIGHT_TOOL_CONFIG[tool].hasListPanel) return

      const minOuterWidth =
        workspaceLayoutStore.rightToolArea.widths.list + DETAIL_MIN_WIDTH + ACTIVITY_BAR_WIDTH
      if (panelStore.rightWidth < minOuterWidth) {
        panelStore.setRightWidth(minOuterWidth)
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stopListResize()
    detailObserver?.disconnect()
    detailObserver = null
  })

  return {
    activeConfig,
    showListPanel,
    listWidth,
    isResizingList,
    attachDetailPanel,
    startListResize,
  }
}
