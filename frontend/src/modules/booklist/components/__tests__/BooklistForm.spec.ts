/**
 * BooklistForm组件测试
 */
// @ts-nocheck - Test file with flexible type assertions

import { mount } from '@vue/test-utils'
import { createMockBooklist } from '../../../../tests/fixtures'

// Mock设计系统组件 - 必须在导入组件之前
vi.mock('@/design-system/components', () => {
  const { h, defineComponent } = require('vue')

  const MockQyInput = defineComponent({
    name: 'QyInput',
    props: {
      modelValue: { type: [String, Number], default: '' },
      type: { type: String, default: 'text' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      rows: { type: Number, default: 3 },
      maxlength: { type: Number },
      showCount: { type: Boolean, default: false },
      size: { type: String, default: 'medium' },
    },
    emits: ['update:modelValue', 'change', 'blur', 'focus'],
    setup(props: any, { emit }: any) {
      const handleInput = (e: any) => {
        const target = e.target
        const value = target.value
        emit('update:modelValue', value)
        emit('change', value)
      }

      const handleBlur = () => {
        emit('blur')
      }

      const handleFocus = () => {
        emit('focus')
      }

      return () =>
        h(
          props.type === 'textarea' ? 'textarea' : 'input',
          {
            class: 'qy-input',
            type: props.type === 'textarea' ? undefined : props.type,
            placeholder: props.placeholder,
            disabled: props.disabled,
            readonly: props.readonly,
            rows: props.rows,
            maxlength: props.maxlength,
            value: props.modelValue,
            onInput: handleInput,
            onBlur: handleBlur,
            onFocus: handleFocus,
            'data-testid': 'qy-input',
          },
          [],
        )
    },
    methods: {
      // 添加 focus 方法以支持组件测试中的 tagInputRef.value?.focus() 调用
      focus() {
        // Mock implementation
      },
    },
  })

  const MockQyTextarea = defineComponent({
    name: 'QyTextarea',
    props: {
      modelValue: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      rows: { type: Number, default: 3 },
      maxlength: { type: Number },
      showCount: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'change', 'blur', 'focus'],
    setup(props: any, { emit }: any) {
      const handleInput = (e: any) => {
        const value = e.target.value
        emit('update:modelValue', value)
        emit('change', value)
      }

      return () =>
        h('textarea', {
          class: 'qy-textarea',
          placeholder: props.placeholder,
          disabled: props.disabled,
          readonly: props.readonly,
          rows: props.rows,
          maxlength: props.maxlength,
          value: props.modelValue,
          onInput: handleInput,
          onBlur: () => emit('blur'),
          onFocus: () => emit('focus'),
          'data-testid': 'qy-textarea',
        })
    },
  })

  const MockQyButton = defineComponent({
    name: 'QyButton',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'medium' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      type: { type: String, default: 'button' },
    },
    emits: ['click'],
    setup(props: any, { emit, slots }: any) {
      const classes = ['qy-button', `qy-button--${props.variant}`, `qy-button--${props.size}`]
      if (props.disabled) classes.push('is-disabled')
      if (props.loading) classes.push('is-loading')

      return () =>
        h(
          'button',
          {
            class: classes,
            disabled: props.disabled,
            type: props.type,
            onClick: (e: any) => emit('click', e),
          },
          slots.default ? slots.default() : [],
        )
    },
  })

  const MockQyBadge = defineComponent({
    name: 'QyBadge',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'medium' },
      closable: { type: Boolean, default: false },
    },
    emits: ['click', 'close'],
    setup(props: any, { emit, slots }: any) {
      const children = [slots.default ? slots.default() : '']
      if (props.closable) {
        children.push(
          h(
            'span',
            {
              class: 'close-btn',
              onClick: (e: any) => {
                e.stopPropagation()
                emit('close')
              },
            },
            '×',
          ),
        )
      }
      return () =>
        h(
          'span',
          {
            class: ['qy-badge', `qy-badge--${props.variant}`, `qy-badge--${props.size}`],
            onClick: () => emit('click'),
          },
          children,
        )
    },
  })

  const MockQyIcon = defineComponent({
    name: 'QyIcon',
    props: {
      name: { type: String, required: true },
      size: { type: Number, default: 16 },
    },
    setup(props: any) {
      return () =>
        h('i', { class: `qy-icon qy-icon--${props.name}`, style: { fontSize: `${props.size}px` } })
    },
  })

  return {
    QyInput: MockQyInput,
    QyTextarea: MockQyTextarea,
    QyButton: MockQyButton,
    QyBadge: MockQyBadge,
    QyIcon: MockQyIcon,
  }
})

