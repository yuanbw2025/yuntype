# 云中书 / YunType — 原子设计系统

> 本文档定义云中书排版输出的完整设计系统：配色、排版结构、装饰风格、字体气质。
> 这四个维度的**原子组合**构成 11×5×4×3 = **660种** 独特排版方案。

---

## 核心概念

```
排版方案 = 配色方案 × 排版结构 × 装饰风格 × 字体气质
           (11种)     (5种)     (4种)     (3种)
                    = 660种组合
```

每个原子维度独立变化，任意组合都保证**视觉协调**。这是通过约束每个原子的参数范围实现的——不是"随便搭配"，而是"在预设的和谐范围内自由组合"。

---

## 维度一：配色方案（11套）

### 浅色系（8套）— 编号 L1-L8

#### L1: 奶茶温柔

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#FAF6F1` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#C8A882` | 标题、强调 |
| 辅色 | `#E8D5C0` | 引用块背景、分割线 |
| 点缀色 | `#8B6914` | 链接、按钮 |
| 正文色 | `#4A3F35` | 正文文字 |
| 次要文字 | `#8C7B6B` | 注释、日期 |

**适合**: 生活随笔、美食、女性向内容

#### L2: 薄荷清新

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F0FAF6` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#2D9F83` | 标题、强调 |
| 辅色 | `#B8E6D8` | 引用块背景 |
| 点缀色 | `#1A7A5C` | 链接 |
| 正文色 | `#2C3E3A` | 正文 |
| 次要文字 | `#6B8F85` | 注释 |

**适合**: 健康、环保、清新生活

#### L3: 蜜桃活力

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#FFF5F0` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#FF7B54` | 标题 |
| 辅色 | `#FFD4C2` | 引用块背景 |
| 点缀色 | `#E85D3A` | 链接 |
| 正文色 | `#3D2C25` | 正文 |
| 次要文字 | `#9C7B6F` | 注释 |

**适合**: 年轻活力、运动、美妆

#### L4: 烟灰高级

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F5F5F3` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#6B6B6B` | 标题 |
| 辅色 | `#E0E0DC` | 引用块背景 |
| 点缀色 | `#3A3A3A` | 链接 |
| 正文色 | `#333333` | 正文 |
| 次要文字 | `#999999` | 注释 |

**适合**: 商务、科技、极简风格

#### L5: 藤紫文艺

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F8F4FA` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#8B6AAE` | 标题 |
| 辅色 | `#E4D6F0` | 引用块背景 |
| 点缀色 | `#6B4C8A` | 链接 |
| 正文色 | `#3A2D4A` | 正文 |
| 次要文字 | `#8A7A9C` | 注释 |

**适合**: 文学、诗歌、文艺青年

#### L6: 海盐蓝调

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F0F5FA` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#3B7DD8` | 标题 |
| 辅色 | `#C5DAF0` | 引用块背景 |
| 点缀色 | `#2B5EA8` | 链接 |
| 正文色 | `#2A3540` | 正文 |
| 次要文字 | `#7090A8` | 注释 |

**适合**: 科技、教育、专业知识

#### L7: 柠檬阳光

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#FFFCF0` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#D4A017` | 标题 |
| 辅色 | `#F5E6B0` | 引用块背景 |
| 点缀色 | `#B8860B` | 链接 |
| 正文色 | `#3A3520` | 正文 |
| 次要文字 | `#8A8060` | 注释 |

**适合**: 亲子、教育、温暖积极

#### L8: 樱花物语

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#FFF5F8` | body 背景 |
| 内容背景 | `#FFFFFF` | 文章区域 |
| 主色 | `#E07B9B` | 标题 |
| 辅色 | `#F8D7E2` | 引用块背景 |
| 点缀色 | `#C45A7A` | 链接 |
| 正文色 | `#3D2A32` | 正文 |
| 次要文字 | `#9C7A88` | 注释 |

**适合**: 女性、浪漫、情感

### 深色系（3套）— 编号 D1-D3

#### D1: 墨夜金字

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#1A1A2E` | body 背景 |
| 内容背景 | `#16213E` | 文章区域 |
| 主色 | `#E2B857` | 标题 |
| 辅色 | `#2A2A4A` | 引用块背景 |
| 点缀色 | `#F0D078` | 链接 |
| 正文色 | `#D4D4D4` | 正文 |
| 次要文字 | `#8888AA` | 注释 |

**适合**: 高端、商务、金融

