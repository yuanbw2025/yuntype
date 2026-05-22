// PPTX 导入解析器
// 用 JSZip 解包 .pptx（本质是 ZIP），DOMParser 解析 XML，提取幻灯片数据 + 主题配色
// 标准 16:9 幻灯片尺寸：9144000 × 5143500 EMU

import JSZip from 'jszip'
import { makeId } from './slides-gen'
import type {
  Slide, SlideElement, SlideTheme, ElementStyle, ElementRole,
  ElementType, AnimationType, AnimationTrigger, SlideLayout,
} from './slides-gen'

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
//  PPTX 预设几何体 → SVG path（viewBox 0 0 100 100）
// ═══════════════════════════════════════

// 生成正多边形
function polyPath(sides: number, cx = 50, cy = 50, r = 50, startAngle = -Math.PI / 2): string {
  const pts: string[] = []
  for (let i = 0; i < sides; i++) {
    const a = startAngle + (2 * Math.PI * i) / sides
    const x = (cx + r * Math.cos(a)).toFixed(2)
    const y = (cy + r * Math.sin(a)).toFixed(2)
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return pts.join(' ') + ' Z'
}

// 生成星形
function starPath(points: number, outerR = 50, innerR = 20, cx = 50, cy = 50): string {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI / points) - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = (cx + r * Math.cos(a)).toFixed(2)
    const y = (cy + r * Math.sin(a)).toFixed(2)
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
  }
  return pts.join(' ') + ' Z'
}

