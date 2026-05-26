// 演示稿面板 — 描述主题 → AI 生成交互式演示 → 预览/全屏/下载

import { useState, useEffect, useRef, useCallback } from 'react'
import { generatePresentation, downloadPresentation, presentationPresets, type PresentationResult } from '../lib/ai/presentation-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'
import { accentThemes } from '../lib/theme'

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
    <div className="presentation-workbench">
      <aside className="presentation-control-panel">
        {showConfig ? (
          <div className="presentation-config-wrap">
            <APIConfigForm
              title="配置 AI 服务"
              description="演示稿生成需要 AI 大模型。推荐使用通义千问或 DeepSeek。"
              config={config}
              providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
              accent={accentThemes.purple}
              onSave={(c) => { setConfig(c as AIClientConfig); saveChatConfig(c as AIClientConfig); setShowConfig(false) }}
              onCancel={() => config && setShowConfig(false)}
            />
          </div>
        ) : (
          <>
            <div className="presentation-toolbar">
              <div className="presentation-title">
                <strong>演示稿</strong>
                <span>{selectedPreset ? presentationPresets.find(p => p.id === selectedPreset)?.name : '生成可交互 HTML 演示'}</span>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="presentation-ghost-btn"
              >
                API 配置
              </button>
            </div>

            <section className="presentation-section">
              <div className="presentation-section-title">
                <strong>场景</strong>
                <span>{presentationPresets.length} 个模板</span>
              </div>
              <div className="presentation-preset-grid">
                {presentationPresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetClick(p.id)}
                    className={`presentation-preset ${selectedPreset === p.id ? 'is-active' : ''}`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="presentation-prompt-section">
              <div className="presentation-section-title">
                <strong>主题</strong>
                <span>{prompt.trim().length} 字</span>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：介绍我们团队的新产品，一款面向设计师的 AI 工具..."
              />

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || !config}
                className="presentation-primary-btn"
              >
                {loading ? '生成中...' : '生成演示稿'}
              </button>

              {!config && (
                <div className="presentation-config-warning">
                  请先点击右上角配置 API Key
                </div>
              )}
            </section>

            <div className="presentation-action-area">
              {result?.html && (
                <>
                  <button
                    onClick={handleDownload}
                    className="presentation-download-btn"
                  >
                    下载
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="presentation-fullscreen-btn"
                  >
                    全屏
                  </button>
                </>
              )}
              {!result?.html && (
                <div className="presentation-action-hint">
                  生成后支持键盘导航（← →）、点击翻页、全屏放映
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      <section className="presentation-preview-area">
        {result?.html ? (
          <>
            <div className="presentation-preview-bar">
              <span>预览 · {result.slideCount || '?'} 页演示稿</span>
              <div>
                <button
                  onClick={handleFullscreen}
                  className="presentation-fullscreen-btn"
                >
                  全屏放映
                </button>
                <button
                  onClick={handleDownload}
                  className="presentation-download-btn"
                >
                  下载
                </button>
              </div>
            </div>
            <div
              ref={previewRef}
              className={`presentation-stage ${isFullscreen ? 'is-fullscreen' : ''}`}
            >
              <div className="presentation-frame">
                <iframe
                  ref={iframeRef}
                  sandbox="allow-scripts allow-same-origin"
                  title="演示预览"
                />
              </div>
            </div>
          </>
        ) : result?.error ? (
          <div className="presentation-empty-wrap">
            <div className="presentation-error">
              {result.error}
            </div>
          </div>
        ) : (
          <div className="presentation-empty-wrap">
            <div className="presentation-empty-state">
              <div>🎬</div>
              <strong>等待生成演示稿</strong>
              <span>在左侧描述演示主题，生成后可预览、下载或全屏放映。</span>
              <p>
              <span>⌨ 键盘导航</span>
              <span>🖱 点击翻页</span>
              <span>⛶ 全屏放映</span>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