#### D2: 极夜极光

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#0F0F1A` | body 背景 |
| 内容背景 | `#1A1A2A` | 文章区域 |
| 主色 | `#00D4AA` | 标题 |
| 辅色 | `#1A2A35` | 引用块背景 |
| 点缀色 | `#00FFCC` | 链接 |
| 正文色 | `#C8D0D8` | 正文 |
| 次要文字 | `#6A8090` | 注释 |

**适合**: 科技、编程、极客

#### D3: 深海墨蓝

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#0A1628` | body 背景 |
| 内容背景 | `#12233D` | 文章区域 |
| 主色 | `#5BA4E6` | 标题 |
| 辅色 | `#1A3050` | 引用块背景 |
| 点缀色 | `#7ABCF5` | 链接 |
| 正文色 | `#C0D0E0` | 正文 |
| 次要文字 | `#6080A0` | 注释 |

**适合**: 深度分析、学术、严肃话题

---

## 维度二：排版结构（5种）

### T1: 紧凑知识型

**适合**: 干货类、教程类、列表型文章

```
特征:
- line-height: 1.75
- 段落间距: 16px
- 标题上方间距: 24px
- 标题字号: h1=22px, h2=18px, h3=16px
- 正文字号: 15px
- 引用块: 左边框3px + 浅色背景
- 列表: 紧凑排列，项间距8px
- 适合文字量大的内容
```

**CSS 参数**:
```css
--font-size-body: 15px;
--font-size-h1: 22px;
--font-size-h2: 18px;
--font-size-h3: 16px;
--line-height: 1.75;
--paragraph-spacing: 16px;
--heading-top-spacing: 24px;
--blockquote-border: 3px;
--blockquote-padding: 12px 16px;
--list-item-spacing: 8px;
--content-padding: 16px 20px;
```

### T2: 舒展阅读型

**适合**: 散文、随笔、情感类文章

```
特征:
- line-height: 2.0
- 段落间距: 24px
- 标题上方间距: 40px
- 标题字号: h1=24px, h2=20px, h3=17px
- 正文字号: 16px
- 大量留白，阅读节奏舒缓
- 首行缩进2em（可选）
- 适合阅读体验优先的内容
```

**CSS 参数**:
```css
--font-size-body: 16px;
--font-size-h1: 24px;
--font-size-h2: 20px;
--font-size-h3: 17px;
--line-height: 2.0;
--paragraph-spacing: 24px;
--heading-top-spacing: 40px;
--blockquote-border: 2px;
--blockquote-padding: 16px 20px;
--list-item-spacing: 12px;
--content-padding: 20px 24px;
--text-indent: 2em; /* 可选 */
```

### T3: 卡片模块型

**适合**: 产品介绍、对比分析、结构化内容

```
特征:
- 每个section用卡片（圆角+阴影/边框）包裹
- 卡片间距: 20px
- 标题在卡片内，背景色区分
- 适合结构清晰、模块化的内容
- 引用块用独立卡片样式
```

**CSS 参数**:
```css
--font-size-body: 15px;
--font-size-h1: 22px;
--font-size-h2: 18px;
--font-size-h3: 16px;
--line-height: 1.8;
--card-border-radius: 8px;
--card-padding: 20px;
--card-margin: 20px 0;
--card-shadow: 0 2px 8px rgba(0,0,0,0.06);
--card-border: 1px solid rgba(0,0,0,0.08);
```

### T4: 杂志编辑型

**适合**: 深度报道、专栏、高质感内容

```
特征:
- 大标题（h1=28px），有冲击力
- 首段放大（18px / drop-cap首字下沉）
- 图片全宽显示
- 引用块居中、斜体、大字号
- 分割线使用装饰元素
- 整体有"杂志版面"的感觉
```

**CSS 参数**:
```css
--font-size-body: 16px;
--font-size-h1: 28px;
--font-size-h2: 22px;
--font-size-h3: 18px;
--line-height: 1.9;
--paragraph-spacing: 20px;
--heading-top-spacing: 48px;
--first-paragraph-size: 18px;
--blockquote-font-size: 20px;
--blockquote-text-align: center;
--blockquote-font-style: italic;
```

### T5: 对话访谈型

**适合**: Q&A、采访、对话体

```
特征:
- 问答交替，颜色区分
- 问题（Q）：加粗 + 主色
- 回答（A）：正常 + 缩进或浅色背景
- 对话气泡样式（可选）
- 说话人标识
```

