import { useRef, useState } from 'react'
import { plainTextToMarkdown } from '../../lib/text-to-markdown'

interface ArticleEditorPanelProps {
  value: string
  onChange: (value: string) => void
}

const DEMO_ARTICLE = `# 如何高效阅读一本书

阅读是一种**终身学习**的方式。掌握正确的阅读方法，能让你事半功倍。

## 选书：找到值得读的书

不是所有书都值得从头读到尾。选书的关键是：

- 看目录，判断结构是否清晰
- 看序言，了解作者的写作动机
- 看评价，但不要被评分绑架

> 一本好书，是作者用几年时间浓缩的思考，你用几天时间就能吸收。

## 阅读：主动阅读四步法

### 第一步：略读

花15分钟快速翻阅，了解全书框架。

### 第二步：精读

带着问题阅读核心章节，做标记和笔记。

### 第三步：复述

用自己的话总结每章要点。

### 第四步：实践

把书中的方法应用到实际场景中。

---

## 笔记：构建知识体系

1. 写读书笔记，不是抄书
2. 用思维导图梳理逻辑
3. 与已有知识建立连接

> 知识只有被使用，才真正属于你。

## 总结

阅读不在于速度，而在于**深度**。希望这篇文章能帮你建立自己的阅读方法论。
`

type ToolId = 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'list' | 'quote' | 'hr' | 'link'

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: 'bold', label: 'B', title: '加粗' },
  { id: 'italic', label: 'I', title: '斜体' },
  { id: 'h1', label: 'H1', title: '一级标题' },
  { id: 'h2', label: 'H2', title: '二级标题' },
  { id: 'h3', label: 'H3', title: '三级标题' },
  { id: 'list', label: '≡', title: '无序列表' },
  { id: 'quote', label: '“', title: '引用' },
  { id: 'hr', label: '—', title: '分割线' },
  { id: 'link', label: '🔗', title: '链接' },
]

export default function ArticleEditorPanel({ value, onChange }: ArticleEditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [notice, setNotice] = useState('')
  const wordCount = value.replace(/\s/g, '').length
  const lineCount = value ? value.split('\n').length : 0

  const flash = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(''), 1800)
  }

  const handleAutoFormat = () => {
    if (!value.trim()) return
    const result = plainTextToMarkdown(value)
    if (result === value) {
      flash('内容已经是 Markdown 格式')
      return
    }
    onChange(result)
    flash('已整理为 Markdown')
  }

  const applyTool = (tool: ToolId) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)
    const before = value.slice(0, start)
    const after = value.slice(end)
    const lineStart = before.lastIndexOf('\n') + 1
    const linePrefix = before.slice(0, lineStart)
    const currentLineBefore = before.slice(lineStart)

    let next = value
    let cursorStart = start
    let cursorEnd = end

    const wrap = (prefix: string, suffix = prefix, placeholder = '文字') => {
      const inner = selected || placeholder
      next = `${before}${prefix}${inner}${suffix}${after}`
      cursorStart = start + prefix.length
      cursorEnd = cursorStart + inner.length
    }

    const linePrefixTool = (prefix: string, placeholder = '标题') => {
      const inner = selected || placeholder
      next = `${linePrefix}${prefix}${currentLineBefore}${inner}${after}`
      cursorStart = linePrefix.length + prefix.length + currentLineBefore.length
      cursorEnd = cursorStart + inner.length
    }

    switch (tool) {
      case 'bold':
        wrap('**')
        break
      case 'italic':
        wrap('*')
        break
      case 'h1':
        linePrefixTool('# ')
        break
      case 'h2':
        linePrefixTool('## ')
        break
      case 'h3':
        linePrefixTool('### ')
        break
      case 'list':
        linePrefixTool('- ', '列表项')
        break
      case 'quote':
        linePrefixTool('> ', '引用内容')
        break
      case 'hr':
        next = `${before}${before.endsWith('\n') || before.length === 0 ? '' : '\n'}---\n${after}`
        cursorStart = cursorEnd = start + 4
        break
      case 'link':
        wrap('[', '](https://example.com)', '链接文字')
        break
    }

    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorStart, cursorEnd)
    })
  }

  return (
    <div className="article-editor">
      <div className="article-editor-actions">
        <button onClick={handleAutoFormat} disabled={!value.trim()}>🪄 整理</button>
        <button onClick={() => onChange(DEMO_ARTICLE)}>示例</button>
      </div>

      {notice && <div className="article-notice">{notice}</div>}

      <div className="article-toolbar" aria-label="Markdown 格式工具">
        {TOOLS.map(tool => (
          <button key={tool.id} title={tool.title} onClick={() => applyTool(tool.id)}>
            {tool.label}
          </button>
        ))}
        <span>Markdown</span>
      </div>

      <div className="article-paper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="粘贴你的文章到这里...

支持 Markdown，也可以粘贴纯文本后点击「整理」自动转换。"
        />
      </div>

      <div className="article-status">
        <span>{wordCount} 字</span>
        <span>{lineCount} 行</span>
      </div>
    </div>
  )
}
