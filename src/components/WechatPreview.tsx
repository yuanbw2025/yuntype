// 公众号预览组件 — 右侧面板，模拟375px手机宽度

import { useMemo } from 'react'
import { renderWechatHTML } from '../lib/render/wechat'
import { type StyleCombo, type AtomIds } from '../lib/atoms'

interface WechatPreviewProps {
  markdown: string
  style: StyleCombo
  comboName: string
  atomIds: AtomIds
}

export default function WechatPreview({ markdown, style, comboName, atomIds }: WechatPreviewProps) {
  const html = useMemo(() => {
    if (!markdown.trim()) return ''
    return renderWechatHTML(markdown, style)
  }, [markdown, style])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>👁️ 公众号预览</span>
        <span style={{ fontSize: '11px', color: '#999' }}>
          {atomIds.colorId} · {atomIds.layoutId} · {atomIds.decorationId} · {atomIds.typographyId}
        </span>
      </div>

      {/* 预览区 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        background: '#f0f0f0',
      }}>
        {/* 手机模拟器外框 */}
        <div style={{
          maxWidth: '375px',
          margin: '0 auto',
          background: style.color.colors.pageBg,
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #ddd',
        }}>
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
            }}>
              在左侧输入文章后，排版预览将显示在这里
            </div>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #e5e5e5',
        fontSize: '12px',
        color: '#999',
      }}>
        当前方案: {comboName}
      </div>
    </div>
  )
}