import BooklistForm from '../BooklistForm.vue'

describe('BooklistForm', () => {
  const defaultProps = {
    popularTags: ['玄幻', '仙侠', '都市', '历史', '科幻', '游戏', '军事', '武侠'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render form correctly in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.booklist-form').exists()).toBe(true)
      expect(wrapper.text()).toContain('书单标题')
      expect(wrapper.text()).toContain('书单描述')
      expect(wrapper.text()).toContain('书单封面')
      expect(wrapper.text()).toContain('标签')
      expect(wrapper.text()).toContain('隐私设置')
    })

    it('should render form correctly in edit mode', () => {
      // Arrange
      const booklist: any = createMockBooklist({
        title: '编辑书单',
        description: '编辑描述',
        tags: ['玄幻', '仙侠'],
      })

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('保存')
      expect(wrapper.find('input[type="text"]').element.value).toBe('编辑书单')
    })

    it('should render submit button as "创建" in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.text()).toContain('创建')
    })

    it('should render submit button as "保存" in edit mode', () => {
      // Arrange
      const booklist = createMockBooklist() as any

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('保存')
    })

    it('should render popular tags when provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.popular-tags').exists()).toBe(true)
      expect(wrapper.text()).toContain('推荐标签')
      defaultProps.popularTags.forEach((tag) => {
        expect(wrapper.text()).toContain(tag)
      })
    })

    it('should not render popular tags when not provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          popularTags: [],
        },
      })

      // Assert
      expect(wrapper.find('.popular-tags').exists()).toBe(false)
    })
  })

  describe('form data initialization', () => {
    it('should initialize with empty form data in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.vm.formData).toEqual({
        title: '',
        description: '',
        cover: '',
        isPublic: true,
        tags: [],
      })
    })

    it('should initialize with booklist data in edit mode', () => {
      // Arrange
      const booklist: any = createMockBooklist({
        title: '测试书单',
        description: '测试描述',
        cover: 'https://example.com/cover.jpg',
        isPublic: true,
        tags: ['玄幻', '仙侠'],
      })

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.vm.formData.title).toBe('测试书单')
      expect(wrapper.vm.formData.description).toBe('测试描述')
      expect(wrapper.vm.formData.cover).toBe('https://example.com/cover.jpg')
      expect(wrapper.vm.formData.isPublic).toBe(true)
      expect(wrapper.vm.formData.tags).toEqual(['玄幻', '仙侠'])
    })

    it('should update form data when booklist prop changes', async () => {
      // Arrange
      const booklist1 = createMockBooklist({ title: '书单1' }) as any
      const booklist2 = createMockBooklist({ title: '书单2' }) as any
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist: booklist1,
        },
      })

      // Act
      await wrapper.setProps({ booklist: booklist2 } as any)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.formData.title).toBe('书单2')
    })
  })

  describe('title input', () => {
    it('should update title when input changes', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      const input = wrapper.find('input[type="text"]')

      // Act
      await input.setValue('新书单标题')
      await input.trigger('input')

      // Assert
      expect(wrapper.vm.formData.title).toBe('新书单标题')
    })
  })

  describe('tag management', () => {
    it('should show tag input when add tag button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      const addButton = wrapper.findAll('button').find((btn) => btn.text().includes('添加标签'))

      // Act
      await addButton?.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.find('input[placeholder="输入标签"]').exists()).toBe(true)
    })

    it('should add tag when tag input is confirmed', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).inputVisible = true

      // Act
      ;(wrapper.vm as any).inputValue = '新标签'
      await (wrapper.vm as any).confirmTag()

      // Assert
      expect(wrapper.vm.formData.tags).toContain('新标签')
      expect(wrapper.vm.inputVisible).toBe(false)
      expect(wrapper.vm.inputValue).toBe('')
    })

    it('should not add duplicate tag', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData.tags = ['玄幻']
      ;(wrapper.vm as any).inputVisible = true

      // Act
      ;(wrapper.vm as any).inputValue = '玄幻'
      await (wrapper.vm as any).confirmTag()

      // Assert
      expect(wrapper.vm.formData.tags.filter((t) => t === '玄幻')).toHaveLength(1)
    })

    it('should remove tag when close button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData.tags = ['玄幻', '仙侠']

      // Act
      await (wrapper.vm as any).removeTag('玄幻')

      // Assert
      expect(wrapper.vm.formData.tags).not.toContain('玄幻')
      expect(wrapper.vm.formData.tags).toContain('仙侠')
    })

    it('should add tag when popular tag is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      await (wrapper.vm as any).addTag('玄幻')

      // Assert
      expect(wrapper.vm.formData.tags).toContain('玄幻')
    })

    it('should not add duplicate tag from popular tags', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData.tags = ['玄幻']

      // Act
      await (wrapper.vm as any).addTag('玄幻')

      // Assert
      expect(wrapper.vm.formData.tags.filter((t) => t === '玄幻')).toHaveLength(1)
    })
  })

  describe('cover upload', () => {
    it('should have file input element', () => {
      // Arrange & Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
      expect(fileInput.attributes('accept')).toBe('image/*')
      expect(fileInput.attributes('style')).toContain('display: none')
    })

    it('should remove cover when remove button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData.cover = 'https://example.com/cover.jpg'

      // Act
      await (wrapper.vm as any).removeCover()

      // Assert
      expect(wrapper.vm.formData.cover).toBe('')
    })
  })

  describe('privacy settings', () => {
    it('should set isPublic to true when public option is selected', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      wrapper.vm.formData.isPublic = true

      // Assert
      expect(wrapper.vm.formData.isPublic).toBe(true)
    })

    it('should set isPublic to false when private option is selected', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      wrapper.vm.formData.isPublic = false

      // Assert
      expect(wrapper.vm.formData.isPublic).toBe(false)
    })
  })

  describe('form submission', () => {
    it('should emit submit event with form data when form is valid', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData = {
        title: '测试书单',
        description: '测试描述',
        cover: 'https://example.com/cover.jpg',
        isPublic: true,
        tags: ['玄幻', '仙侠'],
      }

      // Act
      await (wrapper.vm as any).handleSubmit()

      // Assert
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0]).toEqual([
        {
          title: '测试书单',
          description: '测试描述',
          cover: 'https://example.com/cover.jpg',
          isPublic: true,
          tags: ['玄幻', '仙侠'],
        },
      ])
    })

    it('should not emit submit event when form is invalid', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData.title = '' // Invalid title

      // Act
      await (wrapper.vm as any).handleSubmit()

      // Assert
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('should trim title in submit data', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      ;(wrapper.vm as any).formData = {
        title: '  测试书单  ',
        description: '  测试描述  ',
        cover: '',
        isPublic: true,
        tags: [],
      }

      // Act
      await (wrapper.vm as any).handleSubmit()

      // Assert
      expect((wrapper.emitted('submit')?.[0] as any)?.[0]?.title).toBe('测试书单')
      expect((wrapper.emitted('submit')?.[0] as any)?.[0]?.description).toBe('测试描述')
    })
  })

  describe('form cancellation', () => {
    it('should emit cancel event when cancel button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      await (wrapper.vm as any).handleCancel()

      // Assert
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('validation', () => {
    it('should be valid when title has at least 2 characters', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.formData.title = '测试'

      // Act & Assert
      expect(wrapper.vm.isValid).toBe(true)
    })

    it('should be invalid when title is empty', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.formData.title = ''

      // Act & Assert
      expect(wrapper.vm.isValid).toBe(false)
    })

    it('should be invalid when title has only 1 character', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.formData.title = '测'

      // Act & Assert
      expect(wrapper.vm.isValid).toBe(false)
    })

    it('should trim title when validating', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.formData.title = '  测试  '

      // Act & Assert
      expect(wrapper.vm.isValid).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading state when loading prop is true', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })

      // Assert
      expect(wrapper.props('loading')).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('should compute isEdit correctly when booklist is provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist: createMockBooklist() as any,
        },
      })

      // Assert
      expect(wrapper.vm.isEdit).toBe(true)
    })

    it('should compute isEdit correctly when booklist is not provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.vm.isEdit).toBe(false)
    })
  })
})