// 30+ 常用 PPTX 预设几何体 → SVG path（归一化到 0-100 坐标系）
const PRESET_PATHS: Record<string, string> = {
  // 基础矩形（用 div 时不需要，但 SVG 渲染也提供）
  rect:           'M0,0 H100 V100 H0 Z',
  // 圆角矩形 — 用 CSS border-radius 处理，这里给备用 path
  roundRect:      'M10,0 H90 Q100,0 100,10 V90 Q100,100 90,100 H10 Q0,100 0,90 V10 Q0,0 10,0 Z',
  // 椭圆
  ellipse:        'M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z',
  // 三角形
  triangle:       'M50,0 L100,100 L0,100 Z',
  rtTriangle:     'M0,0 L100,100 L0,100 Z',
  // 菱形
  diamond:        'M50,0 L100,50 L50,100 L0,50 Z',
  // 平行四边形
  parallelogram:  'M25,0 L100,0 L75,100 L0,100 Z',
  // 梯形
  trapezoid:      'M0,100 L20,0 L80,0 L100,100 Z',
  // 多边形
  pentagon:       polyPath(5),
  hexagon:        'M25,0 L75,0 L100,50 L75,100 L25,100 L0,50 Z',
  heptagon:       polyPath(7),
  octagon:        'M29,0 L71,0 L100,29 L100,71 L71,100 L29,100 L0,71 L0,29 Z',
  decagon:        polyPath(10),
  dodecagon:      polyPath(12),
  // 星形
  star4:          starPath(4, 50, 20),
  star5:          starPath(5, 50, 21),
  star6:          starPath(6, 50, 25),
  star7:          starPath(7, 50, 25),
  star8:          starPath(8, 50, 20),
  star10:         starPath(10, 50, 22),
  star12:         starPath(12, 50, 25),
  star16:         starPath(16, 50, 30),
  star24:         starPath(24, 50, 35),
  star32:         starPath(32, 50, 38),
  // 箭头
  rightArrow:     'M0,35 L65,35 L65,0 L100,50 L65,100 L65,65 L0,65 Z',
  leftArrow:      'M100,35 L35,35 L35,0 L0,50 L35,100 L35,65 L100,65 Z',
  upArrow:        'M35,100 L35,35 L0,35 L50,0 L100,35 L65,35 L65,100 Z',
  downArrow:      'M35,0 L35,65 L0,65 L50,100 L100,65 L65,65 L65,0 Z',
  leftRightArrow: 'M0,50 L20,15 L20,40 L80,40 L80,15 L100,50 L80,85 L80,60 L20,60 L20,85 Z',
  upDownArrow:    'M50,0 L15,20 L40,20 L40,80 L15,80 L50,100 L85,80 L60,80 L60,20 L85,20 Z',
  bentArrow:      'M0,40 L40,40 L40,0 L100,50 L40,100 L40,60 L0,60 Z',
  // 标注气泡
  callout1:       'M0,0 H100 V75 H60 L50,100 L40,75 H0 Z',
  callout2:       'M0,0 H100 V75 H70 L85,100 L55,75 H0 Z',
  wedgeRectCallout: 'M0,0 H100 V75 H55 L50,100 L45,75 H0 Z',
  // 其他常用
  chord:          'M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 L0,100 Z',
  arc:            'M0,50 C0,22.4 22.4,0 50,0 C77.6,0 100,22.4 100,50',
  plus:           'M35,0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z',
  cross:          'M35,0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z',
  cube:           'M25,10 L75,10 L100,35 L100,90 L50,90 L25,65 Z M25,10 L25,65 L50,90 M75,10 L100,35',
  can:            'M0,15 C0,7 22,0 50,0 C78,0 100,7 100,15 L100,85 C100,93 78,100 50,100 C22,100 0,93 0,85 Z',
  // 线条类（将在渲染时特殊处理）
  line:           'M0,50 L100,50',
  straightConnector1: 'M0,50 L100,50',
  bentConnector2: 'M0,0 L0,50 L100,50 L100,100',
  bentConnector3: 'M0,0 L50,0 L50,100 L100,100',
  curvedConnector2: 'M0,0 C0,50 100,50 100,100',
  curvedConnector3: 'M0,0 C50,0 50,100 100,100',
  // 色带/丝带
  ribbon:         'M0,20 H70 L80,0 L90,20 H100 V80 H90 L80,100 L70,80 H0 Z',
  ribbon2:        'M100,20 H30 L20,0 L10,20 H0 V80 H10 L20,100 L30,80 H100 Z',
  // 心形（近似）
  heart:          'M50,85 C30,70 0,60 0,35 C0,15 15,0 35,0 C42,0 48,3 50,8 C52,3 58,0 65,0 C85,0 100,15 100,35 C100,60 70,70 50,85 Z',
  // 闪电
  lightningBolt:  'M60,0 L25,55 L50,55 L40,100 L75,45 L50,45 Z',
  // 云朵（近似）
  cloud:          'M25,70 C10,70 0,60 0,48 C0,36 10,26 22,26 C24,14 34,5 46,5 C54,5 62,9 67,16 C70,13 75,11 80,11 C91,11 100,20 100,31 C100,42 91,51 80,51 C78,51 76,50 74,50 C74,62 64,70 52,70 Z',
  // 表格/格子
  snip1Rect:      'M0,0 H80 L100,20 V100 H0 Z',
  snip2SameRect:  'M20,0 H80 L100,20 V80 L80,100 H20 L0,80 V20 Z',
  snipRoundRect:  'M10,0 H90 Q100,0 100,10 V80 L80,100 H0 V10 Q0,0 10,0 Z',
  // 文档
  homePlate:      'M0,0 H75 L100,50 L75,100 H0 Z',
  chevron:        'M0,0 H75 L100,50 L75,100 H0 L25,50 Z',
  pie:            'M50,50 L50,0 A50,50 0 0,1 100,50 Z',
  halfFrame:      'M0,0 H100 V20 H20 V80 H0 Z',
  corner:         'M0,0 H20 V80 H100 V100 H0 Z',
}

