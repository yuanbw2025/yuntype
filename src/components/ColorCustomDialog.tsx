// 配色自定义弹窗 — 在预设基础上覆盖任意色值

import { useState, useRef } from 'react'
import { colorSchemes, type ColorScheme, type ColorOverride } from '../lib/atoms/colors'

interface ColorCustomDialogProps {
  visible: boolean
  onClose: () => void
  colorId: string
  colorOverride?: ColorOverride
  onChange: (colorId: string, override: ColorOverride | undefined) => void
}

const COLOR_FIELDS: { key: keyof ColorScheme['colors']; label: string; desc: string }[] = [
  { key: 'pageBg',     label: '页面背景',   desc: '整个页面的底色' },
  { key: 'contentBg',  label: '内容背景',   desc: '卡片/内容区底色' },
  { key: 'primary',    label: '主色',       desc: '标题、强调文字、图标' },
  { key: 'secondary',  label: '次色',       desc: '色块、边框' },
  { key: 'accent',     label: '强调色',     desc: '高亮、hover 态' },
  { key: 'text',       label: '正文',       desc: '正文文字颜色' },
  { key: 'textMuted',  label: '辅助文字',   desc: '次要文字、占位符' },
]

/** 通用色板 — 点击即应用。分浅底/鲜明/深沉三行，共 36 色。 */
const SWATCH_PALETTE: string[][] = [
  // 第一行：浅底/背景色（pageBg / contentBg 友好）
  ['#FFFFFF', '#FAFAFA', '#F5F5F5', '#F8F5F0', '#FFF8F0', '#F0F7FF', '#F0FAF6', '#FDF5F5', '#F9F0FF', '#FFFDF0', '#F0F4F8', '#FCF8EC'],
  // 第二行：鲜明色（primary / accent 友好）
  ['#4F46E5', '#2D9F83', '#D97706', '#DC2626', '#E11D48', '#7C3AED', '#0EA5E9', '#059669', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'],
  // 第三行：深沉/正文色
  ['#1F2937', '#111827', '#0F172A', '#2C3E3A', '#3B2F2F', '#4A3F35', '#374151', '#1E293B', '#292524', '#44403C', '#1C1917', '#18181B'],
]

export default function ColorCustomDialog({
  visible,
  onClose,
  colorId,
  colorOverride,
  onChange,
}: ColorCustomDialogProps) {
  const [localColorId, setLocalColorId] = useState(colorId)
  const [localOverride, setLocalOverride] = useState<ColorOverride>(colorOverride ?? {})
  const [activePaletteField, setActivePaletteField] = useState<keyof ColorScheme['colors'] | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  if (!visible) return null

  const baseScheme = colorSchemes.find(c => c.id === localColorId) ?? colorSchemes[0]
  const effectiveColors = { ...baseScheme.colors, ...localOverride }

  const handlePresetChange = (id: string) => {
    setLocalColorId(id)
    // 切换预设时保留 override（用户可能只想换底色但保留自定义主色）
    // 若想清空：setLocalOverride({})
  }

  const handleColorChange = (key: keyof ColorScheme['colors'], value: string) => {
    setLocalOverride(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = (key: keyof ColorScheme['colors']) => {
    setLocalOverride(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleResetAll = () => {
    setLocalOverride({})
  }

  const handleApply = () => {
    const cleanOverride = Object.keys(localOverride).length > 0 ? localOverride : undefined
    onChange(localColorId, cleanOverride)
    onClose()
  }

  const hasOverride = Object.keys(localOverride).length > 0

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '480px', maxHeight: '90vh', background: '#fff',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 标题栏 */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#333' }}>🎨 自定义配色</h3>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#999' }}>
              选择预设 + 微调任意色值，实时生效
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '18px',
            cursor: 'pointer', color: '#999',
          }}>✕</button>
        </div>

        {/* 内容区（可滚动） */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {/* 预设选择 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#555', marginBottom: '8px' }}>
              配色预设
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
            }}>
              {colorSchemes.map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => handlePresetChange(scheme.id)}
                  style={{
                    padding: '6px 4px', fontSize: '10px', cursor: 'pointer',
                    border: `2px solid ${localColorId === scheme.id ? '#4F46E5' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    background: localColorId === scheme.id ? '#EEF0FF' : '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  }}
                >
                  {/* 色条预览 */}
                  <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center' }}>
                    {(['primary', 'secondary', 'accent'] as const).map(k => (
                      <div key={k} style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: scheme.colors[k],
                        border: '1px solid rgba(0,0,0,0.08)',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    color: localColorId === scheme.id ? '#4F46E5' : '#555',
                    fontWeight: localColorId === scheme.id ? 700 : 400,
                    lineHeight: 1.2, textAlign: 'center',
                  }}>{scheme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 色值调整 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontWeight: 700, fontSize: '12px', color: '#555' }}>
                色值微调
                {hasOverride && (
                  <span style={{
                    marginLeft: '6px', fontSize: '10px', color: '#4F46E5',
                    background: '#EEF0FF', padding: '1px 6px', borderRadius: '8px',
                  }}>
                    已自定义 {Object.keys(localOverride).length} 项
                  </span>
                )}
              </span>
              {hasOverride && (
                <button
                  onClick={handleResetAll}
                  style={{
                    fontSize: '11px', color: '#999',
                    background: 'none', border: '1px solid #ddd',
                    borderRadius: '4px', padding: '2px 8px', cursor: 'pointer',
                  }}
                >
                  ↩️ 全部重置
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COLOR_FIELDS.map(({ key, label, desc }) => {
                const isOverridden = key in localOverride
                const currentValue = effectiveColors[key]
                const isPaletteOpen = activePaletteField === key
                return (
                  <div key={key}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '8px',
                      background: isOverridden ? '#F8F7FF' : '#fafafa',
                      border: `1px solid ${isOverridden ? '#4F46E530' : '#f0f0f0'}`,
                    }}>
                      {/* 色块（点击打开色板） */}
                      <div
                        onClick={() => setActivePaletteField(isPaletteOpen ? null : key)}
                        title="点击选色"
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          background: currentValue,
                          border: '2px solid rgba(0,0,0,0.12)',
                          cursor: 'pointer', flexShrink: 0,
                          boxShadow: isPaletteOpen
                            ? `0 0 0 2px #4F46E5`
                            : isOverridden ? `0 0 0 2px #4F46E530` : 'none',
                        }}
                      />
                      {/* 隐藏的 input[type=color]：供"更多颜色"入口调起 */}
                      <input
                        type="color"
                        value={currentValue}
                        onChange={e => handleColorChange(key, e.target.value)}
                        ref={el => { inputRefs.current[key] = el }}
                        style={{ display: 'none' }}
                      />
                      {/* 标签 + 描述 */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px', fontWeight: 600,
                          color: isOverridden ? '#4F46E5' : '#333',
                        }}>
                          {label}
                          {isOverridden && <span style={{ fontSize: '10px', marginLeft: '4px', color: '#4F46E5' }}>●</span>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#aaa' }}>{desc}</div>
                      </div>
                      {/* 十六进制值 */}
                      <input
                        type="text"
                        value={currentValue}
                        onChange={e => {
                          const v = e.target.value
                          if (/^#[0-9A-Fa-f]{0,8}$/.test(v)) handleColorChange(key, v)
                        }}
                        style={{
                          width: '74px', padding: '4px 6px', fontSize: '11px',
                          border: '1px solid #e0e0e0', borderRadius: '4px',
                          fontFamily: 'monospace', color: '#555',
                          background: '#fff',
                        }}
                      />
                      {/* 重置单项按钮 */}
                      {isOverridden && (
                        <button
                          onClick={() => handleReset(key)}
                          title="恢复预设值"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: '#bbb', padding: '0 2px',
                            flexShrink: 0,
                          }}
                        >↩</button>
                      )}
                    </div>

                    {/* 色板弹出层：选色用 */}
                    {isPaletteOpen && (
                      <div style={{
                        marginTop: '6px', padding: '10px 12px',
                        background: '#fff', borderRadius: '8px',
                        border: '1px solid #E0E7FF',
                        boxShadow: '0 2px 12px rgba(79,70,229,0.08)',
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginBottom: '8px',
                        }}>
                          <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>
                            选择颜色
                          </span>
                          <button
                            onClick={() => { inputRefs.current[key]?.click(); }}
                            style={{
                              fontSize: '11px', color: '#4F46E5', background: 'none',
                              border: '1px solid #E0E7FF', borderRadius: '4px',
                              padding: '2px 8px', cursor: 'pointer',
                            }}
                          >
                            🎨 更多颜色…
                          </button>
                        </div>
                        {SWATCH_PALETTE.map((row, i) => (
                          <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: i < 2 ? '4px' : 0 }}>
                            {row.map(hex => {
                              const active = currentValue.toUpperCase() === hex.toUpperCase()
                              return (
                                <div
                                  key={hex}
                                  onClick={() => {
                                    handleColorChange(key, hex)
                                    setActivePaletteField(null)
                                  }}
                                  title={hex}
                                  style={{
                                    flex: 1, aspectRatio: '1',
                                    background: hex, borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: active ? '2px solid #4F46E5' : '1px solid rgba(0,0,0,0.1)',
                                    boxShadow: active ? '0 0 0 1px #fff inset' : 'none',
                                  }}
                                />
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 效果预览条 */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#555', marginBottom: '8px' }}>
              预览
            </div>
            <div style={{
              borderRadius: '10px', overflow: 'hidden',
              border: '1px solid #e0e0e0',
            }}>
              {/* 页面底色 */}
              <div style={{
                background: effectiveColors.pageBg,
                padding: '12px',
              }}>
                {/* 内容卡片 */}
                <div style={{
                  background: effectiveColors.contentBg,
                  borderRadius: '8px', padding: '10px 12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: effectiveColors.primary, marginBottom: '4px',
                  }}>
                    标题样式预览
                  </div>
                  <div style={{
                    fontSize: '11px', color: effectiveColors.text,
                    marginBottom: '4px', lineHeight: 1.6,
                  }}>
                    这是正文文字的颜色效果，用于展示整体配色搭配是否和谐。
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: effectiveColors.primary,
                    color: effectiveColors.contentBg,
                    fontSize: '10px', fontWeight: 600,
                    padding: '3px 10px', borderRadius: '12px',
                    marginRight: '6px',
                  }}>
                    主色标签
                  </div>
                  <span style={{ fontSize: '10px', color: effectiveColors.textMuted }}>
                    辅助文字
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #eee',
          display: 'flex', gap: '8px', flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', fontSize: '13px',
            background: '#f5f5f5', color: '#666',
            border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer',
          }}>
            取消
          </button>
          <button onClick={handleApply} style={{
            flex: 2, padding: '10px', fontSize: '13px', fontWeight: 700,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>
            ✓ 应用配色
          </button>
        </div>
      </div>
    </div>
  )
}
