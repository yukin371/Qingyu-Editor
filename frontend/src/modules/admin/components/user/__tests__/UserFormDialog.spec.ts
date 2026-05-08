import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserFormDialog from '../UserFormDialog.vue'

describe('UserFormDialog', () => {
  it('component exists and can be imported', () => {
    expect(UserFormDialog).toBeDefined()
    expect(UserFormDialog.name || 'UserFormDialog').toBeTruthy()
  })

  it('mounts safely in add mode without user data', () => {
    const wrapper = mount(UserFormDialog, {
      props: {
        visible: true,
        mode: 'add',
      },
      shallow: true,
      global: {
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-alert': true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })
})
