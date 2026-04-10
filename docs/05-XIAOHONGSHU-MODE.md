# 云中书 / YunType — 小红书模式

> 本文档定义小红书图片组生成的完整规格：模板系统、分页逻辑、尺寸规范、字体渲染。

---

## 1. 概述

小红书模式将文章内容自动分页为**图片组**（6-20张），每张图片是一个独立的 HTML → Canvas → PNG 渲染结果。

与公众号模式的核心区别：

| 维度 | 公众号模式 | 小红书模式 |
|------|----------|----------|
| 输出格式 | HTML富文本 | PNG图片组 |
| 字体 | 系统默认（微信限制） | 自定义字体（16种+） |
| 布局 | 长文滚动 | 固定尺寸分页 |
| 装饰 | CSS受限 | 完全自由（渲染为图片） |
| 背景 | 纯色/简单 | 渐变/纹理/几何图案均可 |

---

## 2. 图片尺寸规格

| 比例 | 分辨率（px） | 适用场景 |
|------|------------|---------|
| **3:4**（默认） | 1080 × 1440 | 知识干货、教程（最常见） |
| 1:1 | 1080 × 1080 | 语录、金句、单图 |
| 16:9 | 1920 × 1080 | 横屏、对比图 |

**渲染时使用2倍分辨率**确保清晰度（如3:4实际渲染2160×2880，导出时缩放到1080×1440）。

---

## 3. 图片组结构

一组小红书图片通常包含：

```
┌─────────┐ ┌─────────┐ ┌─────────┐     ┌─────────┐ ┌─────────┐
│  封面图   │ │ 内容图1  │ │ 内容图2  │ ... │ 内容图N  │ │  尾图    │
│  (必须)  │ │         │ │         │     │         │ │  (可选)  │
└─────────┘ └─────────┘ └─────────┘     └─────────┘ └─────────┘
   第1张        第2张        第3张           第N+1张      最后1张
```

### 封面图（Cover）

```
┌──────────────────────────┐
│                          │
│     [装饰元素]            │
│                          │
│   ┌──────────────────┐   │
│   │                  │   │
│   │    大标题         │   │
│   │    (展示字体)     │   │
│   │                  │   │
│   │    副标题/摘要    │   │
│   │    (正文字体)     │   │
│   │                  │   │
│   └──────────────────┘   │
│                          │
│     作者名 / 日期         │
│     [装饰元素]            │
│                          │
└──────────────────────────┘
```

### 内容图（Content）

```
┌──────────────────────────┐
│  页码 (3/8)    [装饰]     │
│                          │
│  ┌──────────────────┐    │
│  │  小标题           │    │
│  └──────────────────┘    │
│                          │
│  正文内容正文内容正文      │
│  内容正文内容正文内容      │
│  正文内容正文内容          │
│                          │
│  • 列表项1               │
│  • 列表项2               │
│  • 列表项3               │
│                          │
│  ┌─ 引用 ─────────────┐  │
│  │ 引用内容引用内容     │  │
│  └────────────────────┘  │
│                          │
│     [底部装饰线]          │
└──────────────────────────┘
```

### 尾图（Ending）

```
┌──────────────────────────┐
│                          │
│     [装饰元素]            │
│                          │
│                          │
│      感谢阅读 ✨          │
│                          │
│      关注 @作者名         │
│      获取更多内容          │
│                          │
│                          │
│     [装饰元素]            │
│                          │
└──────────────────────────┘
```

---

## 4. 分页算法

### 自动分页逻辑

