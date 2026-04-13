// ═══════════════════════════════════════════════════════════════
// V2 场景预设 — Phase 7
// 10 套精选场景 + 场景标签驱动协调引擎
// ═══════════════════════════════════════════════════════════════

import type { AtomIdsV2 } from './index'

// ─── 场景预设 ────────────────────────────────────────────

export interface ScenePresetV2 {
  id: string
  name: string
  nameEn: string
  emoji: string
  desc: string
  /** 预设的原子组合 */
  ids: AtomIdsV2
  /** 场景标签（用于 AI 协调推荐） */
  sceneTags: string[]
}

export const scenePresetsV2: ScenePresetV2[] = [
  {
    id: 'SP01',
    name: '文艺散文',
    nameEn: 'Literary Prose',
    emoji: '✒️',
    desc: '藤紫配色 + 文艺字体，适合散文、诗歌、读书笔记',
    ids: {
      blueprintId: 'B13',
      colorId: 'L5',
      typographyId: 'F2',
      slots: { title: 'center-symmetric', quote: 'big-quotes', list: 'dash-prefix', divider: 'ornament', paragraph: 'indented', section: 'flat-flow' },
    },
    sceneTags: ['literary', 'poetic', 'elegant', 'art'],
  },
  {
    id: 'SP02',
    name: '商务简约',
    nameEn: 'Business Clean',
    emoji: '💼',
    desc: '烟灰配色 + 现代字体，适合商务分析、工作总结',
    ids: {
      blueprintId: 'B14',
      colorId: 'L4',
      typographyId: 'F1',
      slots: { title: 'left-bar', quote: 'highlight-box', list: 'square', divider: 'thin-line', paragraph: 'justified', section: 'left-label' },
    },
    sceneTags: ['business', 'professional', 'clean', 'tech'],
  },
  {
    id: 'SP03',
    name: '禅意留白',
    nameEn: 'Zen Minimal',
    emoji: '🍵',
    desc: '奶茶配色 + 日式留白，适合生活感悟、慢节奏内容',
    ids: {
      blueprintId: 'B02',
      colorId: 'L1',
      typographyId: 'F2',
      slots: { title: 'zen-minimal', quote: 'dashed-frame', list: 'dash-prefix', divider: 'single-circle', paragraph: 'airy-wide', section: 'flat-flow' },
    },
    sceneTags: ['japanese', 'minimal', 'warm', 'lifestyle'],
  },
  {
    id: 'SP04',
    name: '杂志编辑',
    nameEn: 'Magazine Editorial',
    emoji: '📰',
    desc: '蓝调配色 + 首字放大，适合专题报道、深度分析',
    ids: {
      blueprintId: 'B09',
      colorId: 'L6',
      typographyId: 'F1',
      slots: { title: 'banner-full', quote: 'pull-quote', list: 'arrow', divider: 'gradient-line', paragraph: 'lead-paragraph', section: 'flat-flow' },
    },
    sceneTags: ['magazine', 'editorial', 'premium', 'professional'],
  },
  {
    id: 'SP05',
    name: '学术论文',
    nameEn: 'Academic Paper',
    emoji: '🎓',
    desc: '深海配色 + 双线框架，适合论文笔记、学术总结',
    ids: {
      blueprintId: 'B04',
      colorId: 'D3',
      typographyId: 'F1',
      slots: { title: 'double-border', quote: 'double-border', list: 'circle-number', divider: 'double-line', paragraph: 'justified', section: 'flat-flow' },
    },
    sceneTags: ['academic', 'formal', 'serious', 'analysis'],
  },
  {
    id: 'SP06',
    name: '卡片模块',
    nameEn: 'Card Modular',
    emoji: '🃏',
    desc: '薄荷配色 + 卡片阴影，适合知识卡片、信息整理',
    ids: {
      blueprintId: 'B07',
      colorId: 'L2',
      typographyId: 'F1',
      slots: { title: 'left-bar', quote: 'highlight-box', list: 'card-items', divider: 'dots', paragraph: 'compact', section: 'card-shadow' },
    },
    sceneTags: ['card', 'modular', 'structured', 'fresh'],
  },
  {
    id: 'SP07',
    name: '活泼趣味',
    nameEn: 'Playful Fun',
    emoji: '🍑',
    desc: '蜜桃配色 + 气泡圆润，适合生活分享、美食探店',
    ids: {
      blueprintId: 'B08',
      colorId: 'L3',
      typographyId: 'F3',
      slots: { title: 'bubble', quote: 'bubble', list: 'diamond', divider: 'dots', paragraph: 'compact', section: 'card-shadow' },
    },
    sceneTags: ['friendly', 'warm', 'cute', 'young', 'beauty'],
  },
  {
    id: 'SP08',
    name: '教程攻略',
    nameEn: 'Tutorial Guide',
    emoji: '📝',
    desc: '蓝调配色 + 编号步骤，适合教程、干货攻略',
    ids: {
      blueprintId: 'B11',
      colorId: 'L6',
      typographyId: 'F1',
      slots: { title: 'numbered', quote: 'highlight-box', list: 'checklist', divider: 'thin-line', paragraph: 'compact', section: 'flat-flow' },
    },
    sceneTags: ['tutorial', 'step-by-step', 'structured', 'education'],
  },
  {
    id: 'SP09',
    name: '暗夜金字',
    nameEn: 'Midnight Gold',
    emoji: '🌙',
    desc: '金字配色 + 线条主导，适合高端品牌、奢华调性',
    ids: {
      blueprintId: 'B03',
      colorId: 'D1',
      typographyId: 'F2',
      slots: { title: 'left-underline', quote: 'left-bar', list: 'arrow', divider: 'gradient-line', paragraph: 'compact', section: 'divider-separated' },
    },
    sceneTags: ['luxury', 'business', 'finance', 'premium'],
  },
  {
    id: 'SP10',
    name: '樱花浪漫',
    nameEn: 'Sakura Romance',
    emoji: '🌸',
    desc: '樱花配色 + 文艺字体，适合情感文章、女性向内容',
    ids: {
      blueprintId: 'B13',
      colorId: 'L8',
      typographyId: 'F2',
      slots: { title: 'center-symmetric', quote: 'big-quotes', list: 'dash-prefix', divider: 'ornament', paragraph: 'indented', section: 'flat-flow' },
    },
    sceneTags: ['feminine', 'romantic', 'emotional', 'literary'],
  },
]

