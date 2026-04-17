// 导出面板组件 — 复制富文本 + 下载HTML

import { useState, useMemo } from 'react'
import { renderWechatV2 } from '../lib/render/wechat'
import { type StyleComboV2 } from '../lib/atoms'
import { copyRichText, downloadHTML } from '../lib/export/clipboard'

interface ExportPanelProps {
  markdown: string
  style: StyleComboV2
}

export default function ExportPanel({ markdown, style }: ExportPanelProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'fail'>('idle')

  const html = useMemo(() => {
    if (!markdown.trim()) return ''
    return renderWechatV2(markdown, style)
  }, [markdown, style])

  const handleCopy = async () => {
    if (!html) return
    const ok = await copyRichText(html)
    setCopyStatus(ok ? 'success' : 'fail')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const handleDownload = () => {
    if (!html) return
    downloadHTML(html)
  }

  const disabled = !markdown.trim()

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      background: '#fff',
      borderTop: '1px solid #e5e5e5',
    }}>
      <button
        onClick={handleCopy}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 600,
          background: disabled ? '#ccc' : '#4F46E5',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {copyStatus === 'success' ? '✅ 已复制！' : copyStatus === 'fail' ? '❌ 复制失败' : '📋 复制富文本'}
      </button>
      <button
        onClick={handleDownload}
        disabled={disabled}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 600,
          background: disabled ? '#eee' : '#f0f0f0',
          color: disabled ? '#999' : '#333',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        ⬇️ HTML
      </button>
    </div>
  )
}
