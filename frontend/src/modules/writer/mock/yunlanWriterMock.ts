export interface WriterSampleBookMeta {
  title: string
  author: string
  tags: string[]
  statusText: string
  lastUpdate: string
  viewCount: number
  favoriteCount: number
  wordCount: number
  cover: string
  introduction: string
}

export interface WriterSampleChapterItem {
  id: string
  title: string
}

export interface WriterSampleReaderChapter {
  id: string
  chapterNum: number
  title: string
  content: string
  bookId: string
  bookTitle: string
  isRead: boolean
  isFree: boolean
  prevChapterId: string
  nextChapterId: string
}

export const WRITER_SAMPLE_BOOK_ID = 'demo-yunlan'
export const WRITER_SAMPLE_BOOK_TITLE = '云岚纪事'
export const WRITER_SAMPLE_TOTAL_CHAPTERS = 30

export const writerSampleBookMeta: WriterSampleBookMeta = {
  title: WRITER_SAMPLE_BOOK_TITLE,
  author: '青羽书院',
  tags: ['虚构文学', '成长', '冒险', '群像', '长篇'],
  statusText: '连载中 · 本站首发',
  lastUpdate: '2026-02-16 13:25:35',
  viewCount: 2436000,
  favoriteCount: 16814,
  wordCount: 157867,
  cover: '/images/covers/yunlan-cover.png',
  introduction:
    '《云岚纪事》为独立编辑器内置样例书，用于验证项目、章节、资产与编辑流程，不对应任何在线平台内容。',
}

const writerSampleChapterTitlePool = [
  '雨夜入城',
  '青石巷旧书铺',
  '灯下问卷',
  '同行者',
  '山海驿道',
  '归途抉择',
]

const writerSampleChapterParagraphs: Record<string, string[]> = {
  'ch-1': [
    '林砚站在南街转角处，看着贴在墙上的告示被雨水洇透一角，墨字晕成模糊的团。告示上说，北边官道冲垮了一段，驿车暂停三日。',
    '他把木箱换到左手，指节被勒得发白。临行前娘说过，到了云岚城就找南街的周家客栈，那是她年轻时帮工的地方，掌柜的姓陈，人厚道，会给个便宜住处。',
    '青石板路在雨里泛着暗光，他沿着屋檐一路问过去。有人摇头，有人指个方向又改了口，最后是个卖糖水的婆婆把他领到巷子深处，指着两扇半旧的木门说：“就是这儿，周家老店，牌子挂得高，你低头走容易错过。”',
    '林砚抬头看，一块乌木匾上刻着“周家客栈”四个字，漆色斑驳，檐下的灯笼却亮得温和。',
    '他推门进去。堂里只有三张桌子，一个伙计趴在柜台上打盹，听见门响才揉着眼睛站起来。后头帘子一挑，走出个四十来岁的妇人，腰间系着蓝布围裙，手里还攥着根葱。',
    '“住店？”',
    '“是。陈掌柜……”',
    '“我就是。”妇人上下打量他一眼，目光在他湿透的鞋上停了一停，“你娘是林家的人？”',
    '林砚怔了怔，点头。',
    '陈掌柜没再多问，转头对伙计说：“带他去后院，柴房旁边那间，先把湿衣裳换了。”又对林砚道：“你娘当年也住那屋。先歇着，明早下来吃饭。”',
  ],
  'ch-2': [
    '林砚站在东厢房门口，一时不知该进还是该退。',
    '程先生说完那句话后便不再看他，只低头将案上的城防图慢慢卷起。那双手骨节分明，动作很轻，像在对待一件脆弱的旧物。',
    '“进来坐吧。”程先生终于把图卷收进竹筒，抬手指了指窗边的矮几，“茶在壶里，自己倒。”',
    '林砚放下木箱，在矮几旁坐下。茶是凉的，但还有余香。他端着茶杯，目光忍不住往那只竹筒上瞟。',
    '“认得字？”程先生忽然问。',
    '“认得。”林砚回过神，“在村里私塾念过几年。”',
    '“读过什么书？”',
    '“《三字经》《千字文》，还有半本《论语》。”他顿了顿，“先生还借我《山川志》看过。”',
  ],
  'ch-3': [
    '三日后的清晨，林砚推开柴房旁的小窗，看见天边烧着一片淡红。',
    '他捧着《云岚城坊巷录》又翻了一遍，书页边缘被他用指尖捻得发毛。',
    '第三日夜里落了小雨，他听见河堤方向传来三声锣响，不紧不慢，像是报平安的暗号。',
    '此刻他合上书，背上木箱，从后门出去。',
    '“进来。”程先生没有多余的话，转身往里走。',
  ],
}

export const createWriterSampleChapterList = (
  total = WRITER_SAMPLE_TOTAL_CHAPTERS,
): WriterSampleChapterItem[] => {
  return Array.from({ length: total }).map((_, idx) => ({
    id: `ch-${idx + 1}`,
    title:
      idx === 0
        ? '第1章 雨夜入城'
        : idx === 1
          ? '第2章 青石巷旧书铺'
          : idx === 2
            ? '第3章 灯下问卷'
            : `第${idx + 1}章 ${writerSampleChapterTitlePool[idx % writerSampleChapterTitlePool.length]}`,
  }))
}

export const createWriterSampleReaderChapters = (
  total = WRITER_SAMPLE_TOTAL_CHAPTERS,
): WriterSampleReaderChapter[] => {
  const list = createWriterSampleChapterList(total)
  return list.map((item, idx) => {
    const content =
      writerSampleChapterParagraphs[item.id]?.join('\n') ||
      [
        `${item.title} 为独立编辑器样例章节内容。`,
        '本章用于验证桌面写作链路，包括章节切换、自动保存、资产引用与编辑器交互。',
        '后续如果需要更多样例，只应在 writer 模块内扩展，不再回用在线平台 demo 数据。',
      ].join('\n')

    return {
      id: item.id,
      chapterNum: idx + 1,
      title: item.title,
      content,
      bookId: WRITER_SAMPLE_BOOK_ID,
      bookTitle: WRITER_SAMPLE_BOOK_TITLE,
      isRead: idx < 1,
      isFree: true,
      prevChapterId: idx > 0 ? `ch-${idx}` : '',
      nextChapterId: idx < total - 1 ? `ch-${idx + 2}` : '',
    }
  })
}
