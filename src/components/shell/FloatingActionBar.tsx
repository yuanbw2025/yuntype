import { useMemo, useState } from 'react'
import type { AppMode } from '../../App'
import type { StyleComboV2 } from '../../lib/atoms'
import type { ShellPanel } from './IconSidebar'
import { renderWechatV2 } from '../../lib/render/wechat'
import { copyRichText, downloadHTML } from '../../lib/export/clipboard'

interface FloatingActionBarProps {
  mode: AppMode
  markdown: string
  style: StyleComboV2
  onShuffle: () => void
  onOpenPanel: (panel: ShellPanel) => void
}

export default function FloatingActionBar({
  mode,
  markdown,
  style,
  onShuffle,
  onOpenPanel,
}: FloatingActionBarProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const html = useMemo(() => {
    if (!markdown.trim() || mode !== 'wechat') return ''
    return renderWechatV2(markdown, style)
  }, [markdown, mode, style])

  const disabled = !markdown.trim()

  const handleCopy = async () => {
    if (!html) return
    const ok = await copyRichText(html)
    setCopyStatus(ok ? 'success' : 'fail')
    window.setTimeout(() => setCopyStatus('idle'), 1800)
  }

  const handleDownload = () => {
    if (!html) return
    downloadHTML(html)
  }

  if (mode !== 'wechat' && mode !== 'xiaohongshu') return null

  return (
    <div className="floating-action-bar">
      <button onClick={() => onOpenPanel('article')}>📄 文章</button>
      <button onClick={() => onOpenPanel('style')}>🎨 风格</button>
      <span className="fab-sep" />
      <button onClick={onShuffle}>🎲 随机</button>

      {mode === 'wechat' && (
        <>
          <span className="fab-sep" />
          <button className="is-primary" onClick={handleCopy} disabled={disabled}>
            {copyStatus === 'success' ? '已复制' : copyStatus === 'fail' ? '复制失败' : '复制到公众号'}
          </button>
          <button onClick={handleDownload} disabled={disabled}>HTML</button>
        </>
      )}

      {mode === 'xiaohongshu' && (
        <>
          <span className="fab-sep" />
          <button onClick={() => onOpenPanel('style')}>配色/骨架</button>
          <span className="fab-hint">图片下载在底部栏</span>
        </>
      )}
    </div>
  )
}
