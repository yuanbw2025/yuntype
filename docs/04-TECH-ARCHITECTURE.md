# 云中书 / YunType — 技术架构

> 本文档定义技术架构、微信CSS兼容方案、API接入规范、数据流设计。

---

## 1. 架构总览

```
┌──────────────────────────────────────────────┐
│              用户浏览器（纯前端）               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │  输入层   │  │  逻辑层  │  │   输出层     │ │
│  │          │  │         │  │             │ │
│  │ Markdown │→│ 原子组合  │→│ HTML渲染器   │ │
│  │ Parser   │  │ 引擎    │  │ (公众号)    │ │
│  │          │  │         │  │             │ │
│  │ 文章输入  │  │ 微调映射 │  │ Canvas渲染器 │ │
│  │          │  │         │  │ (小红书)    │ │
│  └─────────┘  └────┬────┘  └─────────────┘ │
│                    │                         │
│              ┌─────┴─────┐                   │
│              │  AI 服务层  │ ← 用户的API Key   │
│              │ (可选)     │                   │
│              └───────────┘                   │
│                                              │
│  存储: localStorage (配置/历史)               │
│  字体: Google Fonts CDN + jsDelivr CDN       │
│  部署: Vercel 静态托管                        │
└──────────────────────────────────────────────┘
```

**核心原则**: 零后端。所有计算在浏览器完成，AI调用直接从前端发起（CORS由API提供商处理）。

---

## 2. 目录结构

```
yuntype/
├── public/
│   └── fonts/                  # 本地字体文件（备用）
├── src/
│   ├── main.tsx                # 入口
│   ├── App.tsx                 # 主应用
│   ├── components/
│   │   ├── ArticleInput.tsx    # F1: 文章输入
│   │   ├── PlatformSwitch.tsx  # F2: 平台选择
│   │   ├── ApiConfig.tsx       # F3: API配置弹窗
│   │   ├── StylePanel.tsx      # F5+F6: 原子选择+微调面板
│   │   ├── Preview.tsx         # F7: 预览容器
│   │   ├── WechatPreview.tsx   # F7a: 公众号预览
│   │   ├── XhsPreview.tsx      # F7b: 小红书预览
│   │   ├── ExportPanel.tsx     # F8+F9: 导出按钮
│   │   └── Header.tsx          # 顶栏
│   ├── lib/
│   │   ├── atoms/
│   │   │   ├── colors.ts       # 11套配色数据
│   │   │   ├── layouts.ts      # 5种排版结构数据
│   │   │   ├── decorations.ts  # 4种装饰风格数据
│   │   │   ├── typography.ts   # 3种字体气质数据
│   │   │   └── index.ts        # 原子组合引擎
│   │   ├── ai/
│   │   │   ├── client.ts       # 统一AI API客户端
│   │   │   ├── analyzer.ts     # F4: 文章分析
│   │   │   ├── splitter.ts     # 小红书分段
│   │   │   └── image-gen.ts    # F10: AI生图
│   │   ├── render/
│   │   │   ├── wechat.ts       # 公众号HTML渲染器
│   │   │   ├── xiaohongshu.ts  # 小红书HTML渲染器
│   │   │   └── markdown.ts     # Markdown解析
│   │   ├── export/
│   │   │   ├── clipboard.ts    # 复制富文本
│   │   │   ├── download.ts     # 下载HTML
│   │   │   └── image.ts        # HTML→PNG→ZIP
│   │   ├── fonts.ts            # 字体加载管理
│   │   └── storage.ts          # localStorage 封装
│   ├── hooks/
│   │   ├── useAtoms.ts         # 原子组合状态
│   │   ├── useAI.ts            # AI调用状态
│   │   └── useExport.ts        # 导出状态
│   └── index.css               # 全局样式（工具界面用）
├── docs/                       # 本文档目录
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## 3. 微信公众号 CSS 兼容规范

### 白名单 CSS 属性

微信编辑器会过滤大部分CSS。以下是**确认可用**的属性：

```
✅ 可用:
color, background-color, background
font-size, font-weight, font-style, font-family（有限）
line-height, letter-spacing, word-spacing
text-align, text-indent, text-decoration
padding, padding-top/right/bottom/left
margin, margin-top/right/bottom/left
border, border-top/right/bottom/left
border-radius, border-color, border-style, border-width
width, max-width, height (部分)
display: inline, block, inline-block
vertical-align
box-sizing
opacity
overflow: hidden
white-space
word-break
```

```
❌ 不可用:
display: flex, grid
position: absolute, fixed, relative（不稳定）
transform, transition, animation
box-shadow（部分客户端不支持）
@media 媒体查询
@font-face 自定义字体
::before, ::after 伪元素
CSS 变量 (var())
calc()
```

### 渲染规则

1. **所有样式内联**: 不用 `<style>` 标签，不用 class
```html
<!-- ❌ 错误 -->
<style>.title { color: red; }</style>
<h2 class="title">标题</h2>

