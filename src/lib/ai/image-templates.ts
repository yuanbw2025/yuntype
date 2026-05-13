// AI 配图模板系统 — 场景分类 + 结构化 prompt

export interface ImageCategory {
  id: string
  name: string
  icon: string
  description: string
  templates: ImageTemplate[]
}

export interface ImageTemplate {
  id: string
  name: string
  promptBase: string
  fields: TemplateField[]
}

export interface TemplateField {
  key: string
  label: string
  placeholder: string
  required?: boolean
}

export const imageCategories: ImageCategory[] = [
  {
    id: 'article',
    name: '文章配图',
    icon: '📰',
    description: '公众号/博客文章的题图和插图',
    templates: [
      {
        id: 'article-header',
        name: '文章题图',
        promptBase: 'Create a wide banner illustration for a blog article about {topic}. Style: {style}. Modern, clean composition, no text or watermark. Aspect ratio 16:9.',
        fields: [
          { key: 'topic', label: '文章主题', placeholder: '例如：人工智能的未来趋势', required: true },
          { key: 'style', label: '风格', placeholder: '例如：扁平插画 / 3D渲染 / 水彩' },
        ],
      },
      {
        id: 'article-divider',
        name: '段落插图',
        promptBase: 'Create a small spot illustration representing {concept}. Style: minimal flat illustration, {palette} color palette, simple and elegant, no text, square format.',
        fields: [
          { key: 'concept', label: '插图概念', placeholder: '例如：团队协作 / 数据分析', required: true },
          { key: 'palette', label: '色调', placeholder: '例如：蓝灰 / 暖橙 / 薄荷绿' },
        ],
      },
    ],
  },
  {
    id: 'social',
    name: '社交封面',
    icon: '📱',
    description: '小红书封面、公众号头图、朋友圈配图',
    templates: [
      {
        id: 'xhs-cover',
        name: '小红书封面',
        promptBase: 'Create a visually striking cover image for Xiaohongshu (Little Red Book) post about {topic}. Style: {style}, trendy and eye-catching, suitable for 3:4 portrait format, no text overlay, high quality.',
        fields: [
          { key: 'topic', label: '笔记主题', placeholder: '例如：秋冬穿搭 / 咖啡探店', required: true },
          { key: 'style', label: '风格', placeholder: '例如：ins风 / 日系 / 极简' },
        ],
      },
      {
        id: 'wechat-header',
        name: '公众号头图',
        promptBase: 'Create a professional header image for WeChat article about {topic}. Wide banner format (900x383), {mood} mood, modern and polished, no text, suitable as article cover.',
        fields: [
          { key: 'topic', label: '文章主题', placeholder: '例如：产品发布 / 行业洞察', required: true },
          { key: 'mood', label: '氛围', placeholder: '例如：科技感 / 温暖 / 专业' },
        ],
      },
      {
        id: 'moments-photo',
        name: '朋友圈配图',
        promptBase: 'Create a lifestyle photo-style illustration for {scenario}. Aesthetic, natural lighting, {vibe} vibe, square format, no text, looks like a real photo but artistic.',
        fields: [
          { key: 'scenario', label: '场景', placeholder: '例如：周末下午茶 / 城市夜景', required: true },
          { key: 'vibe', label: '感觉', placeholder: '例如：文艺 / 慵懒 / 活力' },
        ],
      },
    ],
  },
  {
    id: 'avatar',
    name: '头像/形象',
    icon: '👤',
    description: '个人头像、卡通形象、品牌 IP',
    templates: [
      {
        id: 'cartoon-avatar',
        name: '卡通头像',
        promptBase: 'Create a cute cartoon avatar of a {description}. Style: {style}, clean background, centered composition, suitable as social media profile picture, round-friendly composition.',
        fields: [
          { key: 'description', label: '人物描述', placeholder: '例如：戴眼镜的女生 / 穿连帽衫的程序员', required: true },
          { key: 'style', label: '风格', placeholder: '例如：像素风 / 扁平 / 3D 粘土' },
        ],
      },
      {
        id: 'brand-mascot',
        name: '品牌吉祥物',
        promptBase: 'Design a brand mascot character: {character}. It should be {traits}. Simple, memorable, versatile for different contexts, white background, full body view.',
        fields: [
          { key: 'character', label: '形象描述', placeholder: '例如：一只橘猫 / 一个云朵小人', required: true },
          { key: 'traits', label: '性格特征', placeholder: '例如：可爱友好 / 酷炫科技' },
        ],
      },
    ],
  },
  {
    id: 'poster',
    name: '海报/卡片',
    icon: '🎨',
    description: '活动海报、节日贺卡、宣传图',
    templates: [
      {
        id: 'event-poster',
        name: '活动海报',
        promptBase: 'Create a modern event poster background for {event}. Theme: {theme}. Bold visual, dynamic composition, suitable as poster background with space for text overlay, no text in the image.',
        fields: [
          { key: 'event', label: '活动名称', placeholder: '例如：年度技术大会 / 音乐节', required: true },
          { key: 'theme', label: '主题风格', placeholder: '例如：科技未来 / 复古怀旧' },
        ],
      },
      {
        id: 'greeting-card',
        name: '节日贺卡',
        promptBase: 'Create a beautiful greeting card illustration for {holiday}. Style: {style}, festive and warm, elegant composition, no text, suitable as card background.',
        fields: [
          { key: 'holiday', label: '节日', placeholder: '例如：中秋节 / 春节 / 生日', required: true },
          { key: 'style', label: '风格', placeholder: '例如：国风 / 插画 / 简约' },
        ],
      },
    ],
  },
  {
    id: 'product',
    name: '产品展示',
    icon: '📦',
    description: '产品白底图、场景图、展示图',
    templates: [
      {
        id: 'product-showcase',
        name: '产品展示图',
        promptBase: 'Create a product showcase image of {product} on {background}. Professional studio lighting, clean and modern, high-end feel, photorealistic quality.',
        fields: [
          { key: 'product', label: '产品描述', placeholder: '例如：一个白色马克杯 / 一瓶护肤品', required: true },
          { key: 'background', label: '背景', placeholder: '例如：纯白背景 / 大理石桌面' },
        ],
      },
      {
        id: 'product-lifestyle',
        name: '产品场景图',
        promptBase: 'Create a lifestyle scene featuring {product} in a {scene}. Natural, warm atmosphere, {mood} mood, looks like editorial photography, no text.',
        fields: [
          { key: 'product', label: '产品', placeholder: '例如：笔记本电脑 / 咖啡杯', required: true },
          { key: 'scene', label: '场景', placeholder: '例如：咖啡馆 / 书房 / 阳台' },
          { key: 'mood', label: '氛围', placeholder: '例如：温馨 / 专业 / 文艺' },
        ],
      },
    ],
  },
]

export function renderPrompt(template: ImageTemplate, values: Record<string, string>): string {
  let result = template.promptBase
  for (const field of template.fields) {
    const val = values[field.key]?.trim() || field.placeholder.replace('例如：', '').split(' / ')[0]
    result = result.replace(`{${field.key}}`, val)
  }
  return result
}
