// PPTX 导入解析器
// 用 JSZip 解包 .pptx（本质是 ZIP），DOMParser 解析 XML，提取幻灯片数据 + 主题配色
// 标准 16:9 幻灯片尺寸：9144000 × 5143500 EMU

import JSZip from 'jszip'
import { makeId } from './slides-gen'
import type { Slide, SlideElement, SlideTheme, ElementStyle, ElementRole, ElementType, AnimationType, SlideLayout } from './slides-gen'

// ═══════════════════════════════════════
//  常量
// ═══════════════════════════════════════

const DEFAULT_SLIDE_W = 9144000   // EMU，标准 16:9 宽
const DEFAULT_SLIDE_H = 5143500   // EMU，标准 16:9 高

// ═══════════════════════════════════════
//  导出类型
// ═══════════════════════════════════════

export interface PptxThemeColors {
  dk1: string     // dark1  —— 主文字色（通常深色）
  lt1: string     // light1 —— 背景色（通常浅色/白）
  dk2: string     // dark2  —— 次深色
  lt2: string     // light2 —— 次浅色
  accent1: string
  accent2: string
  accent3: string
  accent4: string
  accent5: string
  accent6: string
}

export interface StyleProfile {
  // 从 PPTX 直接提取
  themeColors: PptxThemeColors
  bgColor: string        // 检测到的背景主色
  textColor: string      // 检测到的主文字色
  accentColor: string    // 主强调色（accent1）
  fontFamily: string     // 主字体

  // AI 分析结果（analyzeStyleWithAI 填充）
  styleKeywords: string[]   // ['极简', '商务', '深色'] 等
  tone: string              // '正式专业' | '活泼创意' | '学术严谨' 等
  layoutPattern: string     // '标题居左+右图' 等描述
  colorDescription: string  // '深蓝底 白字 金色强调'
  aiHint: string            // 给后续 AI 生成用的风格提示词（英文，更精准）

  // 映射为编辑器主题（用于导入后自动套色）
  mappedTheme: SlideTheme
}

export interface ParsedPptx {
  slides: Slide[]
  slideCount: number
  styleProfile: Omit<StyleProfile, 'styleKeywords' | 'tone' | 'layoutPattern' | 'colorDescription' | 'aiHint'>
  originalTitle: string
}

// ═══════════════════════════════════════
//  XML 工具（按 localName 查找，绕过命名空间前缀）
// ═══════════════════════════════════════

function getEl(parent: Element, localName: string): Element | null {
  for (const child of Array.from(parent.children)) {
    if (child.localName === localName) return child
  }
  return null
}

function findFirst(root: Element, localName: string): Element | null {
  if (root.localName === localName) return root
  for (const child of Array.from(root.children)) {
    const found = findFirst(child, localName)
    if (found) return found
  }
  return null
}

function findAll(root: Element, localName: string): Element[] {
  const results: Element[] = []
  const walk = (el: Element) => {
    if (el.localName === localName) results.push(el)
    for (const child of Array.from(el.children)) walk(child)
  }
  walk(root)
  return results
}

function parseXml(str: string): Document {
  return new DOMParser().parseFromString(str, 'text/xml')
}

// ═══════════════════════════════════════
//  颜色解析
// ═══════════════════════════════════════

function parseColorEl(el: Element | null): string | null {
  if (!el) return null
  const srgb = getEl(el, 'srgbClr')
  if (srgb) {
    const val = srgb.getAttribute('val')
    return val ? '#' + val.toUpperCase() : null
  }
  const sys = getEl(el, 'sysClr')
  if (sys) {
    const last = sys.getAttribute('lastClr')
    return last ? '#' + last.toUpperCase() : null
  }
  return null
}

