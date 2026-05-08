import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RankingList from '../RankingList.vue'

describe('RankingList', () => {
  it('优先展示书籍真实评分，而不是榜单热度分', () => {
    const wrapper = mount(RankingList, {
      props: {
        type: 'weekly',
        items: [
          {
            id: 'ranking-1',
            score: 128.6,
            viewCount: 5200,
            book: {
              id: 'book-1',
              title: '测试小说',
              author: '测试作者',
              rating: 4.6,
            },
          },
        ],
      },
      global: {
        stubs: {
          'el-image': true,
          'el-tag': true,
          'el-divider': true,
          Empty: true,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('4.6')
    expect(wrapper.text()).not.toContain('128.6')
  })

  it('会把异常评分限制在 5 分上限内', () => {
    const wrapper = mount(RankingList, {
      props: {
        type: 'monthly',
        items: [
          {
            id: 'ranking-2',
            score: 256.4,
            viewCount: 8600,
            book: {
              id: 'book-2',
              title: '异常评分小说',
              author: '测试作者',
              rating: 12,
            },
          },
        ],
      },
      global: {
        stubs: {
          'el-image': true,
          'el-tag': true,
          'el-divider': true,
          Empty: true,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('5.0')
    expect(wrapper.text()).not.toContain('12.0')
  })
})
