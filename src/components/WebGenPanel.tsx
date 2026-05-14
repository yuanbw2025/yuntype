// 网页生成面板 — 描述需求 → AI 生成 HTML → 预览 → 下载

import { useState, useEffect, useRef, useCallback } from 'react'
import { generateWebPage, downloadHtml, webPagePresets, type WebGenResult } from '../lib/ai/web-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'
import { theme, accentThemes } from '../lib/theme'
import DeployGuide from './DeployGuide'

const accentColor = accentThemes.green.accent
const accentBg = accentThemes.green.accentBg
const accentBorder = accentThemes.green.accentBorder
const { border: borderColor, text: textColor, muted: mutedColor } = theme

export default function WebGenPanel() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebGenResult | null>(null)
  const [config, setConfig] = useState<AIClientConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const saved = loadChatConfig()
    setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!config || !prompt.trim()) return
    setLoading(true)
    setResult(null)
    const res = await generateWebPage(config, prompt.trim())
    setResult(res)
    setLoading(false)
  }, [config, prompt])

  const handlePresetClick = (presetId: string) => {
    const preset = webPagePresets.find(p => p.id === presetId)
    if (!preset) return
    setSelectedPreset(presetId)
    setPrompt(preset.examplePrompt)
  }

  const handleDownload = () => {
    if (!result?.html) return
    const name = selectedPreset
      ? `${webPagePresets.find(p => p.id === selectedPreset)?.name || 'page'}.html`
      : 'my-page.html'
    downloadHtml(result.html, name)
  }

  // 将生成的 HTML 写入 iframe
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
      <DeployGuide visible={showGuide} onClose={() => setShowGuide(false)} />

      {/* 左栏：需求输入 */}
      <div className="panel-split-left" style={{
        width: '340px', flexShrink: 0,
        background: '#fff', borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* API 配置区 */}
        {showConfig ? (
          <APIConfigForm
            title="配置 AI 服务"
            description="网页生成需要调用 AI 大模型。选择提供商并填写 API Key。推荐使用通义千问或 DeepSeek，便宜好用。"
            config={config}
            providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
            accent={accentThemes.green}
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
                🌐 网页生成
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
                {webPagePresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetClick(p.id)}
                    style={{
                      padding: '8px 4px', fontSize: '11px',
                      background: selectedPreset === p.id ? accentBg : '#f8f8f8',
                      border: `1px solid ${selectedPreset === p.id ? accentBorder : '#eee'}`,
                      borderRadius: '6px', cursor: 'pointer',
                      color: selectedPreset === p.id ? accentColor : '#555',
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

            {/* 需求描述 */}
            <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '6px' }}>
                描述你想要的网页
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：做一个个人介绍页，我叫小明，是一名设计师..."
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
                  background: loading || !prompt.trim() || !config ? '#ccc' : accentColor,
                  border: 'none', borderRadius: '8px',
                  cursor: loading || !prompt.trim() || !config ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '⏳ 生成中...' : '✨ 生成网页'}
              </button>

              {!config && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#E53E3E', textAlign: 'center' }}>
                  请先点击右上角配置 API Key
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex', gap: '8px',
            }}>
              {result?.html && (
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1, padding: '8px',
                    fontSize: '12px', fontWeight: 600,
                    color: '#4F46E5', background: '#EEF0FF',
                    border: '1px solid #4F46E530',
                    borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  ⬇ 下载 HTML
                </button>
              )}
              <button
                onClick={() => setShowGuide(true)}
                style={{
                  flex: result?.html ? undefined : 1,
                  padding: '8px 12px',
                  fontSize: '12px', fontWeight: 600,
                  color: accentColor, background: accentBg,
                  border: `1px solid ${accentBorder}`,
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >
                📖 建站教程
              </button>
            </div>
          </>
        )}
      </div>

      {/* 右栏：预览 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#f0f0f0', overflow: 'hidden',
      }}>
        {result?.html ? (
          <>
            <div style={{
              padding: '8px 16px',
              background: '#fff', borderBottom: `1px solid ${borderColor}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: mutedColor }}>
                预览 · 生成的网页
              </span>
              <button
                onClick={handleDownload}
                style={{
                  padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                  color: '#4F46E5', background: '#EEF0FF',
                  border: '1px solid #4F46E530',
                  borderRadius: '4px', cursor: 'pointer',
                }}
              >
                ⬇ 下载
              </button>
            </div>
            <div style={{ flex: 1, padding: '16px', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: '1200px',
                background: '#fff', borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden', height: 'fit-content',
              }}>
                <iframe
                  ref={iframeRef}
                  style={{ width: '100%', minHeight: '600px', border: 'none', display: 'block' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="网页预览"
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
              padding: '20px 24px', background: '#FFF5F5',
              border: '1px solid #FED7D7', borderRadius: '8px',
              fontSize: '13px', color: '#C53030', maxWidth: '400px', textAlign: 'center',
            }}>
              ❌ {result.error}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ fontSize: '48px', opacity: 0.3 }}>🌐</div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              在左侧描述你想要的网页，AI 将为你生成
            </div>
            <div style={{ fontSize: '12px', color: '#bbb' }}>
              生成后可在这里预览，满意后下载 HTML 文件
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