// ─── 场景标签词典 ────────────────────────────────────────
// 用于 AI 协调增强：从文章内容关键词 → 场景标签

export const SCENE_TAG_KEYWORDS: Record<string, string[]> = {
  // 文学 / 情感
  literary: ['散文', '诗歌', '文学', '小说', '读书', '书评', '文字', '创作', '笔记'],
  poetic: ['诗', '诗意', '意境', '词', '古风', '韵味'],
  romantic: ['爱情', '恋爱', '浪漫', '告白', '约会', '情感', '温柔', '心动'],
  emotional: ['感动', '泪', '思念', '怀念', '离别', '成长', '治愈'],
  elegant: ['优雅', '精致', '格调', '品味', '美学'],

  // 商务 / 专业
  business: ['商务', '会议', '报告', '方案', '策划', '管理', '团队', '市场', '运营'],
  professional: ['专业', '效率', '分析', '数据', '战略', '规划', '项目'],
  finance: ['金融', '投资', '理财', '基金', '股票', '财报', '经济'],
  tech: ['技术', '开发', '程序', '代码', '软件', '系统', '架构', 'AI', '人工智能'],

  // 教育 / 学术
  academic: ['论文', '研究', '学术', '期刊', '引用', '实验', '理论'],
  education: ['教育', '学习', '课程', '考试', '知识', '考研', '英语', '留学'],
  tutorial: ['教程', '攻略', '步骤', '方法', '技巧', '指南', '入门', '实操'],

  // 生活 / 美食
  lifestyle: ['生活', '日常', '家居', '好物', '种草', '推荐', '安利'],
  warm: ['温暖', '幸福', '陪伴', '家人', '妈妈', '小确幸'],
  fresh: ['清新', '自然', '植物', '森林', '田园', '绿色', '春天'],
  health: ['健康', '运动', '健身', '瑜伽', '养生', '饮食'],
  nature: ['自然', '旅行', '风景', '户外', '露营', '山', '海'],

  // 美妆 / 时尚
  beauty: ['美妆', '护肤', '化妆', '口红', '面膜', '精华', '穿搭'],
  feminine: ['女性', '女生', '闺蜜', '少女', '甜美', '可爱'],
  young: ['青春', '大学', '校园', '活力', '元气', '快乐'],

  // 美食
  cute: ['萌', '可爱', '卡通', '手账', '手绘', '贴纸'],
  friendly: ['分享', '互动', '推荐', '体验', '测评', '打卡', '探店'],

  // 杂志 / 高级
  magazine: ['杂志', '专题', '封面', '排版', '设计', '视觉'],
  editorial: ['编辑', '深度', '调查', '评论', '观点', '洞察'],
  premium: ['高端', '奢华', '品牌', '质感', '定制', '限量'],
  luxury: ['奢侈', '名牌', '豪华', '精品', '钻石', '金色'],

  // 结构 / 卡片
  structured: ['清单', '列表', '分类', '整理', '归纳', '总结'],
  modular: ['模块', '卡片', '信息', '数据', '图表'],
  minimal: ['极简', '简约', '留白', '纯净', '素雅'],
  'step-by-step': ['步骤', '流程', '阶段', '第一步', '接下来'],

  // 设计 / 几何
  design: ['设计', '创意', '灵感', '配色', '排版', '海报'],
  geometric: ['几何', '图形', '线条', '对称', '图案'],

  // 日式
  japanese: ['日式', '和风', '禅', '侘寂', '枯山水', '抹茶'],

  // 时间线
  timeline: ['时间线', '历史', '年表', '回顾', '编年', '发展'],

  // 育儿
  parenting: ['育儿', '宝宝', '亲子', '儿童', '母婴', '早教'],

  // 编程
  programming: ['编程', '代码', '开发者', '前端', '后端', '数据库', 'Python', 'JavaScript'],
  geek: ['极客', '黑客', '开源', '终端', '命令行'],
}

