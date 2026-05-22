// 故事游戏导出 — 生成可独立运行的单文件 HTML 游戏

import type { StoryGame } from './ai/story-game-gen'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function exportGameToHtml(game: StoryGame): string {
  const gameJson = JSON.stringify(game)
  const title = escHtml(game.title)
  const desc = escHtml(game.description)

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--accent:#6366f1;--accent2:#818cf8;--bg:#0f0f1e;--card:#1a1a2e;--border:rgba(255,255,255,.12);--text:#e2e8f0;--muted:#94a3b8}
body{font-family:"思源宋体","Source Han Serif","Noto Serif SC",Georgia,serif;background:var(--bg);color:var(--text);height:100vh;overflow:hidden;display:flex;flex-direction:column;user-select:none}

/* 标题屏 */
#title-screen{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,#1e1b4b 0%,#0f0f1e 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:100}
#ts-title{font-size:clamp(24px,5vw,48px);font-weight:bold;letter-spacing:6px;text-shadow:0 0 40px var(--accent)}
#ts-desc{font-size:14px;color:var(--muted);letter-spacing:1px}
#ts-start{padding:14px 52px;background:linear-gradient(135deg,var(--accent),#8b5cf6);border:none;color:#fff;cursor:pointer;border-radius:8px;font-size:16px;letter-spacing:3px;font-family:inherit;transition:all .2s;box-shadow:0 4px 24px rgba(99,102,241,.4)}
#ts-start:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,.6)}
#ts-load{padding:10px 32px;background:transparent;border:1px solid var(--border);color:var(--muted);cursor:pointer;border-radius:8px;font-size:13px;font-family:inherit;transition:all .2s}
#ts-load:hover{border-color:var(--accent2);color:var(--accent2)}

/* 顶栏 */
#hdr{display:none;justify-content:space-between;align-items:center;padding:8px 20px;background:rgba(0,0,0,.6);border-bottom:1px solid var(--border);flex-shrink:0;backdrop-filter:blur(12px)}
#hdr-title{font-size:13px;color:var(--muted);letter-spacing:1px}
#vars-bar{display:flex;gap:8px;flex-wrap:wrap}
.var-chip{background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);padding:2px 10px;border-radius:20px;font-size:11px;color:var(--accent2)}
#hdr-btns{display:flex;gap:6px}
.hdr-btn{padding:4px 12px;background:rgba(255,255,255,.07);border:1px solid var(--border);color:var(--text);cursor:pointer;border-radius:5px;font-size:12px;font-family:inherit;transition:all .15s}
.hdr-btn:hover{background:rgba(255,255,255,.15)}

/* 场景区 */
#scene{display:none;flex:1;flex-direction:column;justify-content:flex-end;padding:32px 40px 24px;overflow:hidden}
#dialogue{background:rgba(0,0,0,.78);border:1px solid var(--border);border-radius:16px;padding:28px 32px;max-height:52vh;overflow-y:auto;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.4)}
#dialogue::-webkit-scrollbar{width:4px}
#dialogue::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
#speaker{font-size:14px;font-weight:bold;margin-bottom:14px;padding:4px 14px;border-radius:20px;display:inline-block}
#content{font-size:16px;line-height:1.9;white-space:pre-wrap;color:#dde6f5}

