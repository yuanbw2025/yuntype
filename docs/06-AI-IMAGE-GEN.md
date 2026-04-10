# 云中书 / YunType — AI 生图模块

> 本文档定义配图生成功能的两种模式：程序化信息图（无需AI）和 AI 文生图（需要API Key）。
> **优先级: P2**（可以在 MVP 之后实现）

---

## 1. 概述

文章配图有两种生成路径，按文章类型自动推荐：

| 路径 | 适用内容 | 技术 | 需要API？ |
|------|---------|------|----------|
| **程序化信息图** | 知识干货、教程、对比分析 | HTML+CSS → Canvas → PNG | ❌ 不需要 |
| **AI 文生图** | 情感散文、故事、生活 | 调用生图API | ✅ 需要 |

---

## 2. 程序化信息图（无需AI）

### 可用模板

#### 流程图模板

```
┌──────┐    ┌──────┐    ┌──────┐
│ 步骤1 │ → │ 步骤2 │ → │ 步骤3 │
└──────┘    └──────┘    └──────┘
```

**输入格式**:
```json
{
  "type": "flow",
  "steps": ["需求分析", "原型设计", "开发测试", "上线运营"]
}
```

#### 对比表模板

```
┌─────────┬──────────┐
│  方案A   │   方案B   │
├─────────┼──────────┤
│  特点1   │   特点1   │
│  特点2   │   特点2   │
└─────────┴──────────┘
```

**输入格式**:
```json
{
  "type": "comparison",
  "columns": [
    { "title": "方案A", "items": ["快速", "简单", "免费"] },
    { "title": "方案B", "items": ["精确", "复杂", "付费"] }
  ]
}
```

#### 知识卡片模板

```
┌──────────────────────┐
│  📌 核心知识点         │
├──────────────────────┤
│  1. 要点一            │
│  2. 要点二            │
│  3. 要点三            │
└──────────────────────┘
```

#### 时间线模板

```
  ●─── 2020: 事件一
  │
  ●─── 2021: 事件二
  │
  ●─── 2022: 事件三
```

#### 数据图表模板（简单SVG）

- 柱状图（纵向/横向）
- 饼图（简单扇形）
- 环形进度图

### 渲染规格

- 输出尺寸：与文章宽度匹配（公众号模式 375px，小红书模式 1080px）
- 配色：继承当前选中的配色方案
- 字体：继承当前字体设置
- 格式：PNG（透明背景或配色背景）

### 实现

```typescript
// ai/infographic.ts

interface InfographicConfig {
  type: 'flow' | 'comparison' | 'card' | 'timeline' | 'chart';
  data: any;
  style: StyleCombo;
  width: number;
  height?: number; // 自动计算
}

function renderInfographic(config: InfographicConfig): string {
  // 返回 HTML 字符串，可以直接用 html2canvas 转PNG
  switch (config.type) {
    case 'flow':
      return renderFlowChart(config);
    case 'comparison':
      return renderComparisonTable(config);
    case 'card':
      return renderKnowledgeCard(config);
    case 'timeline':
      return renderTimeline(config);
    case 'chart':
      return renderSimpleChart(config);
  }
}
```

---

## 3. AI 文生图（需要API Key）

### 支持的 API

| 提供商 | API 格式 | 图片尺寸 | 价格参考 |
|-------|---------|---------|---------|
| 豆包 (Doubao) | 自有格式 | 1024×1024 等 | ~¥0.04/张 |
| 千问 (Qwen/Wanx) | OpenAI兼容 | 1024×1024 等 | ~¥0.04/张 |
| Gemini | Gemini格式 | 自适应 | 免费额度 |
| OpenAI DALL-E 3 | OpenAI格式 | 1024×1024/1792×1024 | ~$0.04/张 |

### 调用流程

```
用户选择段落 → 生成描述prompt → 翻译为英文 → 调用生图API → 返回图片URL → 用户下载
```

### Prompt 生成策略

```typescript
// ai/image-gen.ts

function generateImagePrompt(
  paragraph: string,
  style: StyleCombo,
  articleTone: string
): string {
  // 基于文章段落和当前配色风格，生成图片描述
  const colorMood = getColorMood(style.color); // 如 "warm and cozy"
  const artStyle = getArtStyle(articleTone);    // 如 "watercolor illustration"
  
  return `${artStyle} of ${summarize(paragraph)}, ${colorMood} color palette, 
    minimal composition, suitable for social media article illustration, 
    no text, no watermark`;
}
```

### API 调用实现

```typescript
// OpenAI / 千问 兼容格式
async function generateImage(config: AIConfig, prompt: string): Promise<string> {
  const response = await fetch(`${config.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url', // 或 'b64_json'
    }),
  });
  
  const data = await response.json();
  return data.data[0].url; // 图片URL
}

// Gemini 原生图片生成
async function generateImageGemini(config: AIConfig, prompt: string): Promise<string> {
  const response = await fetch(
    `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    }
  );
  
  const data = await response.json();
  // 从响应中提取 base64 图片数据
  const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}
```

### 用户交互

1. 用户在文章中选中一段文字
2. 点击"生成配图"按钮
3. 系统生成 prompt 并显示给用户（可编辑）
4. 用户确认后调用 API
5. 显示生成结果（可能需要等待10-30秒）
6. 用户满意 → 下载图片 / 不满意 → 重新生成

---

## 4. 验收标准

### 程序化信息图

- [ ] 流程图模板正确渲染
- [ ] 对比表模板正确渲染
- [ ] 知识卡片模板正确渲染
- [ ] 信息图配色继承当前配色方案
- [ ] 可以导出为 PNG

### AI 文生图

- [ ] 可以调用至少一个生图API成功生成图片
- [ ] Prompt 可编辑
- [ ] 生成过程有 loading 状态
- [ ] 生成失败有错误提示
- [ ] 图片可以下载