function resolveSchemeColor(scheme: string, colors: PptxThemeColors): string {
  const map: Record<string, string> = {
    dk1: colors.dk1, lt1: colors.lt1, dk2: colors.dk2, lt2: colors.lt2,
    accent1: colors.accent1, accent2: colors.accent2, accent3: colors.accent3,
    accent4: colors.accent4, accent5: colors.accent5, accent6: colors.accent6,
    bg1: colors.lt1, bg2: colors.lt2, tx1: colors.dk1, tx2: colors.dk2,
    phClr: colors.accent1,
  }
  return map[scheme] || colors.dk1
}

// 判断颜色是否为深色
function isDark(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128
}

// ═══════════════════════════════════════
//  主题解析 (ppt/theme/theme1.xml)
// ═══════════════════════════════════════

function parseThemeColors(themeXml: string): { colors: PptxThemeColors; fontFamily: string } {
  const doc = parseXml(themeXml)
  const clrScheme = findFirst(doc.documentElement, 'clrScheme')

  function getColor(tagName: string): string {
    if (!clrScheme) return '#333333'
    const el = getEl(clrScheme, tagName)
    return parseColorEl(el) || '#333333'
  }

  const colors: PptxThemeColors = {
    dk1: getColor('dk1'), lt1: getColor('lt1'),
    dk2: getColor('dk2'), lt2: getColor('lt2'),
    accent1: getColor('accent1'), accent2: getColor('accent2'),
    accent3: getColor('accent3'), accent4: getColor('accent4'),
    accent5: getColor('accent5'), accent6: getColor('accent6'),
  }

  // 字体
  let fontFamily = 'Microsoft YaHei'
  const majorFont = findFirst(doc.documentElement, 'majorFont')
  if (majorFont) {
    const latin = getEl(majorFont, 'latin')
    const tf = latin?.getAttribute('typeface')
    if (tf && tf !== '+mj-lt') fontFamily = tf
  }

  return { colors, fontFamily }
}

// ═══════════════════════════════════════
//  从 SlideColors 映射到 SlideTheme
// ═══════════════════════════════════════

function buildMappedTheme(colors: PptxThemeColors, bgColor: string): SlideTheme {
  // bg 主色：lt1 通常是背景，但如果 lt1 是白色而实际背景更深，则用 dk1 的对比
  const bg = bgColor
  const dark = isDark(bg)

  const titleColor = dark ? colors.lt1 : colors.dk1
  const bodyColor  = dark ? colors.lt2 : colors.dk2
  const accent     = colors.accent1
  const accentText = isDark(accent) ? '#FFFFFF' : '#000000'
  const labelColor = colors.accent1

  return {
    name: '导入主题',
    bg,
    titleColor,
    bodyColor,
    accent,
    accentText,
    labelColor,
  }
}

// ═══════════════════════════════════════
//  EMU 单位换算
// ═══════════════════════════════════════

function emuToPct(emu: number, total: number): number {
  return Math.round((emu / total) * 1000) / 10   // 保留 1 位小数
}

// 字号：hundredths of a point (PPTX sz) → % of slide height
// 标准: pct = pt / 5.4,  pt = sz / 100
function szToPct(sz: string | null): number {
  if (!sz) return 3
  const pt = parseInt(sz) / 100
  const pct = pt / 5.4
  return Math.max(1.5, Math.min(12, Math.round(pct * 10) / 10))
}

// ═══════════════════════════════════════
//  占位符类型 → ElementRole
// ═══════════════════════════════════════

function phTypeToRole(type: string | null, idx: string | null): ElementRole | null {
  if (!type) {
    // 无 type 时 idx=0 通常是标题
    if (idx === '0') return 'title'
    return 'body'
  }
  if (type === 'title' || type === 'ctrTitle') return 'title'
  if (type === 'subTitle') return 'subtitle'
  if (type === 'body' || type === 'obj') return 'body'
  // 页码/日期/页脚 跳过
  if (type === 'sldNum' || type === 'dt' || type === 'ftr') return null
  return 'body'
}

// ═══════════════════════════════════════
//  解析文本框 (<p:sp>)
// ═══════════════════════════════════════

