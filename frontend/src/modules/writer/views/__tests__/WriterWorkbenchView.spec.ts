import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WriterWorkbenchView from '../WriterWorkbenchView.vue'

const {
  buildWorkbenchRecentProjectCardsMock,
  ensureProjectBaseSkeletonMock,
  importProjectAndEnterMock,
  loadListMock,
  openCreatedProjectMock,
  openProjectMock,
  projectStoreMock,
  routerPushMock,
  saveWriterProjectBriefMock,
} = vi.hoisted(() => ({
  buildWorkbenchRecentProjectCardsMock: vi.fn(),
  ensureProjectBaseSkeletonMock: vi.fn(),
  importProjectAndEnterMock: vi.fn(),
  loadListMock: vi.fn(),
  openCreatedProjectMock: vi.fn(),
  openProjectMock: vi.fn(),
  projectStoreMock: {
    projects: [
      {
        id: 'project-1',
        title: '夜航人手册',
        updatedAt: '2026-05-17T00:00:00.000Z',
      },
    ],
    loadList: vi.fn(),
    create: vi.fn(),
  },
  routerPushMock: vi.fn(),
  saveWriterProjectBriefMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

vi.mock('@/modules/writer/stores/projectStore', () => ({
  useProjectStore: () => projectStoreMock,
}))

vi.mock('@/modules/writer/composables/useWriterProjectEntryActions', () => ({
  useWriterProjectEntryActions: () => ({
    openProject: openProjectMock,
    continueProject: vi.fn(),
    openCreatedProject: openCreatedProjectMock,
    importProjectAndEnter: importProjectAndEnterMock,
  }),
}))

vi.mock('@/modules/writer/services/workbenchProject.service', () => ({
  buildWorkbenchRecentProjectCards: buildWorkbenchRecentProjectCardsMock,
  ensureProjectBaseSkeleton: ensureProjectBaseSkeletonMock,
  sortProjectsByRecent: (projects: unknown[]) => projects,
}))

vi.mock('@/modules/writer/services/writerProjectBrief.service', () => ({
  saveWriterProjectBrief: saveWriterProjectBriefMock,
}))

vi.mock('@/design-system/services', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const createWrapper = async () => {
  loadListMock.mockResolvedValue(undefined)
  buildWorkbenchRecentProjectCardsMock.mockResolvedValue([
    {
      id: 'project-1',
      title: '夜航人手册',
      summary: '',
      status: 'serializing',
      statusLabel: '连载中',
      category: '玄幻',
      totalWords: 1200,
      chapterCount: 3,
      updatedAt: '2026-05-17T00:00:00.000Z',
      lastChapterTitle: '第一章',
      continueTarget: {
        name: 'writer-project',
        params: { projectId: 'project-1' },
      },
    },
  ])

  const wrapper = mount(WriterWorkbenchView, {
    global: {
      stubs: {
        WorkbenchShell: {
          template: '<main><slot name="actions" /><slot /></main>',
        },
        ProjectCreateDialog: true,
        QyButton: {
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        QyCard: {
          template: '<section><slot /></section>',
        },
        QyIcon: true,
        Skeleton: true,
      },
    },
  })

  await flushPromises()
  return wrapper
}

describe('WriterWorkbenchView', () => {
  beforeEach(() => {
    loadListMock.mockReset()
    projectStoreMock.loadList = loadListMock
    projectStoreMock.create.mockReset()
    buildWorkbenchRecentProjectCardsMock.mockReset()
    ensureProjectBaseSkeletonMock.mockReset()
    importProjectAndEnterMock.mockReset()
    openCreatedProjectMock.mockReset()
    openProjectMock.mockReset()
    routerPushMock.mockReset()
    saveWriterProjectBriefMock.mockReset()
    saveWriterProjectBriefMock.mockResolvedValue(undefined)
  })

  it('opens the in-project inspiration panel from the inspiration stage', async () => {
    const wrapper = await createWrapper()

    await wrapper.findAll('.writer-stage-card')[0].trigger('click')

    expect(openProjectMock).toHaveBeenCalledWith('project-1', {
      stage: 'inspiration',
      rightTool: 'inspiration',
    })
    expect(routerPushMock).not.toHaveBeenCalledWith({ name: 'writer-templates' })
  })

  it('opens the in-project review panel from the review stage', async () => {
    const wrapper = await createWrapper()

    await wrapper.findAll('.writer-stage-card')[4].trigger('click')

    expect(openProjectMock).toHaveBeenCalledWith('project-1', {
      stage: 'review',
      rightTool: 'harness',
    })
  })

  it('shows concrete task slices on creative flow stage cards', async () => {
    const wrapper = await createWrapper()

    const firstStage = wrapper.findAll('.writer-stage-card')[0]
    expect(firstStage.text()).toContain('灵感原点')
    expect(firstStage.text()).toContain('题材坐标')
    expect(firstStage.text()).toContain('读者承诺')
  })

  it('persists a project brief when creating a blank project', async () => {
    projectStoreMock.create.mockResolvedValue({ id: 'project-new' })
    ensureProjectBaseSkeletonMock.mockResolvedValue({ chapterId: 'chapter-1' })
    const wrapper = await createWrapper()

    wrapper.findComponent({ name: 'ProjectCreateDialog' }).vm.$emit('submit', {
      title: '夜航人手册',
      summary: '一个关于夜航员寻找失落航线的故事。',
    })
    await flushPromises()

    expect(saveWriterProjectBriefMock).toHaveBeenCalledWith('project-new', {
      premise: '一个关于夜航员寻找失落航线的故事。',
    })
    expect(openCreatedProjectMock).toHaveBeenCalledWith({ id: 'project-new' }, { chapterId: 'chapter-1' })
  })
})