<!-- ✅ 正确 -->
<h2 style="color: red; font-size: 18px; font-weight: bold;">标题</h2>
```

2. **多列布局用 table**:
```html
<!-- ❌ 不能用 flex -->
<div style="display: flex;">...</div>

<!-- ✅ 用 table -->
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="width: 50%; padding: 8px;">左列</td>
    <td style="width: 50%; padding: 8px;">右列</td>
  </tr>
</table>
```

3. **SVG 内联**:
```html
<!-- ✅ 内联SVG（微信支持） -->
<svg width="20" height="20" style="vertical-align: middle;">
  <circle cx="10" cy="10" r="8" fill="#3B7DD8"/>
</svg>
```

4. **图片使用 section 包裹**:
```html
<section style="text-align: center; margin: 16px 0;">
  <img src="https://..." style="max-width: 100%; border-radius: 4px;" />
</section>
```

### 渲染器核心逻辑

```typescript
// wechat.ts - 公众号渲染器核心逻辑

function renderWechatHTML(
  markdownAST: MarkdownNode[],
  style: StyleCombo
): string {
  const { colors, layout, decoration, typography } = resolveStyle(style);
  
  let html = '';
  
  for (const node of markdownAST) {
    switch (node.type) {
      case 'heading':
        html += renderHeading(node, colors, layout, decoration, typography);
        break;
      case 'paragraph':
        html += renderParagraph(node, colors, layout, typography);
        break;
      case 'blockquote':
        html += renderBlockquote(node, colors, layout, decoration);
        break;
      case 'list':
        html += renderList(node, colors, layout, decoration);
        break;
      case 'code':
        html += renderCodeBlock(node, colors, layout);
        break;
      case 'hr':
        html += renderDivider(colors, decoration);
        break;
    }
  }
  
  // 包裹在外层容器中
  return `<section style="
    background-color: ${colors.contentBg};
    padding: ${layout.contentPadding};
    max-width: 100%;
    box-sizing: border-box;
  ">${html}</section>`;
}
```

---

## 4. AI API 接入规范

### 统一接口（OpenAI Compatible）

大部分国产 LLM 都兼容 OpenAI 的 `/chat/completions` 接口格式：

```typescript
// ai/client.ts

interface AIConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

async function callLLM(config: AIConfig, messages: Message[]): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: 0.3, // 低温度，确保稳定的JSON输出
      max_tokens: 500,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Gemini 特殊处理

Gemini 不兼容 OpenAI 格式，需要单独适配：

```typescript
async function callGemini(config: AIConfig, messages: Message[]): Promise<string> {
  const response = await fetch(
    `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      }),
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

### Claude 特殊处理

Claude API 格式略有不同，且有 CORS 限制（前端直接调用可能被拒）：

```typescript
// 注意：Claude API 不允许前端直接调用（CORS限制）
// 解决方案：
// 1. 用户使用第三方中转服务（如 OpenRouter）
// 2. 或者选择其他支持前端调用的提供商
```

### CORS 兼容性

