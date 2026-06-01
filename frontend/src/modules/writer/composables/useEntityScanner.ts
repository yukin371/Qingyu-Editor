import { ref, computed } from 'vue'
import type { KeywordType } from '@editor-shared/extensions/SmartKeyword'

export interface ScannedEntity {
  name: string
  type: KeywordType
  firstAppearance: {
    paragraphIndex: number
    text: string
  }
}

export function useEntityScanner() {
  const scannedEntities = ref<ScannedEntity[]>([])
  const isScanning = ref(false)

  // 扫描频率限制
  let scanTimer: ReturnType<typeof setTimeout> | null = null

  // 扫描文档内容
  function scanContent(content: string): ScannedEntity[] {
    const results: ScannedEntity[] = []

    // 已标记的实体模式 @xxx
    const markedPattern = /@([\u4e00-\u9fa5\w-]{1,30})/g

    // 中文姓名模式：2-4个汉字后跟常见动词
    const namePattern = /([\u4e00-\u9fa5]{2,4})(?:是|在|对|把|被|和|与|向|给|叫|让|请|说|道|问|看|想|觉得|认为)/g

    const foundNames = new Set<string>()
    const paragraphs = content.split(/\n+/)

    // 扫描已标记的实体
    let paragraphIndex = 0
    for (const para of paragraphs) {
      let match
      while ((match = markedPattern.exec(para)) !== null) {
        const name = match[1]
        if (!name || foundNames.has(name)) continue
        foundNames.add(name)

        results.push({
          name,
          type: 'character', // 默认类型
          firstAppearance: {
            paragraphIndex,
            text: para.substring(Math.max(0, match.index - 15), match.index + name.length + 15),
          },
        })
      }
      paragraphIndex++
    }

    // 扫描潜在的新实体（姓名模式）
    paragraphIndex = 0
    for (const para of paragraphs) {
      let match
      while ((match = namePattern.exec(para)) !== null) {
        const name = match[1]
        // 过滤常见词
        if (isCommonWord(name)) continue
        if (!name || name.length < 2 || foundNames.has(name)) continue
        foundNames.add(name)

        results.push({
          name,
          type: 'character',
          firstAppearance: {
            paragraphIndex,
            text: para.substring(Math.max(0, match.index - 15), match.index + match[0].length + 15),
          },
        })
      }
      paragraphIndex++
    }

    // 返回去重后的结果
    return results.slice(0, 20)
  }

  // 过滤常见词
  function isCommonWord(word: string): boolean {
    const commonWords = ['是的', '你在', '他对', '我把', '他被', '我和', '他与', '向我', '给我', '他叫', '他让', '请您', '我说', '他道', '我问', '我看']
    return commonWords.some(w => word.includes(w))
  }

  // 防抖扫描
  function scheduleScan(content: string) {
    if (scanTimer) clearTimeout(scanTimer)
    scanTimer = setTimeout(() => {
      isScanning.value = true
      scannedEntities.value = scanContent(content)
      isScanning.value = false
    }, 1000) // 1秒防抖
  }

  // 获取新的（未在已有列表中的）实体
  const newEntities = computed(() => scannedEntities.value)

  // 忽略某个实体
  const ignoredEntities = ref<Set<string>>(new Set())

  function ignoreEntity(name: string) {
    ignoredEntities.value.add(name)
    // 从扫描结果中移除
    scannedEntities.value = scannedEntities.value.filter(e => e.name !== name)
  }

  function ignoreAll() {
    scannedEntities.value.forEach(e => ignoredEntities.value.add(e.name))
    scannedEntities.value = []
  }

  // 清理
  function cleanup() {
    if (scanTimer) clearTimeout(scanTimer)
  }

  return {
    scannedEntities,
    newEntities,
    isScanning,
    ignoredEntities,
    scheduleScan,
    ignoreEntity,
    ignoreAll,
    cleanup,
  }
}
