// 公众号预览组件 — 右侧面板，模拟375px手机宽度
// 支持缩放滑条 (25%-100%)

import { useState, useMemo } from 'react'
import { renderWechatV2 } from '../lib/render/wechat'
import { type StyleComboV2 } from '../lib/atoms'

interface WechatPreviewProps {
  markdown: string
  style: StyleComboV2
  comboName: string
}

export default function WechatPreview({ markdown, style, comboName }: WechatPreviewProps) {
  const [zoom, setZoom] = useState(100)

  const html = useMemo(() => {
    if (!markdown.trim()) return ''
    return renderWechatV2(markdown, style)
  }, [markdown, style])

  const pageBg = style.color.colors.pageBg
  const scale = zoom / 100

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
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
          👁️ 公众号预览
        </span>
        <span style={{ fontSize: '11px', color: '#999' }}>
          {`${style.blueprint.icon} ${style.blueprint.name}`}
        </span>
      </div>

      {/* 缩放控制栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: '#999', flexShrink: 0, width: '24px' }}>🔍</span>
        <input
          type="range"
          min={25}
          max={100}
          step={5}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{
            flex: 1,
            height: '4px',
            cursor: 'pointer',
            accentColor: '#4F46E5',
          }}
        />
        <span
          onClick={() => setZoom(100)}
          style={{
            fontSize: '11px',
            color: zoom === 100 ? '#999' : '#4F46E5',
            fontWeight: 600,
            cursor: zoom === 100 ? 'default' : 'pointer',
            flexShrink: 0,
            minWidth: '36px',
            textAlign: 'right',
            userSelect: 'none',
          }}
          title={zoom === 100 ? '当前100%' : '点击重置为100%'}
        >
          {zoom}%
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
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
        }}>
          <div style={{
            background: pageBg,
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
      </div>

      {/* 底部状态栏 */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #e5e5e5',
        fontSize: '12px',
        color: '#999',
        flexShrink: 0,
      }}>
        当前方案: {comboName}
      </div>
    </div>
  )
}
