// AI 文章分析模块 — 分析文章气质 → 推荐排版组合

import { chat, type AIClientConfig, type ChatMessage } from './client'
import type { AtomIds } from '../atoms'
import { colorSchemes } from '../atoms/colors'
import { layoutTemplates } from '../atoms/layouts'
import { decorationSets } from '../atoms/decorations'
import { typographySets } from '../atoms/typography'

// ═══════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════

export interface AnalysisResult {
  success: boolean
  recommendation?: {
    atomIds: AtomIds
    reason: string
    articleType: string
    mood: string
  }
  error?: string
}

// ═══════════════════════════════════════
//  System Prompt
// ═══════════════════════════════════════

const SYSTEM_PROMPT = `你是一位专业的排版设计顾问。用户会给你一篇文章，你需要分析文章的类型、气质和目标受众，然后从以下选项中推荐最佳排版组合。

## 可用配色方案
${colorSchemes.map(c => `- ${c.id}: ${c.name}（${c.category === 'dark' ? '深色' : '浅色'}，适合: ${c.tags.join('/')}）`).join('\n')}

## 可用排版结构
${layoutTemplates.map(l => `- ${l.id}: ${l.name}`).join('\n')}

## 可用装饰风格
${decorationSets.map(d => `- ${d.id}: ${d.name}`).join('\n')}

## 可用字体气质
${typographySets.map(t => `- ${t.id}: ${t.name}`).join('\n')}

## 输出格式
严格输出以下 JSON（不要输出任何其他文字，不要用 markdown 代码块包裹）:
{"colorId":"L1","layoutId":"T1","decorationId":"S1","typographyId":"F1","reason":"推荐理由（一句话）","articleType":"文章类型","mood":"文章气质"}

## 匹配规则参考
- 技术教程 → T1紧凑知识型 + S1极简线条 + F1现代简约
- 生活随笔/情感 → T2舒朗阅读型 + S3圆润柔和 + F2文艺经典
- 商业/品牌 → T4杂志编辑型 + S2色块强调 + F1现代简约
- 列表/指南 → T1紧凑知识型 + S2色块强调 + F1现代简约
- 访谈/对话 → T5对话访谈型 + S3圆润柔和 + F2文艺经典
- 学术/严肃 → T2舒朗阅读型 + S1极简线条 + F2文艺经典
- 活泼/趣味 → T3卡片模块型 + S4几何装饰 + F3活泼趣味
- 深色系文章(科技/夜晚/高级) → D1/D2/D3配色`

// ═══════════════════════════════════════
//  分析入口
// ═══════════════════════════════════════

/** AI 分析文章并推荐排版方案 */
export async function analyzeArticle(
  config: AIClientConfig,
  markdown: string,
): Promise<AnalysisResult> {
  if (!markdown.trim()) {
    return { success: false, error: '请先输入文章内容' }
  }

  // 截取前1500字用于分析（节省token）
  const excerpt = markdown.length > 1500 ? markdown.slice(0, 1500) + '\n\n[...文章截断...]' : markdown

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `请分析以下文章并推荐最佳排版组合：\n\n${excerpt}` },
  ]

  const response = await chat(config, messages)

  if (!response.success) {
    return { success: false, error: response.error }
  }

  try {
    // 解析 JSON 响应
    const raw = response.content!.trim()
    // 尝试提取 JSON（兼容被 markdown 代码块包裹的情况）
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: 'AI 返回格式不正确' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    // 验证 ID 有效性
    const validColorIds = colorSchemes.map(c => c.id)
    const validLayoutIds = layoutTemplates.map(l => l.id)
    const validDecoIds = decorationSets.map(d => d.id)
    const validTypoIds = typographySets.map(t => t.id)

    const atomIds: AtomIds = {
      colorId: validColorIds.includes(parsed.colorId) ? parsed.colorId : 'L1',
      layoutId: validLayoutIds.includes(parsed.layoutId) ? parsed.layoutId : 'T1',
      decorationId: validDecoIds.includes(parsed.decorationId) ? parsed.decorationId : 'S1',
      typographyId: validTypoIds.includes(parsed.typographyId) ? parsed.typographyId : 'F1',
    }

    return {
      success: true,
      recommendation: {
        atomIds,
        reason: parsed.reason || 'AI推荐方案',
        articleType: parsed.articleType || '未知',
        mood: parsed.mood || '未知',
      },
    }
  } catch (err: any) {
    return { success: false, error: `解析AI响应失败: ${err.message}` }
  }
}

// ═══════════════════════════════════════
//  无 API Key 时的本地分析（降级方案）
// ═══════════════════════════════════════

