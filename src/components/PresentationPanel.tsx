// 演示稿面板 — 描述主题 → AI 生成交互式演示 → 预览/全屏/下载

import { useState, useEffect, useRef, useCallback } from 'react'
import { generatePresentation, downloadPresentation, presentationPresets, type PresentationResult } from '../lib/ai/presentation-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'
import { theme, accentThemes } from '../lib/theme'

const accent = accentThemes.purple.accent
const accentBg = accentThemes.purple.accentBg
const accentBorder = accentThemes.purple.accentBorder
const { border: borderColor, text: textColor, muted: mutedColor } = theme

export default function PresentationPanel() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PresentationResult | null>(null)
  const [config, setConfig] = useState<AIClientConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = loadChatConfig()
    setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!config || !prompt.trim()) return
    setLoading(true)
    setResult(null)
    const res = await generatePresentation(config, prompt.trim())
    setResult(res)
    setLoading(false)
  }, [config, prompt])

  const handlePresetClick = (presetId: string) => {
    const preset = presentationPresets.find(p => p.id === presetId)
    if (!preset) return
    setSelectedPreset(presetId)
    setPrompt(preset.examplePrompt)
  }

  const handleDownload = () => {
    if (!result?.html) return
    const name = selectedPreset
      ? `${presentationPresets.find(p => p.id === selectedPreset)?.name || 'presentation'}.html`
      : 'presentation.html'
    downloadPresentation(result.html, name)
  }

  const handleFullscreen = () => {
    if (previewRef.current) {
      if (!document.fullscreenElement) {
        previewRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
      }
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (result?.html && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(result.html)
        doc.close()
      }
    }
  }, [result?.html])

  return (
    <div className="panel-split" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 左栏 */}
      <div className="panel-split-left" style={{
        width: '340px', flexShrink: 0,
        background: '#fff', borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {showConfig ? (
          <APIConfigForm
            title="配置 AI 服务"
            description="演示稿生成需要 AI 大模型。推荐使用通义千问或 DeepSeek。"
            config={config}
            providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
            accent={accentThemes.purple}
            onSave={(c) => { setConfig(c as AIClientConfig); saveChatConfig(c as AIClientConfig); setShowConfig(false) }}
            onCancel={() => config && setShowConfig(false)}
          />
        ) : (
          <>
            <div style={{
              padding: '16px', borderBottom: `1px solid ${borderColor}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                🎬 演示稿
              </div>
              <button
                onClick={() => setShowConfig(true)}
                style={{
                  padding: '4px 8px', fontSize: '11px', color: mutedColor,
                  background: 'none', border: `1px solid ${borderColor}`,
                  borderRadius: '4px', cursor: 'pointer',
                }}
              >
                ⚙ API 配置
              </button>
            </div>

            {/* 预设场景 */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '8px' }}>
                快速开始 · 选择场景
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {presentationPresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetClick(p.id)}
                    style={{
                      padding: '8px 4px', fontSize: '11px',
                      background: selectedPreset === p.id ? accentBg : '#f8f8f8',
                      border: `1px solid ${selectedPreset === p.id ? accentBorder : '#eee'}`,
                      borderRadius: '6px', cursor: 'pointer',
                      color: selectedPreset === p.id ? accent : '#555',
                      fontWeight: selectedPreset === p.id ? 600 : 400,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 主题描述 */}
            <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '6px' }}>
                描述演示主题
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：介绍我们团队的新产品，一款面向设计师的 AI 工具..."
                style={{
                  flex: 1, width: '100%', padding: '12px',
                  fontSize: '13px', lineHeight: 1.6,
                  border: `1px solid ${borderColor}`, borderRadius: '8px',
                  resize: 'none', outline: 'none', fontFamily: 'inherit',
                  color: textColor, minHeight: '120px',
                }}
              />

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || !config}
                style={{
                  marginTop: '10px', padding: '10px',
                  fontSize: '13px', fontWeight: 600,
                  color: '#fff',
                  background: loading || !prompt.trim() || !config ? '#ccc' : accent,
                  border: 'none', borderRadius: '8px',
                  cursor: loading || !prompt.trim() || !config ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '⏳ 生成中...' : '✨ 生成演示稿'}
              </button>

              {!config && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#E53E3E', textAlign: 'center' }}>
                  请先点击右上角配置 API Key
                </div>
              )}
            </div>

            {/* 底部提示 + 操作 */}
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${borderColor}`,
              display: 'flex', gap: '8px',
            }}>
              {result?.html && (
                <>
                  <button
                    onClick={handleDownload}
                    style={{
                      flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
                      color: accent, background: accentBg,
                      border: `1px solid ${accentBorder}`,
                      borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    ⬇ 下载
                  </button>
                  <button
                    onClick={handleFullscreen}
                    style={{
                      flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
                      color: '#059669', background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    ⛶ 全屏
                  </button>
                </>
              )}
              {!result?.html && (
                <div style={{ flex: 1, fontSize: '11px', color: mutedColor, textAlign: 'center', lineHeight: 1.5 }}>
                  生成后支持键盘导航（← →）、点击翻页、全屏放映
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 右栏：预览 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#1a1a2e', overflow: 'hidden',
      }}>
        {result?.html ? (
          <>
            <div style={{
              padding: '8px 16px',
              background: '#16162a', borderBottom: '1px solid #2a2a4a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: '#888' }}>
                预览 · {result.slideCount || '?'} 页演示稿
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleFullscreen}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                    color: '#A78BFA', background: '#2d2b55',
                    border: '1px solid #4c3d99',
                    borderRadius: '4px', cursor: 'pointer',
                  }}
                >
                  ⛶ 全屏放映
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                    color: '#67e8f9', background: '#164e63',
                    border: '1px solid #0e7490',
                    borderRadius: '4px', cursor: 'pointer',
                  }}
                >
                  ⬇ 下载
                </button>
              </div>
            </div>
            <div
              ref={previewRef}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', overflow: 'auto',
                background: isFullscreen ? '#000' : undefined,
              }}
            >
              <div style={{
                width: '100%', maxWidth: '960px',
                aspectRatio: '16/9',
                background: '#fff', borderRadius: isFullscreen ? 0 : '8px',
                boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}>
                <iframe
                  ref={iframeRef}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="演示预览"
                />
              </div>
            </div>
          </>
        ) : result?.error ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
          }}>
            <div style={{
              padding: '20px 24px', background: '#2d1f1f',
              border: '1px solid #5c2929', borderRadius: '8px',
              fontSize: '13px', color: '#fca5a5', maxWidth: '400px', textAlign: 'center',
            }}>
              ❌ {result.error}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ fontSize: '48px', opacity: 0.3 }}>🎬</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              在左侧描述演示主题，AI 将生成交互式演示稿
            </div>
            <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '16px' }}>
              <span>⌨ 键盘导航</span>
              <span>🖱 点击翻页</span>
              <span>⛶ 全屏放映</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

