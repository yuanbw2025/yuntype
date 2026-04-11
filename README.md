<div align="center">

# ☁️ 云中书 YunType

**AI 驱动的排版引擎 · 660种原子组合 · 粘贴即排版**

*Paste your article. Get stunning layouts. Copy to WeChat & Xiaohongshu.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Combinations](https://img.shields.io/badge/排版组合-660种-FF6B6B)](/)
[![WeChat Compatible](https://img.shields.io/badge/微信公众号-兼容-07C160?logo=wechat&logoColor=white)](/)

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
| 🤖 **AI 智能推荐** | 分析文章内容和文风，自动匹配最佳排版方案 |
| 🎚️ **滑条微调** | 调"感觉"而不是调参数 — 色温、装饰密度、间距... |
| 📝 **公众号模式** | 输出微信兼容的内联CSS富文本，直接粘贴到公众号编辑器 |
| 📸 **小红书模式** | 自动分页生成图片组，支持16种免费商用字体 |
| 🔑 **自带API Key** | 零后端、零账号、零付费墙，核心功能完全离线可用 |

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
| L1 | 🍵 奶茶温柔 | ![#C8A882](https://via.placeholder.com/12/C8A882/C8A882.png) `#C8A882` | 生活随笔、美食 |
| L2 | 🌿 薄荷清新 | ![#2D9F83](https://via.placeholder.com/12/2D9F83/2D9F83.png) `#2D9F83` | 健康、环保 |
| L3 | 🍑 蜜桃活力 | ![#FF7B54](https://via.placeholder.com/12/FF7B54/FF7B54.png) `#FF7B54` | 美妆、运动 |
| L4 | 🌫️ 烟灰高级 | ![#6B6B6B](https://via.placeholder.com/12/6B6B6B/6B6B6B.png) `#6B6B6B` | 商务、科技 |
| L5 | 💜 藤紫文艺 | ![#8B6FC0](https://via.placeholder.com/12/8B6FC0/8B6FC0.png) `#8B6FC0` | 文艺、读书 |
| L6 | 🌊 天青雅致 | ![#5B8FA8](https://via.placeholder.com/12/5B8FA8/5B8FA8.png) `#5B8FA8` | 旅行、人文 |
| L7 | 🌸 樱花浪漫 | ![#D4729C](https://via.placeholder.com/12/D4729C/D4729C.png) `#D4729C` | 情感、女性 |
| L8 | 🏖️ 落日暖橘 | ![#E8914F](https://via.placeholder.com/12/E8914F/E8914F.png) `#E8914F` | 旅行、生活 |

</td>
<td>

| 编号 | 名称 | 主色 | 适合 |
|:---:|:---:|:---:|:---|
| D1 | 🌙 墨夜金字 | ![#D4A843](https://via.placeholder.com/12/D4A843/D4A843.png) `#D4A843` | 高端品牌 |
| D2 | 🖤 深空科技 | ![#00D4AA](https://via.placeholder.com/12/00D4AA/00D4AA.png) `#00D4AA` | 科技产品 |
| D3 | 🍷 暗夜酒红 | ![#C75B5B](https://via.placeholder.com/12/C75B5B/C75B5B.png) `#C75B5B` | 品酒、高级 |

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
├── index.html                  # 入口 HTML
├── package.json                # React 18 + TypeScript + Vite
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
│
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 主应用（左右分栏布局）
│   ├── index.css               # 全局样式
│   │
│   ├── lib/
│   │   ├── atoms/              # 🎨 原子设计系统
│   │   │   ├── colors.ts       #    11套配色方案
│   │   │   ├── layouts.ts      #    5种排版结构
│   │   │   ├── decorations.ts  #    4种装饰风格
│   │   │   ├── typography.ts   #    3种字体气质
│   │   │   └── index.ts        #    组合引擎 (660种)
│   │   │
│   │   ├── render/             # 📄 渲染核心
│   │   │   ├── markdown.ts     #    Markdown → AST 解析器
│   │   │   └── wechat.ts       #    公众号 HTML 渲染器（全内联CSS）
│   │   │
│   │   └── export/             # 📤 导出工具
│   │       └── clipboard.ts    #    剪贴板复制（双降级策略）
│   │
│   └── components/             # 🧩 UI 组件
│       ├── ArticleInput.tsx    #    文章输入面板
│       ├── WechatPreview.tsx   #    公众号预览（375px模拟）
│       └── ExportPanel.tsx     #    导出操作面板
│
└── docs/                       # 📚 产品文档（7份）
    ├── 01-PRODUCT-OVERVIEW.md  #    产品总览
    ├── 02-FEATURE-SPEC.md      #    功能规格（10个模块）
    ├── 03-DESIGN-SYSTEM.md     #    设计系统（完整原子定义）
    ├── 04-TECH-ARCHITECTURE.md #    技术架构
    ├── 05-XIAOHONGSHU-MODE.md  #    小红书模式
    ├── 06-AI-IMAGE-GEN.md      #    AI图片生成
    └── 07-DEVELOPMENT-PLAN.md  #    开发计划
```

---

### 🛠️ 技术栈

| 层 | 技术 | 说明 |
|:---|:---|:---|
| 框架 | React 18 + TypeScript 5.7 | 组件化开发 |
| 构建 | Vite 6 | 极速 HMR |
| 排版输出 | 纯内联 CSS | 100% 微信兼容，零外部依赖 |
| Markdown | 自研轻量解析器 | 无第三方库，精准控制 AST |
| 图片生成 | html2canvas | 小红书模式导出 PNG |
| 字体 | Google Fonts + jsDelivr | 16种免费商用字体 |
| 部署 | Vercel | 零配置自动部署 |

---

### 🗺️ 开发路线图

```
Phase 1 ✅ (2周)  → MVP：公众号排版核心（粘贴→预览→复制）
                     已完成：原子系统 + 渲染引擎 + UI组件
                     
Phase 2 🔲 (1周)  → AI 分析 + 四维度选择面板 + 微调滑条

Phase 3 🔲 (2周)  → 小红书图片组生成（自动分页 + 16种字体）

Phase 4 🔲 (1-2周) → AI 生图 + 程序化信息图 + 性能优化
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
| 🤖 **AI Smart Matching** | Analyzes article content and writing style, recommends the best layout |
| 🎚️ **Slider Fine-tuning** | Adjust "feel" not parameters — color warmth, decoration density, spacing... |
| 📝 **WeChat Mode** | Outputs inline-CSS rich text, directly paste into WeChat editor |
| 📸 **Xiaohongshu Mode** | Auto-paginate into image carousels, 16 free commercial fonts |
| 🔑 **Bring Your Own API Key** | Zero backend, zero account, zero paywall. Core features work 100% offline |

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
| L1 | 🍵 Milk Tea Warmth | ![#C8A882](https://via.placeholder.com/12/C8A882/C8A882.png) `#C8A882` | Lifestyle, Food |
| L2 | 🌿 Mint Fresh | ![#2D9F83](https://via.placeholder.com/12/2D9F83/2D9F83.png) `#2D9F83` | Health, Eco |
| L3 | 🍑 Peach Vitality | ![#FF7B54](https://via.placeholder.com/12/FF7B54/FF7B54.png) `#FF7B54` | Beauty, Sports |
| L4 | 🌫️ Ash Elegance | ![#6B6B6B](https://via.placeholder.com/12/6B6B6B/6B6B6B.png) `#6B6B6B` | Business, Tech |
| L5 | 💜 Wisteria Literary | ![#8B6FC0](https://via.placeholder.com/12/8B6FC0/8B6FC0.png) `#8B6FC0` | Arts, Books |
| L6 | 🌊 Azure Classic | ![#5B8FA8](https://via.placeholder.com/12/5B8FA8/5B8FA8.png) `#5B8FA8` | Travel, Culture |
| L7 | 🌸 Sakura Romance | ![#D4729C](https://via.placeholder.com/12/D4729C/D4729C.png) `#D4729C` | Emotion, Feminine |
| L8 | 🏖️ Sunset Orange | ![#E8914F](https://via.placeholder.com/12/E8914F/E8914F.png) `#E8914F` | Travel, Lifestyle |

**Dark Themes (3)**

| ID | Name | Primary | Best For |
|:---:|:---|:---:|:---|
| D1 | 🌙 Midnight Gold | ![#D4A843](https://via.placeholder.com/12/D4A843/D4A843.png) `#D4A843` | Premium Brand |
| D2 | 🖤 Deep Space | ![#00D4AA](https://via.placeholder.com/12/00D4AA/00D4AA.png) `#00D4AA` | Tech Product |
| D3 | 🍷 Wine Dark | ![#C75B5B](https://via.placeholder.com/12/C75B5B/C75B5B.png) `#C75B5B` | Luxury, Wine |

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
| Framework | React 18 + TypeScript 5.7 | Component-driven |
| Build | Vite 6 | Instant HMR |
| Layout Output | Pure Inline CSS | 100% WeChat compatible, zero external deps |
| Markdown | Custom Lightweight Parser | No 3rd-party lib, precise AST control |
| Image Export | html2canvas | Xiaohongshu mode PNG export |
| Fonts | Google Fonts + jsDelivr | 16 free commercial fonts |
| Deploy | Vercel | Zero-config auto deploy |

---

### 🗺️ Roadmap

```
Phase 1 ✅ (2 weeks)  → MVP: WeChat layout core (paste → preview → copy)
                         Done: Atomic system + render engine + UI components
                     
Phase 2 🔲 (1 week)   → AI analysis + 4-dimension selector panel + sliders

Phase 3 🔲 (2 weeks)  → Xiaohongshu image carousel (auto-paginate + 16 fonts)

Phase 4 🔲 (1-2 weeks) → AI image gen + infographics + optimization
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