// ─── AI 协调增强：文章内容分析 → 场景标签 ───────────────

/**
 * 分析文章内容，提取场景标签
 * 通过关键词匹配，返回按匹配度排序的标签
 */
export function analyzeArticleTags(article: string): string[] {
  if (!article || article.length < 10) return []

  const tagScores = new Map<string, number>()

  for (const [tag, keywords] of Object.entries(SCENE_TAG_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      // 计算关键词出现次数（最多计3次，避免单词刷分）
      const matches = article.split(kw).length - 1
      score += Math.min(matches, 3)
    }
    if (score > 0) {
      tagScores.set(tag, score)
    }
  }

  // 按分数降序排列，返回标签
  return [...tagScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}

/**
 * 根据文章内容推荐最匹配的场景预设
 * 返回按匹配度排序的预设列表（最多5个）
 */
export function recommendPresets(article: string): ScenePresetV2[] {
  const articleTags = analyzeArticleTags(article)
  if (articleTags.length === 0) return scenePresetsV2.slice(0, 5)

  const scored = scenePresetsV2.map(preset => {
    let score = 0
    for (const st of preset.sceneTags) {
      const idx = articleTags.indexOf(st)
      if (idx !== -1) {
        // 越靠前的标签分数越高
        score += (articleTags.length - idx)
      }
    }
    return { preset, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.preset)
}

/**
 * 根据场景标签获取预设
 */
export function getScenePreset(id: string): ScenePresetV2 | undefined {
  return scenePresetsV2.find(p => p.id === id)
}
