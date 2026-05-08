/**
 * 模拟AI响应生成器
 *
 * 生成模拟的AI回复，用于UI测试和演示。
 * 支持多种预设回复类型和自定义延迟。
 *
 * @param prompt - 用户提示词
 * @param delay - 响应延迟（毫秒），默认1000ms
 * @returns Promise<string> - AI回复内容
 *
 * @example
 * ```typescript
 * const response = await mockAIResponse('帮我续写', 1500)
 * ```
 *
 * @author 猫娘Kore
 * @date 2026-02-08
 */

/**
 * 预设回复类型
 */
export type MockResponseType =
  | 'continuation'  // 续写
  | 'polish'        // 润色
  | 'summary'       // 总结
  | 'suggestion'    // 建议
  | 'general'       // 通用
  | 'error'         // 错误
  | 'greeting'      // 问候

/**
 * 预设回复模板
 */
const MOCK_RESPONSES: Record<MockResponseType, string[]> = {
  continuation: [
    '好的，让我为你继续创作...\n\n阳光透过树叶的缝隙洒在地面上，形成斑驳的光影。她停下脚步，深吸了一口气，感受着森林中清新的空气。这里的一切都显得如此宁静，仿佛时间都在这一刻静止了。\n\n然而，她知道这只是暴风雨前的宁静...',
    '续写内容如下：\n\n夜幕降临，城市的霓虹灯开始闪烁。他站在落地窗前，俯瞰着脚下这座繁华的都市。然而，无论多么璀璨的灯光，都无法照亮他内心的孤独。\n\n"该做出选择了。"他喃喃自语道。',
    '让我继续这个故事...\n\n就在这时，一个意想不到的人出现了。那个本该永远离开的人，此刻正站在门前，脸上带着复杂的表情。\n\n"我以为我们再也见不到了。"她说。'
  ],
  polish: [
    '【润色建议】\n\n原文：他走了进来。\n\n建议修改：他迈着沉重的步伐缓缓走入房间，每一步都似乎带着某种难以言说的压力。\n\n改进点：增加了动作描写和氛围渲染，使人物形象更加立体。',
    '【润色版本】\n\n原句：她哭了。\n\n优化后：泪水如断了线的珍珠般从她的脸颊滑落，她努力想要忍住，但最终还是发出了压抑的啜泣声。\n\n分析：通过比喻和声音描写，增强了情感表达力度。',
    '【润色建议】\n\n建议对这段描写进行以下优化：\n1. 增加感官细节（视觉、听觉、触觉）\n2. 使用更生动的动词\n3. 添加人物心理活动\n4. 营造氛围感\n\n具体修改请看上方对比。'
  ],
  summary: [
    '【内容总结】\n\n本文段主要讲述了主人公在面对困境时的心理变化和成长历程。通过一系列事件的描述，展现了人物从迷茫到坚定的转变过程。\n\n核心要点：\n- 主人公面临重大抉择\n- 内心矛盾的展现\n- 最终做出决定\n- 暗示后续发展',
    '【章节概要】\n\n本章重点：\n1. 情节推进：主角发现了关键线索\n2. 人物关系：揭示了配角的真实身份\n3. 情感发展：主角与配角的互动升级\n4. 伏笔埋设：为后续剧情做铺垫\n\n字数统计：约2500字\n重要程度：⭐⭐⭐⭐',
    '【故事梗概】\n\n这是一个关于成长、友情与冒险的故事。主人公在旅途中结识了各种伙伴，共同面对挑战，最终实现了自我价值的提升。\n\n主题：友谊、勇气、成长\n风格：轻松、热血、感人\n适合人群：青少年及成人读者'
  ],
  suggestion: [
    '【写作建议】\n\n基于当前内容，我有以下建议：\n\n1. 情节发展：可以考虑在下一章引入新的冲突点\n2. 人物塑造：建议增加配角的心理描写\n3. 节奏把控：当前节奏适中，可以保持\n4. 细节补充：建议添加一些环境描写来增强代入感',
    '【创作灵感】\n\n根据你的故事走向，这里有一些可能的创作方向：\n\n📖 情节分支A：主角发现隐藏的秘密\n📖 情节分支B：意外的盟友出现\n📖 情节分支C：背叛与真相\n\n每个分支都有其独特的发展潜力，建议根据整体故事规划选择。',
    '【优化建议】\n\n关注以下几个方面可以让你的作品更上一层楼：\n\n✓ 对话：让每个角色的语言更有特点\n✓ 描写：增加"展示而非告知"的技巧\n✓ 节奏：张弛有度，高潮部分提速\n✓ 情感：深化人物内心戏\n✓ 伏笔：巧妙铺设，适时回收'
  ],
  general: [
    '收到你的请求，我来帮你处理这个问题。\n\n首先，让我们分析一下当前的情况...然后找到合适的解决方案。如果你需要更多细节或者有其他问题，随时告诉我！',
    '好的，我明白了你的需求。让我来协助你完成这项任务。\n\n有任何疑问都可以随时提出，我会尽力为你提供帮助。',
    '我正在为你处理这个请求，请稍等片刻...\n\n如果你有任何特定的要求或者偏好，也可以告诉我，我会根据你的需求进行调整。'
  ],
  error: [
    '抱歉，我遇到了一些问题，无法完成你的请求。请稍后再试，或者换个方式描述你的需求。',
    '哎呀，好像出了点小问题 😅\n\n建议你：\n1. 检查网络连接\n2. 重新发送请求\n3. 如果问题持续，请联系技术支持',
    '处理失败，请重试'
  ],
  greeting: [
    '你好！我是你的AI写作助手 🤖\n\n我可以帮你：\n✨ 续写故事情节\n✨ 润色文字表达\n✨ 提供创作建议\n✨ 总结内容要点\n\n有什么我可以帮助你的吗？',
    '嗨！很高兴见到你！\n\n我是专门为写作爱好者设计的AI助手。无论你是在创作小说、散文还是其他文字作品，我都能提供帮助。\n\n今天想写点什么？',
    '欢迎回来！👋\n\n我随时准备协助你的创作工作。需要续写、润色还是头脑风暴？尽管告诉我！'
  ]
}

