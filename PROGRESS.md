# 云中书 YunType — 项目进度文档

> 更新时间：2026-04-10 21:10

---

## 一、整体进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 产品文档体系 | ✅ 完成 | 7份文档 + README |
| Phase 1 MVP 代码 | ⚠️ 基本完成，有Bug | 16个源文件全部创建，可运行，但排版渲染有问题 |
| Phase 1 Bug修复 | ❌ 待做 | Markdown解析器段落逻辑需修复 |
| Phase 2 | ❌ 未开始 | 四维度面板选择器、风格推荐 |
| Phase 3 | ❌ 未开始 | 小红书图片生成模式 |

---

## 二、已完成的文件清单（16个源文件）

### 项目骨架（3个）
| 文件 | 说明 |
|------|------|
| `package.json` | React 18 + TypeScript + Vite |
| `vite.config.ts` | Vite 配置 |
| `tsconfig.json` | TypeScript 配置 |

### 入口文件（4个）
| 文件 | 说明 |
|------|------|
| `index.html` | HTML入口 |
| `src/main.tsx` | React入口 |
| `src/App.tsx` | 主应用布局（左右分栏） |
| `src/index.css` | 全局样式重置 |

### 原子数据层（5个）
| 文件 | 说明 |
|------|------|
| `src/lib/atoms/colors.ts` | 11套配色方案（L1-L8浅色 + D1-D3深色） |
| `src/lib/atoms/layouts.ts` | 5种排版结构（T1紧凑知识型 ~ T5对话访谈型） |
| `src/lib/atoms/decorations.ts` | 4种装饰风格（S1极简线条 ~ S4几何装饰） |
| `src/lib/atoms/typography.ts` | 3种字体气质（F1现代简约 ~ F3活泼趣味） |
| `src/lib/atoms/index.ts` | 组合引擎（随机组合、按ID获取、共660种组合） |

### 渲染核心（2个）
| 文件 | 说明 |
|------|------|
| `src/lib/render/markdown.ts` | Markdown → AST 解析器 |
| `src/lib/render/wechat.ts` | 公众号 HTML 渲染器（全部内联CSS，微信兼容） |

### UI组件 + 导出（3个）
| 文件 | 说明 |
|------|------|
| `src/components/ArticleInput.tsx` | 文章输入组件（左侧面板，带示例文章） |
| `src/components/WechatPreview.tsx` | 公众号预览组件（右侧面板，375px模拟） |
| `src/components/ExportPanel.tsx` | 导出面板（复制富文本 + 下载HTML） |
| `src/lib/export/clipboard.ts` | 剪贴板工具（Clipboard API + execCommand 双降级） |

### 产品文档（7个）
| 文件 | 说明 |
|------|------|
| `docs/01-PRODUCT-OVERVIEW.md` | 产品总览 |
| `docs/02-FEATURE-SPEC.md` | 功能规格 |
| `docs/03-DESIGN-SYSTEM.md` | 设计系统（四维度原子详细定义） |
| `docs/04-TECH-ARCHITECTURE.md` | 技术架构 |
| `docs/05-XIAOHONGSHU-MODE.md` | 小红书模式 |
| `docs/06-AI-IMAGE-GEN.md` | AI图片生成 |
| `docs/07-DEVELOPMENT-PLAN.md` | 开发计划 |

---

## 三、已知问题（Bug列表）

### 🔴 P0 — 段落不分段（严重）

**现象**：右侧预览里所有文字挤成一坨，没有段落分隔。

**原因**：`markdown.ts` 的段落解析逻辑把连续非空行合并为一个 `<p>`。中文文章通常每行就是一段（不像英文Markdown需要空行分隔段落），所以整篇文章被合并成一个巨大段落。

**修复方案**：修改 `parseMarkdown()` 中段落部分的逻辑 — 每一行非特殊语法的文本独立成一个 `paragraph` 节点，不再合并连续行。

**涉及文件**：`src/lib/render/markdown.ts`

**修复难度**：简单，改一处逻辑即可。

---

### 🟡 P1 — tsconfig baseUrl 弃用警告

**现象**：`tsconfig.json` 中 `baseUrl` 选项在 TypeScript 7.0 将弃用。

**修复方案**：添加 `"ignoreDeprecations": "6.0"` 到 compilerOptions，或移除 baseUrl 改用 paths。

**影响**：不影响运行，仅IDE警告。

---

### 🟡 P2 — 装饰模板中使用十六进制透明度后缀

**现象**：decorations.ts 中有 `${secondary}20`、`${secondary}40` 这样的写法（在hex颜色后直接拼接透明度hex值），部分浏览器可能不支持8位hex颜色。

**修复方案**：改用 rgba() 函数格式。

**影响**：现代浏览器基本支持，低优先级。

---

## 四、下一步待办（优先级排序）

| 优先级 | 任务 | 预估时间 |
|--------|------|---------|
| P0 | 修复段落解析逻辑（markdown.ts） | 5分钟 |
| P1 | 修复tsconfig弃用警告 | 1分钟 |
| P2 | 修复装饰模板hex透明度兼容性 | 10分钟 |
| P3 | 四维度面板选择器（可手动选配色/排版/装饰/字体） | 30分钟 |
| P4 | 风格推荐预设（一键切换推荐组合） | 20分钟 |
| P5 | 手机端响应式适配 | 20分钟 |
| P6 | 小红书图片生成模式（Phase 3） | 2-3小时 |

---

## 五、技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite 6
- **UI**: 纯内联CSS（零依赖）
- **Markdown解析**: 自研轻量解析器
- **渲染策略**: 全部内联CSS，兼容微信公众号编辑器
- **组合系统**: 11配色 × 5排版 × 4装饰 × 3字体 = 660种

---

## 六、运行方式

```bash
cd yuntype
npm run dev
# 浏览器打开 http://localhost:5173
```