function parseTextShape(
  sp: Element,
  slideW: number,
  slideH: number,
  colors: PptxThemeColors,
): SlideElement | null {
  // 判断是否文本框
  const txBody = findFirst(sp, 'txBody')
  if (!txBody) return null

  // 位置尺寸
  const xfrm = findFirst(sp, 'xfrm')
  const off  = xfrm ? getEl(xfrm, 'off') : null
  const ext  = xfrm ? getEl(xfrm, 'ext') : null

  const x = emuToPct(parseInt(off?.getAttribute('x') || '0'), slideW)
  const y = emuToPct(parseInt(off?.getAttribute('y') || '0'), slideH)
  const w = emuToPct(parseInt(ext?.getAttribute('cx') || String(slideW * 0.8)), slideW)
  const h = emuToPct(parseInt(ext?.getAttribute('cy') || String(slideH * 0.2)), slideH)

  // 跳过宽/高为 0 的
  if (w <= 0 || h <= 0) return null

  // 文字内容（按段落拼接）
  const paras = findAll(txBody, 'p')
  const lines: string[] = []
  for (const para of paras) {
    const texts = findAll(para, 't').map(t => t.textContent || '')
    const line = texts.join('')
    lines.push(line)
  }
  const text = lines.filter(l => l.trim()).join('\n')
  if (!text) return null

  // 字号（优先取第一段第一个 rPr，再取 lstStyle/defRPr）
  let fontSize = 3
  const firstRPr = findFirst(txBody, 'rPr')
  if (firstRPr) fontSize = szToPct(firstRPr.getAttribute('sz'))
  else {
    const defRPr = findFirst(txBody, 'defRPr')
    if (defRPr) fontSize = szToPct(defRPr.getAttribute('sz'))
  }

  // 字重/斜体
  const fontWeight = firstRPr?.getAttribute('b') === '1' ? 'bold' : 'normal'
  const fontStyle  = firstRPr?.getAttribute('i') === '1' ? 'italic' : 'normal'

  // 对齐方式（<a:pPr algn="...">）
  const firstPPr = findFirst(txBody, 'pPr')
  const algn = firstPPr?.getAttribute('algn') || 'l'
  const textAlign = algn === 'ctr' ? 'center' : algn === 'r' ? 'right' : 'left'

  // 颜色 override（从 rPr/solidFill/srgbClr 取，如有）
  let colorOverride: string | undefined
  const solidFill = findFirst(txBody, 'solidFill')
  if (solidFill) {
    const srgb = getEl(solidFill, 'srgbClr')
    if (srgb) colorOverride = '#' + (srgb.getAttribute('val') || '').toUpperCase()
    const scheme = getEl(solidFill, 'schemeClr')
    if (scheme) colorOverride = resolveSchemeColor(scheme.getAttribute('val') || '', colors)
  }

  // 占位符角色
  const nvSpPr = findFirst(sp, 'nvSpPr')
  const ph = nvSpPr ? findFirst(nvSpPr, 'ph') : null
  const phType = ph?.getAttribute('type') || null
  const phIdx  = ph?.getAttribute('idx') || null
  const role: ElementRole = phTypeToRole(phType, phIdx) || 'body'

  const style: ElementStyle = {
    fontSize: Math.max(fontSize, role === 'title' ? 4 : 2.5),
    fontWeight: role === 'title' ? 'bold' : fontWeight,
    fontStyle,
    textAlign,
    lineHeight: 1.6,
    letterSpacing: 0,
    colorOverride,
  }

  return {
    id: makeId(),
    elementType: 'text' as ElementType,
    role,
    text,
    animation: 'none' as AnimationType,
    x, y, w, h,
    style,
  }
}

// ═══════════════════════════════════════
//  解析图片 (<p:pic>)
// ═══════════════════════════════════════

