# 云中书 YunType — 项目进度文档

> 更新时间：2026-04-13 18:13

---

## 一、整体进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 产品文档体系 | ✅ 完成 | 7份文档 + README |
| Phase 1 MVP | ✅ 完成 | 16个源文件，Markdown解析+公众号渲染+导出 |
| Phase 2 四维度面板 | ✅ 完成 | 四维度选择器、8套预设、微调滑条、随机组合 |
| Phase 3 小红书模式 | ✅ 完成 | 分页算法、HTML→Canvas→PNG、ZIP打包导出 |
| Phase 4 高级功能 | ✅ 完成 | 信息图、AI生图、品牌预设、历史记录、新手引导、性能优化 |
| Phase 5 AI分析+字体+移动端 | ✅ 完成 | AI文章分析、字体管理器、移动端适配 |
| Phase 6 体验增强 | ✅ 完成 | 暗黑模式、键盘快捷键、封面5变体、拖拽排序、SEO/PWA、Vercel优化 |
| Phase 7 多渠道分发 | ✅ 完成 | MCP Server、Prompt Skill（基础版+完整版）、测试 Playground |
| Phase 8 骨架引擎V2 | ✅ 完成 | 插槽系统(6类48变体) + 蓝图(5套) + V2渲染器 + LayoutPanel + App集成 |
| ⚠️ 架构问题 | ✅ 已解决 | V2骨架引擎通过插槽+蓝图实现真正结构性布局差异，替代旧T1-T5 CSS参数方案 |

---

## 二、Phase 4 新增文件清单（6个新文件 + 2个修改文件）

### 新文件

| 文件 | 说明 |
|------|------|
| `src/lib/render/infographic.ts` | 程序化信息图引擎（流程图/对比表/知识卡片/时间线），继承当前配色，375→1080缩放 |
| `src/components/InfographicPanel.tsx` | 信息图编辑面板 — 模板选择、数据编辑器、实时预览、PNG导出 |
| `src/lib/ai/image-gen.ts` | AI文生图模块 — 支持通义万相/豆包/OpenAI/Gemini，localStorage持久化API配置 |
| `src/components/AIImageDialog.tsx` | AI生图对话框 — 提供商选择、Prompt编辑、快速风格按钮、生成结果展示 |
| `src/lib/storage.ts` | 本地存储模块 — 品牌预设(max20)、历史记录(max10)、引导标记 |
| `src/components/GuideOverlay.tsx` | 4步新手引导遮罩 — 首次访问自动弹出，localStorage持久化 |

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `src/components/StylePanel.tsx` | 新增2个Tab（💼 我的品牌预设、🕐 历史记录），两行Tab布局 |
| `src/App.tsx` | 新增信息图模式、AI生图按钮、GuideOverlay、历史自动记录 |
| `src/lib/export/image.ts` | html2canvas + JSZip 改为动态 import()，减小首屏包体积 |

---

## 三、完整文件清单

### 项目骨架（3个）
| 文件 | 说明 |
|------|------|
| `package.json` | React 19 + TypeScript + Vite 6 + html2canvas + jszip |
| `vite.config.ts` | Vite 配置 |
| `tsconfig.json` | TypeScript 配置 |

### 入口文件（4个）
| 文件 | 说明 |
|------|------|
| `index.html` | HTML入口 |
| `src/main.tsx` | React入口 |
| `src/App.tsx` | 主应用布局（三模式切换：公众号/小红书/信息图） |
| `src/index.css` | 全局样式重置 |

### 原子数据层（6个）
| 文件 | 说明 |
|------|------|
| `src/lib/atoms/colors.ts` | 11套配色方案（L1-L8浅色 + D1-D3深色） |
| `src/lib/atoms/layouts.ts` | 5种排版结构 |
| `src/lib/atoms/decorations.ts` | 4种装饰风格 |
| `src/lib/atoms/typography.ts` | 3种字体气质 |
| `src/lib/atoms/index.ts` | 组合引擎（660种组合） |
| `src/lib/atoms/presets.ts` | 8套风格预设 + 微调参数 |

### 渲染核心（4个）
| 文件 | 说明 |
|------|------|
| `src/lib/render/markdown.ts` | Markdown → AST 解析器 |
| `src/lib/render/wechat.ts` | 公众号 HTML 渲染器（全内联CSS） |
| `src/lib/render/xiaohongshu.ts` | 小红书分页渲染器 |
| `src/lib/render/infographic.ts` | 信息图渲染引擎（4种模板） |

