import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountSettings from '../AccountSettings.vue'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    routerBack: vi.fn(),
    routerPush: vi.fn(),
    messageSuccess: vi.fn(),
    messageError: vi.fn(),
    messageInfo: vi.fn(),
    fetchProfile: vi.fn(),
    updateProfile: vi.fn(),
    initAuth: vi.fn(),
    userStore: null as any,
    authStore: null as any,
    storageGet: vi.fn(),
    readStoredAuthToken: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mocks.routerBack,
    push: mocks.routerPush,
  }),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: mocks.messageSuccess,
    error: mocks.messageError,
    info: mocks.messageInfo,
    warning: vi.fn(),
  },
}))

vi.mock('@/design-system/components', () => ({
  QyButton: {
    template: '<button class="qy-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  QyRadioGroup: {
    template: '<div class="qy-radio-group"><slot /></div>',
    props: ['modelValue'],
  },
  QyRadio: {
    template: '<label class="qy-radio"><input type="radio" /><slot /></label>',
    props: ['value'],
  },
  QyModal: {
    template: '<div class="qy-modal" v-if="visible"><slot /><slot name="footer" /></div>',
    props: ['visible', 'title', 'width'],
    emits: ['update:visible', 'close'],
  },
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name'],
  },
}))

vi.mock('@/design-system/base', () => ({
  Tag: {
    template: '<span class="tag"><slot /></span>',
    props: ['variant'],
  },
  Textarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  Card: {
    template: '<section class="card"><header><slot name="header" /></header><slot /></section>',
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

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('@/utils/storage', () => ({
  default: {
    get: (...args: unknown[]) => mocks.storageGet(...args),
    set: vi.fn(),
  },
  readStoredAuthToken: () => mocks.readStoredAuthToken(),
}))

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const buildUserStore = () =>
  reactive({
    avatar: '',
    displayName: '设置昵称',
    profile: {
      avatar: '',
      nickname: '设置昵称',
      bio: '设置简介',
      gender: 'other',
      birthday: '',
      location: '',
      website: '',
      social: {
        weibo: '',
        wechat: '',
        qq: '',
      },
    },
    fetchProfile: mocks.fetchProfile,
    updateProfile: mocks.updateProfile,
  })

const buildAuthStore = () =>
  reactive({
    token: 'test-token',
    roles: ['author', 'reader'],
    user: {
      roles: ['author', 'reader'],
      role: 'author',
    },
    initAuth: mocks.initAuth,
  })

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.userStore = buildUserStore()
    mocks.authStore = buildAuthStore()
    mocks.fetchProfile.mockResolvedValue(mocks.userStore.profile)
    mocks.updateProfile.mockImplementation(async (payload: Record<string, unknown>) => {
      mocks.userStore.profile = {
        ...mocks.userStore.profile,
        ...payload,
      }
      return mocks.userStore.profile
    })
    mocks.storageGet.mockReturnValue(null)
    mocks.readStoredAuthToken.mockReturnValue('test-token')
  })

  it('should render current roles and downgrade action for author', async () => {
    const wrapper = mount(AccountSettings, {
      global: {
        stubs: {
          'el-page-header': {
            template: '<div class="el-page-header"><slot name="content" /></div>',
          },
          'el-date-picker': {
            template: '<input class="el-date-picker" />',
            props: ['modelValue'],
          },
          QyAvatar: {
            template: '<div class="qy-avatar"><slot /></div>',
            props: ['size', 'src'],
          },
          QyForm: {
            template: '<form class="qy-form"><slot /></form>',
            props: ['model', 'rules', 'labelWidth'],
            methods: {
              async validate() {
                return true
              },
              clearValidate() {},
            },
          },
          QyFormItem: {
            template: '<div class="qy-form-item"><slot /></div>',
            props: ['label', 'prop'],
          },
          'qy-upload': {
            template: '<div class="qy-upload"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()
    await nextTick()

    expect(mocks.fetchProfile).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('作者')
    expect(wrapper.text()).toContain('读者')
    expect(wrapper.text()).toContain('降级为读者')
  })

  it('should save updated settings through user store', async () => {
    const wrapper = mount(AccountSettings, {
      global: {
        stubs: {
          'el-page-header': {
            template: '<div class="el-page-header"><slot name="content" /></div>',
          },
          'el-date-picker': {
            template:
              '<input class="el-date-picker" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          QyAvatar: {
            template: '<div class="qy-avatar"><slot /></div>',
            props: ['size', 'src'],
          },
          QyForm: {
            template: '<form class="qy-form"><slot /></form>',
            props: ['model', 'rules', 'labelWidth'],
            methods: {
              async validate() {
                return true
              },
              clearValidate() {},
            },
          },
          QyFormItem: {
            template: '<div class="qy-form-item"><slot /></div>',
            props: ['label', 'prop'],
          },
          'qy-upload': {
            template: '<div class="qy-upload"><slot /></div>',
          },
        },
      },
    })

    await flushPromises()
    await nextTick()

    const inputs = wrapper.findAll('input')
    const textareas = wrapper.findAll('textarea')

    await inputs[0].setValue('新的设置昵称')
    await textareas[0].setValue('新的设置简介')

    const saveButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('保存设置'))

    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')
    await flushPromises()

    expect(mocks.updateProfile).toHaveBeenCalledWith({
      nickname: '新的设置昵称',
      bio: '新的设置简介',
      gender: 'other',
      social: {
        weibo: '',
        wechat: '',
        qq: '',
      },
    })
    expect(mocks.messageSuccess).toHaveBeenCalledWith('保存成功')
  })
})