async function parsePicture(
  pic: Element,
  slideW: number,
  slideH: number,
  zip: JSZip,
  relsMap: Record<string, string>,  // rId → target file path
): Promise<SlideElement | null> {
  const blip = findFirst(pic, 'blip')
  if (!blip) return null

  const rId = blip.getAttribute('r:embed') || blip.getAttribute('embed')
  if (!rId) return null
  const imgPath = relsMap[rId]
  if (!imgPath) return null

  // 读取图片二进制转 base64
  let imageUrl: string | undefined
  try {
    const imgFile = zip.file(imgPath)
    if (imgFile) {
      const buf = await imgFile.async('base64')
      const ext  = imgPath.split('.').pop()?.toLowerCase() || 'png'
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                 : ext === 'gif' ? 'image/gif'
                 : ext === 'svg' ? 'image/svg+xml'
                 : 'image/png'
      imageUrl = `data:${mime};base64,${buf}`
    }
  } catch { /* 跳过无法读取的图片 */ }

  if (!imageUrl) return null

  // 位置尺寸
  const xfrm = findFirst(pic, 'xfrm')
  const off  = xfrm ? getEl(xfrm, 'off') : null
  const ext  = xfrm ? getEl(xfrm, 'ext') : null

  const x = emuToPct(parseInt(off?.getAttribute('x') || '0'), slideW)
  const y = emuToPct(parseInt(off?.getAttribute('y') || '0'), slideH)
  const w = emuToPct(parseInt(ext?.getAttribute('cx') || String(slideW * 0.4)), slideW)
  const h = emuToPct(parseInt(ext?.getAttribute('cy') || String(slideH * 0.4)), slideH)

  if (w <= 0 || h <= 0) return null

  const style: ElementStyle = {
    fontSize: 3, fontWeight: 'normal', fontStyle: 'normal',
    textAlign: 'left', lineHeight: 1.6, letterSpacing: 0,
  }

  return {
    id: makeId(),
    elementType: 'image' as ElementType,
    role: 'custom',
    text: '',
    imageUrl,
    animation: 'none' as AnimationType,
    x, y, w, h, style,
  }
}

// ═══════════════════════════════════════
//  读取 slide 关系文件 (.rels)，提取图片 rId → path 映射
// ═══════════════════════════════════════

async function parseSlideRels(zip: JSZip, slideRelPath: string): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  try {
    const relsFile = zip.file(slideRelPath)
    if (!relsFile) return map
    const xml = await relsFile.async('string')
    const doc  = parseXml(xml)
    for (const rel of findAll(doc.documentElement, 'Relationship')) {
      const id     = rel.getAttribute('Id') || ''
      const type   = rel.getAttribute('Type') || ''
      const target = rel.getAttribute('Target') || ''
      if (type.includes('image')) {
        // target 可能是 '../media/image1.png'，需要转成 ZIP 内绝对路径
        const base = slideRelPath.replace(/\/[^/]+$/, '/')   // 取目录部分
        const resolved = target.startsWith('../')
          ? 'ppt/' + target.slice(3)
          : base + target
        map[id] = resolved
      }
    }
  } catch {}
  return map
}

// ═══════════════════════════════════════
//  推断背景色
// ═══════════════════════════════════════

function detectBgColor(slideDoc: Document, colors: PptxThemeColors): string {
  // 1. 直接看 <p:bg> → <p:bgPr> → <a:solidFill>
  const bg    = findFirst(slideDoc.documentElement, 'bg')
  const bgPr  = bg ? findFirst(bg, 'bgPr') : null
  const fill  = bgPr ? findFirst(bgPr, 'solidFill') : null
  if (fill) {
    const srgb = getEl(fill, 'srgbClr')
    if (srgb) return '#' + (srgb.getAttribute('val') || 'FFFFFF').toUpperCase()
    const scheme = getEl(fill, 'schemeClr')
    if (scheme) return resolveSchemeColor(scheme.getAttribute('val') || 'lt1', colors)
  }
  // 2. Fallback：用 lt1 作为背景（通常正确）
  return colors.lt1
}

// ═══════════════════════════════════════
//  推断版式（猜 SlideLayout）
// ═══════════════════════════════════════

