#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
//  YunType MCP Server — 云中书排版引擎 MCP 工具
//  让 Cline / Claude Code / Cursor 等 AI 助手直接调用 660 种排版组合
// ═══════════════════════════════════════════════════════════════

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// ═══════════════════════════════════════
//  内嵌原子数据（与 Web 应用同源）
// ═══════════════════════════════════════

interface ColorScheme {
  id: string; name: string; category: 'light' | 'dark'; tags: string[]
  colors: { pageBg: string; contentBg: string; primary: string; secondary: string; accent: string; text: string; textMuted: string }
}

const colorSchemes: ColorScheme[] = [
  { id: 'L1', name: '奶茶温柔', category: 'light', tags: ['温暖','生活','美食'], colors: { pageBg:'#FAF6F1', contentBg:'#FFFDF9', primary:'#C8A882', secondary:'#E8D5C0', accent:'#B8956A', text:'#5C4A3A', textMuted:'#9B8B7A' } },
  { id: 'L2', name: '薄荷清新', category: 'light', tags: ['清新','健康','自然'], colors: { pageBg:'#F0FAF6', contentBg:'#F8FFFC', primary:'#2D9F83', secondary:'#B8E6D6', accent:'#1A8A6E', text:'#2C4A40', textMuted:'#6B9B8A' } },
  { id: 'L3', name: '蜜桃活力', category: 'light', tags: ['活力','年轻','美妆'], colors: { pageBg:'#FFF5F0', contentBg:'#FFFAF7', primary:'#FF7B54', secondary:'#FFD4C4', accent:'#E8633A', text:'#5C3A2A', textMuted:'#B08070' } },
  { id: 'L4', name: '烟灰高级', category: 'light', tags: ['商务','科技','极简'], colors: { pageBg:'#F5F5F5', contentBg:'#FFFFFF', primary:'#6B6B6B', secondary:'#E0E0E0', accent:'#444444', text:'#333333', textMuted:'#999999' } },
  { id: 'L5', name: '藤紫文艺', category: 'light', tags: ['文学','艺术','诗意'], colors: { pageBg:'#F8F4FC', contentBg:'#FEFBFF', primary:'#8B6FC0', secondary:'#D8C8F0', accent:'#7055A8', text:'#3A2C50', textMuted:'#8B7BA0' } },
  { id: 'L6', name: '天青雅致', category: 'light', tags: ['科技','教育','专业'], colors: { pageBg:'#F2F7FA', contentBg:'#F9FCFE', primary:'#5B8FA8', secondary:'#C4DAE8', accent:'#3A7A98', text:'#2C3E4A', textMuted:'#7A9AAA' } },
  { id: 'L7', name: '樱花浪漫', category: 'light', tags: ['女性','浪漫','情感'], colors: { pageBg:'#FFF5F8', contentBg:'#FFFAFC', primary:'#D4729C', secondary:'#F0C4D8', accent:'#C05A88', text:'#4A2A3A', textMuted:'#A07888' } },
  { id: 'L8', name: '落日暖橘', category: 'light', tags: ['温暖','旅行','生活'], colors: { pageBg:'#FFF8F0', contentBg:'#FFFCF7', primary:'#E8914F', secondary:'#F8D4B0', accent:'#D07838', text:'#4A3020', textMuted:'#A08060' } },
  { id: 'D1', name: '墨夜金字', category: 'dark', tags: ['奢华','商务','金融'], colors: { pageBg:'#1A1A2E', contentBg:'#16213E', primary:'#D4A843', secondary:'#2A2A4A', accent:'#E8C060', text:'#E8E0D0', textMuted:'#8A8078' } },
  { id: 'D2', name: '深空科技', category: 'dark', tags: ['科技','极客','编程'], colors: { pageBg:'#0D1117', contentBg:'#161B22', primary:'#00D4AA', secondary:'#1A2A30', accent:'#58D6B0', text:'#C8D0D8', textMuted:'#6A7A80' } },
  { id: 'D3', name: '暗夜酒红', category: 'dark', tags: ['学术','分析','严肃'], colors: { pageBg:'#1A1018', contentBg:'#241820', primary:'#C75B5B', secondary:'#2A1A28', accent:'#E07070', text:'#E0D0D0', textMuted:'#887078' } },
]