### AI模块（3个）
| 文件 | 说明 |
|------|------|
| `src/lib/ai/client.ts` | 统一AI聊天客户端（9个提供商：qwen/deepseek/doubao/openai/gemini等） |
| `src/lib/ai/analyzer.ts` | AI文章分析器（自动推荐排版原子组合，含本地离线分析回退） |
| `src/lib/ai/image-gen.ts` | AI文生图（通义万相/豆包/OpenAI/Gemini） |

### 字体模块（1个）
| 文件 | 说明 |
|------|------|
| `src/lib/fonts/index.ts` | 字体加载管理器（10种字体、按需CDN加载、分类浏览） |

### 存储模块（1个）
| 文件 | 说明 |
|------|------|
| `src/lib/storage.ts` | 品牌预设 + 历史记录 + 引导标记 |

### UI组件（9个）
| 文件 | 说明 |
|------|------|
| `src/components/ArticleInput.tsx` | 文章输入组件 |
| `src/components/WechatPreview.tsx` | 公众号预览组件 |
| `src/components/ExportPanel.tsx` | 导出面板（复制富文本+下载HTML） |
| `src/components/StylePanel.tsx` | 风格面板（5个Tab：预设/四维度/微调/品牌/历史） |
| `src/components/XiaohongshuPreview.tsx` | 小红书预览组件 |
| `src/components/InfographicPanel.tsx` | 信息图编辑面板 |
| `src/components/AIImageDialog.tsx` | AI生图对话框 |
| `src/components/ApiConfigDialog.tsx` | AI文章分析对话框（提供商选择、API配置、分析结果、应用推荐） |
| `src/components/GuideOverlay.tsx` | 新手引导遮罩 |

### 导出工具（2个）
| 文件 | 说明 |
|------|------|
| `src/lib/export/clipboard.ts` | 剪贴板工具 |
| `src/lib/export/image.ts` | 图片导出（html2canvas + JSZip，动态加载） |

### 产品文档（7个）
| 文件 | 说明 |
|------|------|
| `docs/01-PRODUCT-OVERVIEW.md` | 产品总览 |
| `docs/02-FEATURE-SPEC.md` | 功能规格 |
| `docs/03-DESIGN-SYSTEM.md` | 设计系统 |
| `docs/04-TECH-ARCHITECTURE.md` | 技术架构 |
| `docs/05-XIAOHONGSHU-MODE.md` | 小红书模式 |
| `docs/06-AI-IMAGE-GEN.md` | AI图片生成 |
| `docs/07-DEVELOPMENT-PLAN.md` | 开发计划 |

---

## 四、Phase 8 骨架引擎V2 新增文件（2026-04-13）

### 新增文件（9个）

| 文件 | 说明 |
|------|------|
| `src/lib/atoms/slots/index.ts` | 插槽类型定义 + RenderContext + 统一导出 |
| `src/lib/atoms/slots/title.ts` | 标题插槽 10种变体（左底线/居中对称/色块标签/双线框/Banner/编号/左色条/几何前缀/日式/气泡） |
| `src/lib/atoms/slots/quote.ts` | 引用插槽 8种变体（左竖线/圆角卡片/Pull-quote/双线框/大引号/虚线框/气泡/高亮框） |
| `src/lib/atoms/slots/list.ts` | 列表插槽 8种变体（圆点/方块/箭头/菱形/清单/短线/卡片/圆圈编号） |
| `src/lib/atoms/slots/divider.ts` | 分割线插槽 8种变体（细线/粗线/双线/渐变/点状/装饰花/菱形/居中圆） |
| `src/lib/atoms/slots/paragraph.ts` | 段落插槽 6种变体（紧凑/首行缩进/首字下沉/大留白/首段放大/两端对齐） |
| `src/lib/atoms/slots/section.ts` | 节区插槽 6种变体（平铺/卡片阴影/交替色带/时间线/左侧标签/分隔线段落） |
| `src/lib/atoms/blueprints.ts` | 5套蓝图模板（极简流/杂志卡片/学术严谨/时间线叙事/日式侘寂） |
| `src/components/LayoutPanel.tsx` | V2布局面板（蓝图选择 + 6维度插槽选择器 + 随机/重置） |