| 提供商 | 前端直接调用 | 备注 |
|-------|------------|------|
| 千问 | ✅ 支持 | 正式支持前端调用 |
| 豆包 | ✅ 支持 | 需要在控制台开启CORS |
| DeepSeek | ✅ 支持 | |
| Kimi | ✅ 支持 | |
| GLM | ✅ 支持 | |
| OpenAI | ⚠️ 部分 | 需要设置 dangerouslyAllowBrowser |
| Claude | ❌ 不支持 | CORS限制，需要中转 |
| Gemini | ✅ 支持 | 使用API Key方式 |

---

## 5. 数据流设计

### 状态管理

```typescript
// 全局状态（使用 React Context 或 Zustand）

interface AppState {
  // 输入
  article: string;           // 文章原文
  platform: 'wechat' | 'xiaohongshu';
  
  // 原子选择
  atoms: {
    colorId: string;         // 'L1' ~ 'D3'
    layoutId: string;        // 'T1' ~ 'T5'
    decorationId: string;    // 'S1' ~ 'S4'
    typographyId: string;    // 'F1' ~ 'F3'
  };
  
  // 微调值
  tweaks: {
    colorTemp: number;       // 0-100
    brightness: number;      // 0-100
    decorationLevel: number; // 0-100
    spacing: number;         // 0-100
    borderRadius: number;    // 0-100
  };
  
  // AI 配置
  aiConfig: {
    llm: AIConfig | null;
    imageGen: AIConfig | null;
  };
  
  // AI 分析结果
  aiRecommendation: {
    atoms: typeof atoms;
    tweaks: typeof tweaks;
    reason: string;
  } | null;
  
  // 小红书模式
  xhsConfig: {
    aspectRatio: '3:4' | '1:1' | '16:9';
    pages: XhsPage[];       // 分页内容
  };
  
  // UI 状态
  isLoading: boolean;
  tweakPanelOpen: boolean;
}
```

### 数据流

```
用户输入文章
    ↓
Markdown 解析 → AST
    ↓
AI 分析（可选）→ 推荐原子组合
    ↓
原子组合 + 微调参数 → 计算最终样式
    ↓
├→ 公众号: AST + 最终样式 → 内联HTML
└→ 小红书: AST + 最终样式 + 字体 → HTML → Canvas → PNG
```

---

## 6. 关键技术决策

### 为什么用 html2canvas 而不是 Puppeteer？

| 方案 | 优势 | 劣势 |
|------|------|------|
| **html2canvas（选择）** | 纯前端，零后端 | 字体渲染可能有差异 |
| Puppeteer | 精确渲染 | 需要后端服务器 |
| dom-to-image | 更准确 | 维护不活跃 |
| modern-screenshot | 新库，基于html-to-image | 值得关注 |

**决策**: 先用 html2canvas，如果字体渲染有问题，尝试 modern-screenshot。

### 为什么不用富文本编辑器？

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Textarea + Markdown（选择）** | 简单、可靠、解析可控 | 不能所见即所得 |
| TipTap/ProseMirror | 所见即所得 | 复杂度高，排版控制困难 |
| Slate.js | 灵活 | 学习曲线陡 |

**决策**: MVP用textarea + Markdown，V2考虑增加富文本输入。

### 复制富文本的实现

```typescript
// export/clipboard.ts

async function copyRichText(html: string): Promise<void> {
  // 方法1: Clipboard API（现代浏览器）
  try {
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob }),
    ]);
    return;
  } catch (e) {
    // 降级方法
  }
  
  // 方法2: document.execCommand（兼容性更好）
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  
  const range = document.createRange();
  range.selectNodeContents(container);
  
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  
  document.execCommand('copy');
  document.body.removeChild(container);
}
```

---

## 7. 性能要求

| 指标 | 目标 |
|------|------|
| 首屏加载 | < 3秒 |
| 排版预览响应 | < 200ms |
| "换一个"切换 | < 100ms |
| 小红书图片生成（单张） | < 2秒 |
| AI分析响应 | < 10秒 |
| 字体加载 | 异步加载，不阻塞渲染 |