const layoutNames: Record<string, string> = { T1:'紧凑知识型', T2:'舒展阅读型', T3:'卡片模块型', T4:'杂志编辑型', T5:'对话访谈型' }
const layoutIds = ['T1','T2','T3','T4','T5']
const decorationNames: Record<string, string> = { S1:'极简线条', S2:'色块标签', S3:'圆润气泡', S4:'几何装饰' }
const decorationIds = ['S1','S2','S3','S4']
const typographyNames: Record<string, string> = { F1:'现代简约', F2:'文艺优雅', F3:'活泼趣味' }
const typographyIds = ['F1','F2','F3']

const presets = [
  { name: '💼 商务简约', ids: { colorId:'L4', layoutId:'T1', decorationId:'S1', typographyId:'F1' } },
  { name: '🌿 文艺清新', ids: { colorId:'L2', layoutId:'T2', decorationId:'S3', typographyId:'F2' } },
  { name: '🍵 温柔奶茶', ids: { colorId:'L1', layoutId:'T2', decorationId:'S2', typographyId:'F2' } },
  { name: '🍑 活力蜜桃', ids: { colorId:'L3', layoutId:'T1', decorationId:'S4', typographyId:'F3' } },
  { name: '🌙 暗夜金字', ids: { colorId:'D1', layoutId:'T4', decorationId:'S2', typographyId:'F2' } },
  { name: '💻 科技极光', ids: { colorId:'D2', layoutId:'T1', decorationId:'S4', typographyId:'F1' } },
  { name: '🌸 樱花浪漫', ids: { colorId:'L8', layoutId:'T4', decorationId:'S3', typographyId:'F2' } },
  { name: '🌊 深海学术', ids: { colorId:'D3', layoutId:'T3', decorationId:'S2', typographyId:'F1' } },
]

// ═══════════════════════════════════════
//  简化的排版参数
// ═══════════════════════════════════════

function getLayoutParams(id: string) {
  const map: Record<string, any> = {
    T1: { fontSizeBody:'15px', fontSizeH1:'22px', fontSizeH2:'18px', fontSizeH3:'16px', lineHeight:'1.75', paragraphSpacing:'16px', headingTopSpacing:'28px', listItemSpacing:'6px', contentPadding:'20px 24px' },
    T2: { fontSizeBody:'16px', fontSizeH1:'24px', fontSizeH2:'20px', fontSizeH3:'17px', lineHeight:'2.0', paragraphSpacing:'24px', headingTopSpacing:'36px', listItemSpacing:'10px', contentPadding:'24px 28px', textIndent:'2em' },
    T3: { fontSizeBody:'15px', fontSizeH1:'22px', fontSizeH2:'18px', fontSizeH3:'16px', lineHeight:'1.8', paragraphSpacing:'20px', headingTopSpacing:'32px', listItemSpacing:'8px', contentPadding:'20px 24px' },
    T4: { fontSizeBody:'15px', fontSizeH1:'28px', fontSizeH2:'20px', fontSizeH3:'16px', lineHeight:'1.85', paragraphSpacing:'20px', headingTopSpacing:'48px', listItemSpacing:'8px', contentPadding:'24px 28px', firstParagraphSize:'18px', blockquoteFontSize:'16px', blockquoteTextAlign:'center', blockquoteFontStyle:'italic' },
    T5: { fontSizeBody:'15px', fontSizeH1:'22px', fontSizeH2:'18px', fontSizeH3:'16px', lineHeight:'1.8', paragraphSpacing:'16px', headingTopSpacing:'28px', listItemSpacing:'6px', contentPadding:'20px 24px' },
  }
  return map[id] || map['T1']
}

function getTypoParams(id: string) {
  const map: Record<string, any> = {
    F1: { headingWeight:'700', bodyWeight:'400', letterSpacing:'0.5px' },
    F2: { headingWeight:'600', bodyWeight:'400', letterSpacing:'1px' },
    F3: { headingWeight:'800', bodyWeight:'400', letterSpacing:'0px' },
  }
  return map[id] || map['F1']
}

// ═══════════════════════════════════════
//  Markdown 解析器（简化版）
// ═══════════════════════════════════════

interface MdNode { type: string; level?: number; text?: string; children?: string[]; ordered?: boolean; lang?: string; src?: string; alt?: string }

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:3px;font-size:0.9em;">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="text-decoration:underline;">$1</a>')
}