**CSS 参数**:
```css
--font-size-body: 15px;
--font-size-h1: 22px;
--font-size-h2: 18px;
--line-height: 1.8;
--question-font-weight: bold;
--question-color: inherit; /* 渲染时替换为当前配色的 primary 色值 */
--answer-indent: 16px;
--answer-background: inherit; /* 渲染时替换为当前配色的 secondary 色值 */
--speaker-label-size: 13px;
```

---

## 维度三：装饰风格（4种）

### S1: 极简线条

```
特征:
- 标题装饰：下划线（2px实线，主色）
- 分割线：细线（1px solid，辅色）
- 引用块：左边框
- 列表标记：实心圆点（●）
- 整体感觉：干净、专业、不打扰
```

**实现（微信兼容）**:
```html
<!-- 标题装饰 -->
<h2 style="border-bottom: 2px solid #3B7DD8; padding-bottom: 8px;">标题</h2>

<!-- 分割线 -->
<section style="border-top: 1px solid #E0E0E0; margin: 24px 0;"></section>
```

### S2: 色块标签

```
特征:
- 标题装饰：主色背景色块 + 白色文字（或半透明色块底衬）
- 标签/徽章：圆角色块包裹关键词
- 引用块：全色块背景（圆角）
- 列表标记：小色块方点（■）
- 整体感觉：现代、有设计感、信息层次清晰
```

**实现（微信兼容）**:
```html
<!-- 标题装饰 -->
<h2 style="background: #3B7DD8; color: #FFFFFF; padding: 8px 16px; border-radius: 4px; display: inline-block;">标题</h2>

<!-- 标签 -->
<span style="background: #C5DAF0; color: #2B5EA8; padding: 2px 8px; border-radius: 3px; font-size: 13px;">关键词</span>
```

### S3: 圆润气泡

```
特征:
- 标题装饰：大圆角背景（pill形状）
- 引用块：圆角卡片 + 柔和阴影
- 列表标记：emoji或圆形图标
- 分割线：圆点排列（· · · · ·）
- 整体感觉：温暖、友好、可爱
```

**实现（微信兼容）**:
```html
<!-- 标题装饰 -->
<h2 style="background: #FFD4C2; padding: 8px 20px; border-radius: 20px; display: inline-block;">标题</h2>

<!-- 分割线 -->
<p style="text-align: center; color: #CCBBAA; letter-spacing: 8px;">· · · · ·</p>
```

### S4: 几何装饰

```
特征:
- 标题装饰：左侧几何图形（方块/三角/菱形，用CSS或SVG内联）
- 分割线：几何图案排列
- 引用块：双线边框 + 角装饰
- 列表标记：几何形状（◆ ▶ ▸）
- 整体感觉：有设计感、精致、独特
```

**实现（微信兼容）**:
```html
<!-- 标题前装饰 -->
<h2 style="padding-left: 16px;">
  <span style="color: #3B7DD8; margin-right: 8px;">◆</span>标题
</h2>

<!-- 引用块双线边框 -->
<section style="border: 2px double #C5DAF0; padding: 16px; margin: 16px 0;">
  引用内容
</section>
```

---

## 维度四：字体气质（3种）

> **注意**: 公众号模式只能用系统默认字体（微信会覆盖自定义字体），所以字体气质主要影响字号、字重、间距等参数。
> 小红书模式（图片生成）可以使用自定义字体。

### F1: 现代简约

```
公众号参数:
- 标题字重: 700 (bold)
- 正文字重: 400 (normal)
- 字间距: 0.5px
- 倾向: 无衬线体感觉

小红书字体组合:
- 标题: 得意黑 Smiley Sans / 站酷高端黑
- 正文: 思源黑体 Noto Sans CJK
```

### F2: 文艺优雅

```
公众号参数:
- 标题字重: 600 (semi-bold)
- 正文字重: 400
- 字间距: 1px
- 倾向: 宋体/衬线体感觉（正文可加 font-family 尝试）

小红书字体组合:
- 标题: 霞鹜文楷 LXGW WenKai / 站酷小薇LOGO体
- 正文: 思源宋体 Noto Serif CJK
```

### F3: 活泼趣味

```
公众号参数:
- 标题字重: 800 (extra-bold)
- 正文字重: 400
- 字间距: 0
- 倾向: 圆体感觉

小红书字体组合:
- 标题: 站酷快乐体 / 寒蝉手拙体
- 正文: 阿里巴巴普惠体 / 悠哉字体
```

---

## 小红书模式可用字体清单

### 完全免费商用字体（16种）

