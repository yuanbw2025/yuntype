# 云中书 YunType · UI 重设计交接文档

> 给 Claude Code 的完整改造指南。
> 本仓库：https://github.com/yuanbw2025/yuntype
> 本地路径：~/Desktop/projects/yuntype

---

## 核心设计理念：Preview First

**抛弃原三竖栏（输入30% | 风格260px | 预览flex）**，改为：

```
顶栏 48px（Logo + 模式Tab + 操作按钮）
├── 图标侧栏 52px（按需切换面板）
├── 面板 340-400px（按需展开，可关闭）
└── 画布区 flex（预览主角，占 60%+）
```

关键设计决策：
- **骨架选择**：从 emoji + 下拉框 → **可视化卡片网格（SVG结构缩略图）**
- **配色选择**：从下拉 select → **4列宫格色卡（背景色+主色同时展示）**
- **字体选择**：从下拉 → **带字形预览的卡片**
- **预览区**：画布感（格子底纹 + 设备frame阴影 + 悬浮底部操作栏）
- **操作栏**：深色悬浮条 `rgba(18,16,10,0.82)` + backdrop-blur

---

## 参考截图（必读，所有改动以此为准）

| 文件 | 内容 |
|------|------|
| `refs/screen-A.png` | 公众号 · 骨架画廊展开（SVG卡片网格） |
| `refs/screen-B.png` | 公众号 · 配色+字体选择（宫格色卡） |
| `refs/screen-C.png` | 公众号 · 文章编辑器（文档风格编辑区） |
| `refs/screen-D.png` | 小红书 · 图片画布（4列图片网格） |
| `refs/screen-E.png` | 信息图 · 模板选择+数据编辑+预览 |
| `refs/screen-F.png` | AI配图 · 场景选择+结构化Prompt+结果 |
| `refs/screen-G.png` | 网页生成 · 描述输入+浏览器预览 |
| `refs/screen-H.png` | 演示稿 · 幻灯片缩略图+预览+控制 |
| `refs/screen-I.png` | 幻灯片编辑器 · 缩略图轨道+编辑区+属性面板 |
| `refs/screen-J.png` | AI分析弹窗 · 提供商选择+分析结果+推荐应用 |

---

## CSS Design Tokens

新建 `src/styles/tokens.css`（或直接替换 `src/index.css` 的变量部分）：

```css
:root {
  /* 背景 */
  --bg: #EDEBE6;        /* 全局暖奶白，代替原 #f5f5f5 */
  --sur: #FFFFFF;       /* 面板/卡片底色 */
  --sur2: #F5F3EE;      /* 次级面板 */
  --sur3: #EEECEA;      /* 第三级 */
  --hov: rgba(0,0,0,0.04);

  /* 文字 */
  --t1: #18160F;        /* 主文字（暖近黑） */
  --t2: #5C5850;        /* 次要 */
  --t3: #A09A90;        /* 弱/占位 */

  /* 边框 */
  --bd: rgba(0,0,0,0.09);
  --bds: rgba(0,0,0,0.05);
  --bdb: rgba(0,0,0,0.15);

  /* 品牌色 */
  --ac: #4F46E5;        /* 主 accent */
  --acs: rgba(79,70,229,0.10);
  --ach: #4338CA;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.06);
  --shadow-md: 0 6px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08);

  --r: 10px;
  --r-sm: 6px;
}
```

---

## 布局结构（App.tsx 重构）

### 顶栏 — 完全重写

```tsx
// 高度从无规格 → 固定 48px
// 结构：Logo区 | 模式Tab区（flex:1）| 操作按钮区
<header style={{ height:48, background:'#fff', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center' }}>
  {/* Logo区 — 有右边框 */}
  <div style={{ padding:'0 16px', borderRight:'1px solid var(--bd)', height:'100%', display:'flex', alignItems:'center', gap:9 }}>
    <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>☁</div>
    <span style={{ fontSize:15, fontWeight:700 }}>云中书</span>
    <span style={{ fontSize:11, color:'#A09A90' }}>YunType</span>
  </div>

  {/* 模式Tab区 — 替换原分段按钮 */}
  <div style={{ display:'flex', alignItems:'stretch', height:'100%', flex:1, padding:'0 8px' }}>
    {MODES.map(m => (
      <button key={m.key} onClick={() => setMode(m.key)} style={{
        display:'flex', alignItems:'center', gap:5,
        padding:'0 14px', fontSize:12, fontWeight: mode===m.key ? 600 : 500,
        color: mode===m.key ? '#18160F' : '#5C5850',
        background: 'none', border:'none', borderBottom: mode===m.key ? '2px solid #4F46E5' : '2px solid transparent',
        cursor:'pointer', whiteSpace:'nowrap',
      }}>
        <span style={{fontSize:13}}>{m.icon}</span>
        {m.label}
        {mode===m.key && <span style={{ width:5, height:5, borderRadius:999, background: m.color }}/>}
      </button>
    ))}
  </div>

  {/* 操作区 — 右侧紧凑 */}
  <div style={{ display:'flex', gap:6, padding:'0 14px', borderLeft:'1px solid var(--bd)', height:'100%', alignItems:'center' }}>
    {(mode === 'wechat' || mode === 'xiaohongshu') && (
      <button onClick={() => setShowApiConfig(true)} style={{ /* AI分析按钮 */ }}>🤖 AI分析</button>
    )}
    <button onClick={() => setDarkMode(v => !v)}>{darkMode ? '☀️' : '🌙'}</button>
  </div>
</header>
```