### 优化策略

1. **代码分割**: 小红书模式和AI模块懒加载
2. **字体按需加载**: 只加载当前选中的字体
3. **预览防抖**: 微调滑条 100ms debounce
4. **图片生成队列**: 小红书多张图片按序列生成，避免内存溢出

---

## 8. 错误处理与安全规范

### 错误处理策略

| 场景 | 处理方式 | 用户提示 |
|------|---------|---------|
| AI API 调用失败 | 重试1次，仍失败则降级为随机推荐 | "AI 分析暂时不可用，已为您随机推荐" |
| AI 返回非法 JSON | 正则提取 JSON 片段，失败则降级 | 同上 |
| API Key 无效 | 测试连接时即提示 | "API Key 验证失败，请检查后重试" |
| 网络超时（>10s） | AbortController 中断请求 | "请求超时，请检查网络后重试" |
| 剪贴板写入被拒 | 降级为 execCommand('copy') | "已复制（如未成功请手动 Ctrl+C）" |
| 字体加载失败 | 使用系统默认字体渲染 | 静默降级，不打断流程 |
| html2canvas 渲染失败 | 捕获异常，提示用户 | "图片生成失败，请尝试刷新页面" |
| localStorage 已满 | 清理最旧的历史记录 | 静默处理 |

### API Key 安全

1. **仅存 localStorage** — 永远不发送到我们自己的服务器
2. **页面显示时掩码** — 只显示前4位和后4位
3. **导出/分享排版时不携带 Key** — HTML 导出中不含任何凭据
4. **HTTPS only** — Vercel 默认强制 HTTPS，API 调用全部走 HTTPS

---

---

# V2 版本：骨架 × 插槽 技术架构追加

> V2 核心变更：渲染引擎从「平铺循环」升级为「骨架调度 + 插槽注册表」。
> 原有架构不变，以下为新增/改写的模块。

---

## 1. V2 目录结构变更

```
yuntype/src/lib/
├── atoms/
│   ├── colors.ts           # 不变
│   ├── layouts.ts          # 不变（保留为基础参数层）
│   ├── decorations.ts      # 不变（保留为基础兼容层）
│   ├── typography.ts       # 不变
│   ├── presets.ts          # 不变
│   ├── index.ts            # ✏️ 改写：扩展 StyleCombo，加入 blueprint + slots
│   ├── blueprints.ts       # 🆕 骨架注册表（15+种布局骨架）
│   ├── slots/              # 🆕 插槽注册表目录
│   │   ├── index.ts        # 插槽总入口 + 查询函数
│   │   ├── title.ts        # 标题变体（20+种）
│   │   ├── quote.ts        # 引用变体（15+种）
│   │   ├── list.ts         # 列表变体（12+种）
│   │   ├── divider.ts      # 分割线变体（15+种）
│   │   ├── paragraph.ts    # 段落变体（8+种）
│   │   ├── section.ts      # 节区变体（10+种）
│   │   ├── frame.ts        # 边框装饰变体（9+种）
│   │   ├── ornament.ts     # 装饰花纹变体（6+种）
│   │   ├── callout.ts      # 提示框变体（6+种）
│   │   └── badge.ts        # 标签徽章变体（6+种）
│   └── coordinator.ts      # 🆕 协调引擎
├── render/
│   ├── markdown.ts         # 不变
│   ├── wechat.ts           # ✏️ 改写：从平铺循环改为骨架调度
│   └── xiaohongshu.ts      # 后续改写
└── ...

yuntype/src/components/
├── ...existing...
├── LayoutPanel.tsx          # 🆕 骨架选择 + 插槽调节面板
└── SlotSelector.tsx         # 🆕 单个插槽的下拉选择器组件
```

---

## 2. 骨架调度器架构

### 渲染流程对比

**V1（当前）: 平铺循环**
```
Markdown → parseMarkdown() → MarkdownNode[]
  → for each node:
      switch(node.type) → renderHeading/renderParagraph/...
  → 拼接 HTML
  → 包裹外层容器
```

