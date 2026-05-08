import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import ProfileView from '../ProfileView.vue'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    routerPush: vi.fn(),
    messageSuccess: vi.fn(),
    messageError: vi.fn(),
    fetchProfile: vi.fn(),
    updateProfile: vi.fn(),
    getBookshelf: vi.fn(),
    getRecentReading: vi.fn(),
    uploadAvatar: vi.fn(),
    userStore: null as any,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: mocks.messageSuccess,
    error: mocks.messageError,
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/design-system/components', () => ({
  QyAvatar: {
    template: '<div class="qy-avatar"><slot /></div>',
    props: ['size', 'src'],
  },
  QyButton: {
    template: '<button class="qy-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  QyForm: {
    template: '<form class="qy-form"><slot /></form>',
    props: ['modelValue'],
  },
  QyFormItem: {
    template: '<div class="qy-form-item"><slot /></div>',
    props: ['label'],
  },
  QyLoading: {
    template: '<div class="qy-loading" />',
  },
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name'],
  },
}))

vi.mock('@/design-system/base', () => ({
  Empty: {
    template: '<div class="empty"><slot />{{ description }}</div>',
    props: ['description'],
  },
  Card: {
    template: '<section class="card"><header><slot name="header" /></header><slot /></section>',
  },
  Textarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  Image: {
    template: '<img :src="src" class="mock-image" />',
    props: ['src', 'fit'],
  },
  Input: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => mocks.userStore,
}))

vi.mock('@/modules/user/api', () => ({
  userAPI: {
    uploadAvatar: mocks.uploadAvatar,
  },
}))

vi.mock('@/modules/reader/api', () => ({
  booksAPI: {
    getBookshelf: mocks.getBookshelf,
  },
  getRecentReading: mocks.getRecentReading,
}))

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const buildUserStore = () =>
  reactive({
    displayName: '初始昵称',
    username: 'reader_001',
    email: 'reader@qingyu.com',
    avatar: '',
    profile: {
      nickname: '初始昵称',
      username: 'reader_001',
      email: 'reader@qingyu.com',
      bio: '最初的简介',
      avatar: '',
      role: 'author',
    },
    userInfo: {
      role: 'author',
    },
    fetchProfile: mocks.fetchProfile,
    updateProfile: mocks.updateProfile,
  })

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.userStore = buildUserStore()
    mocks.fetchProfile.mockResolvedValue(mocks.userStore.profile)
    mocks.updateProfile.mockImplementation(async (payload: Record<string, string>) => {
      mocks.userStore.profile = {
        ...mocks.userStore.profile,
        ...payload,
      }
      mocks.userStore.displayName = payload.nickname
      return mocks.userStore.profile
    })
    mocks.getBookshelf.mockResolvedValue({ data: { books: [] } })
    mocks.getRecentReading.mockResolvedValue([])
    mocks.uploadAvatar.mockResolvedValue({ url: 'https://example.com/avatar.png' })
  })

  it('should render profile data from user store after mount', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()
    await nextTick()

    expect(mocks.fetchProfile).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('初始昵称')
    expect(wrapper.text()).toContain('reader@qingyu.com')
    expect(wrapper.text()).toContain('作者')
    expect(wrapper.text()).toContain('最初的简介')
  })

  it('should trim inputs and save updated profile through user store', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()
    await nextTick()

    const editButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('编辑资料'))

    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')
    await nextTick()

    const [nicknameInput] = wrapper.findAll('input')
    const [bioTextarea] = wrapper.findAll('textarea')

    await nicknameInput.setValue('  新昵称  ')
    await bioTextarea.setValue('  更新后的简介  ')

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('保存'))

    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(mocks.updateProfile).toHaveBeenCalledWith({
      nickname: '新昵称',
      bio: '更新后的简介',
    })
    expect(mocks.messageSuccess).toHaveBeenCalledWith('资料已更新')
    expect(wrapper.text()).toContain('新昵称')
    expect(wrapper.text()).toContain('更新后的简介')
  })
})
