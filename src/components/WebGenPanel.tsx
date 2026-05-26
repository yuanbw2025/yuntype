// 网页生成面板 — 描述需求 → AI 生成 HTML → 预览 → 下载

import { useState, useEffect, useRef, useCallback } from 'react'
import { generateWebPage, downloadHtml, webPagePresets, type WebGenResult } from '../lib/ai/web-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'
import { accentThemes } from '../lib/theme'
import DeployGuide from './DeployGuide'

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
    <div className="webgen-workbench">
      <DeployGuide visible={showGuide} onClose={() => setShowGuide(false)} />

      <aside className="webgen-control-panel">
        {showConfig ? (
          <div className="webgen-config-wrap">
            <APIConfigForm
              title="配置 AI 服务"
              description="网页生成需要调用 AI 大模型。选择提供商并填写 API Key。推荐使用通义千问或 DeepSeek，便宜好用。"
              config={config}
              providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
              accent={accentThemes.green}
              onSave={(c) => { setConfig(c as AIClientConfig); saveChatConfig(c as AIClientConfig); setShowConfig(false) }}
              onCancel={() => config && setShowConfig(false)}
            />
          </div>
        ) : (
          <>
            <div className="webgen-toolbar">
              <div className="webgen-title">
                <strong>网页生成</strong>
                <span>{selectedPreset ? webPagePresets.find(p => p.id === selectedPreset)?.name : '描述需求生成单页 HTML'}</span>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="webgen-ghost-btn"
              >
                API 配置
              </button>
            </div>

            <section className="webgen-section">
              <div className="webgen-section-title">
                <strong>场景</strong>
                <span>{webPagePresets.length} 个起点</span>
              </div>
              <div className="webgen-preset-grid">
                {webPagePresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetClick(p.id)}
                    className={`webgen-preset ${selectedPreset === p.id ? 'is-active' : ''}`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="webgen-prompt-section">
              <div className="webgen-section-title">
                <strong>描述</strong>
                <span>{prompt.trim().length} 字</span>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：做一个个人介绍页，我叫小明，是一名设计师..."
              />

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || !config}
                className="webgen-primary-btn"
              >
                {loading ? '生成中...' : '生成网页'}
              </button>

              {!config && (
                <div className="webgen-config-warning">
                  请先点击右上角配置 API Key
                </div>
              )}
            </section>

            <div className="webgen-action-area">
              {result?.html && (
                <button
                  onClick={handleDownload}
                  className="webgen-download-btn"
                >
                  下载 HTML
                </button>
              )}
              <button
                onClick={() => setShowGuide(true)}
                className="webgen-guide-btn"
              >
                建站教程
              </button>
            </div>
          </>
        )}
      </aside>

      <section className="webgen-preview-area">
        {result?.html ? (
          <>
            <div className="webgen-browser-bar">
              <span>预览 · 生成的网页</span>
              <i />
              <button
                onClick={handleDownload}
                className="webgen-download-btn"
              >
                下载
              </button>
            </div>
            <div className="webgen-browser-stage">
              <div className="webgen-browser-frame">
                <iframe
                  ref={iframeRef}
                  sandbox="allow-scripts allow-same-origin"
                  title="网页预览"
                />
              </div>
            </div>
          </>
        ) : result?.error ? (
          <div className="webgen-empty-wrap">
            <div className="webgen-error">
              {result.error}
            </div>
          </div>
        ) : (
          <div className="webgen-empty-wrap">
            <div className="webgen-empty-state">
              <div>🌐</div>
              <strong>等待生成网页</strong>
              <span>在左侧描述你想要的网页，生成后可在这里预览并下载 HTML。</span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
