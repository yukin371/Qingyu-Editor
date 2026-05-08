import { describe, expect, it } from 'vitest'
import { buildStoryHarnessSuggestions } from '../storyHarnessSuggestions'

describe('buildStoryHarnessSuggestions', () => {
  it('正文成文但未声明作用域时，应提示补充出场角色', () => {
    const result = buildStoryHarnessSuggestions({
      chapterTitle: '第一章',
      content:
        '张三提着刀冲进院子，四下无人回应。他盯着地上的血迹，越想越不对，最后决定今晚不再相信任何人。' +
        '他在空屋里来回踱步，反复确认窗棂上的脚印和桌上的油灯是否还留着余温，直到天快亮时才勉强压住心里的慌乱。' +
        '可当鸡鸣声从村口传来，他还是决定先去祠堂看看，因为那里也许藏着昨夜真正的见证人。',
      activeCharacters: [],
      activeRelations: [],
      allCharacters: [
        { id: 'char-1', name: '张三' },
        { id: 'char-2', name: '李四' },
      ],
    })

    expect(result.some((item) => item.type === 'scene_scope')).toBe(true)
    expect(result.some((item) => item.title.includes('补充当前场景出场名单'))).toBe(true)
    expect(result.every((item) => item.source === 'live')).toBe(true)
  })

  it('命中角色状态关键词时，应生成状态更新预览', () => {
    const result = buildStoryHarnessSuggestions({
      chapterTitle: '第二章',
      content: '张三看着李四残破的袖口，终于开始怀疑这个老朋友是否还值得托付。',
      activeCharacters: [
        { id: 'char-1', name: '张三', traits: ['热血'] },
        { id: 'char-2', name: '李四', traits: ['冷静'] },
      ],
      activeRelations: [],
      allCharacters: [
        { id: 'char-1', name: '张三' },
        { id: 'char-2', name: '李四' },
      ],
    })

    expect(result.some((item) => item.type === 'state')).toBe(true)
    expect(result.every((item) => item.source === 'live')).toBe(true)
  })

  it('正文中的作者注释应生成更明确的状态变更建议', () => {
    const result = buildStoryHarnessSuggestions({
      chapterTitle: '第三章',
      content:
        '李四靠在墙边，脸色已经白得像纸。\n// @李四 受伤严重，退出后续战斗。\n张三没有继续追问，只让人先把门关上。',
      activeCharacters: [{ id: 'char-2', name: '李四', traits: ['冷静'] }],
      activeRelations: [],
      allCharacters: [
        { id: 'char-1', name: '张三' },
        { id: 'char-2', name: '李四' },
      ],
    })

    expect(result.some((item) => item.title.includes('正文指令建议'))).toBe(true)
    expect(result.some((item) => item.evidence?.includes('// @李四'))).toBe(true)
    expect(result.every((item) => item.source === 'live')).toBe(true)
  })
})
