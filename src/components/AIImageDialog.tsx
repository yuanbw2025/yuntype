// AI 文生图对话框 — 输入描述/选段落 → 生成prompt → 调API → 显示结果

import { useState, useEffect } from 'react'
import {
  generateImage,
  generateImagePrompt,
  getColorMood,
  loadAIImageConfig,
  saveAIImageConfig,
  providerPresets,
  type AIImageConfig,
  type ImageGenResult,
} from '../lib/ai/image-gen'
import type { StyleComboV2 } from '../lib/atoms'

interface AIImageDialogProps {
  visible: boolean
  onClose: () => void
  style: StyleComboV2
  selectedText?: string  // 用户选中的文字（可选）
}

const activeColor = '#4F46E5'
const borderColor = '#E8E8E8'
const textColor = '#333'
const mutedColor = '#888'
const dangerColor = '#E53E3E'

export default function AIImageDialog({ visible, onClose, style, selectedText }: AIImageDialogProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<AIImageConfig | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImageGenResult | null>(null)

  // 加载配置
  useEffect(() => {
    const saved = loadAIImageConfig()
    setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [visible])

  // 自动生成 prompt
  useEffect(() => {
    if (visible && selectedText) {
      const mood = getColorMood(style.color.name)
      setPrompt(generateImagePrompt(selectedText, mood))
    }
  }, [visible, selectedText, style])

  if (!visible) return null

  const handleGenerate = async () => {
    if (!config || !prompt.trim()) return
    setLoading(true)
    setResult(null)
    const res = await generateImage(config, prompt.trim())
    setResult(res)
    setLoading(false)
  }

  const handleDownload = () => {
    if (!result?.imageUrl) return
    const a = document.createElement('a')
    a.href = result.imageUrl
    a.download = `yuntype-ai-image-${Date.now()}.png`
    a.click()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '600px',
        maxHeight: '85vh',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          background: '#FAFAFA',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎨</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: textColor }}>AI 生成配图</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                background: showConfig ? '#EEF0FF' : '#f5f5f5',
                color: showConfig ? activeColor : mutedColor,
                border: `1px solid ${showConfig ? activeColor : borderColor}`,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ⚙️ {showConfig ? '返回生图' : 'API设置'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '5px 10px',
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: mutedColor,
              }}
            >✕</button>
          </div>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {showConfig ? (
            <ConfigPanel
              config={config}
              onSave={(c) => { setConfig(c); saveAIImageConfig(c); setShowConfig(false) }}
            />
          ) : !config ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: mutedColor }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>请先配置 API Key</div>
              <button
                onClick={() => setShowConfig(true)}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  background: activeColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >去配置</button>
            </div>
          ) : (
            <GeneratePanel
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              onDownload={handleDownload}
              loading={loading}
              result={result}
              colorName={style.color.name}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  API 配置面板
// ═══════════════════════════════════════

function ConfigPanel({ config, onSave }: {
  config: AIImageConfig | null
  onSave: (c: AIImageConfig) => void
}) {
  const [provider, setProvider] = useState(config?.provider || 'qwen')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '')
  const [model, setModel] = useState(config?.model || '')

  // 选择提供商时自动填入默认值
  const handleProviderChange = (id: string) => {
    setProvider(id as any)
    const preset = providerPresets.find(p => p.id === id)
    if (preset) {
      setBaseUrl(preset.baseUrl)
      setModel(preset.defaultModel)
    }
  }

  // 初始化
  useEffect(() => {
    if (!config) {
      const preset = providerPresets.find(p => p.id === provider)
      if (preset) {
        setBaseUrl(preset.baseUrl)
        setModel(preset.defaultModel)
      }
    }
  }, [])

  const handleSave = () => {
    if (!apiKey.trim()) return
    onSave({
      provider: provider as any,
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>选择生图提供商</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {providerPresets.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProviderChange(p.id)}
            style={{
              padding: '12px',
              background: provider === p.id ? '#EEF0FF' : '#FAFAFA',
              border: `1.5px solid ${provider === p.id ? activeColor : borderColor}`,
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>{p.icon} {p.name}</div>
            <div style={{ fontSize: '11px', color: mutedColor }}>{p.description}</div>
          </button>
        ))}
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: textColor, display: 'block', marginBottom: '4px' }}>
          API Key <span style={{ color: dangerColor }}>*</span>
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="输入你的 API Key"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '13px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: textColor, display: 'block', marginBottom: '4px' }}>
          Base URL
        </label>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '13px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: textColor, display: 'block', marginBottom: '4px' }}>
          模型
        </label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '13px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div style={{ fontSize: '11px', color: mutedColor, padding: '8px 12px', background: '#FFFBEB', borderRadius: '8px' }}>
        🔒 API Key 仅保存在浏览器本地（localStorage），不会上传到任何服务器。
      </div>

      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        style={{
          padding: '12px',
          fontSize: '14px',
          fontWeight: 700,
          background: apiKey.trim() ? activeColor : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        💾 保存配置
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
//  生图面板
// ═══════════════════════════════════════

function GeneratePanel({ prompt, onPromptChange, onGenerate, onDownload, loading, result, colorName }: {
  prompt: string
  onPromptChange: (v: string) => void
  onGenerate: () => void
  onDownload: () => void
  loading: boolean
  result: ImageGenResult | null
  colorName: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Prompt 输入 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: textColor }}>图片描述 (Prompt)</label>
          <span style={{ fontSize: '11px', color: mutedColor }}>当前配色: {colorName}</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="描述你想要生成的图片，例如：一幅温暖的秋日午后咖啡馆插画..."
          rows={5}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '13px',
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
            lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ fontSize: '11px', color: mutedColor, marginTop: '4px' }}>
          💡 提示：英文 prompt 效果通常更好。可以描述风格、颜色、构图等细节。
        </div>
      </div>

      {/* 快捷 prompt 按钮 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {[
          { label: '扁平插画', prompt: 'Modern flat illustration, clean lines, vibrant colors, minimal composition, no text' },
          { label: '水彩风格', prompt: 'Watercolor painting style, soft edges, flowing colors, artistic and dreamy atmosphere, no text' },
          { label: '3D渲染', prompt: '3D rendered illustration, soft lighting, clay/plastic material, cute and modern, no text' },
          { label: '线条简笔', prompt: 'Simple line drawing, minimalist, black and white with accent color, elegant, no text' },
        ].map(({ label, prompt: p }) => (
          <button
            key={label}
            onClick={() => onPromptChange(p)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              background: '#F5F5FF',
              color: activeColor,
              border: `1px solid ${activeColor}30`,
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 生成按钮 */}
      <button
        onClick={onGenerate}
        disabled={loading || !prompt.trim()}
        style={{
          padding: '14px',
          fontSize: '15px',
          fontWeight: 700,
          background: loading ? '#999' : activeColor,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {loading ? '⏳ 正在生成图片... (约10-30秒)' : '🎨 生成图片'}
      </button>

      {/* 结果区 */}
      {result && (
        <div style={{
          padding: '16px',
          background: result.success ? '#F0FFF4' : '#FFF5F5',
          borderRadius: '12px',
          border: `1px solid ${result.success ? '#C6F6D5' : '#FED7D7'}`,
        }}>
          {result.success && result.imageUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <img
                src={result.imageUrl}
                alt="AI生成图片"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'block',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={onDownload}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#48BB78',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  📥 下载图片
                </button>
                <button
                  onClick={onGenerate}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#fff',
                    color: activeColor,
                    border: `1px solid ${activeColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  🔄 重新生成
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: dangerColor, fontSize: '13px' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>❌ 生成失败</div>
              <div>{result.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