**V2（新）: 骨架调度**
```
Markdown → parseMarkdown() → MarkdownNode[]
  → groupBySection(nodes) → Section[] （按 h2 分组）
  → blueprint.render.wrapDocument(
      sections.map((sec, i) =>
        blueprint.render.wrapSection(
          slots.title.render(sec.heading),
          sec.content.map(node => renderNode(node, slots, style)).join(''),
          i, style
        )
      ).join(''),
      style
    )
```

### 核心函数签名

```typescript
// render/wechat.ts — V2 改写

export function renderWechatHTML(markdown: string, style: StyleComboV2): string {
  const nodes = parseMarkdown(markdown)
  const sections = groupBySection(nodes)
  const { blueprint, slots } = style
  return blueprint.render.wrapDocument(
    renderSections(sections, blueprint, slots, style),
    style
  )
}

function groupBySection(nodes: MarkdownNode[]): Section[] { /* h2分组 */ }

function renderNode(node: MarkdownNode, slots: ResolvedSlots, style: StyleComboV2): string {
  switch (node.type) {
    case 'heading': return slots.title.render({ ...node, ...style })
    case 'paragraph': return slots.paragraph.render({ ...node, ...style })
    case 'blockquote': return slots.quote.render({ ...node, ...style })
    case 'list': return slots.list.render({ ...node, ...style })
    case 'hr': return slots.divider.render({ ...style })
    case 'code': return renderCodeBlock(node, style)
    default: return ''
  }
}
```

---

## 3. 核心数据结构

```typescript
// atoms/blueprints.ts
export interface Blueprint {
  id: string; name: string; description: string;
  defaultSlots: SlotConfig; tags: string[];
  render: {
    wrapDocument: (sectionsHtml: string, style: StyleComboV2) => string
    wrapSection: (titleHtml: string, contentHtml: string, index: number, style: StyleComboV2) => string
  }
}

// atoms/slots/index.ts
export interface SlotVariant {
  id: string; name: string; category: SlotCategory;
  render: (params: SlotRenderParams) => string;
  tags: string[]; affinity: Record<string, number>;
}
export type SlotCategory = 'title'|'quote'|'list'|'divider'|'paragraph'|'section'|'frame'|'ornament'|'callout'|'badge'

// atoms/coordinator.ts
export function coordinateSlots(input: {
  changedSlot: SlotCategory; newVariantId: string;
  currentConfig: SlotConfig; locks: LockState;
}): { newConfig: SlotConfig; changes: Partial<SlotConfig> }
```

---

## 4. 微信兼容：骨架实现方案

| 骨架 | 微信实现方式 |
|------|------------|
| B01 经典简约 | 纯 `<section>` + inline style |
| B02 色带章节 | `<section>` + `border-top: 4px solid` |
| B03 卡片模块 | `<section>` + `border + border-radius` |
| B04 左边栏重点 | `<section>` + `border-left: 3px solid` |
| B05 时间线 | `<table>` 两列：左列圆点+竖线，右列内容 |
| B06 杂志双栏 | `<table>` 两列 |
| B07 标签导航 | `<table>` 横排标签 + `<section>` |
| B08 对话气泡 | `<table>` 左右气泡 + `border-radius` |
| B09 编号步骤 | `<table>` 两列：左列大编号，右列内容 |
| B10-B15 | 类似组合策略 |

---

## 5. 状态管理变更

```typescript
interface AppStateV2 extends AppState {
  blueprintId: string
  slotConfig: SlotConfig
  locks: LockState
  coordinationMode: 'free' | 'coordinated'
}
```

---

## 6. 向后兼容

```typescript
function upgradeToV2(style: StyleCombo): StyleComboV2 {
  return {
    ...style,
    blueprint: getBlueprint('B01'),
    slots: getDefaultSlotConfig(style.decoration.id),
    locks: createUnlockedState(),
  }
}
```
