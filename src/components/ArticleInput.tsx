// 文章输入组件 — 左侧面板
// 支持 Markdown 输入 + 纯文本智能转换

import { useState } from 'react'
import { plainTextToMarkdown } from '../lib/text-to-markdown'

interface ArticleInputProps {
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

export default function ArticleInput({ value, onChange }: ArticleInputProps) {
  const wordCount = value.replace(/\s/g, '').length
  const [showTip, setShowTip] = useState(false)

  const handleAutoFormat = () => {
    if (!value.trim()) return
    const result = plainTextToMarkdown(value)
    if (result === value) {
      // 内容没变化（已经是Markdown），闪一下提示
      setShowTip(true)
      setTimeout(() => setShowTip(false), 2000)
      return
    }
    onChange(result)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>📝 文章输入</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* 智能整理按钮 */}
          <button
            onClick={handleAutoFormat}
            disabled={!value.trim()}
            title="将纯文本智能转换为 Markdown 格式"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: value.trim() ? '#EEF0FF' : '#f5f5f5',
              border: `1px solid ${value.trim() ? '#4F46E530' : '#ddd'}`,
              borderRadius: '4px',
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              color: value.trim() ? '#4F46E5' : '#bbb',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            🪄 整理
          </button>
          {/* 加载示例按钮 */}
          <button
            onClick={() => onChange(DEMO_ARTICLE)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            加载示例
          </button>
        </div>
      </div>

      {/* 已是Markdown提示 */}
      {showTip && (
        <div style={{
          padding: '6px 16px',
          fontSize: '12px',
          color: '#059669',
          background: '#ECFDF5',
          borderBottom: '1px solid #05966920',
          textAlign: 'center',
          transition: 'all 0.3s',
        }}>
          ✅ 内容已经是 Markdown 格式，无需转换
        </div>
      )}

      {/* 输入框 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴你的文章到这里...&#10;&#10;支持 Markdown 格式，也可以粘贴纯文本后点击「🪄 整理」自动转换为 Markdown"
        style={{
          flex: 1,
          padding: '16px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: '14px',
          lineHeight: '1.8',
          fontFamily: 'Menlo, Monaco, Consolas, monospace',
          color: '#333',
          background: 'transparent',
        }}
      />

      {/* 底部状态栏 */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #e5e5e5',
        fontSize: '12px',
        color: '#999',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{wordCount} 字</span>
        <span style={{ color: '#bbb' }}>粘贴纯文本 → 点击 🪄 整理 → 自动转 Markdown</span>
      </div>
    </div>
  )
}
