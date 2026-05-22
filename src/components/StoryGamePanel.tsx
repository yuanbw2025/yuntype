// 故事游戏制作面板 — 故事输入 → AI 转换 → 可视化剧情树 → 试玩 → 导出

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  type StoryGame, type StoryNode, type StoryChoice, type GameVariable,
  generateStoryGame,
} from '../lib/ai/story-game-gen'
import { exportGameToHtml } from '../lib/story-game-export'
import { loadChatConfig, type AIClientConfig } from '../lib/ai/client'
import { saveAs } from 'file-saver'

// ─── 树视图常量 ────────────────────────────────────────────────────────────────
const NODE_W = 190
const NODE_H = 108
const TREE_PAD = 80

// ─── 颜色主题 ──────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  start:   { bg: '#1e3a5f', border: '#3b82f6', badge: '#2563eb', label: '开始' },
  scene:   { bg: '#1e2a3a', border: '#475569', badge: '#334155', label: '场景' },
  ending:  { bg: '#1a2e1a', border: '#16a34a', badge: '#15803d', label: '结局' },
}

// ─── 故事种子预设 ──────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: '☁️ 古风仙侠',
    text: `凌云山脉，仙雾缭绕。少年林珏在山间拾得一枚玉简，内藏古仙残魂。残魂告知林珏：天地大劫将至，唯有寻得三枚破天印才能阻止。然而，魔宗也在追寻破天印的下落，林珏的师父竟是昔日魔宗叛徒。是信任师父、联手揭开真相，还是独自踏上寻印之路？林珏的选择将决定苍生命运。`,
  },
  {
    label: '🔍 都市悬疑',
    text: `深夜，刑警陈默接到一通陌生电话："48小时内，你的城市将有一场大爆炸。"电话来自三年前的悬案死者。陈默独自展开调查，发现案件牵涉一个隐秘组织和自己当年被迫封存的档案。搭档不知情，上司可能是内鬼，而倒计时还在滴答作响。`,
  },
  {
    label: '🚀 科幻末日',
    text: `2089年，人类殖民星舰"希望号"遭遇未知信号，全员陷入昏迷。技术员苏晴最先醒来，发现飞船偏离航线，驶向一片未知星域。舰载AI行为异常，幸存者中有人刻意隐瞒信息，而那个未知信号似乎还在继续。苏晴必须在有限的氧气和信任中找到真相。`,
  },
  {
    label: '🏰 奇幻冒险',
    text: `古老王国的公主艾拉被预言诅咒：十八岁生日当夜，她将沉睡百年。为解除诅咒，艾拉伪装成普通旅人出走皇城，踏上寻找传说中"命运织女"的旅程。一路上遇见了落魄骑士、神秘盗贼和一只会说话的乌鸦，而追捕她的皇家卫队正渐渐逼近。`,
  },
]

// ─── 玩家状态 ──────────────────────────────────────────────────────────────────
interface PlayerState {
  nodeId: string
  vars: Record<string, number | boolean>
  achieved: Set<string>
  ended: boolean
}

function initPlayer(game: StoryGame): PlayerState {
  return {
    nodeId: game.startNodeId,
    vars: Object.fromEntries(game.variables.map(v => [v.name, v.defaultValue])),
    achieved: new Set(),
    ended: false,
  }
}