// 将 DrawingML 自定义路径 (<a:custGeom>) 转为 SVG path 字符串
// 路径坐标规格化到 0-100 坐标系
function custGeomToSvgPath(custGeom: Element): string {
  const pathList = findFirst(custGeom, 'pathLst')
  if (!pathList) return 'M0,0 H100 V100 H0 Z'

  const pathEl = getEl(pathList, 'path')
  if (!pathEl) return 'M0,0 H100 V100 H0 Z'

  const pw = parseInt(pathEl.getAttribute('w') || '100')
  const ph = parseInt(pathEl.getAttribute('h') || '100')
  const scaleX = (v: number) => ((v / pw) * 100).toFixed(2)
  const scaleY = (v: number) => ((v / ph) * 100).toFixed(2)
  const pt = (el: Element) => `${scaleX(parseInt(el.getAttribute('x') || '0'))},${scaleY(parseInt(el.getAttribute('y') || '0'))}`

  const parts: string[] = []
  for (const cmd of Array.from(pathEl.children)) {
    switch (cmd.localName) {
      case 'moveTo': {
        const p = getEl(cmd, 'pt'); if (p) parts.push(`M${pt(p)}`); break
      }
      case 'lnTo': {
        const p = getEl(cmd, 'pt'); if (p) parts.push(`L${pt(p)}`); break
      }
      case 'cubicBezTo': {
        const pts = Array.from(cmd.children).filter(c => c.localName === 'pt')
        if (pts.length === 3) parts.push(`C${pt(pts[0])} ${pt(pts[1])} ${pt(pts[2])}`); break
      }
      case 'quadBezTo': {
        const pts = Array.from(cmd.children).filter(c => c.localName === 'pt')
        if (pts.length === 2) parts.push(`Q${pt(pts[0])} ${pt(pts[1])}`); break
      }
      case 'arcTo': {
        // PPTX arcTo → SVG A（近似：取 sweepAng 决定方向）
        const wR  = Math.abs(parseInt(cmd.getAttribute('wR') || '50'))
        const hR  = Math.abs(parseInt(cmd.getAttribute('hR') || '50'))
        const swAng = parseInt(cmd.getAttribute('swAng') || '5400000')
        const largeArc = Math.abs(swAng) > 10800000 ? 1 : 0
        const sweep    = swAng > 0 ? 1 : 0
        // 终点是相对于当前点移动，简化处理：移到半径末端
        const rx = (wR / pw * 100).toFixed(2)
        const ry = (hR / ph * 100).toFixed(2)
        const ex = (wR / pw * 100 * 2).toFixed(2)
        const ey = (hR / ph * 100 * 2).toFixed(2)
        parts.push(`A${rx},${ry} 0 ${largeArc},${sweep} ${ex},${ey}`)
        break
      }
      case 'close': parts.push('Z'); break
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'M0,0 H100 V100 H0 Z'
}

// ═══════════════════════════════════════
//  填充色 / 描边解析
// ═══════════════════════════════════════

function parseFillFromSpPr(spPr: Element | null, colors: PptxThemeColors): string | null {
  if (!spPr) return null
  // 无填充
  if (findFirst(spPr, 'noFill')) return 'none'
  // 实色
  const solid = findFirst(spPr, 'solidFill')
  if (solid) {
    const srgb = getEl(solid, 'srgbClr')
    if (srgb) return '#' + (srgb.getAttribute('val') || '').toUpperCase()
    const scheme = getEl(solid, 'schemeClr')
    if (scheme) return resolveSchemeColor(scheme.getAttribute('val') || '', colors)
    const prstClr = getEl(solid, 'prstClr')
    if (prstClr) return prstClrToHex(prstClr.getAttribute('val') || '')
  }
  // 渐变 → 取第一个停止色
  const grad = findFirst(spPr, 'gradFill')
  if (grad) {
    const gsLst = findFirst(grad, 'gsLst')
    const firstGs = gsLst ? Array.from(gsLst.children)[0] : null
    if (firstGs) {
      const srgb = getEl(firstGs, 'srgbClr')
      if (srgb) return '#' + (srgb.getAttribute('val') || '').toUpperCase()
      const scheme = getEl(firstGs, 'schemeClr')
      if (scheme) return resolveSchemeColor(scheme.getAttribute('val') || '', colors)
    }
  }
  // 图案填充 → fallback
  return null
}

function parseStrokeFromSpPr(spPr: Element | null, colors: PptxThemeColors): { color: string | null; width: number } {
  if (!spPr) return { color: null, width: 0 }
  const ln = getEl(spPr, 'ln')
  if (!ln) return { color: null, width: 0 }
  if (findFirst(ln, 'noFill')) return { color: null, width: 0 }
  const w = parseInt(ln.getAttribute('w') || '0') / 12700 / 720 * 100  // EMU → %
  const solid = findFirst(ln, 'solidFill')
  if (solid) {
    const srgb = getEl(solid, 'srgbClr')
    if (srgb) return { color: '#' + (srgb.getAttribute('val') || '').toUpperCase(), width: w }
    const scheme = getEl(solid, 'schemeClr')
    if (scheme) return { color: resolveSchemeColor(scheme.getAttribute('val') || '', colors), width: w }
  }
  return { color: null, width: w }
}

// 预设颜色名 → hex（常用子集）
function prstClrToHex(name: string): string {
  const map: Record<string, string> = {
    black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#00FF00',
    blue: '#0000FF', yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF',
    orange: '#FFA500', purple: '#800080', gray: '#808080', grey: '#808080',
    darkBlue: '#00008B', darkRed: '#8B0000', darkGreen: '#006400',
    lightBlue: '#ADD8E6', lightGray: '#D3D3D3', navy: '#000080',
  }
  return map[name] || '#888888'
}

// ═══════════════════════════════════════
//  动画解析 (<p:timing>)
// ═══════════════════════════════════════

export interface ElementAnimation {
  animation: AnimationType
  trigger: AnimationTrigger
  order: number    // 点击序号（1开始）；0表示进入即播
  delay: number    // ms
}

// PPTX presetID + presetSubtype → 我们的 AnimationType
function mapPresetAnim(presetID: number, presetSubtype: number): AnimationType {
  switch (presetID) {
    case 1:  return 'appear'        // Appear
    case 2:                         // Fly In（按方向）
      if (presetSubtype === 4 || presetSubtype === 16) return 'slide-left'
      return 'slide-up'             // 2=from bottom, 8=from top
    case 3: case 4: case 5: case 6: case 7:
    case 8: case 10: case 14: case 15: case 16: case 17:
      return 'fade'                 // Blinds/Box/Checkerboard等 → 近似淡入
    case 21:  return 'fade'         // Fade
    case 22:  return 'zoom'         // Swivel / Zoom
    case 27:  return 'slide-up'     // Rise Up
    case 30:  return 'zoom'         // Basic Zoom
    case 32:  return 'slide-up'     // Float Up
    case 54:  return 'bounce'       // Bounce
    default:  return 'fade'
  }
}

// 解析幻灯片的 timing 区，返回 spid → ElementAnimation 的 Map
export function parseAnimations(slideDoc: Document): Map<string, ElementAnimation> {
  const result = new Map<string, ElementAnimation>()

  const timing = findFirst(slideDoc.documentElement, 'timing')
  if (!timing) return result

  // 找 mainSeq（nodeType="mainSeq" 的 cTn）
  const allCTns = findAll(timing, 'cTn')
  let clickOrder = 0

  for (const cTn of allCTns) {
    const nodeType   = cTn.getAttribute('nodeType') || ''
    const presetClass = cTn.getAttribute('presetClass') || ''
    const presetID   = parseInt(cTn.getAttribute('presetID') || '0')
    const presetSub  = parseInt(cTn.getAttribute('presetSubtype') || '0')
    const durAttr    = cTn.getAttribute('dur') || '0'

    // 只处理入场效果
    if (presetClass !== 'entr') continue

    if (nodeType === 'clickEffect') clickOrder++
    const trigger: AnimationTrigger =
      nodeType === 'clickEffect' ? 'click'
      : nodeType === 'afterEffect' ? 'after'
      : 'with'

    // 延迟
    const delay = parseInt(durAttr !== 'indefinite' ? durAttr : '0') || 0

    // 找 tgtEl/spTgt
    // 向上查父级 par 找 tgtEl（PPTX 结构：cTn 和 tgtEl 同级在 set/animEffect 下）
    const parentEl = cTn.parentElement
    if (!parentEl) continue

    // 查找整个 animation 块（当前 par）下所有 spTgt
    const par = parentEl.parentElement  // par > cTn
    if (!par) continue

    const spTgts = findAll(par, 'spTgt')
    for (const spTgt of spTgts) {
      const spid = spTgt.getAttribute('spid')
      if (spid && !result.has(spid)) {
        result.set(spid, {
          animation: mapPresetAnim(presetID, presetSub),
          trigger,
          order: clickOrder,
          delay,
        })
      }
    }
  }

  return result
}

// ═══════════════════════════════════════
//  解析形状元素 (<p:sp> 不含文字 / <p:cxnSp> 连接线)
// ═══════════════════════════════════════

function parseShapeElement(
  sp: Element,
  slideW: number,
  slideH: number,
  colors: PptxThemeColors,
  animMap: Map<string, ElementAnimation>,
): SlideElement | null {
  // 取形状 ID（用于匹配动画）
  const cNvPr = findFirst(sp, 'cNvPr')
  const spid  = cNvPr?.getAttribute('id') || ''

  // 位置尺寸
  const xfrm = findFirst(sp, 'xfrm')
  const off  = xfrm ? getEl(xfrm, 'off') : null
  const ext  = xfrm ? getEl(xfrm, 'ext') : null
  const flipH = xfrm?.getAttribute('flipH') === '1'
  const flipV = xfrm?.getAttribute('flipV') === '1'

  const x = emuToPct(parseInt(off?.getAttribute('x') || '0'), slideW)
  const y = emuToPct(parseInt(off?.getAttribute('y') || '0'), slideH)
  const w = emuToPct(parseInt(ext?.getAttribute('cx') || '0'), slideW)
  const h = emuToPct(parseInt(ext?.getAttribute('cy') || '0'), slideH)

  if (w <= 0.5 || h <= 0.5) return null  // 过小的形状跳过

  // 几何体
  const spPr = findFirst(sp, 'spPr')
  let svgPath = 'M0,0 H100 V100 H0 Z'
  let shapePreset = 'rect'

  const prstGeom = spPr ? findFirst(spPr, 'prstGeom') : null
  const custGeom = spPr ? findFirst(spPr, 'custGeom') : null

  if (prstGeom) {
    const prst = prstGeom.getAttribute('prst') || 'rect'
    shapePreset = prst
    svgPath = PRESET_PATHS[prst] || 'M0,0 H100 V100 H0 Z'
    // 圆角矩形：调整圆角（avLst > gd adj）
    if (prst === 'roundRect') {
      const adj = findFirst(prstGeom, 'gd')
      const adjVal = parseInt(adj?.getAttribute('fmla')?.replace('val ', '') || '16667') / 100000
      const r = Math.round(adjVal * 50)
      svgPath = `M${r},0 H${100-r} Q100,0 100,${r} V${100-r} Q100,100 ${100-r},100 H${r} Q0,100 0,${100-r} V${r} Q0,0 ${r},0 Z`
    }
  } else if (custGeom) {
    svgPath = custGeomToSvgPath(custGeom)
    shapePreset = 'custom'
  } else {
    // 连接线 (cxnSp)：默认直线
    svgPath = PRESET_PATHS['line'] || 'M0,50 L100,50'
    shapePreset = 'line'
  }

  // 翻转（用 SVG transform）
  if (flipH || flipV) {
    const tx = flipH ? 'scale(-1,1) translate(-100,0)' : ''
    const ty = flipV ? 'scale(1,-1) translate(0,-100)' : ''
    const transform = [tx, ty].filter(Boolean).join(' ')
    if (transform) svgPath = `<g transform="${transform}">${svgPath}</g>`
    // 注意：上面这种方式不能直接放在 svgPath 字符串里（会混合元素和路径）
    // 实际渲染时需要处理，这里先记录翻转标记，简化处理
    // 真正的翻转在 SVG 组件中通过 style transform 处理
  }

  // 填充 & 描边
  const fillColor  = parseFillFromSpPr(spPr, colors)
  const stroke     = parseStrokeFromSpPr(spPr, colors)

  if (fillColor === 'none' && !stroke.color) return null  // 完全透明且无边框 → 跳过

  // 动画
  const anim = animMap.get(spid)

  const style: ElementStyle = {
    fontSize: 3, fontWeight: 'normal', fontStyle: 'normal',
    textAlign: 'left', lineHeight: 1, letterSpacing: 0,
  }

  return {
    id: makeId(),
    elementType: 'shape' as ElementType,
    role: 'custom',
    text: '',
    svgPath,
    shapeFill: fillColor || colors.accent1,
    shapeStroke: stroke.color || undefined,
    shapeStrokeWidth: stroke.width || undefined,
    shapePreset,
    animation: anim?.animation ?? 'none',
    animationTrigger: anim?.trigger,
    animationOrder: anim?.order,
    animationDelay: anim?.delay,
    x, y, w, h, style,
  }
}

// ═══════════════════════════════════════
//  解析文本框 (<p:sp>)
// ═══════════════════════════════════════

function parseTextShape(
  sp: Element,
  slideW: number,
  slideH: number,
  colors: PptxThemeColors,
  animMap: Map<string, ElementAnimation>,
): SlideElement | null {
  // 判断是否文本框
  const txBody = findFirst(sp, 'txBody')
  if (!txBody) return null

  // 取形状 ID（动画匹配）
  const cNvPr = findFirst(sp, 'cNvPr')
  const spid  = cNvPr?.getAttribute('id') || ''

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

  // 形状填充背景色（文字框可能有彩色背景）
  const spPr  = findFirst(sp, 'spPr')
  const bgFill = parseFillFromSpPr(spPr, colors)

  // 动画
  const anim = animMap.get(spid)

  const style: ElementStyle = {
    fontSize: Math.max(fontSize, role === 'title' ? 4 : 2.5),
    fontWeight: role === 'title' ? 'bold' : fontWeight,
    fontStyle,
    textAlign,
    lineHeight: 1.6,
    letterSpacing: 0,
    colorOverride,
    bgFill: bgFill && bgFill !== 'none' ? bgFill : undefined,
  }

  return {
    id: makeId(),
    elementType: 'text' as ElementType,
    role,
    text,
    animation: anim?.animation ?? 'none',
    animationTrigger: anim?.trigger,
    animationOrder:   anim?.order,
    animationDelay:   anim?.delay,
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

  // 1. 解析动画（先获取 spid → animation 映射）
  const animMap = parseAnimations(doc)

  const shapeElements: SlideElement[] = []   // 形状（层次靠后）
  const textElements: SlideElement[] = []    // 文字/图片（层次靠前）

  if (tree) {
    // 形状：<p:sp> 无 txBody → shape，有 txBody → text（可能带 bgFill）
    for (const sp of findAll(tree, 'sp')) {
      const hasTxBody = !!findFirst(sp, 'txBody')
      if (hasTxBody) {
        const el = parseTextShape(sp, slideW, slideH, colors, animMap)
        if (el) textElements.push(el)
      } else {
        const el = parseShapeElement(sp, slideW, slideH, colors, animMap)
        if (el) shapeElements.push(el)
      }
    }
    // 连接线：<p:cxnSp>
    for (const cxn of findAll(tree, 'cxnSp')) {
      const el = parseShapeElement(cxn, slideW, slideH, colors, animMap)
      if (el) shapeElements.push(el)
    }
    // 图片
    for (const pic of findAll(tree, 'pic')) {
      const el = await parsePicture(pic, slideW, slideH, zip, relsMap)
      if (el) textElements.push(el)
    }
  }

  // 形状在底层（先渲染），文字/图片在上层
  const elements = [...shapeElements, ...textElements]

  // 按动画顺序排序：无动画的先显示，有动画的按 order 排序
  elements.sort((a, b) => {
    const ao = a.animationOrder ?? 0
    const bo = b.animationOrder ?? 0
    return ao - bo
  })

  const layout = guessLayout(textElements, slideIndex, totalSlides)

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
    const texts  = s.elements.filter(e => e.elementType === 'text').map(e => `[${e.role}] ${e.text.slice(0, 60)}`).join(' | ')
    const imgs   = s.elements.filter(e => e.elementType === 'image').length
    const shapes = s.elements.filter(e => e.elementType === 'shape').length
    const anims  = s.elements.filter(e => e.animation !== 'none').length
    const extra  = [imgs ? `图片×${imgs}` : '', shapes ? `形状×${shapes}` : '', anims ? `动画×${anims}` : ''].filter(Boolean).join(' ')
    return `第${i + 1}页(${s.layout}): ${texts}${extra ? ` [${extra}]` : ''}`
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