function parseMarkdown(md: string): MdNode[] {
  const lines = md.split('\n')
  const nodes: MdNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }
    const hm = line.match(/^(#{1,3})\s+(.+)/)
    if (hm) { nodes.push({ type:'heading', level:hm[1].length, text:hm[2].trim() }); i++; continue }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) { nodes.push({ type:'hr' }); i++; continue }
    const im = line.trim().match(/^!\[(.*)?\]\((.+?)\)$/)
    if (im) { nodes.push({ type:'image', alt:im[1]||'', src:im[2] }); i++; continue }
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim(); const cl: string[] = []; i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { cl.push(lines[i]); i++ }
      nodes.push({ type:'code', text:cl.join('\n'), lang:lang||undefined }); i++; continue
    }
    if (line.trimStart().startsWith('> ')) {
      const ql: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) { ql.push(lines[i].trimStart().slice(2)); i++ }
      nodes.push({ type:'blockquote', text:ql.join('\n') }); continue
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/,'').trim()); i++ }
      nodes.push({ type:'list', ordered:false, children:items }); continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/,'').trim()); i++ }
      nodes.push({ type:'list', ordered:true, children:items }); continue
    }
    nodes.push({ type:'paragraph', text:line.trim() }); i++
  }
  return nodes
}

// ═══════════════════════════════════════
//  HTML 渲染器（公众号兼容内联 CSS）
// ═══════════════════════════════════════

function renderWechatHTML(markdown: string, colorId: string, layoutId: string, decorationId: string, typographyId: string): string {
  const color = colorSchemes.find(c => c.id === colorId) || colorSchemes[0]
  const c = color.colors
  const p = getLayoutParams(layoutId)
  const typo = getTypoParams(typographyId)
  const nodes = parseMarkdown(markdown)
  let html = ''
  let isFirst = true

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const text = renderInline(node.text || '')
        const level = node.level || 2
        const sizes: Record<number,string> = { 1:p.fontSizeH1, 2:p.fontSizeH2, 3:p.fontSizeH3 }
        const fs = sizes[level] || p.fontSizeH2
        if (level === 1) {
          html += `<section style="margin-top:${p.headingTopSpacing};margin-bottom:${p.paragraphSpacing};font-size:${fs};font-weight:${typo.headingWeight};color:${c.primary};text-align:center;line-height:1.3;">${text}</section>`
        } else {
          html += `<section style="margin-top:${p.headingTopSpacing};margin-bottom:${p.paragraphSpacing};font-size:${fs};font-weight:${typo.headingWeight};color:${c.primary};line-height:1.4;">${text}</section>`
        }
        break
      }
      case 'paragraph': {
        const text = renderInline(node.text || '')
        const fs = (isFirst && p.firstParagraphSize) ? p.firstParagraphSize : p.fontSizeBody
        const indent = p.textIndent ? `text-indent:${p.textIndent};` : ''
        html += `<p style="margin:0 0 ${p.paragraphSpacing} 0;font-size:${fs};line-height:${p.lineHeight};color:${c.text};font-weight:${typo.bodyWeight};letter-spacing:${typo.letterSpacing};${indent}">${text}</p>`
        isFirst = false
        break
      }
      case 'blockquote': {
        const text = renderInline(node.text || '')
        html += `<section style="margin:0 0 ${p.paragraphSpacing} 0;padding:12px 16px;border-left:3px solid ${c.secondary};background:${c.secondary}20;border-radius:4px;font-size:${p.fontSizeBody};color:${c.text};line-height:${p.lineHeight};">${text}</section>`
        break
      }
      case 'list': {
        const items = (node.children || []).map((item, idx) => {
          const prefix = node.ordered
            ? `<span style="color:${c.primary};font-weight:bold;margin-right:6px;">${idx+1}.</span>`
            : `<span style="color:${c.primary};margin-right:6px;">●</span>`
          return `<section style="margin-bottom:${p.listItemSpacing};font-size:${p.fontSizeBody};line-height:${p.lineHeight};color:${c.text};">${prefix}${renderInline(item)}</section>`
        }).join('')
        html += `<section style="margin:0 0 ${p.paragraphSpacing} 0;padding-left:8px;">${items}</section>`
        break
      }
      case 'code': {
        const isDark = color.category === 'dark'
        const bgColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
        const textColor = isDark ? '#C8D0D8' : '#333333'
        const code = (node.text || '').replace(/</g, '<').replace(/>/g, '>')
        html += `<section style="margin:0 0 ${p.paragraphSpacing} 0;background:${bgColor};padding:12px 16px;border-radius:4px;overflow:hidden;"><pre style="margin:0;white-space:pre-wrap;word-break:break-all;font-size:13px;line-height:1.6;color:${textColor};font-family:Consolas,Monaco,'Courier New',monospace;">${code}</pre></section>`
        break
      }
      case 'hr':
        html += `<hr style="border:none;border-top:1px solid ${c.secondary};margin:${p.paragraphSpacing} 0;" />`
        break
      case 'image':
        html += `<section style="text-align:center;margin:16px 0;"><img src="${node.src}" alt="${node.alt||''}" style="max-width:100%;border-radius:4px;" /></section>`
        break
    }
  }

  return `<section style="background-color:${c.contentBg};padding:${p.contentPadding};max-width:100%;box-sizing:border-box;color:${c.text};font-size:${p.fontSizeBody};line-height:${p.lineHeight};letter-spacing:${typo.letterSpacing};font-weight:${typo.bodyWeight};">${html}</section>`
}

