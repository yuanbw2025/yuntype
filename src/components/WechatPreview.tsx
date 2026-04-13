// 公众号预览组件 — 右侧面板，模拟375px手机宽度
// 支持 V1 (StyleCombo) 和 V2 (StyleComboV2) 双模式

import { useMemo } from 'react'
import { renderWechatHTML, renderWechatV2 } from '../lib/render/wechat'
import { type StyleCombo, type StyleComboV2, type AtomIds } from '../lib/atoms'

interface WechatPreviewProps {
  markdown: string
  style: StyleCombo
  styleV2?: StyleComboV2
  useV2?: boolean
  comboName: string
  atomIds: AtomIds
}

export default function WechatPreview({ markdown, style, styleV2, useV2, comboName, atomIds }: WechatPreviewProps) {
  const html = useMemo(() => {
    if (!markdown.trim()) return ''
    if (useV2 && styleV2) {
      return renderWechatV2(markdown, styleV2)
    }
    return renderWechatHTML(markdown, style)
  }, [markdown, style, styleV2, useV2])

  const pageBg = useV2 && styleV2 ? styleV2.color.colors.pageBg : style.color.colors.pageBg

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
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
          👁️ 公众号预览 {useV2 && <span style={{ fontSize: '10px', background: '#4F46E5', color: '#fff', padding: '1px 6px', borderRadius: '8px', marginLeft: '6px' }}>V2</span>}
        </span>
        <span style={{ fontSize: '11px', color: '#999' }}>
          {useV2
            ? `${styleV2?.blueprint.icon ?? ''} ${styleV2?.blueprint.name ?? ''}`
            : `${atomIds.colorId} · ${atomIds.layoutId} · ${atomIds.decorationId} · ${atomIds.typographyId}`
          }
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