// ─── 主组件 ────────────────────────────────────────────────────────────────────
export default function StoryGamePanel() {
  const [storyText, setStoryText] = useState('')
  const [game, setGame] = useState<StoryGame | null>(null)
  const [tab, setTab] = useState<'tree' | 'play' | 'export'>('tree')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [player, setPlayer] = useState<PlayerState | null>(null)
  const [achToast, setAchToast] = useState<{ title: string; desc: string } | null>(null)
  const achTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const config = useMemo<AIClientConfig | null>(() => loadChatConfig(), [])

  // 切换到试玩时初始化玩家状态
  useEffect(() => {
    if (tab === 'play' && game && !player) {
      setPlayer(initPlayer(game))
    }
  }, [tab, game, player])

  // 生成游戏
  const handleGenerate = useCallback(async () => {
    if (!storyText.trim()) { setError('请先输入故事内容'); return }
    if (!config?.apiKey) { setError('请先在其他模式下配置 API Key'); return }
    setLoading(true)
    setError('')
    try {
      const g = await generateStoryGame(storyText, config)
      setGame(g)
      setPlayer(null)
      setSelectedId(null)
      setTab('tree')
    } catch (e: any) {
      setError(e.message || '生成失败')
    } finally {
      setLoading(false)
    }
  }, [storyText, config])

  // 导出 HTML
  const handleExport = useCallback(() => {
    if (!game) return
    const html = exportGameToHtml(game)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${game.title}.html`)
  }, [game])

  // 玩家：前往节点
  const playerGo = useCallback((nodeId: string) => {
    if (!game || !player) return
    const node = game.nodes.find(n => n.id === nodeId)
    if (!node) return

    const newVars = { ...player.vars }
    node.effects?.forEach(e => {
      if (!(e.variable in newVars)) return
      if (e.op === 'set') newVars[e.variable] = e.value
      else if (e.op === 'add') (newVars[e.variable] as number) += (e.value as number)
      else if (e.op === 'toggle') newVars[e.variable] = !newVars[e.variable]
    })

    const newAchieved = new Set(player.achieved)
    if (node.achievementId && !newAchieved.has(node.achievementId)) {
      newAchieved.add(node.achievementId)
      const ach = game.achievements.find(a => a.id === node.achievementId)
      if (ach) {
        setAchToast({ title: `${ach.icon} ${ach.title}`, desc: ach.description })
        if (achTimerRef.current) clearTimeout(achTimerRef.current)
        achTimerRef.current = setTimeout(() => setAchToast(null), 3800)
      }
    }

    setPlayer({ nodeId, vars: newVars, achieved: newAchieved, ended: node.type === 'ending' })
  }, [game, player])

  // 玩家：应用选项效果并跳转
  const playerChoice = useCallback((choice: StoryChoice) => {
    if (!game || !player) return
    const newVars = { ...player.vars }
    choice.effects?.forEach(e => {
      if (!(e.variable in newVars)) return
      if (e.op === 'set') newVars[e.variable] = e.value
      else if (e.op === 'add') (newVars[e.variable] as number) += (e.value as number)
      else if (e.op === 'toggle') newVars[e.variable] = !newVars[e.variable]
    })
    setPlayer(prev => prev ? { ...prev, vars: newVars } : prev)
    setTimeout(() => playerGo(choice.nextNodeId), 0)
  }, [game, player, playerGo])

  // 条件求值
  const evalCond = useCallback((cond: string, vars: Record<string, number | boolean>): boolean => {
    if (!cond) return true
    const m = cond.match(/(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)/)
    if (!m) return true
    const left = vars[m[1]] as number
    let right: any = m[3].trim()
    if (right === 'true') right = true
    else if (right === 'false') right = false
    else if (!isNaN(Number(right))) right = Number(right)
    if (m[2] === '>=') return left >= right
    if (m[2] === '<=') return left <= right
    if (m[2] === '==') return left == right
    if (m[2] === '!=') return left != right
    if (m[2] === '>') return left > right
    if (m[2] === '<') return left < right
    return true
  }, [])

  // 树视图画布尺寸
  const treeLayout = useMemo(() => {
    if (!game || game.nodes.length === 0) return null
    const xs = game.nodes.map(n => n.x)
    const ys = game.nodes.map(n => n.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    const canvasW = maxX - minX + NODE_W + TREE_PAD * 2
    const canvasH = maxY + NODE_H + TREE_PAD * 2
    const offsetX = -minX + TREE_PAD
    return { canvasW, canvasH, offsetX }
  }, [game])

  const selectedNode = game?.nodes.find(n => n.id === selectedId) ?? null
  const playerNode = game?.nodes.find(n => n.id === player?.nodeId) ?? null

  // ─── 渲染 ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', background: '#0f1117' }}>

      {/* ── 左侧栏 ── */}
      <div style={{
        width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#161b27', borderRight: '1px solid #1e2d3d', overflow: 'hidden',
      }}>
        {/* 标题 */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #1e2d3d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📖</span>
            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>故事游戏制作</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>小说 / 剧本 → 分支叙事游戏</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 故事输入 */}
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>故事内容</div>
            <textarea
              value={storyText}
              onChange={e => setStoryText(e.target.value)}
              placeholder="粘贴故事、剧本或情节梗概..."
              style={{
                width: '100%', height: 140, padding: '10px 12px',
                background: '#0f1117', border: '1px solid #1e2d3d',
                borderRadius: 8, color: '#e2e8f0', fontSize: 13,
                lineHeight: 1.6, resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 预设 */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>快速填入示例：</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setStoryText(p.text)}
                  style={{
                    padding: '4px 10px', fontSize: 11, borderRadius: 6,
                    background: '#1e2d3d', border: '1px solid #2d3f52',
                    color: '#94a3b8', cursor: 'pointer',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '11px', borderRadius: 9, border: 'none',
              background: loading ? '#334155' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: 1, transition: 'opacity .2s',
            }}>
            {loading ? '⏳ AI 生成中...' : '✨ AI 转换为游戏'}
          </button>

          {error && (
            <div style={{ fontSize: 12, color: '#f87171', background: '#1f1215', padding: '8px 12px', borderRadius: 6, border: '1px solid #7f1d1d' }}>
              {error}
            </div>
          )}

          {/* 游戏信息 */}
          {game && (
            <div style={{ background: '#0f1117', border: '1px solid #1e2d3d', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#c7d2fe', marginBottom: 8 }}>{game.title}</div>
              {game.description && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{game.description}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['🗺️', `${game.nodes.length} 个节点`],
                  ['👤', `${game.characters.length} 个角色`],
                  ['📊', `${game.variables.length} 个变量`],
                  ['🏆', `${game.achievements.length} 个成就`],
                ].map(([icon, text]) => (
                  <div key={text as string} style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => { setPlayer(null); setTab('play') }}
                  style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 6, background: '#1e2d3d', border: '1px solid #2d3f52', color: '#94a3b8', cursor: 'pointer' }}>
                  🎮 试玩
                </button>
                <button onClick={handleExport}
                  style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 6, background: '#1e2d3d', border: '1px solid #2d3f52', color: '#94a3b8', cursor: 'pointer' }}>
                  📤 导出
                </button>
              </div>
            </div>
          )}

          {/* 选中节点详情 */}
          {selectedNode && tab === 'tree' && (
            <NodeDetail node={selectedNode} game={game!} />
          )}
        </div>
      </div>

      {/* ── 右侧主区 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Tab 栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2, padding: '10px 16px 0',
          background: '#161b27', borderBottom: '1px solid #1e2d3d', flexShrink: 0,
        }}>
          {([
            { key: 'tree', label: '🌳 剧情树' },
            { key: 'play', label: '🎮 试玩' },
            { key: 'export', label: '📤 导出' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '8px 18px', fontSize: 13, borderRadius: '8px 8px 0 0',
                background: tab === t.key ? '#0f1117' : 'transparent',
                border: tab === t.key ? '1px solid #1e2d3d' : '1px solid transparent',
                borderBottom: tab === t.key ? '1px solid #0f1117' : 'none',
                color: tab === t.key ? '#c7d2fe' : '#64748b', cursor: 'pointer',
                fontWeight: tab === t.key ? 700 : 400, position: 'relative', bottom: -1,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#0f1117' }}>

          {/* 剧情树 */}
          {tab === 'tree' && (
            <div style={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative' }}>
              {!game ? (
                <EmptyHint />
              ) : treeLayout ? (
                <div style={{ position: 'relative', width: treeLayout.canvasW, minHeight: treeLayout.canvasH, minWidth: '100%' }}>
                  {/* SVG 连线 */}
                  <svg
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
                    width={treeLayout.canvasW} height={treeLayout.canvasH}>
                    {game.nodes.map(node =>
                      node.choices.map(choice => {
                        const target = game.nodes.find(n => n.id === choice.nextNodeId)
                        if (!target) return null
                        const x1 = node.x + treeLayout.offsetX
                        const y1 = node.y + TREE_PAD + NODE_H
                        const x2 = target.x + treeLayout.offsetX
                        const y2 = target.y + TREE_PAD
                        const cy = (y1 + y2) / 2
                        const isSelected = selectedId === node.id || selectedId === target.id
                        return (
                          <path key={`${node.id}-${choice.id}`}
                            d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
                            fill="none"
                            stroke={isSelected ? '#818cf8' : '#2d3f52'}
                            strokeWidth={isSelected ? 2 : 1.5}
                            strokeDasharray={choice.condition ? '5,4' : undefined}
                            opacity={0.8}
                          />
                        )
                      })
                    )}
                  </svg>
                  {/* 节点卡片 */}
                  {game.nodes.map(node => {
                    const colors = NODE_COLORS[node.type] || NODE_COLORS.scene
                    const isSelected = selectedId === node.id
                    const left = node.x + treeLayout.offsetX - NODE_W / 2
                    const top = node.y + TREE_PAD
                    return (
                      <div key={node.id}
                        onClick={() => setSelectedId(isSelected ? null : node.id)}
                        style={{
                          position: 'absolute', left, top,
                          width: NODE_W, minHeight: NODE_H,
                          background: colors.bg,
                          border: `2px solid ${isSelected ? '#818cf8' : colors.border}`,
                          borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                          transition: 'border-color .15s, box-shadow .15s',
                          boxShadow: isSelected ? '0 0 0 3px rgba(129,140,248,.25)' : 'none',
                        }}>
                        {/* 类型标签 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 4,
                            background: colors.badge, color: '#e2e8f0', fontWeight: 600,
                          }}>
                            {colors.label}
                          </span>
                          <span style={{ fontSize: 10, color: '#475569' }}>{node.id}</span>
                        </div>
                        {/* 标题 */}
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 5, lineHeight: 1.4 }}>
                          {node.title}
                        </div>
                        {/* 内容预览 */}
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, marginBottom: 6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {node.content}
                        </div>
                        {/* 选项数量 */}
                        {node.choices.length > 0 && (
                          <div style={{ fontSize: 10, color: '#4f6080' }}>
                            → {node.choices.length} 个选项
                            {node.choices.some(c => c.condition) && ' · 含条件'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* 试玩 */}
          {tab === 'play' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {!game || !player ? (
                <EmptyHint msg={game ? '正在初始化...' : undefined} />
              ) : (
                <>
                  {/* 变量栏 */}
                  {game.variables.length > 0 && (
                    <div style={{ padding: '8px 20px', background: 'rgba(0,0,0,.4)', borderBottom: '1px solid #1e2d3d', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                      {game.variables.map((v: GameVariable) => (
                        <span key={v.name} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', color: '#a5b4fc' }}>
                          {v.label}: {String(player.vars[v.name])}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 场景区 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px 40px 18px' }}>
                    <div style={{
                      background: 'rgba(0,0,0,.75)', border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 16, padding: '24px 28px', backdropFilter: 'blur(12px)',
                      maxHeight: '52vh', overflowY: 'auto',
                    }}>
                      {/* 角色名 */}
                      {playerNode?.speakerId && (() => {
                        const ch = game.characters.find(c => c.id === playerNode.speakerId)
                        return ch ? (
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, padding: '3px 14px', borderRadius: 20, display: 'inline-block', color: ch.color, background: ch.color + '22' }}>
                            {ch.name}
                          </div>
                        ) : null
                      })()}
                      {/* 场景文字 */}
                      <div style={{ fontSize: 15, lineHeight: 1.9, color: '#dde6f5', whiteSpace: 'pre-wrap' }}>
                        {playerNode?.content ?? ''}
                      </div>
                    </div>
                  </div>

                  {/* 选项区 */}
                  {!player.ended ? (
                    <div style={{ padding: '12px 40px 20px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, background: 'rgba(0,0,0,.35)' }}>
                      {playerNode?.choices.map(c => {
                        const ok = !c.condition || evalCond(c.condition, player.vars)
                        return (
                          <button key={c.id}
                            onClick={() => ok && playerChoice(c)}
                            style={{
                              padding: '11px 22px', textAlign: 'left', fontSize: 14, fontFamily: 'inherit',
                              borderRadius: 9, cursor: ok ? 'pointer' : 'not-allowed',
                              background: ok ? 'rgba(99,102,241,.12)' : 'rgba(99,102,241,.04)',
                              border: `1px solid ${ok ? 'rgba(99,102,241,.35)' : 'rgba(99,102,241,.12)'}`,
                              color: ok ? '#c7d2fe' : '#475569',
                              transition: 'all .2s', opacity: ok ? 1 : .5,
                            }}
                            onMouseEnter={e => ok && (e.currentTarget.style.transform = 'translateX(5px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                            {c.text}
                            {c.condition && <span style={{ fontSize: 11, marginLeft: 8, opacity: .6 }}>[{ok ? '✓' : '✗'} {c.condition}]</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* 结局 */
                    <div style={{ padding: '20px 40px', textAlign: 'center', background: 'rgba(0,0,0,.6)', flexShrink: 0, borderTop: '1px solid #1e2d3d' }}>
                      <div style={{ fontSize: 11, letterSpacing: 6, color: '#64748b', marginBottom: 8 }}>— 结局 —</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#c7d2fe', marginBottom: 16 }}>{playerNode?.title}</div>
                      <button onClick={() => setPlayer(initPlayer(game))}
                        style={{ padding: '10px 32px', borderRadius: 8, background: 'rgba(99,102,241,.35)', border: '1px solid rgba(99,102,241,.5)', color: '#c7d2fe', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                        重新开始
                      </button>
                    </div>
                  )}

                  {/* 成就 Toast */}
                  {achToast && (
                    <div style={{
                      position: 'absolute', bottom: 80, right: 20,
                      background: 'linear-gradient(135deg,#065f46,#047857)',
                      border: '1px solid rgba(16,185,129,.4)', borderRadius: 14,
                      padding: '13px 20px', maxWidth: 280, boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                      animation: 'none',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#6ee7b7' }}>{achToast.title}</div>
                      <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 3 }}>{achToast.desc}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 导出 */}
          {tab === 'export' && (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {!game ? <EmptyHint /> : (
                <>
                  <div style={{ fontSize: 48 }}>🎮</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#c7d2fe', marginBottom: 8 }}>{game.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {game.nodes.length} 个节点 · {game.nodes.filter(n => n.type === 'ending').length} 个结局 · {game.achievements.length} 个成就
                    </div>
                  </div>
                  <button onClick={handleExport}
                    style={{
                      padding: '14px 48px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                      color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: 1, boxShadow: '0 4px 20px rgba(99,102,241,.4)',
                    }}>
                    ⬇️ 下载游戏 HTML
                  </button>
                  <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', maxWidth: 380, lineHeight: 1.8 }}>
                    导出为单文件 HTML，无需服务器，双击即可在浏览器中游玩。<br />
                    支持存档/读档（localStorage）、成就解锁、变量系统。
                  </div>
                  <div style={{ background: '#161b27', border: '1px solid #1e2d3d', borderRadius: 12, padding: '16px 20px', width: '100%', maxWidth: 480 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 10 }}>结局列表</div>
                    {game.nodes.filter(n => n.type === 'ending').map(n => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1e2d3d' }}>
                        <span style={{ fontSize: 14 }}>🏁</span>
                        <span style={{ fontSize: 13, color: '#e2e8f0' }}>{n.title}</span>
                        {n.achievementId && <span style={{ fontSize: 10, background: '#1e3a1e', border: '1px solid #1a5c1a', color: '#4ade80', padding: '1px 7px', borderRadius: 4 }}>成就</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 节点详情侧边卡 ────────────────────────────────────────────────────────────
function NodeDetail({ node, game }: { node: StoryNode; game: StoryGame }) {
  const colors = NODE_COLORS[node.type] || NODE_COLORS.scene
  const speaker = game.characters.find(c => c.id === node.speakerId)
  const ach = game.achievements.find(a => a.id === node.achievementId)

  return (
    <div style={{ background: '#0f1117', border: '1px solid #1e2d3d', borderRadius: 10, padding: '14px', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: colors.badge, color: '#e2e8f0', fontSize: 10, fontWeight: 700 }}>{colors.label}</span>
        <span style={{ color: '#c7d2fe', fontWeight: 700, fontSize: 13 }}>{node.title}</span>
      </div>
      {speaker && (
        <div style={{ marginBottom: 8, color: '#94a3b8' }}>
          角色：<span style={{ color: speaker.color, fontWeight: 600 }}>{speaker.name}</span>
        </div>
      )}
      <div style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 10 }}>{node.content}</div>
      {node.choices.length > 0 && (
        <div>
          <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>选项：</div>
          {node.choices.map(c => (
            <div key={c.id} style={{ padding: '5px 8px', background: '#161b27', borderRadius: 5, marginBottom: 4, color: '#94a3b8', lineHeight: 1.5 }}>
              <div>→ {c.text}</div>
              {c.condition && <div style={{ fontSize: 10, color: '#4f6080' }}>条件: {c.condition}</div>}
            </div>
          ))}
        </div>
      )}
      {ach && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: '#0f1f0f', border: '1px solid #1a3a1a', borderRadius: 6 }}>
          <div style={{ color: '#4ade80', fontSize: 11 }}>{ach.icon} {ach.title}</div>
          <div style={{ color: '#4a6450', fontSize: 10, marginTop: 2 }}>{ach.description}</div>
        </div>
      )}
    </div>
  )
}

// ─── 空状态提示 ────────────────────────────────────────────────────────────────
function EmptyHint({ msg }: { msg?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#334155' }}>
      <div style={{ fontSize: 48 }}>📖</div>
      <div style={{ fontSize: 14 }}>{msg ?? '在左侧输入故事，点击 AI 转换'}</div>
    </div>
  )
}