function guessLayout(elements: SlideElement[], slideIndex: number, totalSlides: number): SlideLayout {
  const hasTitle    = elements.some(e => e.role === 'title')
  const hasSubtitle = elements.some(e => e.role === 'subtitle')
  const bodyCount   = elements.filter(e => e.role === 'body').length

  // 首页
  if (slideIndex === 0 && hasTitle) return 'title'
  // 末页
  if (slideIndex === totalSlides - 1 && hasTitle && (hasSubtitle || elements.length <= 2)) return 'closing'
  // 双栏
  if (bodyCount >= 2) return 'two-column'
  // 引言：只有 1~2 个 body 且没有 title
  if (!hasTitle && bodyCount === 1) return 'quote'
  // 要点（body 文字含 • 符号）
  const bodyEl = elements.find(e => e.role === 'body')
  if (bodyEl && (bodyEl.text.includes('•') || bodyEl.text.includes('・') || bodyEl.text.includes('-') || bodyEl.text.includes('\n'))) return 'bullets'
  return 'content'
}

// ═══════════════════════════════════════
//  解析单张幻灯片
// ═══════════════════════════════════════

async function parseSlide(
  zip: JSZip,
  slidePath: string,
  slideRelPath: string,
  colors: PptxThemeColors,
  slideW: number,
  slideH: number,
  slideIndex: number,
  totalSlides: number,
): Promise<{ slide: Slide; bgColor: string | null }> {
  const xml  = await zip.file(slidePath)!.async('string')
  const doc  = parseXml(xml)
  const tree = findFirst(doc.documentElement, 'spTree')

  const bgColor = detectBgColor(doc, colors)
  const relsMap = await parseSlideRels(zip, slideRelPath)

  const elements: SlideElement[] = []

  if (tree) {
    // 文本框
    for (const sp of findAll(tree, 'sp')) {
      const el = parseTextShape(sp, slideW, slideH, colors)
      if (el) elements.push(el)
    }
    // 图片
    for (const pic of findAll(tree, 'pic')) {
      const el = await parsePicture(pic, slideW, slideH, zip, relsMap)
      if (el) elements.push(el)
    }
  }

  const layout = guessLayout(elements, slideIndex, totalSlides)

  const slide: Slide = {
    id: makeId(),
    layout,
    themeIndex: 0,
    elements,
  }

  return { slide, bgColor }
}

// ═══════════════════════════════════════
//  读取幻灯片列表 (presentation.xml)
// ═══════════════════════════════════════

async function getSlideList(zip: JSZip): Promise<string[]> {
  const presXml = await zip.file('ppt/presentation.xml')?.async('string')
  if (!presXml) return []
  const doc = parseXml(presXml)
  const sldIdLst = findFirst(doc.documentElement, 'sldIdLst')
  if (!sldIdLst) return []

  // sldId 有 r:id 属性，需要从 ppt/_rels/presentation.xml.rels 解析
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string')
  if (!relsXml) return []
  const relsDoc = parseXml(relsXml)
  const rIdMap: Record<string, string> = {}
  for (const rel of findAll(relsDoc.documentElement, 'Relationship')) {
    const id     = rel.getAttribute('Id') || ''
    const type   = rel.getAttribute('Type') || ''
    const target = rel.getAttribute('Target') || ''
    if (type.includes('slide') && !type.includes('slideLayout') && !type.includes('slideMaster')) {
      rIdMap[id] = target.startsWith('/') ? target.slice(1) : 'ppt/' + target
    }
  }

  const sldIds = findAll(sldIdLst, 'sldId')
  const paths: string[] = []
  for (const sld of sldIds) {
    const rId = sld.getAttribute('r:id') || sld.getAttribute('id') || ''
    if (rIdMap[rId]) paths.push(rIdMap[rId])
  }

  // 如果 r: 命名空间没解析到，降级：直接扫 ppt/slides/ 目录
  if (paths.length === 0) {
    const files = Object.keys(zip.files)
      .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || '0')
        const nb = parseInt(b.match(/\d+/)?.[0] || '0')
        return na - nb
      })
    return files
  }

  return paths
}

