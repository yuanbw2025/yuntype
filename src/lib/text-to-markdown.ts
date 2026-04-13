// 纯文本 → Markdown 智能转换器
// 识别标题、列表、引用、段落等结构，自动添加 Markdown 标记

/**
 * 将纯文本智能转换为 Markdown
 * 规则：
 * 1. 独立短行（≤40字，无句末标点）→ 标题 ##
 * 2. 数字+点开头 → 有序列表
 * 3. 破折号/点/圆点/方块开头 → 无序列表
 * 4. 引号包裹的独立段落 → 引用 >
 * 5. 连续空行 → 段落分隔
 * 6. 已有的 Markdown 标记保留不动
 */
export function plainTextToMarkdown(text: string): string {
  if (!text.trim()) return ''

  // 如果已经是 Markdown（包含常见标记），直接返回
  if (looksLikeMarkdown(text)) return text

  const lines = text.split('\n')
  const result: string[] = []
  let i = 0
  let lastWasHeading = false
  let inConsecutiveList = false

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    const nextLine = i + 1 < lines.length ? lines[i + 1]?.trim() : ''
    const prevLine = i > 0 ? lines[i - 1]?.trim() : ''

    // 空行：保留
    if (!trimmed) {
      result.push('')
      lastWasHeading = false
      inConsecutiveList = false
      i++
      continue
    }

    // 检测有序列表：数字+点/、/）开头
    const orderedMatch = trimmed.match(/^(\d+)\s*[.、）)]\s*(.+)/)
    if (orderedMatch) {
      if (!inConsecutiveList && result.length > 0 && result[result.length - 1] !== '') {
        result.push('')
      }
      result.push(`${orderedMatch[1]}. ${orderedMatch[2]}`)
      inConsecutiveList = true
      lastWasHeading = false
      i++
      continue
    }

    // 检测无序列表：各种常见列表符号开头
    const unorderedMatch = trimmed.match(/^[·•●○◆◇▸▶►➤→\-–—]\s*(.+)/)
    if (unorderedMatch) {
      if (!inConsecutiveList && result.length > 0 && result[result.length - 1] !== '') {
        result.push('')
      }
      result.push(`- ${unorderedMatch[1]}`)
      inConsecutiveList = true
      lastWasHeading = false
      i++
      continue
    }

    inConsecutiveList = false

    // 检测引用：引号包裹的整段
    if (isQuoteLike(trimmed)) {
      const cleaned = trimmed
        .replace(/^[「"'『【（(]/, '')
        .replace(/[」"'』】）)]$/, '')
        .trim()
      if (!lastWasHeading) result.push('')
      result.push(`> ${cleaned}`)
      result.push('')
      lastWasHeading = false
      i++
      continue
    }

    // 检测标题：独立短行 + 前后有空行（或在开头）
    if (isLikelyHeading(trimmed, prevLine, nextLine)) {
      // 判断层级：第一个标题用 #，其他用 ##
      const level = detectHeadingLevel(trimmed, result)
      if (!lastWasHeading && result.length > 0 && result[result.length - 1] !== '') {
        result.push('')
      }
      result.push(`${'#'.repeat(level)} ${trimmed}`)
      result.push('')
      lastWasHeading = true
      i++
      continue
    }

    // 检测分隔线：连续的符号行
    if (/^[-=_~·.。]{3,}$/.test(trimmed) || /^[─━═]{2,}$/.test(trimmed)) {
      result.push('')
      result.push('---')
      result.push('')
      lastWasHeading = false
      i++
      continue
    }

    // 普通段落
    result.push(trimmed)
    lastWasHeading = false
    i++
  }

  // 清理：合并多余空行（最多2个连续空行）
  let output = result.join('\n')
  output = output.replace(/\n{3,}/g, '\n\n')
  return output.trim()
}

/** 检测文本是否已经是 Markdown */
function looksLikeMarkdown(text: string): boolean {
  const lines = text.split('\n').slice(0, 30) // 检查前30行
  let mdSignals = 0

  for (const line of lines) {
    const t = line.trim()
    if (/^#{1,6}\s/.test(t)) mdSignals += 2      // 标题
    if (/^\*\*[^*]+\*\*/.test(t)) mdSignals++     // 粗体
    if (/^>\s/.test(t)) mdSignals++                // 引用
    if (/^[-*+]\s/.test(t)) mdSignals++            // 列表
    if (/^\d+\.\s/.test(t)) mdSignals++            // 有序列表
    if (/^```/.test(t)) mdSignals += 2             // 代码块
    if (/^\|.*\|/.test(t)) mdSignals++             // 表格
    if (/^---$/.test(t)) mdSignals++               // 分隔线
  }

  return mdSignals >= 3
}

/** 判断一行是否像标题 */
function isLikelyHeading(line: string, prevLine: string, nextLine: string): boolean {
  // 太长不是标题
  if (line.length > 40) return false
  // 太短也不是（单个字）
  if (line.length < 2) return false

  // 以句末标点结尾的通常不是标题
  if (/[。！？…，；：、\.\!\?\,\;]$/.test(line)) return false

  // 前后至少有一个空行（或在文档开头/结尾）
  const prevEmpty = !prevLine
  const nextEmpty = !nextLine

  // 标题的特征得分
  let score = 0

  // 前后有空行
  if (prevEmpty) score += 2
  if (nextEmpty) score += 2

  // 包含中文数字编号（一、二、三...）
  if (/^[一二三四五六七八九十]+[、.．·]\s*/.test(line)) score += 3

  // 包含阿拉伯数字编号 (1.1, 2.3 等)
  if (/^\d+\.\d+\s/.test(line)) score += 3

  // 很短（≤15字）
  if (line.length <= 15) score += 1

  // 包含冒号（标题常见模式）
  if (/[:：]/.test(line) && line.length <= 30) score += 1

  return score >= 3
}

/** 判断引用（引号包裹） */
function isQuoteLike(line: string): boolean {
  // 中文引号包裹
  if (/^[「『""].*[」』""]$/.test(line)) return true
  // 西文引号包裹
  if (/^["'].*["']$/.test(line) && line.length > 10) return true
  return false
}

/** 检测标题层级 */
function detectHeadingLevel(line: string, previousLines: string[]): number {
  // 中文大编号（一、二、三...）→ ## (h2)
  if (/^[一二三四五六七八九十]+[、.．]/.test(line)) return 2

  // 小节编号 (1.1, 2.3 等) → ### (h3)
  if (/^\d+\.\d+/.test(line)) return 3

  // 第一个标题且很短 → # (h1)
  const hasH1 = previousLines.some(l => /^# /.test(l))
  if (!hasH1 && line.length <= 30) return 1

  // 默认 ## (h2)
  return 2
}
