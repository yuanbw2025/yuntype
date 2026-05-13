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

const accent = '#4F46E5'
const accentBg = '#EEF0FF'
const accentBorder = '#C7D2FE'
const borderColor = '#e8e8e8'
const textColor = '#333'
const mutedColor = '#888'

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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 左栏：模板选择 + 参数输入 */}
      <div style={{
        width: '360px', flexShrink: 0,
        background: '#fff', borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {showConfig ? (
          <ImageConfigPanel
            config={config}
            onSave={handleSaveConfig}
            onCancel={() => config && setShowConfig(false)}
          />
        ) : (
          <>
            {/* 标题栏 */}
            <div style={{
              padding: '16px', borderBottom: `1px solid ${borderColor}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                🎨 AI 配图
              </div>
              <button
                onClick={() => setShowConfig(true)}
                style={{
                  padding: '4px 8px', fontSize: '11px', color: mutedColor,
                  background: 'none', border: `1px solid ${borderColor}`,
                  borderRadius: '4px', cursor: 'pointer',
                }}
              >
                ⚙ 图片API
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {/* 场景分类 */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '8px' }}>
                  选择场景
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {imageCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCatSelect(cat)}
                      style={{
                        padding: '6px 10px', fontSize: '12px',
                        background: selectedCat.id === cat.id ? accentBg : '#f8f8f8',
                        border: `1px solid ${selectedCat.id === cat.id ? accentBorder : '#eee'}`,
                        borderRadius: '6px', cursor: 'pointer',
                        color: selectedCat.id === cat.id ? accent : '#555',
                        fontWeight: selectedCat.id === cat.id ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: mutedColor, marginTop: '6px' }}>
                  {selectedCat.description}
                </div>
              </div>

              {/* 模板选择 */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '8px' }}>
                  选择模板
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedCat.templates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTplSelect(tpl)}
                      style={{
                        padding: '6px 12px', fontSize: '12px',
                        background: selectedTpl.id === tpl.id ? accent : '#f5f5f5',
                        color: selectedTpl.id === tpl.id ? '#fff' : '#555',
                        border: 'none', borderRadius: '16px',
                        cursor: 'pointer', fontWeight: selectedTpl.id === tpl.id ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 参数输入 */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '10px' }}>
                  填写参数
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedTpl.fields.map(field => (
                    <div key={field.key}>
                      <label style={{
                        display: 'block', fontSize: '12px', fontWeight: 500,
                        color: textColor, marginBottom: '4px',
                      }}>
                        {field.label}
                        {field.required && <span style={{ color: '#E53E3E', marginLeft: '2px' }}>*</span>}
                      </label>
                      <input
                        value={fieldValues[field.key] || ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%', padding: '8px 10px', fontSize: '13px',
                          border: `1px solid ${borderColor}`, borderRadius: '6px',
                          outline: 'none', color: textColor,
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && hasRequiredFields && config && !loading) {
                            handleGenerate()
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 生成的 Prompt 预览 */}
              <div style={{ padding: '0 16px 12px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600, color: mutedColor,
                  marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>Prompt 预览</span>
                  <button
                    onClick={handleCopyPrompt}
                    style={{
                      padding: '2px 8px', fontSize: '10px',
                      background: copied ? '#D1FAE5' : '#f5f5f5',
                      color: copied ? '#059669' : mutedColor,
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div style={{
                  padding: '8px 10px', fontSize: '11px', lineHeight: 1.6,
                  background: '#f8f8f8', borderRadius: '6px', color: '#666',
                  maxHeight: '100px', overflow: 'auto',
                  wordBreak: 'break-word',
                }}>
                  {renderedPrompt}
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${borderColor}`,
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              {config ? (
                <button
                  onClick={handleGenerate}
                  disabled={loading || !hasRequiredFields}
                  style={{
                    padding: '10px', fontSize: '13px', fontWeight: 600,
                    color: '#fff',
                    background: loading || !hasRequiredFields ? '#ccc' : accent,
                    border: 'none', borderRadius: '8px',
                    cursor: loading || !hasRequiredFields ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? '⏳ 生成中...' : '✨ 生成图片'}
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#E53E3E', marginBottom: '6px' }}>
                    未配置图片 API
                  </div>
                  <div style={{ fontSize: '11px', color: mutedColor, lineHeight: 1.5 }}>
                    你可以复制上方 Prompt，粘贴到任意 AI 绘图工具中使用
                  </div>
                  <button
                    onClick={() => setShowConfig(true)}
                    style={{
                      marginTop: '8px', padding: '6px 16px', fontSize: '12px',
                      color: accent, background: accentBg,
                      border: `1px solid ${accentBorder}`,
                      borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    配置 API Key
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 右栏：图片预览 + 历史 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#f0f0f0', overflow: 'hidden',
      }}>
        {/* 当前图片 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflow: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🎨</div>
              <div style={{ fontSize: '14px', color: mutedColor }}>AI 正在创作中...</div>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : currentImage ? (
            <div style={{ maxWidth: '100%', maxHeight: '100%', textAlign: 'center' }}>
              <img
                src={currentImage}
                alt="AI generated"
                style={{
                  maxWidth: '100%', maxHeight: 'calc(100vh - 260px)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}
              />
              <div style={{
                marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center',
              }}>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '6px 16px', fontSize: '12px', fontWeight: 600,
                    color: accent, background: accentBg,
                    border: `1px solid ${accentBorder}`,
                    borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  ⬇ 下载图片
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  style={{
                    padding: '6px 16px', fontSize: '12px', fontWeight: 600,
                    color: '#059669', background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  🔄 重新生成
                </button>
              </div>
            </div>
          ) : error ? (
            <div style={{
              padding: '20px 24px', background: '#FFF5F5',
              border: '1px solid #FED7D7', borderRadius: '8px',
              fontSize: '13px', color: '#C53030', maxWidth: '400px', textAlign: 'center',
            }}>
              ❌ {error}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.3 }}>🎨</div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '12px' }}>
                {config ? '选择模板并填写参数，点击生成' : '复制 Prompt 到 AI 绘图工具，或配置 API 直接生成'}
              </div>
              {currentPrompt && (
                <div style={{
                  marginTop: '16px', padding: '12px', background: '#fff',
                  borderRadius: '8px', fontSize: '12px', color: '#666',
                  maxWidth: '400px', textAlign: 'left', lineHeight: 1.6,
                }}>
                  {currentPrompt}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div style={{
            borderTop: `1px solid ${borderColor}`,
            background: '#fff', padding: '12px 16px',
            maxHeight: '140px', overflow: 'auto',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '8px' }}>
              历史记录
            </div>
            <div style={{ display: 'flex', gap: '8px', overflow: 'auto' }}>
              {history.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentImage(item.imageUrl)}
                  style={{
                    width: '80px', height: '80px', flexShrink: 0,
                    borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                    border: currentImage === item.imageUrl ? `2px solid ${accent}` : '2px solid transparent',
                    transition: 'border 0.15s',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.templateName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  图片 API 配置子组件
// ═══════════════════════════════════════

function ImageConfigPanel({
  config,
  onSave,
  onCancel,
}: {
  config: AIImageConfig | null
  onSave: (c: AIImageConfig) => void
  onCancel: () => void
}) {
  const [provider, setProvider] = useState<AIImageConfig['provider']>(config?.provider || 'qwen')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || providerPresets[0].baseUrl)
  const [model, setModel] = useState(config?.model || providerPresets[0].defaultModel)

  const handleProviderChange = (id: AIImageConfig['provider']) => {
    setProvider(id)
    const preset = providerPresets.find(p => p.id === id)
    if (preset) {
      setBaseUrl(preset.baseUrl)
      setModel(preset.defaultModel)
    }
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
        ⚙ 图片生成 API
      </div>
      <div style={{ fontSize: '11px', color: mutedColor, lineHeight: 1.5 }}>
        选择图片生成服务并填写 API Key。推荐通义万相或豆包，每张约 ¥0.04。
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '6px' }}>提供商</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {providerPresets.map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id as AIImageConfig['provider'])}
              style={{
                padding: '8px', fontSize: '11px',
                background: provider === p.id ? accentBg : '#f8f8f8',
                border: `1px solid ${provider === p.id ? accentBorder : '#eee'}`,
                borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                color: provider === p.id ? accent : '#555',
              }}
            >
              <div>{p.icon} {p.name}</div>
              <div style={{ fontSize: '10px', color: mutedColor, marginTop: '2px' }}>{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '4px' }}>API Key</div>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          type="password"
          placeholder="填入你的 API Key"
          style={{
            width: '100%', padding: '8px 10px', fontSize: '12px',
            border: `1px solid ${borderColor}`, borderRadius: '6px',
            outline: 'none', fontFamily: 'monospace',
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, marginBottom: '4px' }}>模型</div>
        <input
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder="模型名称"
          style={{
            width: '100%', padding: '8px 10px', fontSize: '12px',
            border: `1px solid ${borderColor}`, borderRadius: '6px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '8px', fontSize: '12px',
            background: '#f0f0f0', border: 'none',
            borderRadius: '6px', cursor: 'pointer', color: '#666',
          }}
        >
          取消
        </button>
        <button
          onClick={() => onSave({ provider, apiKey, baseUrl, model })}
          disabled={!apiKey.trim()}
          style={{
            flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
            background: apiKey.trim() ? accent : '#ccc',
            color: '#fff', border: 'none',
            borderRadius: '6px', cursor: apiKey.trim() ? 'pointer' : 'default',
          }}
        >
          保存
        </button>
      </div>
    </div>
  )
}
