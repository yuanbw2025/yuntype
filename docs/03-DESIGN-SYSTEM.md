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

---

---

# V2 版本：骨架 × 插槽 设计系统追加

> V2 将设计系统从「4维原子」升级为「骨架 + 10维插槽」。
> 原有配色(11套)、排版(5种)、装饰(4种)、字体(3种) 继续保留作为基础层。
> 新增骨架层和插槽层，提供数十亿级别的排版组合。

---

## 新维度：骨架（Blueprint）— 15+种

骨架决定文章的**HTML 结构骨架**（节区包裹方式、章节分组逻辑），而非仅仅 CSS 参数。

### B01: 经典简约
```
结构: 平铺流式，无额外包裹
特征: 干净、无装饰，纯靠排版和留白说话
适合: 任何内容类型
默认搭配: title=下划线, quote=左竖线, divider=细实线, section=无包裹
```

### B02: 色带章节
```
结构: 每个 h2 章节顶部有一条全宽彩色色带
特征: 章节感强，色带高度 4-6px，使用 primary 色
适合: 知识干货、教程、分析报告
默认搭配: title=色带标题, quote=色块引用, divider=无, section=色带节区
```

### B03: 卡片模块
```
结构: 每个 h2 章节包裹在圆角卡片(border-radius + shadow/border)中
特征: 模块化、独立感强，卡片间有间距
适合: 产品介绍、对比分析、结构化内容
默认搭配: title=卡片内标题, quote=浅色底引用, divider=无(卡片自带分隔), section=卡片
```

### B04: 左边栏重点
```
结构: 每个章节左侧有 3-4px 竖色条贯穿
特征: 视觉引导线强，层级分明
适合: 深度文章、分析报告、技术文档
默认搭配: title=左竖线标题, quote=缩进引用, divider=短横线, section=左竖线
```

### B05: 时间线
```
结构: 左侧竖线 + 每个 h2 是一个圆形节点
特征: 叙事感强，有时间/步骤推进感
适合: 历史回顾、项目复盘、成长记录
默认搭配: title=节点标题, quote=气泡引用, divider=无, section=时间线节点
```

### B06: 杂志双栏
```
结构: 标题全宽，内容区交替单栏/双栏(用table实现)
特征: 杂志版面感，信息密度高
适合: 深度报道、专栏、对比分析
默认搭配: title=大号居中, quote=居中斜体大字, divider=装饰线, section=双栏
```

### B07: 标签导航
```
结构: 顶部横排标签(视觉模拟)，下方按标签分组
特征: 分类清晰，适合多主题并列
适合: 产品对比、FAQ、分类推荐
默认搭配: title=标签页标题, quote=色块引用, divider=标签分隔, section=标签组
```

### B08: 对话气泡
```
结构: Q&A 交替气泡，左右分布(用table+border-radius模拟)
特征: 对话感强，问答分明
适合: 采访、Q&A、用户故事
默认搭配: title=对话人标题, quote=气泡, divider=对话分隔, section=气泡
```

### B09: 编号步骤
```
结构: 每个 h2 前有大编号(01/02/03)，渐进展示
特征: 步骤感强，适合操作指南
适合: 教程、操作指南、流程说明
默认搭配: title=大编号标题, quote=提示框, divider=步骤线, section=步骤区块
```

### B10: 引用高亮
```
结构: 正文中穿插大字号引用(pull-quote)，打破阅读节奏
特征: 杂志风格，重点突出
适合: 人物专访、深度报道、散文
默认搭配: title=简约标题, quote=大字居中引用, divider=装饰符, section=无包裹
```

### B11: 网格画廊
```
结构: 图文交替的网格布局(用table 2列实现)
特征: 视觉丰富，图文并茂
适合: 旅行、美食、产品展示
默认搭配: title=色块标题, quote=图片旁引用, divider=无, section=网格
```

### B12: 折叠手风琴
```
结构: 标题行带展开/折叠视觉指示(▸/▾)，内容缩进
特征: 信息量大但不压迫，FAQ风格
适合: FAQ、知识库、产品说明
默认搭配: title=折叠标题, quote=缩进引用, divider=细线, section=折叠区
```

### B13: 渐变色块
```
结构: 不同章节用不同深度的渐变背景色块
特征: 色彩层次丰富，视觉吸引力强
适合: 品牌宣传、活动推广、年度总结
默认搭配: title=白字反色标题, quote=透明底引用, divider=无, section=渐变色块
```

