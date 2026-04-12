<div align="center">

# ☁️ 云中书 YunType

**AI 驱动的排版引擎 · 660种原子组合 · 粘贴即排版**

*Paste your article. Get stunning layouts. Copy to WeChat & Xiaohongshu.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Combinations](https://img.shields.io/badge/排版组合-660种-FF6B6B)](/)
[![AI Providers](https://img.shields.io/badge/AI提供商-11个-FF9900)](/)
[![MCP Ready](https://img.shields.io/badge/MCP-Ready-8B5CF6?logo=anthropic&logoColor=white)](/)
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

### 🚀 四种使用方式

云中书提供 **4 种使用方式**，覆盖从零代码到深度集成的所有场景：

| # | 方式 | 适合人群 | 一句话说明 |
|:---:|:---|:---|:---|
| 1️⃣ | [在线使用 Web App](#-方式一在线使用) | 所有人 | 打开网页，粘贴文章，一键排版 |
| 2️⃣ | [MCP Server 工具调用](#-方式二mcp-server) | Cline / Claude Code / Cursor 用户 | AI 助手直接调用 660 种排版，无需额外 API Key |
| 3️⃣ | [Prompt Skill 提示词技能](#-方式三prompt-skill) | OpenClaw / GPTs / Coze 用户 | 导入技能描述，让平台 AI 学会排版 |
| 4️⃣ | [扔给 AI 自行处理](#-方式四扔给-ai-自行处理) | 懒人 / 极客 | 把仓库链接扔给 AI，让它自己搞定 |

---

#### 📱 方式一：在线使用

最简单的方式，打开即用：

**在线地址**：[https://yuanbw2025.github.io/yuntype/](https://yuanbw2025.github.io/yuntype/) （或 Vercel 部署地址）

```
1. 打开网页
2. 粘贴你的 Markdown / 纯文本文章
3. AI 自动推荐排版（或手动选择 660 种组合）
4. 复制到微信公众号 / 下载小红书图片组
```

**本地运行**：

```bash
git clone https://github.com/yuanbw2025/yuntype.git
cd yuntype && npm install && npm run dev
# → http://localhost:5173
```

---

#### 🔌 方式二：MCP Server

> **MCP (Model Context Protocol)** 是 Anthropic 推出的开放协议，让 AI 助手能调用外部工具。云中书提供了 MCP Server，让 Cline / Claude Code / Cursor 等 AI 编辑器**直接调用 660 种排版组合**，无需自己的 AI API Key。

**安装与构建**：

```bash
cd yuntype/mcp-server
npm install
npm run build
```

**在 Cline 中配置**（`cline_mcp_settings.json`）：

```json
{
  "mcpServers": {
    "yuntype": {
      "command": "node",
      "args": ["<你的路径>/yuntype/mcp-server/dist/index.js"],
      "disabled": false
    }
  }
}
```

**在 Claude Code 中配置**：

```bash
claude mcp add yuntype node <你的路径>/yuntype/mcp-server/dist/index.js
```

**在 Cursor 中配置**（`.cursor/mcp.json`）：

```json
{
  "mcpServers": {
    "yuntype": {
      "command": "node",
      "args": ["<你的路径>/yuntype/mcp-server/dist/index.js"]
    }
  }
}
```

**MCP 提供的工具**：

| 工具名 | 功能 | 参数 |
|:---|:---|:---|
| `yuntype_list_styles` | 列出所有可用的配色/排版/装饰/字体选项 | 无 |
| `yuntype_random_style` | 随机生成一个排版组合 | 无 |
| `yuntype_format` | 用指定风格排版 Markdown 文章 | `markdown`, `color`, `layout`, `decoration`, `typography` |
| `yuntype_preset` | 使用预设风格快速排版 | `markdown`, `preset`（如 tech/literary/food 等） |

**MCP 资源**：

| 资源 URI | 说明 |
|:---|:---|
| `yuntype://style-guide` | 风格推荐指南，帮助 AI 根据文章类型选择最佳排版 |

**使用示例**（在 AI 助手中）：

```
"帮我把这篇文章用云中书排版，用科技风格"
→ AI 自动调用 yuntype_preset(markdown=文章内容, preset="tech")
→ 返回微信兼容的 HTML，直接粘贴到公众号编辑器
```

---

#### 📜 方式三：Prompt Skill（⭐ 推荐）

> **不需要任何 API Key，直接用你的 Claude Pro / Gemini 订阅额度！** 在 claude.ai 的 Artifacts 画布或 Google AI Studio 的 Canvas 中实时预览排版效果，自由搭配、自由调试。

**完整版 Skill**（推荐）— 包含全部 660 种组合的完整数据和渲染规则，AI 直接变成排版引擎：

1. 打开 [`yuntype/skill/yuntype-complete-skill.md`](skill/yuntype-complete-skill.md)
2. 复制全部内容到 claude.ai 的 Project System Prompt / AI Studio 的 System Instructions
3. 发送文章 → AI 分析推荐 → **Artifacts/Canvas 画布直接预览** → 说"换个暖色"即时调整 → 满意后复制 HTML

```
你：帮我排版这篇文章（粘贴文章）
AI：推荐 L4烟灰高级 + T1紧凑知识型 + S1极简线条 + F1现代简约
   （画布中显示排版效果）

你：颜色太冷了，换个暖色
AI：切换为 L1奶茶温柔（画布立即刷新）

你：装饰想要卡片风格
AI：切换为 S2色块标签（画布更新）

你：完美！
AI：请在画布中复制 HTML → 粘贴到公众号编辑器
```

**轻量版 Skill** — 仅做推荐，引导用户去 Web App 操作：

- 文件：[`yuntype/skill/yuntype-skill.md`](skill/yuntype-skill.md)
- 适用于 OpenClaw / GPTs / Coze 等不支持画布的平台

> 💡 完整版 Skill 的核心优势：**用订阅额度代替 API Key**。你订阅的 Claude Pro / Gemini Advanced 本身就是排版引擎，不需要额外付费。

---

#### 🤖 方式四：扔给 AI 自行处理

> 最省事的方式 —— 把仓库链接直接扔给你的 AI 助手，让它自己阅读代码、理解排版逻辑、帮你排版。

**操作方法**：

直接把以下内容发给你的 Claude Code / OpenClaw / Cline / Cursor / ChatGPT：

```
请阅读这个开源排版工具的仓库：https://github.com/yuanbw2025/yuntype
理解它的 660 种排版组合（11配色 × 5排版 × 4装饰 × 3字体），
然后帮我把以下文章用"科技风格"排版成微信公众号兼容的 HTML：

（粘贴你的文章）
```

> 足够聪明的 AI 会自己读懂 `src/lib/atoms/` 下的原子数据和 `src/lib/render/wechat.ts` 的渲染逻辑，然后生成排版后的 HTML。

---

### ✨ 核心特性

| 特性 | 说明 |
|:---:|:---|
| 🎨 **660种排版组合** | 11配色 × 5排版 × 4装饰 × 3字体，原子化组合永不撞款 |
| 🤖 **AI 智能推荐** | 11大AI提供商（通义千问/DeepSeek/豆包/OpenAI/Gemini/Claude/Grok等），分析文章自动匹配最佳排版 |
| 🔌 **MCP Server** | 让 Cline/Claude Code/Cursor 直接调用排版能力，无需额外 API Key |
| 📜 **Prompt Skill** | 在 OpenClaw/GPTs/Coze 中作为技能使用 |
| 🎚️ **滑条微调** | 调"感觉"而不是调参数 — 色温、装饰密度、间距... |
| 📝 **公众号模式** | 输出微信兼容的内联CSS富文本，直接粘贴到公众号编辑器 |
| 📸 **小红书模式** | 自动分页生成图片组，5种封面变体，拖拽排序，ZIP打包导出 |
| 📊 **信息图模式** | 流程图/对比表/知识卡片/时间线，程序化生成精美信息图 |
| 🎨 **AI 文生图** | 集成通义万相/豆包/OpenAI/Gemini，一键生成配图 |
| ✒️ **10种字体** | 按需CDN加载，分类浏览，标题/正文独立选择 |
| 🌙 **暗黑模式** | 深色主题，Ctrl+D一键切换 |
| ⌨️ **键盘快捷键** | Ctrl+Shift+R 随机组合 / Ctrl+E 导出 / Ctrl+D 暗黑模式 |
| 💼 **品牌预设** | 保存最多20套品牌预设，一键调用 |
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

#### 🌈 11套配色方案

| 浅色系 | 深色系 |
|:---|:---|
| 🍵 奶茶温柔 · 🌿 薄荷清新 · 🍑 蜜桃活力 · 🌫️ 烟灰高级 | 🌙 墨夜金字 |
| 💜 藤紫文艺 · 🌊 天青雅致 · 🌸 樱花浪漫 · 🏖️ 落日暖橘 | 🖤 深空科技 · 🍷 暗夜酒红 |

#### 📐 5种排版 · 🎭 4种装饰 · ✒️ 3种字体

| 排版 | 装饰 | 字体 |
|:---|:---|:---|
| 📚 紧凑知识型 | ✏️ 极简线条 | 🏢 思源黑体 |
| 📖 舒适阅读型 | 🖼️ 卡片容器 | 📜 思源宋体 |
| 🗞️ 杂志画报型 | 🌸 渐变装饰 | 🎨 活泼趣味体 |
| 📋 清单列表型 | 💎 几何装饰 | |
| 💬 对话访谈型 | | |

---

### 🤖 AI 能力

| 功能 | 支持的提供商 |
|:---:|:---|
| 📊 **文章分析** | 通义千问、DeepSeek、豆包、OpenAI、Gemini、Claude、Grok、Moonshot、智谱、SiliconFlow、自定义（共11个） |
| 🖼️ **AI 文生图** | 通义万相、豆包、OpenAI DALL-E、Google Gemini |
| 📈 **信息图生成** | 流程图、对比表、知识卡片、时间线 |

> 💡 自带 API Key 模式，数据不经过任何中间服务器，100%隐私安全。

---

### 🏗️ 项目结构

```
yuntype/
├── index.html                  # 入口 HTML
├── package.json                # React 19 + TypeScript + Vite 6
├── vite.config.ts              # Vite 配置
├── vercel.json                 # Vercel 部署配置
│
├── public/                     # 静态资源（PWA manifest + Service Worker）
│
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 主应用（三模式切换 + 暗黑模式 + 快捷键）
│   ├── index.css               # 全局样式
│   │
│   ├── lib/
│   │   ├── atoms/              # 🎨 原子设计系统（配色/排版/装饰/字体/组合引擎）
│   │   ├── render/             # 📄 渲染核心（Markdown解析/公众号/小红书/信息图）
│   │   ├── ai/                 # 🤖 AI 模块（11个提供商统一接口 + 文生图）
│   │   ├── fonts/              # ✒️ 字体管理器（10种字体/按需CDN）
│   │   ├── storage.ts          # 💾 本地存储
│   │   └── export/             # 📤 导出工具（剪贴板 + 图片）
│   │
│   └── components/             # 🧩 UI 组件
│
├── mcp-server/                 # 🔌 MCP Server（Model Context Protocol）
│   ├── package.json            #    依赖：@modelcontextprotocol/sdk
│   ├── tsconfig.json           #    TypeScript 配置
│   └── src/
│       └── index.ts            #    MCP 工具（4个工具 + 1个资源）
│
├── skill/                      # 📜 Prompt Skill
│   └── yuntype-skill.md        #    技能描述文件（OpenClaw/GPTs/Coze）
│
└── docs/                       # 📚 产品文档
```

---

### 🛠️ 技术栈

| 层 | 技术 | 说明 |
|:---|:---|:---|
| 框架 | React 19 + TypeScript 5.7 | 组件化开发 |
| 构建 | Vite 6 | 极速 HMR |
| 排版输出 | 纯内联 CSS | 100% 微信兼容 |
| AI | 11 个提供商统一接口 | 通义千问/DeepSeek/豆包/OpenAI/Gemini/Claude/Grok/Moonshot/智谱/SiliconFlow/自定义 |
| MCP | @modelcontextprotocol/sdk | Cline/Claude Code/Cursor 工具调用 |
| PWA | Service Worker + Manifest | 离线可用，可安装到桌面 |
| 部署 | Vercel | 智能缓存 + SPA 重写 |

---

### 🗺️ 开发路线图

```
Phase 1 ✅  → MVP：公众号排版核心
Phase 2 ✅  → 四维度选择面板 + 8套预设 + 微调滑条
Phase 3 ✅  → 小红书图片组生成
Phase 4 ✅  → 信息图引擎 + AI文生图 + 品牌预设
Phase 5 ✅  → AI文章分析（9→11个提供商）+ 字体管理器 + 移动端适配
Phase 6 ✅  → 暗黑模式 + 快捷键 + 封面5变体 + SEO/PWA
Phase 7 ✅  → MCP Server + Prompt Skill + Claude/Grok支持
Phase 8 🔲  → 多语言支持 + 模板市场 + 协作编辑
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

**YunType** (云中书, literally "Book in the Clouds") is a **zero-backend, zero-login AI typesetting engine** that helps WeChat Official Account and Xiaohongshu creators generate **professional layouts instantly**.

> No design skills needed. No subscription. Paste your article, pick a style, copy and go.

---

### 🚀 Four Ways to Use

| # | Method | For | Description |
|:---:|:---|:---|:---|
| 1️⃣ | [Online Web App](#-method-1-online-web-app) | Everyone | Open browser, paste article, get layout |
| 2️⃣ | [MCP Server](#-method-2-mcp-server) | Cline / Claude Code / Cursor users | AI assistant calls 660 layouts directly |
| 3️⃣ | [Prompt Skill](#-method-3-prompt-skill) | OpenClaw / GPTs / Coze users | Import skill description for AI platforms |
| 4️⃣ | [Let AI Figure It Out](#-method-4-let-ai-figure-it-out) | Lazy geniuses | Throw the repo link to your AI |

---

#### 📱 Method 1: Online Web App

**Live Demo**: [https://yuanbw2025.github.io/yuntype/](https://yuanbw2025.github.io/yuntype/)

```bash
# Or run locally:
git clone https://github.com/yuanbw2025/yuntype.git
cd yuntype && npm install && npm run dev
# → http://localhost:5173
```

---

#### 🔌 Method 2: MCP Server

> **MCP (Model Context Protocol)** is Anthropic's open protocol for AI tool invocation. YunType's MCP Server lets Cline / Claude Code / Cursor **directly call 660 layout combinations** — no extra API key needed.

**Install & Build**:

```bash
cd yuntype/mcp-server
npm install && npm run build
```

**Configure in Cline** (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "yuntype": {
      "command": "node",
      "args": ["<your-path>/yuntype/mcp-server/dist/index.js"]
    }
  }
}
```

**Configure in Claude Code**:

```bash
claude mcp add yuntype node <your-path>/yuntype/mcp-server/dist/index.js
```

**Available MCP Tools**:

| Tool | Description |
|:---|:---|
| `yuntype_list_styles` | List all available color/layout/decoration/typography options |
| `yuntype_random_style` | Generate a random style combination |
| `yuntype_format` | Format Markdown with specified style parameters |
| `yuntype_preset` | Quick format using preset styles (tech/literary/food...) |

---

#### 📜 Method 3: Prompt Skill

Import [`yuntype/skill/yuntype-skill.md`](skill/yuntype-skill.md) into OpenClaw / GPTs / Coze as a system prompt or knowledge base. The AI will learn YunType's layout rules and generate formatted HTML through conversation.

---

#### 🤖 Method 4: Let AI Figure It Out

Just send this to your AI assistant (Claude Code / OpenClaw / Cline / ChatGPT):

```
Read this open-source typesetting tool: https://github.com/yuanbw2025/yuntype
Understand its 660 layout combinations (11 colors × 5 layouts × 4 decorations × 3 fonts),
then format my article in "tech style" as WeChat-compatible HTML:

(paste your article)
```

---

### ✨ Key Features

| Feature | Description |
|:---:|:---|
| 🎨 **660 Layout Combinations** | 11 colors × 5 layouts × 4 decorations × 3 fonts — atomic design |
| 🤖 **AI Smart Matching** | 11 AI providers (Qwen/DeepSeek/Doubao/OpenAI/Gemini/Claude/Grok...) |
| 🔌 **MCP Server** | Direct tool invocation from Cline/Claude Code/Cursor |
| 📜 **Prompt Skill** | Use as a skill in OpenClaw/GPTs/Coze |
| 📝 **WeChat Mode** | Inline-CSS output, paste directly into WeChat editor |
| 📸 **Xiaohongshu Mode** | Auto-paginate into image carousels, 5 cover variants, ZIP export |
| 📊 **Infographic Mode** | Flowcharts / comparison tables / knowledge cards / timelines |
| 🎨 **AI Image Generation** | Tongyi Wanxiang / Doubao / DALL-E / Gemini |
| 🌙 **Dark Mode** | Ctrl+D toggle, persistent |
| 🔑 **Zero Barrier** | No backend, no account, no paywall |

---

### 🛠️ Tech Stack

| Layer | Tech |
|:---|:---|
| Framework | React 19 + TypeScript 5.7 + Vite 6 |
| Layout Output | Pure Inline CSS (100% WeChat compatible) |
| AI | 11 Providers Unified Interface |
| MCP | @modelcontextprotocol/sdk |
| PWA | Service Worker + Manifest (offline capable) |
| Deploy | Vercel |

---

### 📄 License

[MIT License](LICENSE) — Free to use. Open source forever.

---

<div align="center">

**Made with ☁️ by [yuanbw2025](https://github.com/yuanbw2025)**

*云中谁寄锦书来？*

</div>
