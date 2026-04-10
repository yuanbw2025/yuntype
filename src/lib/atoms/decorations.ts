// 4种装饰风格 — S1-S4
// 使用 {{primary}} {{secondary}} {{accent}} 占位符，渲染时替换为实际色值

export interface DecorationSet {
  id: string
  name: string
  templates: {
    headingDecoH2: (text: string, primary: string, secondary: string) => string
    headingDecoH3: (text: string, primary: string) => string
    blockquote: (content: string, secondary: string, text: string) => string
    divider: (secondary: string, primary: string) => string
    listMarker: (primary: string) => string
  }
  tags: string[]
}

export const decorationSets: DecorationSet[] = [
  {
    id: 'S1', name: '极简线条',
    templates: {
      headingDecoH2: (text, primary) =>
        `<h2 style="border-bottom: 2px solid ${primary}; padding-bottom: 8px; margin: 0;">${text}</h2>`,
      headingDecoH3: (text, primary) =>
        `<h3 style="border-left: 3px solid ${primary}; padding-left: 10px; margin: 0;">${text}</h3>`,
      blockquote: (content, secondary, text) =>
        `<section style="border-left: 3px solid ${secondary}; padding: 12px 16px; background: ${secondary}20; color: ${text}; margin: 0;">${content}</section>`,
      divider: (secondary) =>
        `<section style="border-top: 1px solid ${secondary}; margin: 24px 0;"></section>`,
      listMarker: () => '●',
    },
    tags: ['minimal', 'clean', 'professional'],
  },
  {
    id: 'S2', name: '色块标签',
    templates: {
      headingDecoH2: (text, primary) =>
        `<h2 style="margin: 0;"><span style="background: ${primary}; color: #FFFFFF; padding: 6px 16px; border-radius: 4px; display: inline-block;">${text}</span></h2>`,
      headingDecoH3: (text, primary) =>
        `<h3 style="margin: 0;"><span style="background: ${primary}30; color: ${primary}; padding: 4px 12px; border-radius: 3px; display: inline-block;">${text}</span></h3>`,
      blockquote: (content, secondary, text) =>
        `<section style="background: ${secondary}; padding: 16px 20px; border-radius: 6px; color: ${text}; margin: 0;">${content}</section>`,
      divider: (secondary) =>
        `<section style="border-top: 3px solid ${secondary}; margin: 24px 0;"></section>`,
      listMarker: (primary) => `<span style="color: ${primary};">■</span>`,
    },
    tags: ['modern', 'colorful', 'design'],
  },
  {
    id: 'S3', name: '圆润气泡',
    templates: {
      headingDecoH2: (text, _primary, secondary) =>
        `<h2 style="margin: 0;"><span style="background: ${secondary}; padding: 8px 20px; border-radius: 20px; display: inline-block;">${text}</span></h2>`,
      headingDecoH3: (text, primary) =>
        `<h3 style="margin: 0;"><span style="background: ${primary}15; padding: 6px 16px; border-radius: 16px; display: inline-block;">${text}</span></h3>`,
      blockquote: (content, secondary, text) =>
        `<section style="background: ${secondary}40; padding: 16px 20px; border-radius: 12px; color: ${text}; margin: 0;">${content}</section>`,
      divider: (_secondary, primary) =>
        `<p style="text-align: center; color: ${primary}; letter-spacing: 8px; margin: 24px 0;">· · · · ·</p>`,
      listMarker: () => '🔹',
    },
    tags: ['friendly', 'warm', 'cute'],
  },
  {
    id: 'S4', name: '几何装饰',
    templates: {
      headingDecoH2: (text, primary) =>
        `<h2 style="padding-left: 0; margin: 0;"><span style="color: ${primary}; margin-right: 8px;">◆</span>${text}</h2>`,
      headingDecoH3: (text, primary) =>
        `<h3 style="padding-left: 0; margin: 0;"><span style="color: ${primary}; margin-right: 8px;">▸</span>${text}</h3>`,
      blockquote: (content, secondary, text) =>
        `<section style="border: 2px double ${secondary}; padding: 16px; color: ${text}; margin: 0;">${content}</section>`,
      divider: (secondary) =>
        `<p style="text-align: center; color: ${secondary}; letter-spacing: 6px; margin: 24px 0;">◇ ◇ ◇</p>`,
      listMarker: (primary) => `<span style="color: ${primary};">▶</span>`,
    },
    tags: ['geometric', 'unique', 'design'],
  },
]