### B14: 侧注标注
```
结构: 主内容左侧占70%，右侧30%放注释/旁批(用table实现)
特征: 学术感，信息层次丰富
适合: 学术文章、读书笔记、代码解析
默认搭配: title=学术标题, quote=侧注引用, divider=虚线, section=主+侧
```

### B15: 报纸版式
```
结构: 大标题横跨全宽，内容分2-3栏(用table实现)
特征: 新闻感强，信息密度高
适合: 新闻资讯、行业简报、周刊
默认搭配: title=报头标题, quote=边框引用, divider=粗线, section=多栏
```

---

## 插槽变体清单（10维度）

### 插槽 1: `title` 标题（20+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| t01 | 纯文本 | 无装饰，仅字号+字重 | minimal |
| t02 | 下划线 | 标题下方 2px 实线 | minimal, clean |
| t03 | 色块背景 | 主色背景 + 白字 | modern, bold |
| t04 | 半透明底 | 半透明主色底衬 | soft, modern |
| t05 | 左竖线 | 左侧 3-4px 竖线 | classic, professional |
| t06 | 大圆角底 | pill 形状背景 | friendly, warm |
| t07 | 几何前缀 | ◆ ▸ ● 等前缀 | geometric, unique |
| t08 | 编号前缀 | 01. 02. 大编号 | structured, guide |
| t09 | 色带标题 | 全宽色带 + 白字 | bold, magazine |
| t10 | 渐变底 | 左→右渐变背景 | modern, premium |
| t11 | 双线框 | 上下双线包夹 | formal, academic |
| t12 | 引号装饰 | 大引号 + 文字 | literary, elegant |
| t13 | 阴影文字 | text-shadow 效果 | bold, design |
| t14 | 标签式 | 小标签 + 大标题组合 | structured, modern |
| t15 | 居中大字 | 居中 + 大字号 | magazine, hero |
| t16 | 斜体标题 | font-style: italic | elegant, literary |
| t17 | 角标装饰 | 左上角 ┌── 线条 | geometric, clean |
| t18 | emoji 前缀 | 📌 🔥 ✨ 等 | friendly, fun |
| t19 | 反色圆角 | 圆角反色块 | modern, app |
| t20 | 虚线下划 | 虚线下边框 | subtle, minimal |

