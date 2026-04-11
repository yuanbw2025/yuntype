// 字体加载管理器 — 按需加载免费中文字体

// ═══════════════════════════════════════
//  字体定义
// ═══════════════════════════════════════

export interface FontInfo {
  id: string
  name: string
  nameEn: string
  category: 'sans' | 'serif' | 'display' | 'handwriting'
  weight: string
  css: string        // CSS font-family 值
  url: string        // WOFF2 文件 URL
  loaded: boolean
  description: string
}

// 使用各大免费字体 CDN
const LXGW_CDN = 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css'
const DEYI_CDN = 'https://cdn.jsdelivr.net/npm/smiley-sans@2.0.0/dist/SmileySans-Oblique.css'

export const fontRegistry: FontInfo[] = [
  // 系统字体（无需加载）
  {
    id: 'system-sans',
    name: '系统无衬线',
    nameEn: 'System Sans',
    category: 'sans',
    weight: '400',
    css: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    url: '',
    loaded: true,
    description: '系统默认无衬线字体，兼容性最佳',
  },
  {
    id: 'system-serif',
    name: '系统衬线',
    nameEn: 'System Serif',
    category: 'serif',
    weight: '400',
    css: "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif",
    url: '',
    loaded: true,
    description: '系统衬线字体，适合文学类内容',
  },
  // 免费网络字体
  {
    id: 'lxgw-wenkai',
    name: '霞鹜文楷',
    nameEn: 'LXGW WenKai',
    category: 'serif',
    weight: '400',
    css: "'LXGW WenKai', serif",
    url: LXGW_CDN,
    loaded: false,
    description: '开源文楷字体，温润有书卷气',
  },
  {
    id: 'smiley-sans',
    name: '得意黑',
    nameEn: 'Smiley Sans',
    category: 'display',
    weight: '400',
    css: "'Smiley Sans', sans-serif",
    url: DEYI_CDN,
    loaded: false,
    description: '开源窄体黑，适合标题和海报',
  },
  {
    id: 'noto-sans-sc',
    name: '思源黑体',
    nameEn: 'Noto Sans SC',
    category: 'sans',
    weight: '400',
    css: "'Noto Sans SC', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
    loaded: false,
    description: 'Google 开源黑体，字重丰富',
  },
  {
    id: 'noto-serif-sc',
    name: '思源宋体',
    nameEn: 'Noto Serif SC',
    category: 'serif',
    weight: '400',
    css: "'Noto Serif SC', serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap',
    loaded: false,
    description: 'Google 开源宋体，适合正式内容',
  },
  {
    id: 'zcool-kuaile',
    name: '站酷快乐体',
    nameEn: 'ZCOOL KuaiLe',
    category: 'display',
    weight: '400',
    css: "'ZCOOL KuaiLe', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap',
    loaded: false,
    description: '活泼圆润体，适合趣味内容',
  },
  {
    id: 'zcool-xiaowei',
    name: '站酷小薇LOGO体',
    nameEn: 'ZCOOL XiaoWei',
    category: 'display',
    weight: '400',
    css: "'ZCOOL XiaoWei', serif",
    url: 'https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap',
    loaded: false,
    description: 'LOGO风格体，适合标题',
  },
  {
    id: 'ma-shan-zheng',
    name: '马善政毛笔楷书',
    nameEn: 'Ma Shan Zheng',
    category: 'handwriting',
    weight: '400',
    css: "'Ma Shan Zheng', cursive",
    url: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
    loaded: false,
    description: '毛笔楷书风格，适合中式设计',
  },
  {
    id: 'zhi-mang-xing',
    name: '字体圈欣意冠黑体',
    nameEn: 'Zhi Mang Xing',
    category: 'handwriting',
    weight: '400',
    css: "'Zhi Mang Xing', cursive",
    url: 'https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap',
    loaded: false,
    description: '行书体，适合国风设计',
  },
]

// ═══════════════════════════════════════
//  字体加载状态管理
// ═══════════════════════════════════════

const loadedFonts = new Set<string>(['system-sans', 'system-serif'])
const loadingPromises = new Map<string, Promise<void>>()

/** 加载单个字体 */
export async function loadFont(fontId: string): Promise<void> {
  if (loadedFonts.has(fontId)) return

  // 避免重复加载
  const existing = loadingPromises.get(fontId)
  if (existing) return existing

  const font = fontRegistry.find(f => f.id === fontId)
  if (!font || !font.url) return

  const promise = new Promise<void>((resolve, reject) => {
    // 通过 <link> 标签加载 CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = font.url
    link.crossOrigin = 'anonymous'

    link.onload = () => {
      loadedFonts.add(fontId)
      font.loaded = true
      loadingPromises.delete(fontId)
      resolve()
    }

    link.onerror = () => {
      loadingPromises.delete(fontId)
      reject(new Error(`加载字体 ${font.name} 失败`))
    }

    document.head.appendChild(link)
  })

  loadingPromises.set(fontId, promise)
  return promise
}

/** 批量预加载字体 */
export async function preloadFonts(fontIds: string[]): Promise<void> {
  await Promise.allSettled(fontIds.map(id => loadFont(id)))
}

/** 获取字体是否已加载 */
export function isFontLoaded(fontId: string): boolean {
  return loadedFonts.has(fontId)
}

/** 获取所有已加载字体 */
export function getLoadedFonts(): FontInfo[] {
  return fontRegistry.filter(f => loadedFonts.has(f.id))
}

/** 根据分类获取字体列表 */
export function getFontsByCategory(category?: FontInfo['category']): FontInfo[] {
  if (!category) return fontRegistry
  return fontRegistry.filter(f => f.category === category)
}

// ═══════════════════════════════════════
//  localStorage 持久化
// ═══════════════════════════════════════

const STORAGE_KEY = 'yuntype_custom_fonts'

interface CustomFontConfig {
  titleFont: string   // fontId
  bodyFont: string    // fontId
}

export function loadCustomFontConfig(): CustomFontConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveCustomFontConfig(config: CustomFontConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}
