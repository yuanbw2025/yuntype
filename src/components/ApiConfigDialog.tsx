// API 配置弹窗 — 配置 AI 聊天提供商 + AI分析按钮

import { useState, useEffect } from 'react'
import {
  chatProviderPresets,
  loadChatConfig,
  saveChatConfig,
  type AIClientConfig,
} from '../lib/ai/client'
import { analyzeArticle, analyzeArticleLocal, type AnalysisResult } from '../lib/ai/analyzer'
import { defaultAtomIdsV2, type AtomIdsV2 } from '../lib/atoms'

interface ApiConfigDialogProps {
  visible: boolean
  onClose: () => void
  article: string
  onApplyRecommendation: (ids: AtomIdsV2) => void
}

export default function ApiConfigDialog({
  visible,
  onClose,
  article,
  onApplyRecommendation,
}: ApiConfigDialogProps) {
  const [config, setConfig] = useState<AIClientConfig>({
    provider: 'qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    model: 'qwen-plus',
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    const saved = loadChatConfig()
    if (saved) setConfig(saved)
  }, [])

  const handleProviderSelect = (id: string) => {
    const preset = chatProviderPresets.find(p => p.id === id)
    if (!preset) return
    const newConfig = {
      ...config,
      provider: id,
      baseUrl: preset.baseUrl || config.baseUrl,
      model: preset.defaultModel || config.model,
    }
    setConfig(newConfig)
    saveChatConfig(newConfig)
  }

  const handleConfigChange = (field: keyof AIClientConfig, value: string) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    saveChatConfig(newConfig)
  }

  const handleAnalyze = async () => {
    if (!article.trim()) {
      setResult({ success: false, error: '请先输入文章内容' })
      return
    }

    setAnalyzing(true)
    setResult(null)

    try {
      let res: AnalysisResult
      if (config.apiKey) {
        res = await analyzeArticle(config, article)
      } else {
        // 无API Key，使用本地分析
        res = analyzeArticleLocal(article)
      }
      setResult(res)
    } catch (err: any) {
      setResult({ success: false, error: err.message || '分析失败' })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleApply = () => {
    if (result?.success && result.recommendation) {
      // 将 AI 推荐的 colorId/typographyId 应用到 V2 默认骨架配置
      const base = defaultAtomIdsV2()
      onApplyRecommendation({
        ...base,
        colorId: result.recommendation.atomIds.colorId,
        typographyId: result.recommendation.atomIds.typographyId,
      })
      onClose()
    }
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '520px', maxHeight: '85vh', background: '#fff',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 标题 */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>🤖 AI 智能分析</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
              分析文章气质，推荐最佳排版组合
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: '#999', padding: '4px',
          }}>✕</button>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {/* 分析按钮区 */}
          <div style={{
            display: 'flex', gap: '10px', marginBottom: '20px',
          }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !article.trim()}
              style={{
                flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700,
                background: analyzing ? '#ccc' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#fff', border: 'none', borderRadius: '10px',
                cursor: analyzing ? 'not-allowed' : 'pointer',
              }}
            >
              {analyzing ? '⏳ 分析中...' : config.apiKey ? '🤖 AI 智能分析' : '📊 本地智能分析'}
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                padding: '12px 16px', fontSize: '13px',
                background: showConfig ? '#EEF0FF' : '#f5f5f5',
                color: showConfig ? '#4F46E5' : '#666',
                border: `1px solid ${showConfig ? '#4F46E530' : '#ddd'}`,
                borderRadius: '10px', cursor: 'pointer',
              }}
            >
              ⚙️
            </button>
          </div>

          {!config.apiKey && (
            <div style={{
              padding: '10px 14px', marginBottom: '16px',
              background: '#FFF8E1', borderRadius: '8px',
              fontSize: '12px', color: '#F57F17',
              border: '1px solid #FFE08240',
            }}>
              💡 未配置 API Key，将使用本地关键词分析（准确度有限）。
              点击 ⚙️ 配置 AI 提供商获得更精准推荐。
            </div>
          )}

          {/* API配置面板（折叠） */}
          {showConfig && (
            <div style={{
              padding: '16px', marginBottom: '16px',
              background: '#FAFAFA', borderRadius: '12px',
              border: '1px solid #eee',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>
                AI 提供商配置
              </div>

              {/* 提供商选择 */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px', marginBottom: '14px',
              }}>
                {chatProviderPresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSelect(p.id)}
                    style={{
                      padding: '8px 6px', fontSize: '11px', fontWeight: 500,
                      background: config.provider === p.id ? '#EEF0FF' : '#fff',
                      color: config.provider === p.id ? '#4F46E5' : '#666',
                      border: `1.5px solid ${config.provider === p.id ? '#4F46E5' : '#e0e0e0'}`,
                      borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* API Key */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => handleConfigChange('apiKey', e.target.value)}
                  placeholder="输入 API Key"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: '13px',
                    border: '1px solid #ddd', borderRadius: '8px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Base URL */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Base URL
                </label>
                <input
                  value={config.baseUrl}
                  onChange={e => handleConfigChange('baseUrl', e.target.value)}
                  placeholder="API 地址"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: '13px',
                    border: '1px solid #ddd', borderRadius: '8px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Model */}
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Model
                </label>
                <input
                  value={config.model}
                  onChange={e => handleConfigChange('model', e.target.value)}
                  placeholder="模型名称"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: '13px',
                    border: '1px solid #ddd', borderRadius: '8px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* 分析结果 */}
          {result && (
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: result.success ? '#F0FFF4' : '#FFF5F5',
              border: `1px solid ${result.success ? '#C6F6D5' : '#FED7D7'}`,
            }}>
              {result.success && result.recommendation ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748' }}>
                        {result.recommendation.articleType}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        气质: {result.recommendation.mood}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '10px 14px', background: '#fff',
                    borderRadius: '8px', marginBottom: '12px',
                    fontSize: '13px', color: '#4A5568', lineHeight: '1.6',
                  }}>
                    {result.recommendation.reason}
                  </div>

                  <div style={{
                    display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px',
                  }}>
                    {Object.entries(result.recommendation.atomIds).map(([key, val]) => (
                      <span key={key} style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                        background: '#EEF0FF', color: '#4F46E5',
                        borderRadius: '6px',
                      }}>
                        {String(val)}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={handleApply}
                    style={{
                      width: '100%', padding: '10px', fontSize: '14px', fontWeight: 700,
                      background: '#4F46E5', color: '#fff', border: 'none',
                      borderRadius: '8px', cursor: 'pointer',
                    }}
                  >
                    ✨ 应用推荐方案
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>❌</span>
                  <span style={{ fontSize: '13px', color: '#E53E3E' }}>{result.error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