/* 选项区 */
#choices{display:none;padding:14px 40px 20px;flex-direction:column;gap:9px;flex-shrink:0;background:rgba(0,0,0,.35)}
.choice{padding:12px 24px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);color:#c7d2fe;border-radius:9px;cursor:pointer;text-align:left;font-size:14px;line-height:1.5;transition:all .2s;font-family:inherit}
.choice:hover{background:rgba(99,102,241,.28);border-color:rgba(99,102,241,.6);color:#fff;transform:translateX(5px)}
.choice.locked{opacity:.38;cursor:not-allowed;transform:none;filter:saturate(.4)}

/* 结局覆盖层 */
#ending{position:fixed;inset:0;background:rgba(0,0,0,.88);display:none;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:50;text-align:center;padding:40px}
#ending.show{display:flex}
#ending-label{font-size:11px;letter-spacing:6px;color:var(--muted);text-transform:uppercase}
#ending-title{font-size:clamp(20px,4vw,36px);font-weight:bold;letter-spacing:2px}
#ending-content{font-size:15px;max-width:520px;line-height:1.9;color:#b8c7e0}
#ending-btns{display:flex;gap:12px;margin-top:8px}
.ending-btn{padding:11px 32px;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit;transition:all .2s}
#btn-restart{background:rgba(99,102,241,.35);border:1px solid rgba(99,102,241,.6);color:#c7d2fe}
#btn-restart:hover{background:rgba(99,102,241,.55)}
#btn-title{background:transparent;border:1px solid var(--border);color:var(--muted)}
#btn-title:hover{border-color:var(--accent2);color:var(--accent2)}

/* 成就 toast */
#ach-toast{position:fixed;bottom:80px;right:20px;background:linear-gradient(135deg,#065f46,#047857);border:1px solid rgba(16,185,129,.4);border-radius:14px;padding:14px 20px;display:none;flex-direction:column;gap:5px;max-width:290px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:200}
#ach-toast.show{display:flex;animation:slideIn .35s ease}
@keyframes slideIn{from{transform:translateX(120%)}to{transform:translateX(0)}}
.ach-head{font-weight:bold;font-size:13px;color:#6ee7b7}
.ach-body{font-size:12px;color:#a7f3d0;opacity:.9}

/* 存/读档弹窗 */
#modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:150}
#modal-mask.show{display:flex}
#modal{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;min-width:330px;box-shadow:0 16px 48px rgba(0,0,0,.5)}
#modal-title{font-size:16px;font-weight:bold;margin-bottom:18px;color:var(--accent2)}
.slot{display:flex;align-items:center;gap:14px;padding:13px;border-radius:10px;background:rgba(255,255,255,.04);margin-bottom:8px;cursor:pointer;border:1px solid transparent;transition:all .15s}
.slot:hover{background:rgba(255,255,255,.09);border-color:var(--border)}
.slot-icon{font-size:20px;width:32px;text-align:center;flex-shrink:0}
.slot-info{flex:1}
.slot-name{font-size:13px;color:var(--text)}
.slot-meta{font-size:11px;color:var(--muted);margin-top:3px}
.slot-act{font-size:11px;color:var(--accent2);flex-shrink:0}
#modal-cancel{margin-top:14px;padding:9px;width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted);cursor:pointer;border-radius:8px;font-family:inherit;font-size:13px;transition:all .15s}
#modal-cancel:hover{background:rgba(255,255,255,.1);color:var(--text)}
</style>
</head>
<body>

<div id="title-screen">
  <div id="ts-title">${title}</div>
  <div id="ts-desc">${desc}</div>
  <button id="ts-start" onclick="startGame()">开始游戏</button>
  <button id="ts-load" onclick="openModal('load')">读取存档</button>
</div>

<div id="hdr">
  <div id="hdr-title">${title}</div>
  <div id="vars-bar"></div>
  <div id="hdr-btns">
    <button class="hdr-btn" onclick="openModal('save')">💾 存档</button>
    <button class="hdr-btn" onclick="openModal('load')">📂 读档</button>
  </div>
</div>

<div id="scene">
  <div id="dialogue">
    <div id="speaker" style="display:none"></div>
    <div id="content"></div>
  </div>
</div>

<div id="choices"></div>

<div id="ending">
  <div id="ending-label">— 结局 —</div>
  <div id="ending-title"></div>
  <div id="ending-content"></div>
  <div id="ending-btns">
    <button class="ending-btn" id="btn-restart" onclick="restartGame()">重新开始</button>
    <button class="ending-btn" id="btn-title" onclick="backToTitle()">返回标题</button>
  </div>
</div>

<div id="ach-toast">
  <div class="ach-head" id="ach-head"></div>
  <div class="ach-body" id="ach-body"></div>
</div>

<div id="modal-mask">
  <div id="modal">
    <div id="modal-title">存档</div>
    <div id="slot-list"></div>
    <button id="modal-cancel" onclick="closeModal()">取消</button>
  </div>
</div>

<script>
const G=${gameJson};
const SAVE_KEY='sg_'+G.id;
let state={nodeId:G.startNodeId,vars:Object.fromEntries(G.variables.map(v=>[v.name,v.defaultValue])),achieved:new Set(),visited:new Set()};
let modalMode='save';

function startGame(){
  document.getElementById('title-screen').style.display='none';
  document.getElementById('hdr').style.display='flex';
  document.getElementById('scene').style.display='flex';
  document.getElementById('choices').style.display='flex';
  go(G.startNodeId);
}

function go(nodeId){
  const node=G.nodes.find(n=>n.id===nodeId);
  if(!node)return;
  state.nodeId=nodeId;
  state.visited.add(nodeId);
  if(node.effects)node.effects.forEach(applyEff);
  if(node.achievementId)unlock(node.achievementId);

  const spkEl=document.getElementById('speaker');
  if(node.speakerId){
    const ch=G.characters.find(c=>c.id===node.speakerId);
    if(ch){
      spkEl.textContent=ch.name;
      spkEl.style.cssText=\`color:\${ch.color};background:\${ch.color}22;display:inline-block\`;
    } else spkEl.style.display='none';
  } else spkEl.style.display='none';

  document.getElementById('content').textContent=node.content;
  refreshVars();

  if(node.type==='ending'){showEnding(node);return;}
  renderChoices(node);
}

function renderChoices(node){
  const el=document.getElementById('choices');
  el.innerHTML='';
  node.choices.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='choice';
    btn.textContent=c.text;
    if(c.condition&&!evalCond(c.condition)){
      btn.classList.add('locked');
      btn.title='条件不满足';
    } else {
      btn.onclick=()=>{
        if(c.effects)c.effects.forEach(applyEff);
        go(c.nextNodeId);
      };
    }
    el.appendChild(btn);
  });
}

function evalCond(cond){
  const m=cond.match(/(\\w+)\\s*(>=|<=|==|!=|>|<)\\s*(.+)/);
  if(!m)return true;
  const left=state.vars[m[1]];
  let right=m[3].trim();
  if(right==='true')right=true;
  else if(right==='false')right=false;
  else if(!isNaN(Number(right)))right=Number(right);
  if(m[2]==='>=')return left>=right;
  if(m[2]==='<=')return left<=right;
  if(m[2]==='==')return left==right;
  if(m[2]==='!=')return left!=right;
  if(m[2]==='>')return left>right;
  if(m[2]==='<')return left<right;
  return true;
}

function applyEff(e){
  if(!(e.variable in state.vars))return;
  if(e.op==='set')state.vars[e.variable]=e.value;
  else if(e.op==='add')state.vars[e.variable]+=e.value;
  else if(e.op==='toggle')state.vars[e.variable]=!state.vars[e.variable];
}

function refreshVars(){
  document.getElementById('vars-bar').innerHTML=G.variables.map(v=>
    \`<span class="var-chip">\${v.label}: \${state.vars[v.name]}</span>\`
  ).join('');
}

function showEnding(node){
  document.getElementById('choices').style.display='none';
  document.getElementById('ending-title').textContent=node.title;
  document.getElementById('ending-content').textContent=node.content;
  document.getElementById('ending').classList.add('show');
}

function restartGame(){
  document.getElementById('ending').classList.remove('show');
  document.getElementById('choices').style.display='flex';
  state={nodeId:G.startNodeId,vars:Object.fromEntries(G.variables.map(v=>[v.name,v.defaultValue])),achieved:new Set(),visited:new Set()};
  go(G.startNodeId);
}

function backToTitle(){
  document.getElementById('ending').classList.remove('show');
  document.getElementById('hdr').style.display='none';
  document.getElementById('scene').style.display='none';
  document.getElementById('choices').style.display='none';
  document.getElementById('title-screen').style.display='flex';
}

function unlock(id){
  if(state.achieved.has(id))return;
  state.achieved.add(id);
  const a=G.achievements.find(x=>x.id===id);
  if(!a)return;
  const t=document.getElementById('ach-toast');
  document.getElementById('ach-head').textContent=a.icon+' '+a.title;
  document.getElementById('ach-body').textContent=a.description;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3800);
}

function getSaves(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]')}catch{return[]}}

function openModal(mode){
  modalMode=mode;
  document.getElementById('modal-title').textContent=mode==='save'?'💾 存档':'📂 读档';
  const saves=getSaves();
  const list=document.getElementById('slot-list');
  list.innerHTML='';
  for(let i=0;i<3;i++){
    const s=saves[i];
    const div=document.createElement('div');
    div.className='slot';
    div.innerHTML=\`
      <div class="slot-icon">\${s?'📄':'🗒️'}</div>
      <div class="slot-info">
        <div class="slot-name">\${s?('存档 '+(i+1)+' — '+G.nodes.find(n=>n.id===s.nodeId)?.title||''):'空存档'}</div>
        <div class="slot-meta">\${s?new Date(s.time).toLocaleString():'—'}</div>
      </div>
      <div class="slot-act">\${mode==='save'?'写入':(s?'读取':'—')}</div>
    \`;
    if(mode==='save'||s){
      div.onclick=()=>{
        if(mode==='save')saveSlot(i);
        else loadSlot(i);
        closeModal();
      };
    }
    list.appendChild(div);
  }
  document.getElementById('modal-mask').classList.add('show');
}

function closeModal(){document.getElementById('modal-mask').classList.remove('show')}

function saveSlot(i){
  const saves=getSaves();
  saves[i]={...state,achieved:[...state.achieved],visited:[...state.visited],time:Date.now()};
  localStorage.setItem(SAVE_KEY,JSON.stringify(saves));
}

function loadSlot(i){
  const s=getSaves()[i];
  if(!s)return;
  state={...s,achieved:new Set(s.achieved),visited:new Set(s.visited)};
  document.getElementById('ending').classList.remove('show');
  document.getElementById('choices').style.display='flex';
  document.getElementById('hdr').style.display='flex';
  document.getElementById('scene').style.display='flex';
  document.getElementById('title-screen').style.display='none';
  go(state.nodeId);
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
});
</script>
</body>
</html>`
}
