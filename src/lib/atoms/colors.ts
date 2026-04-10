// 11套配色方案 — 浅色系 L1-L8，深色系 D1-D3

export interface ColorScheme {
  id: string
  name: string
  category: 'light' | 'dark'
  colors: {
    pageBg: string
    contentBg: string
    primary: string
    secondary: string
    accent: string
    text: string
    textMuted: string
  }
  tags: string[]
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'L1', name: '奶茶温柔', category: 'light',
    colors: {
      pageBg: '#FAF6F1', contentBg: '#FFFFFF',
      primary: '#C8A882', secondary: '#E8D5C0',
      accent: '#8B6914', text: '#4A3F35', textMuted: '#8C7B6B',
    },
    tags: ['warm', 'feminine', 'lifestyle'],
  },
  {
    id: 'L2', name: '薄荷清新', category: 'light',
    colors: {
      pageBg: '#F0FAF6', contentBg: '#FFFFFF',
      primary: '#2D9F83', secondary: '#B8E6D8',
      accent: '#1A7A5C', text: '#2C3E3A', textMuted: '#6B8F85',
    },
    tags: ['fresh', 'health', 'nature'],
  },
  {
    id: 'L3', name: '蜜桃活力', category: 'light',
    colors: {
      pageBg: '#FFF5F0', contentBg: '#FFFFFF',
      primary: '#FF7B54', secondary: '#FFD4C2',
      accent: '#E85D3A', text: '#3D2C25', textMuted: '#9C7B6F',
    },
    tags: ['energetic', 'young', 'beauty'],
  },
  {
    id: 'L4', name: '烟灰高级', category: 'light',
    colors: {
      pageBg: '#F5F5F3', contentBg: '#FFFFFF',
      primary: '#6B6B6B', secondary: '#E0E0DC',
      accent: '#3A3A3A', text: '#333333', textMuted: '#999999',
    },
    tags: ['business', 'tech', 'minimal'],
  },
  {
    id: 'L5', name: '藤紫文艺', category: 'light',
    colors: {
      pageBg: '#F8F4FA', contentBg: '#FFFFFF',
      primary: '#8B6AAE', secondary: '#E4D6F0',
      accent: '#6B4C8A', text: '#3A2D4A', textMuted: '#8A7A9C',
    },
    tags: ['literary', 'art', 'poetic'],
  },
  {
    id: 'L6', name: '海盐蓝调', category: 'light',
    colors: {
      pageBg: '#F0F5FA', contentBg: '#FFFFFF',
      primary: '#3B7DD8', secondary: '#C5DAF0',
      accent: '#2B5EA8', text: '#2A3540', textMuted: '#7090A8',
    },
    tags: ['tech', 'education', 'professional'],
  },
  {
    id: 'L7', name: '柠檬阳光', category: 'light',
    colors: {
      pageBg: '#FFFCF0', contentBg: '#FFFFFF',
      primary: '#D4A017', secondary: '#F5E6B0',
      accent: '#B8860B', text: '#3A3520', textMuted: '#8A8060',
    },
    tags: ['warm', 'parenting', 'education'],
  },
  {
    id: 'L8', name: '樱花物语', category: 'light',
    colors: {
      pageBg: '#FFF5F8', contentBg: '#FFFFFF',
      primary: '#E07B9B', secondary: '#F8D7E2',
      accent: '#C45A7A', text: '#3D2A32', textMuted: '#9C7A88',
    },
    tags: ['feminine', 'romantic', 'emotional'],
  },
  {
    id: 'D1', name: '墨夜金字', category: 'dark',
    colors: {
      pageBg: '#1A1A2E', contentBg: '#16213E',
      primary: '#E2B857', secondary: '#2A2A4A',
      accent: '#F0D078', text: '#D4D4D4', textMuted: '#8888AA',
    },
    tags: ['luxury', 'business', 'finance'],
  },
  {
    id: 'D2', name: '极夜极光', category: 'dark',
    colors: {
      pageBg: '#0F0F1A', contentBg: '#1A1A2A',
      primary: '#00D4AA', secondary: '#1A2A35',
      accent: '#00FFCC', text: '#C8D0D8', textMuted: '#6A8090',
    },
    tags: ['tech', 'geek', 'programming'],
  },
  {
    id: 'D3', name: '深海墨蓝', category: 'dark',
    colors: {
      pageBg: '#0A1628', contentBg: '#12233D',
      primary: '#5BA4E6', secondary: '#1A3050',
      accent: '#7ABCF5', text: '#C0D0E0', textMuted: '#6080A0',
    },
    tags: ['academic', 'analysis', 'serious'],
  },
]
