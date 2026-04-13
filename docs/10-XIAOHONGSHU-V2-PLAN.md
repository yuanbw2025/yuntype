# 小红书 V2 开发规划：骨架+插槽系统移植

## 一、现状分析

### 1.1 公众号 V2（已完成）

公众号的 V2 系统已经完整实现：

```
骨架(Blueprint) + 6个插槽(Slot) + 配色 + 字体
  ↓
renderWechatV2() → 内联CSS HTML
```

- **15种骨架**：极简清爽、日式留白、线条主导、双线学术、色块标签、交替色带、卡片模块、气泡圆润、杂志编辑、首字下沉、编号步骤、时间线、文艺散文、商务左标签、几何装饰
- **6个插槽**：标题(10+变体)、引用(8+变体)、列表(8+变体)、分割线(7+变体)、段落(5+变体)、节区(5+变体)
- 用户选骨架 → 默认插槽就位 → 可单独换任何插槽

### 1.2 小红书 V1（当前状态）

小红书目前的渲染器 `renderXhsPages()` 只支持 V1 的 `StyleCombo`：

- ✅ 配色：跟随全局 11 套配色切换
- ✅ 字体：跟随全局 3 种字体气质（从 CDN 加载开源字体）
- ❌ 骨架：没有骨架概念，所有页面使用同一种固定布局
- ❌ 插槽：标题/引用/列表/分割线样式固定，不可切换
- ❌ 版式：切换骨架/装饰/排版结构时，小红书画面不变

**问题本质**：公众号 V2 的骨架和插槽系统没有同步到小红书渲染器。用户在中栏选择不同骨架，右侧公众号预览变化明显，但切到小红书模式后完全感受不到差异。

### 1.3 V1 渲染器架构

当前小红书 V1 的渲染流程：

```
Markdown → parseMarkdown() → MarkdownNode[]
  ↓
estimateElementHeight() → 高度估算
  ↓
splitIntoPages() → XhsPage[]（封面/内容/尾页）
  ↓
renderXhsPage() → HTML字符串（每页一个div）
  ↓
html2canvas → PNG → JSZip → ZIP下载
```

关键函数：
- `renderCover*()`: 5种封面变体（经典/大字/极简/卡片/杂志）
- `renderContentPage()`: 内容页渲染（固定样式）
- `renderElement()`: 各元素渲染（标题/段落/列表/引用/代码/分割线）
- `renderEndingPage()`: 尾页渲染

---

## 二、V2 目标

### 2.1 核心目标

**让小红书模式和公众号模式共享同一套骨架+插槽系统**，用户切换骨架/插槽时，小红书的页面布局、标题样式、引用样式等随之变化。

### 2.2 具体效果

| 操作 | V1（当前） | V2（目标） |
|------|-----------|-----------|
| 切换骨架（极简→日式→卡片） | ❌ 无变化 | ✅ 页面结构变化 |
| 切换标题插槽 | ❌ 无变化 | ✅ 标题装饰变化 |
| 切换引用插槽 | ❌ 无变化 | ✅ 引用块样式变化 |
| 切换列表插槽 | ❌ 无变化 | ✅ 列表标记变化 |
| 切换分割线插槽 | ❌ 无变化 | ✅ 分割线形态变化 |
| 切换段落插槽 | ❌ 无变化 | ✅ 段落排列变化 |
| 切换节区插槽 | ❌ 无变化 | ✅ 章节包裹变化 |
| 切换配色 | ✅ 已支持 | ✅ 保持 |
| 切换字体 | ✅ 已支持 | ✅ 保持 |

### 2.3 设计原则

1. **插槽复用**：尽可能复用公众号 V2 的插槽渲染逻辑，只做画布尺寸适配
2. **封面升级**：封面变体也纳入骨架系统，不同骨架有不同的默认封面风格
3. **分页不变**：智能分页算法保持不变，只是渲染层切换为 V2
4. **渐进式**：V1 渲染器保留，V2 作为独立路径，通过开关切换

---

## 三、技术方案

### 3.1 新增函数签名

```typescript
// xiaohongshu.ts 新增 V2 入口
export function renderXhsPagesV2(
  markdown: string,
  style: StyleComboV2,   // 骨架+插槽+配色+字体
  ratio: string,         // '3:4' | '1:1' | '16:9'
): XhsPage[]

export function renderXhsPageV2(
  page: XhsPage,
  style: StyleComboV2,
  config: XhsConfig,
): string
```

### 3.2 插槽适配层

公众号的插槽输出是内联 CSS HTML（`<section style="...">`），小红书需要的也是内联 CSS HTML（只是画布尺寸不同）。核心差异：

| 维度 | 公众号 | 小红书 |
|------|--------|--------|
| 画布宽度 | ~600px（手机屏幕） | 1080px（固定画布） |
| 字号基准 | 15-16px | 30-32px |
| 行高 | 1.75-2.0 | 1.6-1.8 |
| padding | 20-30px | 60-80px |
| 分页 | 无（连续滚动） | 有（固定高度切分） |