// ═══════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function getComboName(cid: string, lid: string, did: string, tid: string): string {
  const cn = colorSchemes.find(c => c.id === cid)?.name || cid
  return `${cn} · ${layoutNames[lid]||lid} · ${decorationNames[did]||did} · ${typographyNames[tid]||tid}`
}

// ═══════════════════════════════════════
//  MCP Server 定义
// ═══════════════════════════════════════

const server = new McpServer({
  name: 'yuntype',
  version: '0.1.0',
})

// Tool 1: 列出所有可用风格
server.tool(
  'yuntype_list_styles',
  '列出云中书所有可用的排版风格选项：11种配色、5种排版结构、4种装饰风格、3种字体气质，以及8个精选预设',
  {},
  async () => {
    const colors = colorSchemes.map(c => `  ${c.id}: ${c.name}（${c.category === 'dark' ? '深色' : '浅色'}，适合: ${c.tags.join('/')}）`)
    const layouts = layoutIds.map(id => `  ${id}: ${layoutNames[id]}`)
    const decos = decorationIds.map(id => `  ${id}: ${decorationNames[id]}`)
    const typos = typographyIds.map(id => `  ${id}: ${typographyNames[id]}`)
    const presetList = presets.map(p => `  ${p.name} → colorId:${p.ids.colorId} layoutId:${p.ids.layoutId} decorationId:${p.ids.decorationId} typographyId:${p.ids.typographyId}`)

    return {
      content: [{
        type: 'text' as const,
        text: `🎨 云中书 YunType — 660种排版组合\n\n` +
          `═══ 配色方案（11种）═══\n${colors.join('\n')}\n\n` +
          `═══ 排版结构（5种）═══\n${layouts.join('\n')}\n\n` +
          `═══ 装饰风格（4种）═══\n${decos.join('\n')}\n\n` +
          `═══ 字体气质（3种）═══\n${typos.join('\n')}\n\n` +
          `═══ 精选预设（8套）═══\n${presetList.join('\n')}\n\n` +
          `总组合数: ${colorSchemes.length} × ${layoutIds.length} × ${decorationIds.length} × ${typographyIds.length} = 660`,
      }],
    }
  },
)

// Tool 2: 随机生成一套风格
server.tool(
  'yuntype_random_style',
  '随机生成一套排版风格组合（从660种中随机选取）',
  {},
  async () => {
    const cid = randomPick(colorSchemes).id
    const lid = randomPick(layoutIds)
    const did = randomPick(decorationIds)
    const tid = randomPick(typographyIds)
    return {
      content: [{
        type: 'text' as const,
        text: `🎲 随机排版组合:\n\n` +
          `风格名: ${getComboName(cid, lid, did, tid)}\n` +
          `colorId: ${cid}\nlayoutId: ${lid}\ndecorationId: ${did}\ntypographyId: ${tid}\n\n` +
          `可直接用于 yuntype_format 工具`,
      }],
    }
  },
)