### 修改文件（3个）

| 文件 | 修改内容 |
|------|---------|
| `src/lib/atoms/index.ts` | 新增 StyleComboV2/AtomIdsV2 类型 + getStyleComboV2/randomAtomIdsV2/getComboNameV2 + TOTAL_COMBOS_V2 |
| `src/lib/render/wechat.ts` | 新增 renderWechatV2() 函数，基于插槽+蓝图渲染真正结构差异化HTML |
| `src/components/WechatPreview.tsx` | 支持 V1/V2 双模式，V2显示蓝图图标+名称 |
| `src/App.tsx` | 集成V1/V2切换按钮、LayoutPanel、styleV2状态、handleShuffle双模式 |

### 架构说明

V2骨架引擎解决了原T1-T5仅改CSS参数的核心问题：
- **插槽系统**：6类共48种变体，每种变体生成不同的HTML结构
- **蓝图系统**：5套预设蓝图，每套指定6个插槽的推荐组合
- **组合空间**：5蓝图 × 10标题 × 8引用 × 8列表 × 8分割线 × 6段落 × 6节区 × 11配色 = 超100万种
- **V1/V2共存**：App顶栏提供 V1经典/V2骨架 切换按钮，兼容旧工作流

---

## 五、构建产物

```
dist/index.html                            2.62 kB │ gzip:  1.04 kB
dist/assets/index.css                      2.49 kB │ gzip:  0.81 kB
dist/assets/jszip.min.js                  97.54 kB │ gzip: 30.32 kB  (懒加载)
dist/assets/html2canvas.esm.js           202.38 kB │ gzip: 48.04 kB  (懒加载)
dist/assets/index.js                     310.79 kB │ gzip: 93.76 kB
```

html2canvas 和 JSZip 通过 dynamic import() 实现懒加载，首屏只加载主包 ~94KB gzip。

---

## 六、工作日志

### 2026-04-13（Day 5）

**Phase 8 骨架引擎V2（已完成）：**
- ✅ 插槽系统设计 + 6类48种变体实现
- ✅ 蓝图系统 5套预设模板
- ✅ V2渲染器 renderWechatV2() 基于 AST → 插槽映射
- ✅ LayoutPanel.tsx 蓝图+插槽选择面板
- ✅ WechatPreview.tsx V1/V2双模式支持
- ✅ App.tsx 集成 V1/V2切换、LayoutPanel、双模式状态管理
- ✅ TypeScript 类型检查通过（0 error）
- ✅ Vite 构建通过：342KB主包 + 2.49KB CSS

### 2026-04-12（Day 3-4）

**Phase 7 多渠道分发（Day 4 下午-晚间）：**
- ✅ MCP Server 构建完成
  - `mcp-server/src/index.ts`：4个工具（list_styles/random_style/format/preset）+ 1个资源
  - `mcp-server/package.json` + `tsconfig.json`：构建配置
  - 注册到 Cline MCP 配置，工具验证通过
- ✅ Prompt Skill 基础版 `skill/yuntype-skill.md`：轻量提示词，引导AI按四维度排版
- ✅ Prompt Skill 完整版 `skill/yuntype-complete-skill.md`（⭐推荐）
  - 内嵌全部660种组合数据（11色×5排版×4装饰×3字体）
  - 用户可直接导入 Claude Pro / Gemini Advanced 的 Artifacts/Canvas 中使用
  - 无需 API Key，利用订阅额度即可运行
- ✅ README.md 更新：方式三 Prompt Skill 区域重写，完整版标记为推荐
- ✅ 测试工具 `test-playground.html`：独立HTML测试页
  - 左侧面板：8个预设按钮 + 4个四维度下拉框 + 随机组合 + 一键复制
  - 右侧：Markdown编辑器 + 实时渲染预览
  - 内嵌完整渲染引擎（与MCP Server同源数据）
- ✅ 测试预览 `test-preview.html`：静态单预设预览页
- ✅ 参考资料收集：下载解压 awesome-design-md + ui-ux-pro-max-skill 到 `_reference/`