// ═══════════════════════════════════════
//  主入口：parsePptx
// ═══════════════════════════════════════

export async function parsePptx(file: File): Promise<ParsedPptx> {
  const zip = await JSZip.loadAsync(file)

  // 1. 解析主题色
  const themeFile = zip.file('ppt/theme/theme1.xml')
  const { colors, fontFamily } = themeFile
    ? parseThemeColors(await themeFile.async('string'))
    : { colors: defaultColors(), fontFamily: 'Microsoft YaHei' }

  // 2. 获取幻灯片文件列表（按顺序）
  const slidePaths = await getSlideList(zip)

  // 3. 解析每张幻灯片
  const slides: Slide[] = []
  let detectedBg = colors.lt1   // 默认背景

  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i]
    // .rels 文件路径：ppt/slides/_rels/slide1.xml.rels
    const slideRelPath = slidePath.replace(/\/([^/]+)$/, '/_rels/$1.rels')

    try {
      const { slide, bgColor } = await parseSlide(
        zip, slidePath, slideRelPath, colors,
        DEFAULT_SLIDE_W, DEFAULT_SLIDE_H,
        i, slidePaths.length,
      )
      slides.push(slide)
      if (bgColor && i === 0) detectedBg = bgColor  // 用第一页背景作代表
    } catch (err) {
      console.warn(`跳过无法解析的幻灯片: ${slidePath}`, err)
    }
  }

  // 4. 构建映射主题
  const mappedTheme = buildMappedTheme(colors, detectedBg)

  // 5. 提取标题（从第一页 title 元素）
  const firstSlide = slides[0]
  const titleEl = firstSlide?.elements.find(e => e.role === 'title')
  const originalTitle = titleEl?.text || file.name.replace(/\.pptx?$/i, '')

  const styleProfile = {
    themeColors: colors,
    bgColor: detectedBg,
    textColor: isDark(detectedBg) ? colors.lt1 : colors.dk1,
    accentColor: colors.accent1,
    fontFamily,
    mappedTheme,
  }

  return { slides, slideCount: slides.length, styleProfile, originalTitle }
}

// ═══════════════════════════════════════
//  提取摘要（给 AI 分析用）
// ═══════════════════════════════════════

export function summarizeParsedPptx(parsed: ParsedPptx): string {
  const { slides, styleProfile, originalTitle } = parsed
  const { themeColors: c, bgColor, accentColor } = styleProfile

  const slidesSummary = slides.slice(0, 8).map((s, i) => {
    const texts = s.elements.filter(e => e.elementType === 'text').map(e => `[${e.role}] ${e.text.slice(0, 60)}`).join(' | ')
    const imgs  = s.elements.filter(e => e.elementType === 'image').length
    return `第${i + 1}页(${s.layout}): ${texts}${imgs ? ` [图片×${imgs}]` : ''}`
  }).join('\n')

  return `演示文稿标题: "${originalTitle}"，共 ${slides.length} 页。
背景色: ${bgColor}  强调色: ${accentColor}
主题色板: dk1=${c.dk1} lt1=${c.lt1} accent1=${c.accent1} accent2=${c.accent2}
字体: ${styleProfile.fontFamily}

幻灯片内容摘要:
${slidesSummary}${slides.length > 8 ? `\n... 还有 ${slides.length - 8} 页` : ''}`
}

// ═══════════════════════════════════════
//  默认颜色（解析失败时使用）
// ═══════════════════════════════════════

function defaultColors(): PptxThemeColors {
  return {
    dk1: '#000000', lt1: '#FFFFFF', dk2: '#1F3864', lt2: '#E7E6E6',
    accent1: '#4472C4', accent2: '#ED7D31', accent3: '#A9D18E',
    accent4: '#FF0000', accent5: '#FFC000', accent6: '#00B0F0',
  }
}