/** 本地关键词分析 — 不需要 API Key */
export function analyzeArticleLocal(markdown: string): AnalysisResult {
  if (!markdown.trim()) {
    return { success: false, error: '请先输入文章内容' }
  }

  const text = markdown.toLowerCase()
  const len = markdown.length

  // 关键词匹配
  const techKeywords = ['代码', 'code', '函数', 'function', 'api', '技术', '编程', '开发', '算法', 'npm', 'git', 'react', 'vue', 'python']
  const lifeKeywords = ['生活', '日常', '心情', '感悟', '旅行', '美食', '咖啡', '花', '阳光', '温暖', '幸福']
  const bizKeywords = ['品牌', '营销', '商业', '增长', '用户', '市场', '策略', '数据', '转化', '运营']
  const academicKeywords = ['研究', '论文', '理论', '分析', '方法论', '实验', '数据分析', '结论']
  const funKeywords = ['哈哈', '绝了', '推荐', '安利', '种草', '好物', '分享', '宝藏']

  const countMatches = (keywords: string[]) => keywords.filter(k => text.includes(k)).length

  const scores = {
    tech: countMatches(techKeywords),
    life: countMatches(lifeKeywords),
    biz: countMatches(bizKeywords),
    academic: countMatches(academicKeywords),
    fun: countMatches(funKeywords),
  }

  // 确定文章类型
  const maxType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]

  // 列表类文章检测
  const listPattern = /^[-*\d.]\s/gm
  const listCount = (markdown.match(listPattern) || []).length
  const isList = listCount > 5

  // 对话类文章检测
  const dialogPattern = /[：:]["'"「]/g
  const dialogCount = (markdown.match(dialogPattern) || []).length
  const isDialog = dialogCount > 3

  let atomIds: AtomIds
  let articleType: string
  let mood: string
  let reason: string

  if (isDialog) {
    atomIds = { colorId: 'L1', layoutId: 'T5', decorationId: 'S3', typographyId: 'F2' }
    articleType = '对话访谈'
    mood = '温暖对话感'
    reason = '检测到对话体结构，推荐访谈型排版'
  } else if (isList) {
    atomIds = { colorId: 'L6', layoutId: 'T1', decorationId: 'S2', typographyId: 'F1' }
    articleType = '列表指南'
    mood = '清晰条理'
    reason = '检测到大量列表项，推荐紧凑知识型排版'
  } else if (maxType[0] === 'tech' && maxType[1] >= 2) {
    atomIds = { colorId: 'L4', layoutId: 'T1', decorationId: 'S1', typographyId: 'F1' }
    articleType = '技术教程'
    mood = '专业理性'
    reason = '检测到技术关键词，推荐简约专业排版'
  } else if (maxType[0] === 'life' && maxType[1] >= 2) {
    atomIds = { colorId: 'L1', layoutId: 'T2', decorationId: 'S3', typographyId: 'F2' }
    articleType = '生活随笔'
    mood = '温暖柔和'
    reason = '检测到生活类内容，推荐舒朗温暖排版'
  } else if (maxType[0] === 'biz' && maxType[1] >= 2) {
    atomIds = { colorId: 'L4', layoutId: 'T4', decorationId: 'S2', typographyId: 'F1' }
    articleType = '商业品牌'
    mood = '高级专业'
    reason = '检测到商业内容，推荐杂志编辑型排版'
  } else if (maxType[0] === 'academic' && maxType[1] >= 2) {
    atomIds = { colorId: 'L6', layoutId: 'T2', decorationId: 'S1', typographyId: 'F2' }
    articleType = '学术文章'
    mood = '严谨学术'
    reason = '检测到学术关键词，推荐舒朗经典排版'
  } else if (maxType[0] === 'fun' && maxType[1] >= 2) {
    atomIds = { colorId: 'L3', layoutId: 'T3', decorationId: 'S4', typographyId: 'F3' }
    articleType = '趣味分享'
    mood = '活泼趣味'
    reason = '检测到活泼内容，推荐卡片趣味型排版'
  } else if (len > 3000) {
    atomIds = { colorId: 'L2', layoutId: 'T2', decorationId: 'S1', typographyId: 'F2' }
    articleType = '长文'
    mood = '沉稳阅读'
    reason = '长文章推荐舒朗阅读排版，减少视觉疲劳'
  } else {
    atomIds = { colorId: 'L5', layoutId: 'T1', decorationId: 'S3', typographyId: 'F1' }
    articleType = '通用文章'
    mood = '清新自然'
    reason = '通用推荐，适合大多数文章类型'
  }

  return {
    success: true,
    recommendation: { atomIds, reason, articleType, mood },
  }
}