**适配策略**：为每个插槽增加一个 `platform` 参数：

```typescript
interface SlotRenderContext {
  platform: 'wechat' | 'xhs'
  canvasWidth: number
  baseFontSize: number
  colors: ColorScheme
  fonts: { title: string; body: string }
}
```

插槽函数根据 `platform` 自动调整字号倍率和间距。

### 3.3 骨架对小红书页面的影响

每种骨架不仅定义默认插槽，还应定义**小红书专属属性**：

```typescript
interface BlueprintXhsConfig {
  // 封面风格偏好
  coverVariant: 'classic' | 'bold' | 'minimal' | 'card' | 'magazine' | 'auto'
  
  // 内容页布局
  contentLayout: 'standard' | 'card-wrapped' | 'alternating-bg' | 'timeline-rail'
  
  // 页面装饰
  pageDecoration: {
    headerBar: boolean       // 页面顶部装饰条
    footerLine: boolean      // 页面底部装饰线
    pageNumberStyle: 'right' | 'center' | 'fraction' | 'dot'
    brandPosition: 'bottom-center' | 'bottom-right' | 'none'
  }
  
  // 尾页风格
  endingStyle: 'standard' | 'minimal' | 'card'
}
```

### 3.4 15种骨架的小红书映射

| 骨架 | 封面变体 | 内容布局 | 页面装饰 |
|------|---------|---------|---------|
| 极简清爽 | minimal | standard | 无顶部条，底部细线 |
| 日式留白 | minimal | standard | 居中○分割，大间距 |
| 线条主导 | classic | standard | 顶部色条，底部渐变线 |
| 双线学术 | magazine | standard | 双线页眉页脚 |
| 色块标签 | bold | standard | 色块标题，角标页码 |
| 交替色带 | classic | alternating-bg | 奇偶段落交替底色 |
| 卡片模块 | card | card-wrapped | 每段包裹在卡片中 |
| 气泡圆润 | card | card-wrapped | 圆角气泡包裹 |
| 杂志编辑 | magazine | standard | 杂志页眉，大标题 |
| 首字下沉 | classic | standard | 段首大字母 |
| 编号步骤 | bold | standard | 自动编号圆圈 |
| 时间线 | classic | timeline-rail | 左侧时间轴连线 |
| 文艺散文 | minimal | standard | 居中排列，诗意间距 |
| 商务左标签 | classic | standard | 左侧色条标记 |
| 几何装饰 | bold | standard | 几何符号装饰 |

### 3.5 内容页 V2 渲染逻辑

```typescript
function renderContentPageV2(
  page: XhsPage,
  style: StyleComboV2,
  config: XhsConfig,
): string {
  const ctx: SlotRenderContext = {
    platform: 'xhs',
    canvasWidth: config.width,
    baseFontSize: config.fontSize,
    colors: style.color.colors,
    fonts: { title: style.titleFont, body: style.bodyFont },
  }

  let html = ''

  // 1. 页面头部装饰（由骨架决定）
  html += renderPageHeader(page, style.blueprint, ctx)

  // 2. 渲染各元素（调用插槽系统）
  for (const el of page.elements) {
    switch (el.type) {
      case 'heading':
        html += getSlot('title', style).render(el, ctx)  // 复用插槽
        break
      case 'paragraph':
        html += getSlot('paragraph', style).render(el, ctx)
        break
      case 'blockquote':
        html += getSlot('quote', style).render(el, ctx)
        break
      case 'list':
        html += getSlot('list', style).render(el, ctx)
        break
      case 'hr':
        html += getSlot('divider', style).render(el, ctx)
        break
      case 'code':
        html += renderCodeBlockXhs(el, ctx)  // 代码块特殊处理
        break
    }
  }

  // 3. 页面底部装饰
  html += renderPageFooter(page, style.blueprint, ctx)

  return html
}
```

### 3.6 封面 V2

封面变体保留 5 种，但增加骨架感知：

```typescript
function renderCoverV2(
  title: string,
  summary: string,
  style: StyleComboV2,
  config: XhsConfig,
): string {
  // 骨架推荐的封面变体
  const variant = style.blueprint.xhs?.coverVariant || 'auto'
  
  if (variant === 'auto') {
    // 根据骨架标签自动选择
    return selectCoverByBlueprint(style.blueprint, title, summary, style, config)
  }
  
  // 使用指定变体
  return renderCoverVariant(variant, title, summary, style, config)
}
```

---

## 四、实施计划

### Phase 1：插槽适配层（预计 2-3 小时）

**目标**：让现有插槽支持 `platform: 'xhs'` 参数

- [ ] 在 `SlotRenderContext` 中添加 `platform` 字段
- [ ] 修改所有插槽渲染函数，根据 platform 调整字号/间距
- [ ] 添加 XHS 专用的字号倍率计算函数
- [ ] 单元测试：确认插槽在 xhs 模式下输出正确的字号

