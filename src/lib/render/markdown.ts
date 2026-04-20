// 简易 Markdown → AST 解析器
// 将 Markdown 文本解析为结构化节点，供渲染器使用

export type NodeType = 'heading' | 'paragraph' | 'blockquote' | 'list' | 'code' | 'hr' | 'image' | 'table'

export interface MarkdownNode {
  type: NodeType
  level?: number          // heading: 1-3
  text?: string           // heading, paragraph 的原始文本
  children?: string[]     // list 的每一项
  lang?: string           // code 的语言
  ordered?: boolean       // list 是否有序
  src?: string            // image src
  alt?: string            // image alt
  headers?: string[]      // table 列头
  rows?: string[][]       // table 数据行
}

/** 处理行内 Markdown：**bold** *italic* `code` [link](url) */
export function renderInline(text: string): string {
  return text
    // 粗体 **text** 或 __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // 斜体 *text* 或 _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // 行内代码 `code`
    .replace(/`(.+?)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">$1</code>')
    // 链接 [text](url)
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="text-decoration: underline;">$1</a>')
    // 图片 ![alt](src) — 转成 image 节点在块级处理，这里兜底
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
}

/** 解析表格行：| cell1 | cell2 | ... | */
function parseTableRow(line: string): string[] {
  return line.trim().split('|').slice(1, -1).map(c => c.trim())
}

/** 判断是否为表格分隔行：| --- | :---: | */
function isTableSeparator(cells: string[]): boolean {
  return cells.length > 0 && cells.every(c => /^:?-+:?$/.test(c))
}

/** 将 Markdown 文本解析为 AST 节点数组 */
export function parseMarkdown(md: string): MarkdownNode[] {
  const lines = md.split('\n')
  const nodes: MarkdownNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 空行跳过
    if (line.trim() === '') {
      i++
      continue
    }

    // 标题 # ## ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      nodes.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      })
      i++
      continue
    }

    // 分割线 --- *** ___（需在表格检测前，避免被误判为分隔行）
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      nodes.push({ type: 'hr' })
      i++
      continue
    }

    // 图片（独立一行）
    const imgMatch = line.trim().match(/^!\[(.*)?\]\((.+?)\)$/)
    if (imgMatch) {
      nodes.push({
        type: 'image',
        alt: imgMatch[1] || '',
        src: imgMatch[2],
      })
      i++
      continue
    }

    // 代码块 ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      nodes.push({
        type: 'code',
        text: codeLines.join('\n'),
        lang: lang || undefined,
      })
      i++ // 跳过结束的 ```
      continue
    }

    // 引用块 >
    if (line.trimStart().startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) {
        quoteLines.push(lines[i].trimStart().slice(2))
        i++
      }
      nodes.push({
        type: 'blockquote',
        text: quoteLines.join('\n'),
      })
      continue
    }

    // 表格：行以 | 开头
    if (line.trimStart().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      const parsedLines = tableLines.map(parseTableRow)
      let headers: string[] = []
      const rows: string[][] = []
      let foundSeparator = false

      for (const cells of parsedLines) {
        if (isTableSeparator(cells)) {
          foundSeparator = true
        } else if (!foundSeparator) {
          headers = cells // 分隔符前第一行为列头
        } else {
          rows.push(cells)
        }
      }

      // 无分隔符时：第一行列头，其余为数据行
      if (!foundSeparator && parsedLines.length > 0) {
        headers = parsedLines[0]
        for (let j = 1; j < parsedLines.length; j++) rows.push(parsedLines[j])
      }

      if (headers.length > 0) {
        nodes.push({ type: 'table', headers, rows })
      }
      continue
    }

    // 无序列表 - 或 *
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, '').trim())
        i++
      }
      nodes.push({
        type: 'list',
        ordered: false,
        children: items,
      })
      continue
    }

    // 有序列表：
    //   英文: 1. / 1) / 1)
    //   中文: 1、 / 1．/ 一、 / 二、 / ①②③…
    //   组合: (1) / （1）
    const ORDERED_RE = /^\s*(?:\(\d+\)|（\d+）|\d+[.．、)]|[一二三四五六七八九十百千]+[、.．]|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])\s*/
    if (ORDERED_RE.test(line)) {
      const items: string[] = []
      while (i < lines.length && ORDERED_RE.test(lines[i])) {
        items.push(lines[i].replace(ORDERED_RE, '').trim())
        i++
      }
      nodes.push({
        type: 'list',
        ordered: true,
        children: items,
      })
      continue
    }

    // 普通段落（每行独立成段，适配中文文章习惯）
    nodes.push({
      type: 'paragraph',
      text: line.trim(),
    })
    i++
  }

  return nodes
}
