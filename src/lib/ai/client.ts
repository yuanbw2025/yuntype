// 统一 AI 客户端 — 支持 OpenAI 兼容格式 + Gemini 原生格式

// ═══════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════

export interface AIClientConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  success: boolean
  content?: string
  error?: string
}

// ═══════════════════════════════════════
//  提供商预设
// ═══════════════════════════════════════

export interface ChatProviderPreset {
  id: string
  name: string
  icon: string
  baseUrl: string
  defaultModel: string
  description: string
}

export const chatProviderPresets: ChatProviderPreset[] = [
  {
    id: 'qwen',
    name: '通义千问',
    icon: '🌐',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    description: '阿里千问，便宜好用',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek V3，性价比高',
  },
  {
    id: 'doubao',
    name: '豆包',
    icon: '🫘',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-1.5-pro-32k-250115',
    description: '字节豆包，国内快速',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    description: 'GPT-4o mini，准确度高',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '💎',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    description: 'Google Gemini，多模态',
  },
  {
    id: 'moonshot',
    name: 'Kimi',
    icon: '🌙',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    description: 'Kimi 长文本理解',
  },
  {
    id: 'zhipu',
    name: '智谱',
    icon: '🧠',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    description: '智谱 GLM-4，免费额度',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    icon: '⚡',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    description: '硅基流动，免费模型多',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '🟤',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-20250514',
    description: 'Anthropic Claude，文字/代码最强',
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '𝕏',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3-mini',
    description: 'xAI Grok，推理能力强',
  },
  {
    id: 'custom',
    name: '自定义',
    icon: '🔧',
    baseUrl: '',
    defaultModel: '',
    description: '任意 OpenAI 兼容 API',
  },
]

// ═══════════════════════════════════════
//  localStorage 持久化
// ═══════════════════════════════════════

const STORAGE_KEY = 'yuntype_ai_chat_config'

export function loadChatConfig(): AIClientConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveChatConfig(config: AIClientConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// ═══════════════════════════════════════
//  API 调用
// ═══════════════════════════════════════

/** 统一聊天接口 */
export async function chat(
  config: AIClientConfig,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (!config.apiKey) {
    return { success: false, error: '请先配置 API Key' }
  }

  try {
    if (config.provider === 'gemini') {
      return await callGemini(config, messages)
    }
    if (config.provider === 'claude') {
      return await callClaude(config, messages)
    }
    return await callOpenAICompatible(config, messages)
  } catch (err: any) {
    return { success: false, error: err.message || '请求失败' }
  }
}

// ═══════════════════════════════════════
//  OpenAI 兼容格式
// ═══════════════════════════════════════

async function callOpenAICompatible(
  config: AIClientConfig,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`API错误 ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('API 返回了空内容')
  }

  return { success: true, content }
}

// ═══════════════════════════════════════
//  Claude (Anthropic) 原生格式
// ═══════════════════════════════════════

async function callClaude(
  config: AIClientConfig,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/messages`

  // Claude 的 system 是顶层参数，不在 messages 里
  const systemMsg = messages.find(m => m.role === 'system')
  const chatMsgs = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }))

  const body: any = {
    model: config.model,
    max_tokens: 4096,
    messages: chatMsgs,
  }
  if (systemMsg) {
    body.system = systemMsg.content
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Claude API错误 ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.content?.[0]?.text

  if (!content) {
    throw new Error('Claude 返回了空内容')
  }

  return { success: true, content }
}
// ═══════════════════════════════════════
//  Gemini 原生格式
// ═══════════════════════════════════════

async function callGemini(
  config: AIClientConfig,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/models/${config.model}:generateContent`

  const systemMsg = messages.find(m => m.role === 'system')
  const userMsgs = messages.filter(m => m.role !== 'system')

  const contents = userMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body: Record<string, unknown> = { contents }
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini API错误 ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    throw new Error('Gemini 返回了空内容')
  }

  return { success: true, content }
}
