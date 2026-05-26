// AI 配图面板 — 场景模板 + 结构化 prompt + 图片生成/预览

import { useState, useEffect, useCallback } from 'react'
import {
  imageCategories,
  renderPrompt,
  type ImageCategory,
  type ImageTemplate,
} from '../lib/ai/image-templates'
import {
  generateImage,
  loadAIImageConfig,
  saveAIImageConfig,
  providerPresets,
  type AIImageConfig,
} from '../lib/ai/image-gen'

import { APIConfigForm } from './APIConfigForm'
import { accentThemes } from '../lib/theme'

interface HistoryItem {
  imageUrl: string
  prompt: string
  templateName: string
  timestamp: number
}

export default function ImageGenPanel() {
  const [config, setConfig] = useState<AIImageConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [selectedCat, setSelectedCat] = useState<ImageCategory>(imageCategories[0])
  const [selectedTpl, setSelectedTpl] = useState<ImageTemplate>(imageCategories[0].templates[0])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const saved = loadAIImageConfig()
    setConfig(saved)
  }, [])

  const handleCatSelect = (cat: ImageCategory) => {
    setSelectedCat(cat)
    setSelectedTpl(cat.templates[0])
    setFieldValues({})
    setCurrentPrompt(null)
  }

  const handleTplSelect = (tpl: ImageTemplate) => {
    setSelectedTpl(tpl)
    setFieldValues({})
    setCurrentPrompt(null)
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const renderedPrompt = renderPrompt(selectedTpl, fieldValues)

  const handleGenerate = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(null)
    setCurrentImage(null)

    const prompt = renderedPrompt
    setCurrentPrompt(prompt)

    const res = await generateImage(config, prompt)

    if (res.success && res.imageUrl) {
      setCurrentImage(res.imageUrl)
      setHistory(prev => [{
        imageUrl: res.imageUrl!,
        prompt,
        templateName: `${selectedCat.icon} ${selectedTpl.name}`,
        timestamp: Date.now(),
      }, ...prev].slice(0, 20))
    } else {
      setError(res.error || '生成失败')
    }
    setLoading(false)
  }, [config, renderedPrompt, selectedCat, selectedTpl])

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(renderedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDownload = () => {
    if (!currentImage) return
    const a = document.createElement('a')
    a.href = currentImage
    a.download = `yuntype-${selectedTpl.id}-${Date.now()}.png`
    a.click()
  }

  const handleSaveConfig = (c: AIImageConfig) => {
    setConfig(c)
    saveAIImageConfig(c)
    setShowConfig(false)
  }

  const hasRequiredFields = selectedTpl.fields
    .filter(f => f.required)
    .every(f => fieldValues[f.key]?.trim())

  return (
    <div className="imagegen-workbench">
      <aside className="imagegen-control-panel">
        {showConfig ? (
          <div className="imagegen-config-wrap">
            <APIConfigForm
              title="图片生成 API"
              description="选择图片生成服务并填写 API Key。推荐通义万相或豆包，每张约 ¥0.04。"
              config={config}
              providers={providerPresets}
              accent={accentThemes.indigo}
              showDescription
              onSave={(c) => handleSaveConfig(c as AIImageConfig)}
              onCancel={() => config && setShowConfig(false)}
            />
          </div>
        ) : (
          <>
            <div className="imagegen-toolbar">
              <div className="imagegen-title">
                <strong>AI 配图</strong>
                <span>{selectedCat.name} · {selectedTpl.name}</span>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="imagegen-ghost-btn"
              >
                图片 API
              </button>
            </div>

            <div className="imagegen-scroll">
              <section className="imagegen-section">
                <div className="imagegen-section-title">
                  <strong>场景</strong>
                  <span>{imageCategories.length} 类</span>
                </div>
                <div className="imagegen-category-grid">
                  {imageCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCatSelect(cat)}
                      className={`imagegen-category ${selectedCat.id === cat.id ? 'is-active' : ''}`}
                    >
                      <span>{cat.icon}</span>
                      <strong>{cat.name}</strong>
                    </button>
                  ))}
                </div>
                <p className="imagegen-help">{selectedCat.description}</p>
              </section>

              <section className="imagegen-section">
                <div className="imagegen-section-title">
                  <strong>模板</strong>
                  <span>{selectedCat.templates.length} 个 Prompt 结构</span>
                </div>
                <div className="imagegen-template-list">
                  {selectedCat.templates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTplSelect(tpl)}
                      className={`imagegen-template ${selectedTpl.id === tpl.id ? 'is-active' : ''}`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="imagegen-section">
                <div className="imagegen-section-title">
                  <strong>参数</strong>
                  <span>{selectedTpl.fields.length} 项</span>
                </div>
                <div className="imagegen-fields">
                  {selectedTpl.fields.map(field => (
                    <div key={field.key}>
                      <label>
                        {field.label}
                        {field.required && <span>*</span>}
                      </label>
                      <input
                        value={fieldValues[field.key] || ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && hasRequiredFields && config && !loading) {
                            handleGenerate()
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="imagegen-section">
                <div className="imagegen-section-title">
                  <strong>Prompt</strong>
                  <button
                    onClick={handleCopyPrompt}
                    className={`imagegen-copy ${copied ? 'is-copied' : ''}`}
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="imagegen-prompt-preview">
                  {renderedPrompt}
                </div>
              </section>
            </div>

            <div className="imagegen-action-area">
              {config ? (
                <button
                  onClick={handleGenerate}
                  disabled={loading || !hasRequiredFields}
                  className="imagegen-primary-btn"
                >
                  {loading ? '生成中...' : '生成图片'}
                </button>
              ) : (
                <div className="imagegen-config-empty">
                  <strong>未配置图片 API</strong>
                  <span>可以先复制 Prompt 到任意 AI 绘图工具使用。</span>
                  <button
                    onClick={() => setShowConfig(true)}
                  >
                    配置 API Key
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      <section className="imagegen-preview-area">
        <div className="imagegen-preview-stage">
          {loading ? (
            <div className="imagegen-empty-state">
              <div className="imagegen-spinner">🎨</div>
              <strong>AI 正在创作中...</strong>
            </div>
          ) : currentImage ? (
            <div className="imagegen-result">
              <img
                src={currentImage}
                alt="AI generated"
              />
              <div className="imagegen-result-actions">
                <button
                  onClick={handleDownload}
                >
                  下载图片
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  重新生成
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="imagegen-error">
              {error}
            </div>
          ) : (
            <div className="imagegen-empty-state">
              <div className="imagegen-empty-icon">🎨</div>
              <strong>{config ? '准备生成图片' : '复制 Prompt 或配置 API'}</strong>
              <span>{config ? '选择模板并填写参数，点击生成。' : '复制 Prompt 到绘图工具，或配置 API 直接生成。'}</span>
              {currentPrompt && (
                <div className="imagegen-current-prompt">
                  {currentPrompt}
                </div>
              )}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="imagegen-history">
            <div className="imagegen-history-title">
              <strong>历史记录</strong>
              <span>{history.length} 张</span>
            </div>
            <div className="imagegen-history-strip">
              {history.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentImage(item.imageUrl)}
                  className={`imagegen-history-thumb ${currentImage === item.imageUrl ? 'is-active' : ''}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.templateName}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