### 插槽 2: `quote` 引用（15+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| q01 | 左竖线 | 经典左边框引用 | classic, minimal |
| q02 | 色块底 | 全色块背景 + 圆角 | modern, soft |
| q03 | 对话气泡 | 圆角 + 小三角箭头 | friendly, dialogue |
| q04 | 便签纸 | 黄色底 + 微倾斜感 | warm, casual |
| q05 | 书页引用 | 大引号 + 斜体 + 居中 | literary, elegant |
| q06 | 双线框 | 双线边框包围 | formal, classic |
| q07 | 虚线框 | 虚线边框 | subtle, light |
| q08 | 左色带 | 左侧宽色带 + 浅背景 | bold, structured |
| q09 | 卡片式 | 圆角 + 阴影(兼容性视) | card, modern |
| q10 | 缩进式 | 纯缩进 + 小字号 | minimal, academic |
| q11 | 居中大字 | 大字号 + 居中 + 斜体 | magazine, pullquote |
| q12 | 顶色条 | 顶部色条 + 浅背景 | structured, modern |
| q13 | 花括号 | 左侧大花括号 { | unique, academic |
| q14 | emoji 标注 | 💡/📝/⚠️ 前缀 | friendly, callout |
| q15 | 渐变底 | 渐变背景 | premium, modern |

### 插槽 3: `list` 列表（12+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| l01 | 实心圆 | ● 经典圆点 | classic, minimal |
| l02 | 方块 | ■ 实心方块 | modern, bold |
| l03 | 三角 | ▶ 右三角 | geometric, active |
| l04 | 菱形 | ◆ 菱形 | geometric, unique |
| l05 | emoji 系列 | 🔹 ✅ ⭐ | friendly, fun |
| l06 | 编号圆圈 | ① ② ③ | structured, clear |
| l07 | 编号色块 | 数字色块标签 | modern, bold |
| l08 | 横线前缀 | — 破折号 | minimal, clean |
| l09 | 箭头 | → 右箭头 | active, guide |
| l10 | 勾选框 | ☐ / ☑ 勾选 | task, structured |
| l11 | 小圆点 | · 小居中圆点 | subtle, elegant |
| l12 | 竖线缩进 | 左竖线 + 缩进 | structured, code |

### 插槽 4: `divider` 分割线（15+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| d01 | 细实线 | 1px solid | minimal, clean |
| d02 | 粗实线 | 3px solid | bold, strong |
| d03 | 虚线 | 1px dashed | subtle, light |
| d04 | 点线 | 1px dotted | playful, light |
| d05 | 双线 | 2px double | formal, classic |
| d06 | 圆点排列 | · · · · · | elegant, literary |
| d07 | 几何排列 | ◇ ◇ ◇ | geometric, unique |
| d08 | 星号排列 | ✦ ✦ ✦ | decorative, premium |
| d09 | 波浪符 | ～～～～～ | playful, friendly |
| d10 | emoji | 🌿 ❀ ✿ | fun, themed |
| d11 | 渐变线 | 中间深两头浅 | modern, premium |
| d12 | 短横线居中 | 短线居中(30%宽) | minimal, elegant |
| d13 | 菱形居中 | ──❖── | decorative, formal |
| d14 | 空行 | 纯留白分隔 | minimal, zen |
| d15 | 色块条 | 全宽薄色条 | bold, section |

### 插槽 5: `paragraph` 段落（8+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| p01 | 标准 | 无缩进，正常间距 | default, modern |
| p02 | 首行缩进 | text-indent: 2em | traditional, literary |
| p03 | 首字下沉 | 首字母放大(模拟) | magazine, premium |
| p04 | 高亮段 | 浅色背景突出 | emphasis, callout |
| p05 | 引述段 | 缩进 + 斜体 + 小字 | quote, literary |
| p06 | 宽松段 | 加大行高和段间距 | relaxed, reading |
| p07 | 紧凑段 | 减小间距 | dense, knowledge |
| p08 | 左对齐严格 | 无两端对齐 | clean, code |

### 插槽 6: `section` 节区（10+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| s01 | 无包裹 | 纯 margin 分隔 | minimal, default |
| s02 | 卡片 | 圆角 + border | card, modern |
| s03 | 色带顶部 | 顶部 4px 色条 | structured, bold |
| s04 | 左竖线 | 左侧贯穿竖线 | classic, guide |
| s05 | 阴影区块 | 浅阴影(兼容性视) | modern, premium |
| s06 | 背景色块 | 浅色背景区块 | soft, warm |
| s07 | 虚线框 | 虚线边框包围 | subtle, light |
| s08 | 双线框 | 双线边框 | formal, academic |
| s09 | 渐变背景 | 渐变色底 | bold, premium |
| s10 | 缩进块 | 左侧大缩进 | clean, structured |

### 插槽 7: `frame` 边框装饰（9+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| f01 | 无边框 | 默认无边框 | minimal, default |
| f02 | 圆角细线 | 1px + border-radius | soft, modern |
| f03 | 方角粗线 | 2px + 无圆角 | bold, formal |
| f04 | 双线框 | border: double | classic, academic |
| f05 | 菱形角标 | 四角菱形装饰 | geometric, unique |
| f06 | 虚线框 | dashed border | casual, light |
| f07 | 阴影框 | box-shadow 效果(兼容性视) | modern, premium |
| f08 | 花边框 | border + 内缩装饰 | decorative, warm |
| f09 | 渐变边框 | 渐变色边框(用border-image) | premium, bold |

### 插槽 8: `ornament` 装饰花纹（6+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| o01 | 无装饰 | 默认无 | minimal |
| o02 | 章节尾花 | ❧ ❦ ✦ ◈ 等尾部装饰 | literary, elegant |
| o03 | 角标花纹 | ┏━ ━┓ 角落装饰线 | geometric, formal |
| o04 | 背景纹理-条纹 | 斜线条纹背景 | pattern, subtle |
| o05 | 背景纹理-点阵 | 圆点网格背景 | pattern, playful |
| o06 | 首字花体 | 首字母装饰放大 | literary, premium |

### 插槽 9: `callout` 提示框（6+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| c01 | 圆角色块 | 背景色 + 圆角 | modern, clean |
| c02 | 左图标带 | 左侧图标 + 浅背景 | structured, info |
| c03 | 上色条 | 顶部色条 + 浅背景 | structured, bold |
| c04 | 侧边竖条 | 左侧粗竖条 + 背景 | classic, emphasis |
| c05 | 纸片便签 | 便签纸风格 | casual, warm |
| c06 | 终端风格 | 深色底 + 等宽字体 | code, tech |

### 插槽 10: `badge` 标签徽章（6+种）

| ID | 名称 | 描述 | 标签 |
|----|------|------|------|
| b01 | 圆角标签 | 小圆角背景色 | modern, default |
| b02 | 药丸形 | 大圆角(pill) | friendly, app |
| b03 | 方色块 | 无圆角纯色块 | bold, structured |
| b04 | 描边标签 | 只有边框无填充 | subtle, clean |
| b05 | 渐变标签 | 渐变背景 | premium, modern |
| b06 | 编号圆圈 | 数字 + 圆形背景 | structured, guide |

---

## 装饰素材库

### 章节尾花集
```
❧  ❦  ✦  ◈  ❋  ⟡  ✻  ❃  ☙  ❊  ✿  ❀  ✾  ❁  ※  ⁂  ⁕  ✤  ✥  ✣
```

### 角标/线条装饰
```
┌──  ──┐      ╔══  ══╗      ◆──  ──◆      ✦──  ──✦
└──  ──┘      ╚══  ══╝      ──◆──         ──✦──
```

### 分割符装饰
```
── ✦ ──    ═══❖═══    ～～～～    ▬▬▬▬    •••••
── ◆ ──    ───❋───    ≈≈≈≈≈    ━━━━    ○○○○○
── ● ──    ───✿───    ∽∽∽∽∽    ┄┄┄┄    ◇◇◇◇◇
```

### 列表标记符
```
● ○ ◉ ◎    ■ □ ◆ ◇    ▶ ▸ ▹ ►    ★ ☆ ✦ ✧
→ ⟶ ⇒ ➤    ✓ ✔ ☑ ☐    🔹 🔸 🔵 🔴    📌 ⭐ ✅ 💡
```

---

## V2 组合数公式

```
总组合 = 骨架(15+) × 标题(20+) × 引用(15+) × 列表(12+) × 分割(15+) ×
         段落(8+) × 节区(10+) × 边框(9+) × 装饰(6+) × 提示(6+) × 标签(6+) ×
         配色(11) × 字体(3)

       = 15 × 20 × 15 × 12 × 15 × 8 × 10 × 9 × 6 × 6 × 6 × 11 × 3
       ≈ 约 460 亿种组合
```

用户无需面对这个数字 —— 骨架自带默认搭配，协调引擎自动匹配，用户只操作自己关心的维度。

---

## V2 数据结构

```typescript
// V2 新增类型

interface Blueprint {
  id: string              // 'B01' ~ 'B15+'
  name: string            // '经典简约'
  description: string     // 结构描述
  defaultSlots: SlotConfig // 默认插槽搭配
  tags: string[]          // ['minimal', 'classic']
  // 骨架级别的渲染函数
  render: {
    wrapDocument: (content: string, style: StyleCombo) => string
    wrapSection: (title: string, content: string, index: number, style: StyleCombo) => string
  }
}

interface SlotVariant {
  id: string              // 't01', 'q03', 'l05'...
  name: string            // '色块背景'
  render: (params: SlotRenderParams) => string  // 渲染函数
  tags: string[]          // ['modern', 'bold']
  affinity: Record<string, number>  // { 'q02': 0.9, 'q05': 0.3 }
}

interface SlotConfig {
  title: string           // 标题变体 ID
  quote: string           // 引用变体 ID
  list: string            // 列表变体 ID
  divider: string         // 分割线变体 ID
  paragraph: string       // 段落变体 ID
  section: string         // 节区变体 ID
  frame: string           // 边框变体 ID
  ornament: string        // 装饰变体 ID
  callout: string         // 提示框变体 ID
  badge: string           // 标签变体 ID
}

interface LockState {
  title: boolean
  quote: boolean
  list: boolean
  divider: boolean
  paragraph: boolean
  section: boolean
  frame: boolean
  ornament: boolean
  callout: boolean
  badge: boolean
}

// V2 扩展后的 StyleCombo
interface StyleComboV2 extends StyleCombo {
  blueprint: Blueprint
  slots: SlotConfig
  locks: LockState
}
```