### Phase 2：骨架 XHS 配置（预计 1-2 小时）

**目标**：为每种骨架添加小红书专属配置

- [ ] 定义 `BlueprintXhsConfig` 类型
- [ ] 为 15 种骨架填写 XHS 配置（封面变体、内容布局、页面装饰）
- [ ] 添加默认值和 fallback 逻辑

### Phase 3：渲染器 V2（预计 3-4 小时）

**目标**：实现 `renderXhsPageV2()` 核心渲染函数

- [ ] 实现 `renderContentPageV2()`：调用插槽系统渲染内容页
- [ ] 实现 `renderCoverV2()`：骨架感知的封面渲染
- [ ] 实现 `renderEndingPageV2()`：保持现有尾页 + 骨架装饰
- [ ] 实现页面头部/底部装饰渲染
- [ ] 适配 4 种内容布局（standard / card-wrapped / alternating-bg / timeline-rail）

### Phase 4：组件接入（预计 1-2 小时）

**目标**：让 XiaohongshuPreview 组件支持 V2

- [ ] 修改 `XiaohongshuPreview.tsx`：检测 V2 模式，调用 `renderXhsPageV2`
- [ ] 修改 `App.tsx`：传递 `StyleComboV2` 给小红书组件
- [ ] 确保 V1/V2 切换无缝（顶栏按钮控制）

### Phase 5：高度估算适配（预计 1 小时）

**目标**：插槽样式变化后，分页高度估算仍然准确

- [ ] 插槽的装饰元素（色块、边框、padding）纳入高度计算
- [ ] 节区包裹（卡片阴影、色带）的额外高度纳入计算
- [ ] 交替色带/时间线布局的特殊间距处理

### Phase 6：测试 + 优化（预计 1-2 小时）

- [ ] 15 种骨架 × 3 种比例 = 45 种组合的视觉测试
- [ ] 插槽切换后重新分页的性能测试
- [ ] 长文（10000字+）的分页稳定性测试
- [ ] 导出 ZIP 的完整性测试

### 总计预估：9-14 小时

---

## 五、UI 变化

### 5.1 小红书模式的中栏

当前：小红书模式的中栏和公众号一样（骨架/插槽面板），但实际只有配色和字体生效。

V2 后：**中栏的所有控件都实际生效**——切换骨架，小红书页面结构变；切换插槽，小红书元素样式变。

### 5.2 新增小红书专属控件（可选）

| 控件 | 说明 |
|------|------|
| 封面变体选择 | 在缩略图区域显示当前封面变体，可手动切换 |
| 每页元素密度 | 滑条控制每页最多放多少内容（紧凑/标准/宽松） |
| 页面装饰开关 | 开关控制页眉页脚、品牌水印的显示 |

---

## 六、风险与注意事项

### 6.1 性能

- 小红书每次重新渲染需要重新分页 + 重新生成所有页面 HTML
- 15种骨架 × 插槽切换 = 频繁的重渲染
- **对策**：使用 `useMemo` 缓存分页结果，只在 markdown/style 变化时重新计算

### 6.2 高度估算准确性

- 插槽样式差异大（极简 vs 卡片包裹 vs 时间线），高度估算可能偏差
- **对策**：为每种插槽组合定义高度修正系数

### 6.3 向后兼容

- V1 渲染器保留，不删除
- 用户可以通过顶栏的 "V1 经典" 按钮回退到 V1 模式
- 品牌预设中保存的 V1 配置仍然可用

### 6.4 字体加载

- 小红书模式需要从 CDN 加载 6 种开源字体
- V2 可能引入更多字体变体
- **对策**：预加载策略优化，首次加载时显示进度条

---

## 七、文件改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `src/lib/atoms/slots.ts` | 修改 | 插槽渲染函数添加 platform 适配 |
| `src/lib/atoms/blueprints.ts` | 修改 | 每种骨架添加 XHS 配置 |
| `src/lib/render/xiaohongshu.ts` | 新增函数 | `renderXhsPageV2` / `renderContentPageV2` / `renderCoverV2` |
| `src/components/XiaohongshuPreview.tsx` | 修改 | 接入 V2 渲染路径 |
| `src/App.tsx` | 修改 | 传递 StyleComboV2 给小红书组件 |
| `src/lib/atoms/index.ts` | 可能修改 | 导出类型调整 |

---

## 八、验收标准

1. ✅ 用户切换骨架时，小红书预览的页面结构明显变化
2. ✅ 用户切换任何一个插槽时，小红书对应元素的样式立即变化
3. ✅ 15种骨架 × 3种比例 × 11种配色 = 495种组合全部可用
4. ✅ 分页算法在所有插槽组合下稳定（不出现空页、不截断文字）
5. ✅ 导出 ZIP 包含所有页面，每页渲染正确
6. ✅ V1 模式仍然可用，切换无报错
7. ✅ 首次加载性能无明显退化
