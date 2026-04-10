// 文章输入组件 — 左侧面板

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

      {/* 输入框 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴你的 Markdown 文章到这里..."
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
      }}>
        {wordCount} 字
      </div>
    </div>
  )
}
