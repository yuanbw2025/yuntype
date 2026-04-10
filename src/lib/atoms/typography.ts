// 3种字体气质 — F1-F3

export interface TypographySet {
  id: string
  name: string
  wechat: {
    headingWeight: string
    bodyWeight: string
    letterSpacing: string
  }
  xiaohongshu: {
    titleFont: string
    bodyFont: string
    titleFontUrl: string
    bodyFontUrl: string
  }
  tags: string[]
}

export const typographySets: TypographySet[] = [
  {
    id: 'F1', name: '现代简约',
    wechat: {
      headingWeight: '700',
      bodyWeight: '400',
      letterSpacing: '0.5px',
    },
    xiaohongshu: {
      titleFont: 'Smiley Sans',
      bodyFont: 'Noto Sans SC',
      titleFontUrl: 'https://cdn.jsdelivr.net/gh/atelier-anchor/smiley-sans@latest/dist/SmileySans-Oblique.ttf',
      bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap',
    },
    tags: ['modern', 'clean', 'sans-serif'],
  },
  {
    id: 'F2', name: '文艺优雅',
    wechat: {
      headingWeight: '600',
      bodyWeight: '400',
      letterSpacing: '1px',
    },
    xiaohongshu: {
      titleFont: 'LXGW WenKai',
      bodyFont: 'Noto Serif SC',
      titleFontUrl: 'https://cdn.jsdelivr.net/gh/lxgw/LxgwWenKai@latest/fonts/LXGWWenKai-Regular.ttf',
      bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
    },
    tags: ['literary', 'elegant', 'serif'],
  },
  {
    id: 'F3', name: '活泼趣味',
    wechat: {
      headingWeight: '800',
      bodyWeight: '400',
      letterSpacing: '0',
    },
    xiaohongshu: {
      titleFont: 'ZCOOL KuaiLe',
      bodyFont: 'Alibaba PuHuiTi',
      titleFontUrl: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap',
      bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Alibaba+PuHuiTi:wght@400;700&display=swap',
    },
    tags: ['playful', 'fun', 'rounded'],
  },
]
