export interface YunlanCommentReply {
  id: string
  user: string
  content: string
  time: string
}

export interface YunlanComment {
  id: string
  user: string
  time: string
  content: string
  rating: number
  collectCount: number
  replies: YunlanCommentReply[]
}

export const yunlanInitialComments: YunlanComment[] = [
  {
    id: 'c1',
    user: '千夜',
    time: '12分钟前',
    content: '开篇信息量控制得很好，人物关系交代清晰，阅读节奏舒服。',
    rating: 4.5,
    collectCount: 12,
    replies: [
      { id: 'r1', user: '作者回复', content: '感谢建议，后续会加强主线推进节奏。', time: '10分钟前' }
    ]
  },
  {
    id: 'c2',
    user: '墨灯',
    time: '8分钟前',
    content: '群像塑造很有层次，配角不是工具人，这点很加分。',
    rating: 5,
    collectCount: 7,
    replies: []
  },
  {
    id: 'c3',
    user: '白石',
    time: '3分钟前',
    content: '章节推进稳，世界观信息是循序渐进给出的，追更体验不错。',
    rating: 4,
    collectCount: 3,
    replies: []
  },
  {
    id: 'c4',
    user: '流年',
    time: '刚刚',
    content: '建议后面补充更多场景描写，能进一步提升画面感。',
    rating: 4.5,
    collectCount: 2,
    replies: []
  }
]