### 模式对应新增：`slides`

```tsx
// App.tsx 新增模式
type AppMode = 'wechat' | 'xiaohongshu' | 'infographic' | 'webpage' | 'imagegen' | 'presentation' | 'slides'

// MODES 数组
const MODES = [
  { key:'wechat',       icon:'📝', label:'公众号',  color:'#07C160', dot:'#07C160' },
  { key:'xiaohongshu',  icon:'📸', label:'小红书',  color:'#E8294A', dot:'#E8294A' },
  { key:'infographic',  icon:'📊', label:'信息图',  color:'#7C3AED', dot:'#7C3AED' },
  { key:'imagegen',     icon:'🎨', label:'配图',    color:'#0284C7', dot:'#0284C7' },
  { key:'webpage',      icon:'🌐', label:'网页',    color:'#059669', dot:'#059669' },
  { key:'presentation', icon:'🎬', label:'演示',    color:'#D97706', dot:'#D97706' },
  { key:'slides',       icon:'🎞', label:'幻灯片',  color:'#0891B2', dot:'#0891B2' },
];
```

### 主内容区 — 新布局

```tsx
{/* 主内容 */}
<div style={{ flex:1, display:'flex', overflow:'hidden' }}>
  {/* 图标侧栏 52px — 所有模式常驻 */}
  <IconSidebar activePanel={activePanel} onToggle={setActivePanel} mode={mode}/>

  {/* 面板区 — 按需展开 */}
  {activePanel === 'style' && (mode === 'wechat' || mode === 'xiaohongshu') && (
    <StyleGalleryPanel atomIdsV2={atomIdsV2} onChange={setAtomIdsV2} onShuffle={handleShuffle}/>
  )}
  {activePanel === 'article' && (mode === 'wechat' || mode === 'xiaohongshu') && (
    <ArticleEditorPanel value={article} onChange={setArticle}/>
  )}

  {/* 画布/预览区 — flex:1，永远占主位 */}
  <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background:'var(--bg)' }}>
    {/* 格子底纹 */}
    <div style={{ position:'absolute', inset:0, opacity:.4, backgroundImage:'radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>

    {/* 预览内容 */}
    {mode === 'wechat' && <WechatCanvas style={finalStyle}/>}
    {mode === 'xiaohongshu' && <XhsCanvas .../>}
    {/* ... 其他模式 */}

    {/* 悬浮操作栏 */}
    <FloatingActionBar mode={mode} style={finalStyle} markdown={article}/>
  </div>
</div>
```

---

## 关键组件改造

### 1. StyleGalleryPanel（替换 LayoutPanel）

**骨架选择 — 从下拉框改为卡片网格：**

```tsx
// 原：<select onChange={setBlueprintId}>...
// 新：
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px' }}>
  {blueprints.map(bp => (
    <div key={bp.id} onClick={() => setBlueprintId(bp.id)}
         style={{ border: active===bp.id ? '2px solid var(--ac)' : '1.5px solid var(--bd)',
                  borderRadius:10, overflow:'hidden', cursor:'pointer',
                  background: active===bp.id ? 'var(--acs)' : 'var(--sur)' }}>
      {/* SVG 结构缩略图 — 参考 refs/screen-A.png */}
      <div style={{ height:100, background:'var(--sur2)' }}>
        <BlueprintSVGThumb type={bp.category}/>
      </div>
      <div style={{ padding:'8px 12px' }}>
        <div style={{ fontSize:12, fontWeight:700 }}>{bp.name}</div>
        <div style={{ fontSize:10, color:'var(--t3)' }}>{bp.tags.join(' · ')}</div>
      </div>
    </div>
  ))}
</div>
```

**配色选择 — 宫格色卡：**

```tsx
// 原：<select onChange={setColorId}>...
// 新：
<div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'0 16px' }}>
  {colorSchemes.map(c => (
    <div key={c.id} onClick={() => setColorId(c.id)}
         style={{ border: active===c.id ? '2px solid var(--ac)' : '2px solid transparent',
                  borderRadius:10, overflow:'hidden', cursor:'pointer' }}>
      {/* 背景色 swatch */}
      <div style={{ height:56, background:c.background, position:'relative' }}>
        <div style={{ width:18, height:18, borderRadius:999, background:c.primary,
                      border:'2.5px solid rgba(255,255,255,0.8)', position:'absolute',
                      bottom:8, left:10, boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}/>
      </div>
      <div style={{ padding:'6px 10px', background:'var(--sur)', fontSize:10, fontWeight:600 }}>
        {c.name}
      </div>
    </div>
  ))}
</div>
```