```typescript
interface XhsPage {
  type: 'cover' | 'content' | 'ending';
  elements: PageElement[];
}

interface PageElement {
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'image';
  content: string;
  estimatedHeight: number; // 预估像素高度
}

function splitToPages(
  markdownAST: MarkdownNode[],
  config: { width: number; height: number; padding: number }
): XhsPage[] {
  const pages: XhsPage[] = [];
  const availableHeight = config.height - config.padding * 2 - 80; // 减去页码和装饰区域
  
  // 第1页：封面
  pages.push({
    type: 'cover',
    elements: extractCoverContent(markdownAST), // 提取标题和摘要
  });
  
  // 中间页：内容
  let currentPage: PageElement[] = [];
  let currentHeight = 0;
  
  for (const node of markdownAST) {
    const element = convertToPageElement(node);
    
    if (currentHeight + element.estimatedHeight > availableHeight) {
      // 当前页满了，开新页
      pages.push({ type: 'content', elements: currentPage });
      currentPage = [element];
      currentHeight = element.estimatedHeight;
    } else {
      currentPage.push(element);
      currentHeight += element.estimatedHeight;
    }
  }
  
  // 最后一页内容
  if (currentPage.length > 0) {
    pages.push({ type: 'content', elements: currentPage });
  }
  
  // 尾图
  pages.push({
    type: 'ending',
    elements: [],
  });
  
  return pages;
}
```

### 高度估算

```typescript
function estimateHeight(element: PageElement, fontSize: number, lineHeight: number, width: number): number {
  const charsPerLine = Math.floor(width / fontSize);
  const lines = Math.ceil(element.content.length / charsPerLine);
  const baseHeight = lines * fontSize * lineHeight;
  
  switch (element.type) {
    case 'heading':
      return baseHeight + 32; // 额外间距
    case 'paragraph':
      return baseHeight + 16;
    case 'list':
      return baseHeight + 24;
    case 'blockquote':
      return baseHeight + 40; // 含背景padding
    default:
      return baseHeight;
  }
}
```

### AI 辅助分页（需要 API Key）

```
Prompt: 请将以下文章拆分为小红书图片组。
每张图片的文字量控制在 80-150 字。
第1张是封面（标题+一句话摘要）。
最后1张是结尾（总结+引导关注）。
中间每张聚焦一个独立的知识点或段落。

请返回 JSON 数组格式...
```

---

## 5. 小红书图片渲染器

### HTML 模板

```typescript
function renderXhsPage(page: XhsPage, style: StyleCombo): string {
  const { colors, layout, decoration, typography } = resolveStyle(style);
  const fonts = typography.xiaohongshu;
  
  return `
    <div style="
      width: 1080px;
      height: 1440px;
      background-color: ${colors.pageBg};
      padding: 60px;
      box-sizing: border-box;
      font-family: '${fonts.bodyFont}', sans-serif;
      position: relative;
      overflow: hidden;
    ">
      ${renderPageNumber(page, style)}
      ${renderPageContent(page, style)}
      ${renderPageDecoration(page, style)}
    </div>
  `;
}
```

### 背景样式

小红书图片不受微信CSS限制，可以使用丰富的背景效果：

```typescript
const BACKGROUND_STYLES = {
  // 纯色（最安全）
  solid: (color: string) => `background-color: ${color};`,
  
  // 线性渐变
  gradient: (color1: string, color2: string) =>
    `background: linear-gradient(135deg, ${color1}, ${color2});`,
  
  // 径向渐变
  radial: (color1: string, color2: string) =>
    `background: radial-gradient(circle at 30% 30%, ${color1}, ${color2});`,
  
  // 网格纹理（CSS实现）
  grid: (color: string, lineColor: string) =>
    `background-color: ${color}; 
     background-image: linear-gradient(${lineColor} 1px, transparent 1px), 
                       linear-gradient(90deg, ${lineColor} 1px, transparent 1px);
     background-size: 40px 40px;`,
  
  // 圆点纹理
  dots: (color: string, dotColor: string) =>
    `background-color: ${color};
     background-image: radial-gradient(${dotColor} 1px, transparent 1px);
     background-size: 20px 20px;`,
  
  // 斜线纹理
  stripes: (color: string, stripeColor: string) =>
    `background-color: ${color};
     background-image: repeating-linear-gradient(
       45deg, transparent, transparent 10px, ${stripeColor} 10px, ${stripeColor} 11px
     );`,
};
```

