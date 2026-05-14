import { useState, useEffect } from 'react'
import { theme, type AccentTheme } from '../lib/theme'

interface ProviderOption {
  id: string
  name: string
  icon: string
  baseUrl: string
  defaultModel: string
  description?: string
}

interface APIConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

interface APIConfigFormProps {
  title: string
  description: string
  config: APIConfig | null
  providers: ProviderOption[]
  accent?: AccentTheme
  showDescription?: boolean
  onSave: (config: APIConfig) => void
  onCancel: () => void
}

export function APIConfigForm({
  title,
  description,
  config,
  providers,
  accent = { accent: theme.accent, accentBg: theme.accentBg, accentBorder: theme.accentBorder },
  showDescription = false,
  onSave,
  onCancel,
}: APIConfigFormProps) {
  const [provider, setProvider] = useState(config?.provider || providers[0]?.id || '')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || providers[0]?.baseUrl || '')
  const [model, setModel] = useState(config?.model || providers[0]?.defaultModel || '')

  useEffect(() => {
    const preset = providers.find(p => p.id === provider)
    if (preset && !config) {
      setBaseUrl(preset.baseUrl)
      setModel(preset.defaultModel)
    }
  }, [provider])

  const handleProviderChange = (id: string) => {
    setProvider(id)
    const preset = providers.find(p => p.id === id)
    if (preset) {
      setBaseUrl(preset.baseUrl)
      setModel(preset.defaultModel)
    }
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>
        ⚙ {title}
      </div>
      <div style={{ fontSize: '11px', color: theme.muted, lineHeight: 1.5 }}>
        {description}
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, marginBottom: '6px' }}>提供商</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              style={{
                padding: showDescription ? '8px' : '6px 8px',
                fontSize: '11px',
                background: provider === p.id ? accent.accentBg : '#f8f8f8',
                border: `1px solid ${provider === p.id ? accent.accentBorder : '#eee'}`,
                borderRadius: showDescription ? '6px' : '4px',
                cursor: 'pointer', textAlign: 'left',
                color: provider === p.id ? accent.accent : '#555',
              }}
            >
              {showDescription ? (
                <>
                  <div>{p.icon} {p.name}</div>
                  {p.description && (
                    <div style={{ fontSize: '10px', color: theme.muted, marginTop: '2px' }}>{p.description}</div>
                  )}
                </>
              ) : (
                <>{p.icon} {p.name}</>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, marginBottom: '4px' }}>API Key</div>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          type="password"
          placeholder="填入你的 API Key"
          style={{
            width: '100%', padding: '8px 10px', fontSize: '12px',
            border: `1px solid ${theme.border}`, borderRadius: '6px',
            outline: 'none', fontFamily: 'monospace',
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, marginBottom: '4px' }}>模型</div>
        <input
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder="模型名称"
          style={{
            width: '100%', padding: '8px 10px', fontSize: '12px',
            border: `1px solid ${theme.border}`, borderRadius: '6px',
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
            background: apiKey.trim() ? accent.accent : '#ccc',
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
