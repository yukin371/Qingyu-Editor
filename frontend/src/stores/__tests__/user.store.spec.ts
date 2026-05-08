import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../auth'
import { useUserStore } from '../user'
import storage from '@/utils/storage'

const { mockSharedAuthAPI } = vi.hoisted(() => ({
  mockSharedAuthAPI: {
    getUserInfo: vi.fn(),
    updateUserInfo: vi.fn(),
  },
}))

vi.mock('@/modules/shared/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  sharedAuthAPI: mockSharedAuthAPI,
}))

const createLocalStorageMock = () => {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

describe('UserStore auth sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('fetchUserInfo should sync auth roles and persisted roles from profile response', async () => {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    userStore.token = 'test-token'
    mockSharedAuthAPI.getUserInfo.mockResolvedValue({
      user: {
        id: 'user-1',
        username: 'reader_1',
        nickname: '读者一号',
        roles: ['writer', 'reader'],
      },
    })

    await userStore.fetchUserInfo()

    expect(authStore.roles).toEqual(['author', 'reader'])
    expect(authStore.user?.role).toBe('author')
    expect(authStore.user?.roles).toEqual(['author', 'reader'])
    expect(storage.get('roles')).toEqual(['author', 'reader'])
    expect((storage.get('user') as { roles?: string[] } | null)?.roles).toEqual([
      'author',
      'reader',
    ])
  })

  it('updateProfile should keep auth roles while syncing updated user fields', async () => {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    authStore.roles = ['author']
    authStore.user = {
      id: 'user-1',
      username: 'reader_1',
      nickname: '旧昵称',
      role: 'author',
      roles: ['author'],
    } as any
    userStore.userInfo = {
      id: 'user-1',
      username: 'reader_1',
      nickname: '旧昵称',
      role: 'author',
      roles: ['author'],
    } as any

    mockSharedAuthAPI.updateUserInfo.mockResolvedValue({
      user: {
        nickname: '新昵称',
        bio: '新的简介',
      },
    })

    await userStore.updateProfile({
      nickname: '新昵称',
      bio: '新的简介',
    })

    expect(authStore.roles).toEqual(['author'])
    expect(authStore.user?.nickname).toBe('新昵称')
    expect(authStore.user?.bio).toBe('新的简介')
    expect(authStore.user?.roles).toEqual(['author'])
    expect(storage.get('roles')).toEqual(['author'])
  })
})