| 编号 | 字体名 | 英文名 | 风格 | CDN/下载 |
|------|-------|--------|------|---------|
| 1 | 思源黑体 | Noto Sans SC | 中性现代 | Google Fonts |
| 2 | 思源宋体 | Noto Serif SC | 优雅文艺 | Google Fonts |
| 3 | 阿里巴巴普惠体 | Alibaba PuHuiTi | 圆润友好 | alibabafont.com |
| 4 | 得意黑 | Smiley Sans | 潮流锐利 | github.com/atelier-anchor/smiley-sans |
| 5 | 霞鹜文楷 | LXGW WenKai | 手写文艺 | github.com/lxgw/LxgwWenKai |
| 6 | 站酷快乐体 | ZCOOL KuaiLe | 活泼可爱 | fonts.google.com |
| 7 | 站酷高端黑 | ZCOOL QingKe HuangYou | 硬朗有力 | fonts.google.com |
| 8 | 站酷酷黑 | ZCOOL KuHei | 粗壮有力 | 站酷官网 |
| 9 | 站酷小薇LOGO体 | ZCOOL XiaoWei | 温柔女性 | fonts.google.com |
| 10 | 庞门正道标题体 | PangMenZhengDao | 粗壮方正 | github免费下载 |
| 11 | 庞门正道粗书体 | PangMenZhengDao CuShu | 毛笔书法 | github免费下载 |
| 12 | 优设标题黑 | YouShe BiaoTiHei | 现代粗黑 | 优设网免费下载 |
| 13 | 字体圈欣意冠黑体 | ZiTiQuanXinYi | 圆润粗黑 | github免费下载 |
| 14 | 寒蝉手拙体 | HanChan ShouZhuo | 手写稚拙 | github免费下载 |
| 15 | 小赖字体 | XiaoLai | 手写日系 | github.com/lxgw/XiaolaiSC |
| 16 | 悠哉字体 | Youzai | 圆体日系 | github.com/lxgw/yozai-font |

### 字体加载策略

1. **首选 Google Fonts CDN**（思源黑/宋、站酷系列有Google Fonts版本）
2. **次选 jsDelivr CDN**（从GitHub仓库加载其他开源字体）
3. **降级方案**: 未加载完成时使用系统字体

```javascript
// 字体加载示例
const FONT_CDN = {
  'NotoSansSC': 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap',
  'NotoSerifSC': 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
  'SmileySans': 'https://cdn.jsdelivr.net/gh/atelier-anchor/smiley-sans@latest/dist/SmileySans-Oblique.ttf',
  'LXGWWenKai': 'https://cdn.jsdelivr.net/gh/lxgw/LxgwWenKai@latest/fonts/LXGWWenKai-Regular.ttf',
  // ...更多字体
};
```

---

## 原子组合数据结构

```typescript
// TypeScript 类型定义

interface ColorScheme {
  id: string; // 'L1' | 'L2' | ... | 'D3'
  name: string; // '奶茶温柔'
  category: 'light' | 'dark';
  colors: {
    pageBg: string;
    contentBg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
  };
  tags: string[]; // ['warm', 'feminine', 'lifestyle']
}

interface LayoutTemplate {
  id: string; // 'T1' | 'T2' | ... | 'T5'
  name: string; // '紧凑知识型'
  params: {
    fontSizeBody: string;
    fontSizeH1: string;
    fontSizeH2: string;
    fontSizeH3: string;
    lineHeight: string;
    paragraphSpacing: string;
    headingTopSpacing: string;
    contentPadding: string;
    // ... 更多参数
  };
  tags: string[]; // ['knowledge', 'dense', 'professional']
}

interface DecorationSet {
  id: string; // 'S1' | 'S2' | 'S3' | 'S4'
  name: string; // '极简线条'
  // 每个装饰元素的 HTML 模板（使用 {{color}} 占位符）
  templates: {
    headingDecoH2: string; // h2 标题装饰HTML
    headingDecoH3: string;
    blockquote: string;
    divider: string;
    listMarker: string;
  };
  tags: string[]; // ['minimal', 'clean', 'professional']
}

interface TypographySet {
  id: string; // 'F1' | 'F2' | 'F3'
  name: string; // '现代简约'
  wechat: {
    headingWeight: string;
    bodyWeight: string;
    letterSpacing: string;
  };
  xiaohongshu: {
    titleFont: string;
    bodyFont: string;
    titleFontUrl: string;
    bodyFontUrl: string;
  };
  tags: string[]; // ['modern', 'clean']
}

// 完整的排版方案
interface StyleCombo {
  color: ColorScheme;
  layout: LayoutTemplate;
  decoration: DecorationSet;
  typography: TypographySet;
}
```