// Tool 3: 核心排版工具
server.tool(
  'yuntype_format',
  '将 Markdown 文章排版为微信公众号兼容的内联CSS HTML。传入文章内容和风格参数（colorId, layoutId, decorationId, typographyId），返回可直接粘贴到公众号编辑器的富文本HTML。',
  {
    markdown: z.string().describe('Markdown 格式的文章内容'),
    colorId: z.string().describe('配色方案ID（L1-L8浅色，D1-D3深色）').default('L4'),
    layoutId: z.string().describe('排版结构ID（T1紧凑知识型/T2舒展阅读型/T3卡片模块型/T4杂志编辑型/T5对话访谈型）').default('T1'),
    decorationId: z.string().describe('装饰风格ID（S1极简线条/S2色块标签/S3圆润气泡/S4几何装饰）').default('S1'),
    typographyId: z.string().describe('字体气质ID（F1现代简约/F2文艺优雅/F3活泼趣味）').default('F1'),
  },
  async ({ markdown, colorId, layoutId, decorationId, typographyId }) => {
    const html = renderWechatHTML(markdown, colorId, layoutId, decorationId, typographyId)
    const name = getComboName(colorId, layoutId, decorationId, typographyId)
    return {
      content: [{
        type: 'text' as const,
        text: `✅ 排版完成！风格: ${name}\n\n` +
          `<!-- 以下 HTML 可直接粘贴到微信公众号编辑器 -->\n${html}`,
      }],
    }
  },
)

// Tool 4: 使用预设排版
server.tool(
  'yuntype_preset',
  '使用精选预设排版文章。可选预设: 商务简约/文艺清新/温柔奶茶/活力蜜桃/暗夜金字/科技极光/樱花浪漫/深海学术',
  {
    markdown: z.string().describe('Markdown 格式的文章内容'),
    preset: z.string().describe('预设名称（商务简约/文艺清新/温柔奶茶/活力蜜桃/暗夜金字/科技极光/樱花浪漫/深海学术）').default('商务简约'),
  },
  async ({ markdown, preset }) => {
    const found = presets.find(p => p.name.includes(preset))
    if (!found) {
      return { content: [{ type: 'text' as const, text: `❌ 未找到预设"${preset}"。可选: ${presets.map(p=>p.name).join(', ')}` }] }
    }
    const { colorId, layoutId, decorationId, typographyId } = found.ids
    const html = renderWechatHTML(markdown, colorId, layoutId, decorationId, typographyId)
    return {
      content: [{
        type: 'text' as const,
        text: `✅ 使用预设「${found.name}」排版完成！\n\n` +
          `<!-- 以下 HTML 可直接粘贴到微信公众号编辑器 -->\n${html}`,
      }],
    }
  },
)

// ═══════════════════════════════════════
//  Resource: 排版指南
// ═══════════════════════════════════════

server.resource(
  'style-guide',
  'yuntype://style-guide',
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: 'text/plain',
      text: `# 云中书 YunType 排版风格指南

## 文章类型 → 推荐风格

技术教程 → L4烟灰高级 + T1紧凑知识型 + S1极简线条 + F1现代简约
生活随笔 → L1奶茶温柔 + T2舒展阅读型 + S3圆润气泡 + F2文艺优雅
商业分析 → L4烟灰高级 + T4杂志编辑型 + S2色块标签 + F1现代简约
美妆种草 → L3蜜桃活力 + T1紧凑知识型 + S4几何装饰 + F3活泼趣味
旅行游记 → L7樱花浪漫 + T4杂志编辑型 + S3圆润气泡 + F2文艺优雅
书评影评 → L5藤紫文艺 + T2舒展阅读型 + S1极简线条 + F2文艺优雅
编程教程 → D2深空科技 + T1紧凑知识型 + S4几何装饰 + F1现代简约
育儿经验 → L8落日暖橘 + T2舒展阅读型 + S2色块标签 + F3活泼趣味
财经分析 → D1墨夜金字 + T4杂志编辑型 + S2色块标签 + F2文艺优雅
学术论文 → D3暗夜酒红 + T3卡片模块型 + S1极简线条 + F1现代简约
人物访谈 → L1奶茶温柔 + T5对话访谈型 + S3圆润气泡 + F2文艺优雅

## 使用提示
- 先分析文章类型和气质，参考上方推荐选择风格
- 调用 yuntype_list_styles 查看所有选项
- 调用 yuntype_format 执行排版
- 或直接调用 yuntype_preset 使用精选预设`,
    }],
  }),
)

// ═══════════════════════════════════════
//  启动服务器
// ═══════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