/**
 * 关键词匹配规则
 */
const KEYWORD_MAP: Record<string, MockResponseType> = {
  '续写': 'continuation',
  '继续': 'continuation',
  '接着': 'continuation',
  '润色': 'polish',
  '修改': 'polish',
  '优化': 'polish',
  '总结': 'summary',
  '概括': 'summary',
  '摘要': 'summary',
  '建议': 'suggestion',
  '灵感': 'suggestion',
  '帮助': 'suggestion',
  '你好': 'greeting',
  '嗨': 'greeting',
  'hello': 'greeting',
  'hi': 'greeting'
}

/**
 * 模拟AI响应
 *
 * @param prompt - 用户提示词
 * @param delay - 响应延迟（毫秒）
 * @returns Promise<string> - AI回复内容
 */
export function mockAIResponse(prompt: string, delay: number = 1000): Promise<string> {
  return new Promise((resolve) => {
    // 根据关键词选择回复类型
    let responseType: MockResponseType = 'general'

    for (const [keyword, type] of Object.entries(KEYWORD_MAP)) {
      if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
        responseType = type
        break
      }
    }

    // 随机选择该类型的回复
    const responses = MOCK_RESPONSES[responseType]
    const response = responses[Math.floor(Math.random() * responses.length)]

    // 模拟网络延迟
    setTimeout(() => {
      resolve(response)
    }, delay)
  })
}

/**
 * 模拟流式AI响应（用于打字机效果）
 *
 * @param prompt - 用户提示词
 * @param onChunk - 接收数据块的回调
 * @param delay - 响应延迟（毫秒）
 * @returns Promise<void>
 */
export async function mockAIStreamResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  delay: number = 1000
): Promise<void> {
  // 先等待初始延迟
  await new Promise(resolve => setTimeout(resolve, delay))

  // 获取完整回复
  const response = await mockAIResponse(prompt, 0)

  // 模拟流式输出（每次发送一个字符）
  for (let i = 0; i < response.length; i++) {
    onChunk(response[i])
    await new Promise(resolve => setTimeout(resolve, 30)) // 每个字符间隔30ms
  }
}

/**
 * 获取预设快捷操作的提示词
 */
export const QUICK_ACTION_PROMPTS = {
  continue: {
    label: '续写一段',
    icon: 'Pencil',
    prompt: '请根据当前内容续写一段话'
  },
  polish: {
    label: '润色文字',
    icon: 'Sparkles',
    prompt: '请帮我润色这段文字'
  },
  summary: {
    label: '总结内容',
    icon: 'DocumentText',
    prompt: '请总结当前内容'
  },
  suggestion: {
    label: '写作建议',
    icon: 'LightBulb',
    prompt: '请给我一些写作建议'
  },
  brainstorm: {
    label: '头脑风暴',
    icon: 'Bolt',
    prompt: '帮我进行头脑风暴'
  },
  character: {
    label: '角色设定',
    icon: 'User',
    prompt: '帮我完善角色设定'
  }
}

/**
 * 根据快捷操作ID获取对应的提示词
 */
export function getQuickActionPrompt(actionId: string): string {
  const action = (QUICK_ACTION_PROMPTS as Record<string, { prompt: string }>)[actionId]
  return action?.prompt || '请提供帮助'
}
