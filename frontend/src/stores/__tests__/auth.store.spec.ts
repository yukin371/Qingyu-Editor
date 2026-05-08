import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../auth'
import storage from '@/utils/storage'

const { mockSharedAuthAPI } = vi.hoisted(() => ({
  mockSharedAuthAPI: {
    getUserInfo: vi.fn(),
    updateUserInfo: vi.fn(),
  },
}))

vi.mock('@/modules/shared/api/auth', () => ({
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

describe('AuthStore role sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('getUserInfo should normalize and persist roles', async () => {
    const authStore = useAuthStore()

    mockSharedAuthAPI.getUserInfo.mockResolvedValue({
      user: {
        id: 'user-1',
        username: 'author_1',
        role: 'writer',
      },
      roles: ['writer', 'reader'],
      permissions: ['writer:read'],
    })

    await authStore.getUserInfo()

    expect(authStore.roles).toEqual(['author', 'reader'])
    expect(authStore.user?.role).toBe('author')
    expect(authStore.user?.roles).toEqual(['author', 'reader'])
    expect(storage.get('roles')).toEqual(['author', 'reader'])
  })

  it('updateUserInfo should preserve existing roles when response omits roles', async () => {
    const authStore = useAuthStore()

    authStore.roles = ['author']
    authStore.user = {
      id: 'user-1',
      username: 'author_1',
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

    await authStore.updateUserInfo({
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