### 2. IconSidebar（新组件）

```tsx
// 52px 常驻侧栏，按钮切换面板
function IconSidebar({ activePanel, onToggle, mode }) {
  const items = [
    { id:'article', icon:'📄', label:'文章', show: ['wechat','xiaohongshu'].includes(mode) },
    { id:'style',   icon:'🎨', label:'风格', show: ['wechat','xiaohongshu'].includes(mode) },
    null, // 分隔
    { id:'export',  icon:'📤', label:'导出', show: true },
  ];
  return (
    <div style={{ width:52, background:'var(--sur)', borderRight:'1px solid var(--bd)', display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0', gap:2 }}>
      {items.map((it, i) =>
        it === null ? <div key={i} style={{ width:24, height:1, background:'var(--bd)', margin:'4px 0' }}/> :
        it.show ? (
          <button key={it.id} onClick={() => onToggle(activePanel === it.id ? null : it.id)}
                  style={{ width:38, height:38, borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, cursor:'pointer', background: activePanel===it.id ? 'var(--acs)' : 'none', border:'none', color: activePanel===it.id ? 'var(--ac)' : 'var(--t3)' }}>
            <span style={{fontSize:16}}>{it.icon}</span>
            <span style={{fontSize:9, fontFamily:'inherit'}}>{it.label}</span>
          </button>
        ) : null
      )}
    </div>
  );
}
```

### 3. FloatingActionBar（新组件）

```tsx
// 悬浮在画布底部
function FloatingActionBar({ mode, style, markdown }) {
  return (
    <div style={{
      position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)',
      display:'flex', alignItems:'center', gap:6,
      background:'rgba(18,16,10,0.82)', backdropFilter:'blur(16px)',
      borderRadius:10, padding:'6px 10px',
      border:'1px solid rgba(255,255,255,0.1)', color:'#fff',
    }}>
      {mode === 'wechat' && <>
        <CanvasBtn onClick={handleShuffle}>🎲 随机换风格</CanvasBtn>
        <Sep/>
        <CanvasBtn>📱 手机</CanvasBtn>
        <CanvasBtn>🖥️ 桌面</CanvasBtn>
        <Sep/>
        <CanvasBtn primary onClick={handleCopy}>📋 复制到公众号</CanvasBtn>
        <CanvasBtn onClick={handleDownload}>⬇ HTML</CanvasBtn>
      </>}
      {/* 其他模式类似 */}
    </div>
  );
}
```

---

## 改造优先级

### P0 · 视觉骨架（必须先改）

1. **`src/index.css`** — 替换 CSS 变量（参考 tokens.css 内容）
2. **`src/App.tsx`** — 顶栏重写（Tab模式 + 图标侧栏 + 画布格子底纹）
3. 全局背景色从 `#f5f5f5` → `#EDEBE6`

### P1 · 面板改造

4. **`src/components/LayoutPanel.tsx`** — 骨架从下拉→卡片网格；配色从下拉→宫格色卡；字体从下拉→预览卡片
5. **`src/components/ArticleInput.tsx`** — 加格式工具栏（B/I/H1/H2/引用等）
6. 新增 `IconSidebar` 组件
7. 新增 `FloatingActionBar` 组件

### P2 · 各模式专属控制面板

8. 小红书：比例选择用图形卡片（不是文字按钮）
9. 信息图：模板选择用图标卡片
10. 网页/演示：浏览器chrome预览框
11. 幻灯片编辑器：三栏布局（缩略图轨道 | 编辑画布 | 属性面板）

---

## 文件清单

```
yuntype-redesign/
├── CLAUDE_HANDOFF.md      ← 本文档
├── refs/
│   ├── screen-A.png       ← 骨架画廊（视觉目标）
│   ├── screen-B.png       ← 配色字体
│   ├── screen-C.png       ← 文章编辑器
│   ├── screen-D.png       ← 小红书画布
│   ├── screen-E.png       ← 信息图
│   ├── screen-F.png       ← AI配图
│   ├── screen-G.png       ← 网页生成
│   ├── screen-H.png       ← 演示稿
│   ├── screen-I.png       ← 幻灯片编辑器
│   └── screen-J.png       ← AI分析弹窗
└── tokens.css             ← 新 CSS 变量（直接用）
```

---

## 给 Claude Code 的最后一句话

> **截图即是规范。** 遇到任何不确定的细节，打开对应的 `refs/screen-*.png` 对着改，而不是自由发挥。
>
> 改动顺序：先改 App.tsx 顶栏和背景色（马上就能看到大变化），再改 LayoutPanel 的骨架/配色选择器，最后是各模式专属面板。
> 每改完一块，跑 `npm run dev` 在浏览器里对比截图。