### 字体渲染保障

```typescript
// fonts.ts - 字体加载管理

async function ensureFontLoaded(fontName: string, fontUrl: string): Promise<boolean> {
  // 检查字体是否已加载
  if (document.fonts.check(`16px "${fontName}"`)) {
    return true;
  }
  
  // 加载字体
  try {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    return true;
  } catch (error) {
    console.warn(`字体 ${fontName} 加载失败，使用系统字体降级`);
    return false;
  }
}

// 在渲染前确保字体就绪
async function prepareForRender(typography: TypographySet): Promise<void> {
  const { titleFont, bodyFont, titleFontUrl, bodyFontUrl } = typography.xiaohongshu;
  
  await Promise.all([
    ensureFontLoaded(titleFont, titleFontUrl),
    ensureFontLoaded(bodyFont, bodyFontUrl),
  ]);
  
  // 等待所有字体渲染完成
  await document.fonts.ready;
}
```

---

## 6. HTML → PNG 转换

### 使用 html2canvas

```typescript
// export/image.ts

import html2canvas from 'html2canvas';
import JSZip from 'jszip';

async function renderPageToImage(
  pageHtml: string,
  width: number,
  height: number
): Promise<Blob> {
  // 创建隐藏的渲染容器
  const container = document.createElement('div');
  container.innerHTML = pageHtml;
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  document.body.appendChild(container);
  
  const target = container.firstElementChild as HTMLElement;
  
  try {
    const canvas = await html2canvas(target, {
      width: width,
      height: height,
      scale: 2,              // 2倍渲染确保清晰
      useCORS: true,         // 允许跨域图片
      allowTaint: false,
      backgroundColor: null, // 透明背景（使用元素自身背景）
      logging: false,
    });
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
  } finally {
    document.body.removeChild(container);
  }
}

async function exportAllPages(
  pages: XhsPage[],
  style: StyleCombo,
  config: { width: number; height: number },
  onProgress?: (progress: number) => void // 0~1 进度回调
): Promise<void> {
  const zip = new JSZip();
  
  for (let i = 0; i < pages.length; i++) {
    const html = renderXhsPage(pages[i], style);
    const blob = await renderPageToImage(html, config.width, config.height);
    
    const paddedIndex = String(i + 1).padStart(2, '0');
    zip.file(`yuntype-${paddedIndex}.png`, blob);
    
    // 更新进度条
    onProgress?.((i + 1) / pages.length);
  }
  
  // 生成并下载 ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `yuntype-${Date.now()}.zip`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 7. 小红书模板系统

### 封面模板变体

| 模板 | 风格 | 描述 |
|------|------|------|
| cover-center | 居中大标题 | 标题居中，上下装饰 |
| cover-left | 左对齐 | 标题左对齐，右侧留白 |
| cover-editorial | 杂志风 | 大字号标题 + 小字副标题 |
| cover-card | 卡片风 | 中心卡片包裹标题 |
| cover-split | 上下分割 | 上半部分色块 + 下半部分白底标题 |

### 内容模板变体

| 模板 | 风格 | 描述 |
|------|------|------|
| content-standard | 标准 | 小标题 + 正文 + 列表 |
| content-numbered | 编号 | 大编号 + 要点内容 |
| content-quote | 引用 | 大段引用 + 注释 |
| content-comparison | 对比 | 左右/上下对比结构 |
| content-highlight | 高亮 | 关键句高亮色块 |

---

## 8. 验收标准

- [ ] 生成的图片尺寸精确（1080×1440 等）
- [ ] 自定义字体在图片中正确渲染
- [ ] 文字不溢出图片边界
- [ ] 分页合理——不在句子中间断开
- [ ] 页码正确显示
- [ ] 封面图和尾图风格与内容图协调
- [ ] 可以单张预览/下载
- [ ] 可以一键打包下载 ZIP
- [ ] 字体加载失败时有合理的降级方案
- [ ] 在 Chrome/Safari/Edge 中渲染结果一致
