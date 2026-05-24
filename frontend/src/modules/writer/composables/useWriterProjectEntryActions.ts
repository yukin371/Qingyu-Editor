import type { LocationQueryRaw, RouteLocationRaw, Router } from 'vue-router'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import { importProjectArchive } from '@/modules/writer/services/workbenchProject.service'
import type { WorkbenchRecentProjectCard } from '@/modules/writer/types/workbench'

type MaybePromise<T> = T | Promise<T>
type CreatedProjectLike = { id?: string; projectId?: string } | null | undefined

interface ImportProjectAndEnterOptions {
  refresh?: () => MaybePromise<void>
  successMessage?: (title?: string) => string
}

const CREATED_PROJECT_ENTRY_QUERY = 'created_project'
const CONTINUE_PROJECT_ENTRY_QUERY = 'continue_project'
const IMPORTED_PROJECT_ENTRY_QUERY = 'imported_project'

function resolveProjectId(created: CreatedProjectLike): string {
  return created?.id || created?.projectId || ''
}

export function useWriterProjectEntryActions(routerOverride?: Router) {
  const router = routerOverride ?? useRouter()

  function buildProjectTarget(projectId: string, query?: LocationQueryRaw): RouteLocationRaw {
    const target: RouteLocationRaw = {
      name: WRITER_ROUTE_NAMES.project,
      params: { projectId },
    }

    if (query) {
      target.query = query
    }

    return target
  }

  async function openProject(projectId: string, query?: LocationQueryRaw) {
    if (!projectId) {
      return false
    }

    await router.push(buildProjectTarget(projectId, query))
    return true
  }

  async function continueProject(project: WorkbenchRecentProjectCard) {
    const continueTarget = project.continueTarget as Exclude<RouteLocationRaw, string>
    await router.push({
      ...continueTarget,
      query: {
        ...(continueTarget.query || {}),
        entry: CONTINUE_PROJECT_ENTRY_QUERY,
      },
    })
  }

  async function openCreatedProject(created: CreatedProjectLike, query?: LocationQueryRaw) {
    const projectId = resolveProjectId(created)
    return openProject(projectId, {
      ...(query || {}),
      entry: CREATED_PROJECT_ENTRY_QUERY,
    })
  }

  async function importProjectAndEnter(file: File, options: ImportProjectAndEnterOptions = {}) {
    const result = await importProjectArchive(file)
    if (!result.success || !result.projectId) {
      message.error(result.error || '导入失败，请重试')
      return result
    }

    await options.refresh?.()
    message.success(
      options.successMessage?.(result.title) || `已导入项目：${result.title || '未命名项目'}`,
    )
    await openProject(result.projectId, { entry: IMPORTED_PROJECT_ENTRY_QUERY })
    return result
  }

  return {
    openProject,
    continueProject,
    openCreatedProject,
    importProjectAndEnter,
  }
}
