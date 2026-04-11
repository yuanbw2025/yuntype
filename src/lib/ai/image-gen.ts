// AI 文生图模块 — 支持 OpenAI 兼容格式（千问/豆包/DALL-E 3）+ Gemini

// ═══════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════

export interface AIImageConfig {
  provider: 'openai' | 'qwen' | 'doubao' | 'gemini'
  baseUrl: string
  apiKey: string
  model: string
}

export interface ImageGenResult {
  success: boolean
  imageUrl?: string       // data URL 或 http URL
  error?: string
  prompt?: string
}

// ═══════════════════════════════════════
//  预设提供商配置
// ═══════════════════════════════════════

export interface ProviderPreset {
  id: string
  name: string
  icon: string
  baseUrl: string
  defaultModel: string
  description: string
}

export const providerPresets: ProviderPreset[] = [
  {
    id: 'qwen',
    name: '通义万相',
    icon: '🌐',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'wanx-v1',
    description: '阿里云千问生图，~¥0.04/张',
  },
  {
    id: 'doubao',
    name: '豆包',
    icon: '🫘',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-seedream-3-0-t2i-250415',
    description: '字节豆包生图，~¥0.04/张',
  },
  {
    id: 'openai',
    name: 'OpenAI DALL-E',
    icon: '🤖',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'dall-e-3',
    description: 'DALL-E 3，~$0.04/张',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '💎',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash-exp-image-generation',
    description: 'Google Gemini 原生图片生成',
  },
]

// ═══════════════════════════════════════
//  Prompt 生成
// ═══════════════════════════════════════

/** 根据文字段落 + 风格氛围生成图片描述 prompt */
export function generateImagePrompt(
  text: string,
  colorMood?: string,
): string {
  // 截取核心内容（最多200字用于描述）
  const summary = text.length > 200 ? text.slice(0, 200) + '...' : text

  const mood = colorMood || 'harmonious and elegant'

  return `Create an illustration for a social media article. 
Content theme: ${summary}
Style requirements: ${mood} color palette, minimal and clean composition, modern flat illustration style, suitable as article header image, no text or watermark in the image, high quality, visually appealing.`
}

/** 获取配色方案的氛围描述 */
export function getColorMood(colorName: string): string {
  const moodMap: Record<string, string> = {
    '奶茶温柔': 'warm milk tea tones, soft beige and brown',
    '薄荷清新': 'fresh mint green, natural and refreshing',
    '蜜桃活力': 'vibrant peach and coral, energetic',
    '烟灰高级': 'sophisticated gray tones, minimalist and professional',
    '藤紫文艺': 'literary purple and lavender, artistic and poetic',
    '海盐蓝调': 'ocean blue tones, professional and trustworthy',
    '柠檬阳光': 'sunny lemon yellow, warm and cheerful',
    '樱花物语': 'cherry blossom pink, romantic and feminine',
    '墨夜金字': 'dark luxury with gold accents, premium and elegant',
    '极夜极光': 'dark tech with cyan aurora, futuristic and cool',
    '深海墨蓝': 'deep ocean blue, academic and serious',
  }
  return moodMap[colorName] || 'harmonious and elegant'
}

// ═══════════════════════════════════════
//  localStorage 存储
// ═══════════════════════════════════════

const STORAGE_KEY = 'yuntype_ai_image_config'

export function loadAIImageConfig(): AIImageConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAIImageConfig(config: AIImageConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// ═══════════════════════════════════════
//  API 调用
// ═══════════════════════════════════════

/** 生成图片 — 统一入口 */
export async function generateImage(
  config: AIImageConfig,
  prompt: string,
): Promise<ImageGenResult> {
  try {
    if (config.provider === 'gemini') {
      return await generateImageGemini(config, prompt)
    } else {
      return await generateImageOpenAICompat(config, prompt)
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message || '未知错误',
      prompt,
    }
  }
}

/** OpenAI 兼容格式（OpenAI / 千问 / 豆包） */
async function generateImageOpenAICompat(
  config: AIImageConfig,
  prompt: string,
): Promise<ImageGenResult> {
  const url = `${config.baseUrl.replace(/\/+$/, '')}/images/generations`

  const body: any = {
    model: config.model,
    prompt,
    n: 1,
    size: '1024x1024',
  }

  // 豆包需要 response_format 为 url
  if (config.provider === 'doubao') {
    body.response_format = 'url'
  } else {
    body.response_format = 'b64_json'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API 返回 ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = await response.json()

  if (data.data && data.data[0]) {
    const item = data.data[0]
    if (item.b64_json) {
      return {
        success: true,
        imageUrl: `data:image/png;base64,${item.b64_json}`,
        prompt,
      }
    } else if (item.url) {
      return {
        success: true,
        imageUrl: item.url,
        prompt,
      }
    }
  }

  throw new Error('API 返回格式异常，未找到图片数据')
}

/** Gemini 原生图片生成 */
async function generateImageGemini(
  config: AIImageConfig,
  prompt: string,
): Promise<ImageGenResult> {
  const url = `${config.baseUrl.replace(/\/+$/, '')}/models/${config.model}:generateContent?key=${config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API 返回 ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = await response.json()

  // 从响应中提取图片
  const candidates = data.candidates
  if (candidates && candidates[0]?.content?.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          success: true,
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          prompt,
        }
      }
    }
  }

  throw new Error('Gemini 返回中未找到图片数据')
}
