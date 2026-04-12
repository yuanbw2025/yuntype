<div align="center">

# ☁️ 云中书 YunType

**AI 驱动的排版引擎 · 660种原子组合 · 粘贴即排版**

*Paste your article. Get stunning layouts. Copy to WeChat & Xiaohongshu.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Combinations](https://img.shields.io/badge/排版组合-660种-FF6B6B)](/)
[![WeChat Compatible](https://img.shields.io/badge/微信公众号-兼容-07C160?logo=wechat&logoColor=white)](/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](/)

---

[🇨🇳 中文](#-中文文档) · [🇺🇸 English](#-english-documentation)

</div>

---

<a name="-中文文档"></a>

## 🇨🇳 中文文档

### 💡 这是什么？

**云中书**是一个零后端、零账号的 AI 排版工具，帮助公众号和小红书创作者**一键生成专业排版**。

> 不需要设计能力。不需要开会员。粘贴文章，选个风格，复制走人。

```
📋 粘贴文章  →  🎨 AI推荐排版  →  🔧 微调风格  →  📎 复制到微信 / 📸 下载图片组
```

---

### ✨ 核心特性

| 特性 | 说明 |
|:---:|:---|
| 🎨 **660种排版组合** | 11配色 × 5排版 × 4装饰 × 3字体，原子化组合永不撞款 |
| 🤖 **AI 智能推荐** | 9大AI提供商（通义千问/DeepSeek/豆包/OpenAI/Gemini等），分析文章自动匹配最佳排版 |
| 🎚️ **滑条微调** | 调"感觉"而不是调参数 — 色温、装饰密度、间距... |
| 📝 **公众号模式** | 输出微信兼容的内联CSS富文本，直接粘贴到公众号编辑器 |
| 📸 **小红书模式** | 自动分页生成图片组，5种封面变体，拖拽排序，ZIP打包导出 |
| 📊 **信息图模式** | 流程图/对比表/知识卡片/时间线，程序化生成精美信息图 |
| 🎨 **AI 文生图** | 集成通义万相/豆包/OpenAI/Gemini，一键生成配图 |
| ✒️ **10种字体** | 按需CDN加载，分类浏览，标题/正文独立选择 |
| 🌙 **暗黑模式** | 深色主题，保护眼睛，Ctrl+D一键切换 |
| ⌨️ **键盘快捷键** | Ctrl+Shift+R 随机组合 / Ctrl+E 导出 / Ctrl+D 暗黑模式 |
| 💼 **品牌预设** | 保存最多20套品牌预设，一键调用 |
| 🕐 **历史记录** | 自动保存最近10次排版记录 |
| 📱 **移动端适配** | 平板/手机/超小屏全适配，触屏优化 |
| 🔑 **零门槛** | 零后端、零账号、零付费墙，核心功能完全离线可用 |

---

### 🎨 原子设计系统

云中书的排版不是"模板"，而是**四维度原子的自由组合**：

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   排版方案 = 配色 × 排版 × 装饰 × 字体         │
│              11种   5种    4种   3种            │
│                                                 │
│              = 660 种独特组合                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

#### 🌈 维度一：11套配色方案

<table>
<tr>
<td align="center"><b>浅色系 (8套)</b></td>
<td align="center"><b>深色系 (3套)</b></td>
</tr>
<tr>
<td>

| 编号 | 名称 | 主色 | 适合场景 |
|:---:|:---:|:---:|:---|
| L1 | 🍵 奶茶温柔 | `#C8A882` | 生活随笔、美食 |
| L2 | 🌿 薄荷清新 | `#2D9F83` | 健康、环保 |
| L3 | 🍑 蜜桃活力 | `#FF7B54` | 美妆、运动 |
| L4 | 🌫️ 烟灰高级 | `#6B6B6B` | 商务、科技 |
| L5 | 💜 藤紫文艺 | `#8B6FC0` | 文艺、读书 |
| L6 | 🌊 天青雅致 | `#5B8FA8` | 旅行、人文 |
| L7 | 🌸 樱花浪漫 | `#D4729C` | 情感、女性 |
| L8 | 🏖️ 落日暖橘 | `#E8914F` | 旅行、生活 |

</td>
<td>

| 编号 | 名称 | 主色 | 适合 |
|:---:|:---:|:---:|:---|
| D1 | 🌙 墨夜金字 | `#D4A843` | 高端品牌 |
| D2 | 🖤 深空科技 | `#00D4AA` | 科技产品 |
| D3 | 🍷 暗夜酒红 | `#C75B5B` | 品酒、高级 |

</td>
</tr>
</table>

---

#### 📐 维度二：5种排版结构

| 编号 | 名称 | 特点 | 最佳场景 |
|:---:|:---|:---|:---|
| T1 | 📚 紧凑知识型 | 信息密度高、段落紧凑、适合干货 | 技术教程、知识分享 |
| T2 | 📖 舒适阅读型 | 大段落间距、宽行高、适合长文 | 深度长文、散文 |
| T3 | 🗞️ 杂志画报型 | 首字下沉、图文混排、视觉冲击 | 品牌故事、旅行游记 |
| T4 | 📋 清单列表型 | 以列表和卡片为主、信息模块化 | 产品测评、攻略清单 |
| T5 | 💬 对话访谈型 | 对话气泡样式、角色区分 | 访谈记录、FAQ |

---

#### 🎭 维度三：4种装饰风格

| 编号 | 名称 | 视觉效果 |
|:---:|:---|:---|
| S1 | ✏️ 极简线条 | 细线分割、无多余装饰、呼吸感强 |
| S2 | 🖼️ 卡片容器 | 圆角卡片包裹、柔和阴影、模块化 |
| S3 | 🌸 渐变装饰 | 标题渐变背景、引用色块、柔美过渡 |
| S4 | 💎 几何装饰 | 几何色块点缀、标题前缀装饰、设计感强 |

---

#### ✒️ 维度四：3种字体气质

| 编号 | 名称 | 字体 | 气质 |
|:---:|:---|:---|:---|
| F1 | 🏢 现代简约 | 思源黑体 Noto Sans SC | 专业、干净、通用 |
| F2 | 📜 典雅宋体 | 思源宋体 Noto Serif SC | 文艺、古典、高级 |
| F3 | 🎨 活泼趣味 | ZCOOL QingKe HuangYou | 年轻、有趣、个性 |

---

### 📸 小红书模式

小红书模式支持将文章自动分页为 1080×1440 图片组：

| 功能 | 说明 |
|:---:|:---|
| 📐 **智能分页** | 按段落自动切分内容，确保排版美观 |
| 🎨 **5种封面变体** | classic 经典 / bold 大字 / minimal 极简 / card 卡片 / magazine 杂志 |
| 🖱️ **拖拽排序** | 生成后可拖拽调整页面顺序 |
| 🏷️ **增强尾页** | CTA互动按钮（点赞/收藏/转发）+ 品牌区 + 总页数 |
| 📦 **ZIP打包** | 一键下载所有图片，自动编号命名 |

---

### 🤖 AI 能力

| 功能 | 支持的提供商 |
|:---:|:---|
| 📊 **文章分析** | 通义千问、DeepSeek、豆包、OpenAI、Gemini、Moonshot、智谱、SiliconFlow、自定义 |
| 🖼️ **AI 文生图** | 通义万相、豆包、OpenAI DALL-E、Google Gemini |
| 📈 **信息图生成** | 内置4种模板：流程图、对比表、知识卡片、时间线 |

> 💡 自带 API Key 模式，数据不经过任何中间服务器，100%隐私安全。离线时自动使用本地规则分析。

---

### 🌙 暗黑模式 & 快捷键

| 快捷键 | 功能 |
|:---:|:---|
| `Ctrl + D` | 切换暗黑/明亮模式 |
| `Ctrl + Shift + R` | 随机生成排版组合 |
| `Ctrl + E` | 导出当前排版 |

暗黑模式支持 localStorage 持久化，刷新页面保持上次设置。

---

### 🚀 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/yuanbw2025/yuntype.git

# 2. 安装依赖
cd yuntype
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# → http://localhost:5173
```

---

### 🏗️ 项目结构

```
yuntype/
├── index.html                  # 入口 HTML（含SEO/OG/PWA元标签）
├── package.json                # React 19 + TypeScript + Vite 6
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── vercel.json                 # Vercel 部署配置（缓存/安全头/SPA重写）
│
├── public/
│   ├── manifest.json           # PWA 应用清单
│   └── sw.js                   # Service Worker（网络优先缓存策略）
│
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 主应用（三模式切换 + 暗黑模式 + 快捷键）
│   ├── index.css               # 全局样式（CSS变量 + 暗黑主题 + 响应式）
│   │
│   ├── lib/
│   │   ├── atoms/              # 🎨 原子设计系统
│   │   │   ├── colors.ts       #    11套配色方案
│   │   │   ├── layouts.ts      #    5种排版结构
│   │   │   ├── decorations.ts  #    4种装饰风格
│   │   │   ├── typography.ts   #    3种字体气质
│   │   │   ├── index.ts        #    组合引擎 (660种)
│   │   │   └── presets.ts      #    8套风格预设 + 微调参数
│   │   │
│   │   ├── render/             # 📄 渲染核心
│   │   │   ├── markdown.ts     #    Markdown → AST 解析器
│   │   │   ├── wechat.ts       #    公众号 HTML 渲染器（全内联CSS）
│   │   │   ├── xiaohongshu.ts  #    小红书分页渲染器（5种封面变体）
│   │   │   └── infographic.ts  #    信息图渲染引擎（4种模板）
│   │   │
│   │   ├── ai/                 # 🤖 AI 模块
│   │   │   ├── client.ts       #    统一AI客户端（9个提供商）
│   │   │   ├── analyzer.ts     #    文章分析器（自动推荐 + 离线回退）
│   │   │   └── image-gen.ts    #    AI文生图（4个提供商）
│   │   │
│   │   ├── fonts/              # ✒️ 字体模块
│   │   │   └── index.ts        #    字体加载管理器（10种字体/按需CDN）
│   │   │
│   │   ├── storage.ts          # 💾 本地存储（品牌预设/历史/引导）
│   │   │
│   │   └── export/             # 📤 导出工具
│   │       ├── clipboard.ts    #    剪贴板复制（双降级策略）
│   │       └── image.ts        #    图片导出（html2canvas + JSZip，懒加载）
│   │
│   └── components/             # 🧩 UI 组件
│       ├── ArticleInput.tsx    #    文章输入面板
│       ├── WechatPreview.tsx   #    公众号预览（375px模拟）
│       ├── XiaohongshuPreview.tsx  # 小红书预览（拖拽排序）
│       ├── ExportPanel.tsx     #    导出操作面板
│       ├── StylePanel.tsx      #    风格面板（6个Tab）
│       ├── FontPanel.tsx       #    字体选择面板
│       ├── InfographicPanel.tsx #   信息图编辑面板
│       ├── AIImageDialog.tsx   #    AI生图对话框
│       ├── ApiConfigDialog.tsx #    AI分析配置对话框
│       └── GuideOverlay.tsx    #    新手引导遮罩
│
└── docs/                       # 📚 产品文档（7份）
    ├── 01-PRODUCT-OVERVIEW.md
    ├── 02-FEATURE-SPEC.md
    ├── 03-DESIGN-SYSTEM.md
    ├── 04-TECH-ARCHITECTURE.md
    ├── 05-XIAOHONGSHU-MODE.md
    ├── 06-AI-IMAGE-GEN.md
    └── 07-DEVELOPMENT-PLAN.md
```

---

### 🛠️ 技术栈

| 层 | 技术 | 说明 |
|:---|:---|:---|
| 框架 | React 19 + TypeScript 5.7 | 组件化开发 |
| 构建 | Vite 6 | 极速 HMR |
| 排版输出 | 纯内联 CSS | 100% 微信兼容，零外部依赖 |
| Markdown | 自研轻量解析器 | 无第三方库，精准控制 AST |
| 图片生成 | html2canvas（动态加载） | 小红书模式导出 PNG |
| 打包导出 | JSZip（动态加载） | ZIP 批量下载 |
| 字体 | Google Fonts + jsDelivr | 10种免费商用字体，按需加载 |
| AI | 9 个提供商统一接口 | 通义千问/DeepSeek/豆包/OpenAI/Gemini... |
| 存储 | localStorage | 品牌预设 + 历史记录 + 用户偏好 |
| PWA | Service Worker + Manifest | 离线可用，可安装到桌面 |
| 部署 | Vercel | 智能缓存 + 安全头 + SPA 重写 |

---

### 📦 构建产物

```
dist/index.html                            2.62 kB │ gzip:  1.04 kB
dist/assets/index.css                      2.49 kB │ gzip:  0.81 kB
dist/assets/jszip.min.js                  97.54 kB │ gzip: 30.32 kB  (懒加载)
dist/assets/html2canvas.esm.js           202.38 kB │ gzip: 48.04 kB  (懒加载)
dist/assets/index.js                     310.79 kB │ gzip: 93.76 kB
```

> html2canvas 和 JSZip 通过 `dynamic import()` 懒加载，首屏仅加载主包 ~94KB gzip。

---

### 🗺️ 开发路线图

```
Phase 1 ✅  → MVP：公众号排版核心（粘贴→预览→复制）
Phase 2 ✅  → 四维度选择面板 + 8套预设 + 微调滑条 + 随机组合
Phase 3 ✅  → 小红书图片组生成（自动分页 + HTML→Canvas→PNG）
Phase 4 ✅  → 信息图引擎 + AI文生图 + 品牌预设 + 历史记录 + 新手引导
Phase 5 ✅  → AI文章分析（9个提供商）+ 字体管理器 + 移动端适配
Phase 6 ✅  → 暗黑模式 + 键盘快捷键 + 封面5变体 + 拖拽排序 + SEO/PWA + Vercel优化
Phase 7 🔲  → 多语言支持 + 模板市场 + 协作编辑 + 更多导出格式
```

---

### 🤝 参与贡献

欢迎贡献！无论是 Bug 修复、新配色方案、新排版结构，还是文档改进都非常欢迎。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

---

### 📄 许可

[MIT License](LICENSE) — 自由使用，开源万岁。

---
---

<a name="-english-documentation"></a>

<div align="center">

## 🇺🇸 English Documentation

</div>

### 💡 What is YunType?

**YunType** (云中书, literally "Book in the Clouds") is a **zero-backend, zero-login AI typesetting engine** that helps WeChat Official Account and Xiaohongshu (Little Red Book) creators generate **professional layouts instantly**.

> No design skills needed. No subscription. Paste your article, pick a style, copy and go.

```
📋 Paste Article  →  🎨 AI Recommends Layout  →  🔧 Fine-tune  →  📎 Copy to WeChat / 📸 Download Images
```

---

### ✨ Key Features

| Feature | Description |
|:---:|:---|
| 🎨 **660 Layout Combinations** | 11 colors × 5 layouts × 4 decorations × 3 fonts — atomic design, never repeat |
| 🤖 **AI Smart Matching** | 9 AI providers (Qwen/DeepSeek/Doubao/OpenAI/Gemini...), auto-match best layout |
| 🎚️ **Slider Fine-tuning** | Adjust "feel" not parameters — color warmth, decoration density, spacing... |
| 📝 **WeChat Mode** | Outputs inline-CSS rich text, directly paste into WeChat editor |
| 📸 **Xiaohongshu Mode** | Auto-paginate into image carousels, 5 cover variants, drag-to-reorder, ZIP export |
| 📊 **Infographic Mode** | Flowcharts / comparison tables / knowledge cards / timelines |
| 🎨 **AI Image Generation** | Integrated with Tongyi Wanxiang / Doubao / OpenAI DALL-E / Gemini |
| ✒️ **10 Fonts** | On-demand CDN loading, category browsing, separate title/body selection |
| 🌙 **Dark Mode** | Eye-friendly dark theme, Ctrl+D toggle, persisted in localStorage |
| ⌨️ **Keyboard Shortcuts** | Ctrl+Shift+R random / Ctrl+E export / Ctrl+D dark mode |
| 💼 **Brand Presets** | Save up to 20 brand presets, one-click apply |
| 🕐 **History** | Auto-save last 10 layout records |
| 📱 **Mobile Responsive** | Tablet / phone / small screen fully adapted |
| 🔑 **Zero Barrier** | Zero backend, zero account, zero paywall. Core features work 100% offline |

---

### 🎨 Atomic Design System

YunType doesn't use "templates". It uses **free combination of 4 atomic dimensions**:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Layout = Color Scheme × Structure × Decoration     │
│            × Typography                              │
│                                                      │
│            11 × 5 × 4 × 3 = 660 unique combos       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

#### 🌈 Dimension 1: 11 Color Schemes

**Light Themes (8)**

| ID | Name | Primary | Best For |
|:---:|:---|:---:|:---|
| L1 | 🍵 Milk Tea Warmth | `#C8A882` | Lifestyle, Food |
| L2 | 🌿 Mint Fresh | `#2D9F83` | Health, Eco |
| L3 | 🍑 Peach Vitality | `#FF7B54` | Beauty, Sports |
| L4 | 🌫️ Ash Elegance | `#6B6B6B` | Business, Tech |
| L5 | 💜 Wisteria Literary | `#8B6FC0` | Arts, Books |
| L6 | 🌊 Azure Classic | `#5B8FA8` | Travel, Culture |
| L7 | 🌸 Sakura Romance | `#D4729C` | Emotion, Feminine |
| L8 | 🏖️ Sunset Orange | `#E8914F` | Travel, Lifestyle |

**Dark Themes (3)**

| ID | Name | Primary | Best For |
|:---:|:---|:---:|:---|
| D1 | 🌙 Midnight Gold | `#D4A843` | Premium Brand |
| D2 | 🖤 Deep Space | `#00D4AA` | Tech Product |
| D3 | 🍷 Wine Dark | `#C75B5B` | Luxury, Wine |

---

#### 📐 Dimension 2: 5 Layout Structures

| ID | Name | Character | Best For |
|:---:|:---|:---|:---|
| T1 | 📚 Compact Knowledge | High density, tight paragraphs | Tutorials, Knowledge |
| T2 | 📖 Comfortable Reading | Wide spacing, relaxed rhythm | Long-form, Essays |
| T3 | 🗞️ Magazine Pictorial | Drop caps, visual impact | Brand stories, Travel |
| T4 | 📋 Checklist Card | Card-based, modular info | Reviews, Guides |
| T5 | 💬 Dialogue Interview | Chat bubbles, role distinction | Interviews, FAQ |

---

#### 🎭 Dimension 3: 4 Decoration Styles

| ID | Name | Visual Effect |
|:---:|:---|:---|
| S1 | ✏️ Minimal Lines | Thin dividers, breathing room, clean |
| S2 | 🖼️ Card Containers | Rounded cards, soft shadows, modular |
| S3 | 🌸 Gradient Accents | Gradient heading backgrounds, soft transitions |
| S4 | 💎 Geometric Patterns | Geometric blocks, title prefixes, bold design |

---

#### ✒️ Dimension 4: 3 Typography Moods

| ID | Name | Font | Mood |
|:---:|:---|:---|:---|
| F1 | 🏢 Modern Clean | Noto Sans SC | Professional, universal |
| F2 | 📜 Classical Serif | Noto Serif SC | Literary, elegant |
| F3 | 🎨 Playful Fun | ZCOOL QingKe HuangYou | Youthful, creative |

---

### 📸 Xiaohongshu Mode

| Feature | Description |
|:---:|:---|
| 📐 **Smart Pagination** | Auto-split content by paragraphs for beautiful layouts |
| 🎨 **5 Cover Variants** | Classic / Bold / Minimal / Card / Magazine |
| 🖱️ **Drag & Drop Reorder** | Rearrange pages after generation |
| 🏷️ **Enhanced Ending Page** | CTA buttons (Like/Save/Share) + Brand section + Page count |
| 📦 **ZIP Export** | One-click download all images, auto-numbered |

---

### 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yuanbw2025/yuntype.git

# 2. Install dependencies
cd yuntype
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# → http://localhost:5173
```

---

### 🛠️ Tech Stack

| Layer | Tech | Note |
|:---|:---|:---|
| Framework | React 19 + TypeScript 5.7 | Component-driven |
| Build | Vite 6 | Instant HMR |
| Layout Output | Pure Inline CSS | 100% WeChat compatible, zero external deps |
| Markdown | Custom Lightweight Parser | No 3rd-party lib, precise AST control |
| Image Export | html2canvas (lazy-loaded) | Xiaohongshu mode PNG export |
| ZIP Export | JSZip (lazy-loaded) | Batch download |
| Fonts | Google Fonts + jsDelivr | 10 free commercial fonts, on-demand loading |
| AI | 9 Providers Unified Interface | Qwen/DeepSeek/Doubao/OpenAI/Gemini... |
| Storage | localStorage | Brand presets + History + Preferences |
| PWA | Service Worker + Manifest | Offline capable, installable |
| Deploy | Vercel | Smart cache + Security headers + SPA rewrite |

---

### 🗺️ Roadmap

```
Phase 1 ✅  → MVP: WeChat layout core (paste → preview → copy)
Phase 2 ✅  → 4-dimension selector + 8 presets + sliders + random
Phase 3 ✅  → Xiaohongshu image carousel (auto-paginate + Canvas)
Phase 4 ✅  → Infographics + AI image gen + Brand presets + History + Onboarding
Phase 5 ✅  → AI article analysis (9 providers) + Font manager + Mobile responsive
Phase 6 ✅  → Dark mode + Shortcuts + 5 cover variants + Drag reorder + SEO/PWA + Vercel
Phase 7 🔲  → i18n + Template marketplace + Collaboration + More export formats
```

---

### 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new color schemes, new layout structures, or documentation improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

### 📄 License

[MIT License](LICENSE) — Free to use. Open source forever.

---

<div align="center">

**Made with ☁️ by [yuanbw2025](https://github.com/yuanbw2025)**

*云中谁寄锦书来？*

</div>