**🔴 用户测试反馈 — 核心架构问题：**
- 用户实测 test-playground.html 后发现：切换660种组合，实际只有颜色、字重、线条粗细在变
- **根本原因**：5种排版(T1-T5)仅定义了 fontSize/lineHeight/spacing 等CSS数值参数，未改变HTML结构
- 标题位置、内容块布局、装饰元素排列在所有组合中完全相同
- 用户原话："版式定好之后，纯改色的东西，完全不是一个'多版式'的概念"
- 用户期望的差异化：极简排版 vs 线条主导 vs 图形模块丰富 vs 图片突出留位 等真正的结构差异
- 此问题影响 MCP Server、Skill、Playground 等所有渠道，属于渲染引擎架构级问题
- 另外 Playground 缺少小红书模式入口

**待处理（下一阶段）：**
- 🔴 重新设计5种排版(T1-T5)：每种排版需生成不同的HTML结构，而非仅改CSS参数
- 🔴 test-playground.html 增加小红书预览模式
- 🔴 研究参考项目（awesome-design-md: 66套DESIGN.md，ui-ux-pro-max-skill: 67种UI风格+161条推理规则）获取结构差异化灵感

**Phase 6 体验增强（Day 3 早间，已完成）：**
- ✅ Phase 6 体验增强（8项全部完成）
  - FontPanel 字体选择面板渲染到 StylePanel
  - 小红书封面5变体系统（classic/bold/minimal/card/magazine）+ 尾页增强（CTA按钮/品牌区）
  - 键盘快捷键（Ctrl+Shift+R随机/Ctrl+E导出/Ctrl+D暗黑模式）
  - SEO + Open Graph + Twitter Card 元标签
  - 暗黑模式（CSS变量 + localStorage持久化 + 🌙/☀️ 切换按钮）
  - PWA支持（manifest.json + Service Worker网络优先缓存策略）
  - 小红书页面拖拽排序（drag & drop重排缩略图）
  - Vercel部署优化（缓存策略/安全头/SPA重写规则）
  - 构建验证通过：310KB主包 + 2.49KB CSS，0 error
- ✅ Phase 5 AI分析 + 字体管理 + 移动端适配
  - AI聊天客户端 client.ts（9个提供商：qwen/deepseek/doubao/openai/gemini/moonshot/zhipu/siliconflow/custom）
  - AI文章分析器 analyzer.ts（自动推荐660种组合，含本地离线回退）
  - ApiConfigDialog.tsx（提供商选择+API配置+分析结果+应用推荐按钮）
  - 字体加载管理器 fonts/index.ts（10种字体，按需CDN加载）
  - App.tsx 集成 AI分析按钮 + ApiConfigDialog 对话框
  - index.css 移动端响应式适配（平板/手机/超小屏/触屏优化）
- ✅ 构建验证通过：294KB主包 + 1.59KB CSS，0 error
- ✅ Phase 4 全部 6 个新文件创建完成
  - 信息图引擎（流程图/对比表/知识卡片/时间线）
  - AI文生图模块（4个提供商支持）
  - 本地存储（品牌预设/历史记录/引导标记）
  - 新手引导遮罩（4步教学）
- ✅ StylePanel 扩展为 5 个 Tab（新增品牌预设+历史记录）
- ✅ App.tsx 集成三模式切换 + AI生图入口 + 历史自动记录
- ✅ image.ts 性能优化 — html2canvas/JSZip 改为动态 import()
- ✅ 构建验证通过，0 error

### 2026-04-11（Day 2）

**已完成：**
- ✅ Phase 2 四维度选择器完成
- ✅ Phase 3 小红书图片生成模式完成
- ✅ Bug修复：段落解析、装饰模板hex透明度兼容性
- ✅ tsconfig 弃用警告修复

### 2026-04-10（Day 1）

**已完成：**
- ✅ 完成全部 7 份产品文档
- ✅ 完成 Phase 1 MVP 全部 16 个源文件
- ✅ 推送 yuntype 到主仓库 my-website + 独立仓库 yuntype

---

## 七、技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 6
- **UI**: 纯内联CSS（零UI依赖）
- **图片渲染**: html2canvas（动态加载）
- **打包导出**: JSZip（动态加载）
- **存储**: localStorage
- **组合系统V1**: 11配色 × 5排版 × 4装饰 × 3字体 = 660种
- **组合系统V2**: 5蓝图 × 10标题 × 8引用 × 8列表 × 8分割线 × 6段落 × 6节区 × 11配色 = 100万+种

---

## 八、运行方式

```bash
cd yuntype
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```
