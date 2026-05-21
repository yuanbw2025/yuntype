// ==UserScript==
// @name         微信公众号HTML插入器-真实剪贴板版
// @namespace    https://mp.weixin.qq.com/
// @version      3.3.0
// @description  支持 ProseMirror 编辑器的 HTML 插入 (直接 DOM 追加，绕过 paste 过滤，保留 grid/flex 排版)
// @author       AI Assistant
// @match        https://mp.weixin.qq.com/cgi-bin/appmsg*
// @match        https://mp.weixin.qq.com/appmsg/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    //  日志系统
    // =========================================================
    const TAG = '[微信HTML插入器]';
    const log = {
        info: (m, ...a) => console.log(`${TAG} ℹ️ ${m}`, ...a),
        ok: (m, ...a) => console.log(`${TAG} ✅ ${m}`, ...a),
        warn: (m, ...a) => console.warn(`${TAG} ⚠️ ${m}`, ...a),
        error: (m, ...a) => console.error(`${TAG} ❌ ${m}`, ...a),
    };

    log.info('脚本启动 v3.3.0 — 直接 DOM 追加版（绕过 paste 过滤）');

    // =========================================================
    //  注入全局样式 — 动画、过渡、主题变量
    // =========================================================
    const STYLE_ID = 'wh-injector-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            /* -------- 主题变量 -------- */
            :root {
                --wh-primary: #6366f1;
                --wh-primary-dark: #4f46e5;
                --wh-accent: #8b5cf6;
                --wh-surface: #ffffff;
                --wh-surface-dim: #f8fafc;
                --wh-border: #e2e8f0;
                --wh-text: #1e293b;
                --wh-text-dim: #64748b;
                --wh-success: #22c55e;
                --wh-error: #ef4444;
                --wh-warning: #f59e0b;
                --wh-radius: 14px;
                --wh-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                --wh-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                --wh-mono: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
            }

            /* -------- FAB 浮动按钮 -------- */
            #wh-fab {
                position: fixed; right: 20px; top: 50%;
                transform: translateY(-50%);
                width: 52px; height: 52px;
                border-radius: 16px;
                background: linear-gradient(135deg, var(--wh-primary), var(--wh-accent));
                color: white; cursor: pointer; z-index: 999980;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4),
                            0 1px 3px rgba(0,0,0,0.1);
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none; border: none; outline: none;
            }
            #wh-fab:hover {
                transform: translateY(-50%) scale(1.08);
                box-shadow: 0 8px 28px rgba(99, 102, 241, 0.55),
                            0 2px 6px rgba(0,0,0,0.12);
            }
            #wh-fab:active { transform: translateY(-50%) scale(0.95); }

            #wh-fab svg {
                width: 24px; height: 24px;
                fill: none; stroke: currentColor; stroke-width: 2;
                stroke-linecap: round; stroke-linejoin: round;
            }

            /* -------- 遮罩层 -------- */
            #wh-overlay {
                position: fixed; inset: 0;
                background: rgba(15, 23, 42, 0.4);
                backdrop-filter: blur(4px);
                z-index: 999988;
                display: flex; align-items: center; justify-content: center;
                animation: wh-fadeIn 0.2s ease;
            }

            /* -------- 主对话框 -------- */
            #wh-dialog {
                background: var(--wh-surface);
                border-radius: 20px;
                width: 640px; max-height: 82vh;
                box-shadow: var(--wh-shadow);
                display: flex; flex-direction: column;
                overflow: hidden;
                animation: wh-slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: var(--wh-font);
            }

            /* -------- 顶栏 -------- */
            .wh-header {
                padding: 20px 24px;
                background: linear-gradient(135deg, var(--wh-primary), var(--wh-accent));
                color: white;
                display: flex; justify-content: space-between; align-items: center;
            }
            .wh-header h2 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
            .wh-header small { opacity: 0.7; font-weight: 400; font-size: 12px; margin-left: 8px; }
            .wh-header p { margin: 3px 0 0; font-size: 12px; opacity: 0.8; }

            .wh-close-btn {
                width: 32px; height: 32px; border-radius: 10px;
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.2);
                color: white; font-size: 14px; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .wh-close-btn:hover { background: rgba(255,255,255,0.3); }

            /* -------- 模板区 -------- */
            .wh-templates {
                padding: 14px 24px;
                border-bottom: 1px solid var(--wh-border);
                display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
            }
            .wh-templates label {
                font-size: 12px; color: var(--wh-text-dim);
                font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; margin-right: 4px;
            }

            .wh-tpl-btn {
                padding: 5px 14px; border-radius: 20px;
                border: 1px solid var(--wh-border);
                background: var(--wh-surface);
                color: var(--wh-text);
                font-size: 13px; cursor: pointer;
                transition: all 0.15s;
                font-family: var(--wh-font);
            }
            .wh-tpl-btn:hover {
                background: var(--wh-primary);
                color: white; border-color: var(--wh-primary);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }

            .wh-tpl-add {
                padding: 5px 14px; border-radius: 20px;
                border: 1px dashed var(--wh-border);
                background: transparent; color: var(--wh-text-dim);
                font-size: 13px; cursor: pointer;
                transition: all 0.15s;
                font-family: var(--wh-font);
            }
            .wh-tpl-add:hover { border-color: var(--wh-primary); color: var(--wh-primary); }

            /* -------- 代码编辑区 -------- */
            .wh-editor-area {
                flex: 1; overflow: hidden;
                display: flex; flex-direction: column;
                padding: 16px 24px;
            }

            .wh-textarea {
                flex: 1; min-height: 220px;
                border: 2px solid var(--wh-border);
                border-radius: var(--wh-radius);
                padding: 16px; resize: none; outline: none;
                font-family: var(--wh-mono);
                font-size: 13px; line-height: 1.7;
                color: var(--wh-text);
                background: var(--wh-surface-dim);
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .wh-textarea:focus {
                border-color: var(--wh-primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
                background: white;
            }
            .wh-textarea::placeholder { color: #94a3b8; }

            /* -------- 底部操作栏 -------- */
            .wh-actions {
                padding: 14px 24px;
                border-top: 1px solid var(--wh-border);
                display: flex; gap: 8px; justify-content: flex-end;
                background: var(--wh-surface-dim);
            }

            .wh-btn {
                padding: 9px 20px; border-radius: 10px;
                font-size: 13px; font-weight: 600;
                cursor: pointer; transition: all 0.15s;
                border: 1px solid transparent;
                font-family: var(--wh-font);
                display: inline-flex; align-items: center; gap: 6px;
            }

            .wh-btn-primary {
                background: linear-gradient(135deg, var(--wh-primary), var(--wh-accent));
                color: white;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }
            .wh-btn-primary:hover {
                box-shadow: 0 4px 16px rgba(99, 102, 241, 0.45);
                transform: translateY(-1px);
            }

            .wh-btn-outline {
                background: white; border-color: var(--wh-border);
                color: var(--wh-text-dim);
            }
            .wh-btn-outline:hover {
                border-color: var(--wh-primary); color: var(--wh-primary);
            }

            .wh-btn-danger {
                background: white; border-color: var(--wh-error);
                color: var(--wh-error);
            }
            .wh-btn-danger:hover {
                background: var(--wh-error); color: white;
            }

            /* -------- Toast -------- */
            .wh-toast {
                position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
                padding: 12px 24px; border-radius: 12px;
                font-size: 14px; font-weight: 600;
                z-index: 999999;
                box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                animation: wh-slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: var(--wh-font);
                display: flex; align-items: center; gap: 8px;
                cursor: pointer;
            }
            .wh-toast-success { background: var(--wh-success); color: white; }
            .wh-toast-error   { background: var(--wh-error);   color: white; }
            .wh-toast-warning { background: var(--wh-warning); color: white; }

            /* -------- 动画 -------- */
            @keyframes wh-fadeIn {
                from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes wh-slideUp {
                from { opacity: 0; transform: translateY(24px) scale(0.96); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes wh-slideDown {
                from { opacity: 0; transform: translate(-50%, -12px); }
                to   { opacity: 1; transform: translate(-50%, 0); }
            }
            @keyframes wh-fadeOut {
                to { opacity: 0; transform: translate(-50%, -8px); }
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================
    //  配置持久化
    // =========================================================
    const STORAGE_KEY = 'wechat-html-injector-v3';
    const Config = {
        _cache: null,
        _read() {
            if (!this._cache) {
                try { this._cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
                catch { this._cache = {}; }
            }
            return this._cache;
        },
        get(k) { return this._read()[k]; },
        set(k, v) { const d = this._read(); d[k] = v; localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); },
    };

    // =========================================================
    //  模板
    // =========================================================
    const PRESETS = [
        {
            id: 'preset-card', name: '信息卡片', icon: '🃏',
            code: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin: 20px 0; color: white;">
  <h3 style="margin: 0 0 12px; font-size: 22px;">📌 标题</h3>
  <p style="margin: 0; font-size: 16px; line-height: 1.8; opacity: 0.95;">在这里写内容</p>
</div>`
        },
        {
            id: 'preset-quote', name: '引用块', icon: '💬',
            code: `<blockquote style="border-left: 4px solid #667eea; margin: 20px 0; padding: 16px 24px; background: #f8f9ff; border-radius: 0 12px 12px 0;">
  <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #2d3748;">引用内容写在这里</p>
  <footer style="margin-top: 8px; font-size: 14px; color: #718096; text-align: right;">— 来源</footer>
</blockquote>`
        },
        {
            id: 'preset-cta', name: 'CTA按钮', icon: '🚀',
            code: `<div style="text-align: center; margin: 30px 0;">
  <a style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 36px; border-radius: 50px; font-size: 17px; font-weight: bold; text-decoration: none;">🚀 立即行动</a>
</div>`
        },
        {
            id: 'preset-divider', name: '分割线', icon: '✂️',
            code: `<div style="text-align: center; margin: 32px 0; color: #a0aec0; font-size: 20px; letter-spacing: 12px;">· · ·</div>`
        },
    ];

    function getUserTemplates() { return Config.get('templates') || []; }
    function saveUserTemplate(name, code) {
        const list = getUserTemplates();
        list.push({ id: 'user-' + Date.now(), name, icon: '📄', code });
        Config.set('templates', list);
    }
    function deleteUserTemplate(id) {
        Config.set('templates', getUserTemplates().filter(t => t.id !== id));
    }

    // =========================================================
    //  编辑器探测
    // =========================================================
    function findEditor() {
        // ProseMirror 优先
        const pm = document.querySelector('.ProseMirror');
        if (pm && pm.isContentEditable) {
            const r = pm.getBoundingClientRect();
            if (r.width > 100 && r.height > 30) {
                log.ok('ProseMirror', r.width + 'x' + r.height);
                return { editor: pm, doc: document, type: 'prosemirror' };
            }
        }

        // iframe 内的 ProseMirror
        for (const f of document.querySelectorAll('iframe')) {
            try {
                const d = f.contentDocument;
                if (!d) continue;
                const ipm = d.querySelector('.ProseMirror');
                if (ipm && ipm.isContentEditable) {
                    log.ok('ProseMirror (iframe)');
                    return { editor: ipm, doc: d, type: 'prosemirror-iframe' };
                }
            } catch { }
        }

        // 回退: 最大 contenteditable
        let best = null, bestArea = 0;
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            const r = el.getBoundingClientRect();
            const a = r.width * r.height;
            if (r.width > 200 && r.height > 50 && a > bestArea) {
                bestArea = a; best = { editor: el, doc: document, type: 'contenteditable' };
            }
        });
        if (best) { log.ok('Contenteditable fallback'); return best; }

        log.error('未找到编辑器'); return null;
    }

    // =========================================================
    //  HTML 清理
    // =========================================================
    function cleanHTML(html) {
        return html
            .replace(/<!--[\s\S]*?-->/g, '')              // 去掉注释，防止 ProseMirror 因注释节点错误规范化
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
            .replace(/<object[\s\S]*?<\/object>/gi, '')
            .replace(/<embed[^>]*>/gi, '')
            .replace(/<form[\s\S]*?<\/form>/gi, '')
            .replace(/\s(on\w+)\s*=\s*["'][^"']*["']/gi, '');
    }

    // =========================================================
    //  插入引擎
    // =========================================================

    // -------------------------------------------------------------------------
    // 策略 A: 渲染后复制（renderCopy）
    //   原理：把 HTML 渲染进一个屏幕外的 contenteditable div，
    //         用 execCommand('copy') 写入"真实"剪贴板，
    //         再对编辑器执行 execCommand('paste')。
    //   这条路绕过了 ProseMirror 的合成事件过滤，保留 grid/flex 等样式。
    // -------------------------------------------------------------------------
    function insertViaRenderCopy(editor, doc, html) {
        try {
            // 1. 创建屏幕外可渲染暂存区（不能用 display:none，那样无法被选中复制）
            const staging = doc.createElement('div');
            staging.contentEditable = 'true';
            staging.style.cssText = [
                'position:fixed', 'left:-9999px', 'top:100px',
                'width:680px', 'min-height:10px',
                'overflow:visible', 'z-index:-9999',
                'opacity:0.01', 'pointer-events:none'
            ].join(';');
            staging.innerHTML = html;
            doc.body.appendChild(staging);

            // 2. 全选并复制
            staging.focus();
            const r = doc.createRange();
            r.selectNodeContents(staging);
            const sel = doc.getSelection();
            sel.removeAllRanges();
            sel.addRange(r);
            const copied = doc.execCommand('copy');
            doc.body.removeChild(staging);

            if (!copied) { log.warn('renderCopy: execCommand copy failed'); return false; }

            // 3. 聚焦编辑器并粘贴
            editor.focus();
            const edSel = doc.getSelection();
            if (!edSel.rangeCount) {
                const er = doc.createRange();
                er.selectNodeContents(editor); er.collapse(false);
                edSel.removeAllRanges(); edSel.addRange(er);
            }
            if (doc.execCommand('paste')) {
                log.ok('renderCopy + execCommand paste');
                return true;
            }
            log.warn('renderCopy: execCommand paste failed');
            return false;
        } catch (e) {
            log.warn('renderCopy failed:', e.message);
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // 策略 B: 合成 ClipboardEvent（原策略 1，保留作降级）
    // -------------------------------------------------------------------------
    function insertViaPaste(editor, doc, html) {
        try {
            editor.focus();
            const sel = doc.getSelection();
            if (!sel.rangeCount) {
                const r = doc.createRange();
                r.selectNodeContents(editor); r.collapse(false);
                sel.removeAllRanges(); sel.addRange(r);
            }
            const dt = new DataTransfer();
            dt.setData('text/html', html);
            dt.setData('text/plain', html.replace(/<[^>]*>/g, ''));
            const ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
            editor.dispatchEvent(ev);
            log.ok('Synthetic ClipboardEvent paste');
            return true;
        } catch (e) { log.warn('Paste failed:', e.message); return false; }
    }

    // -------------------------------------------------------------------------
    // 策略 C: execCommand insertHTML（原策略 2）
    // -------------------------------------------------------------------------
    function insertViaExec(editor, doc, html) {
        try {
            editor.focus();
            const sel = doc.getSelection();
            if (!sel.rangeCount) {
                const r = doc.createRange();
                r.selectNodeContents(editor); r.collapse(false);
                sel.removeAllRanges(); sel.addRange(r);
            }
            if (doc.execCommand('insertHTML', false, html)) { log.ok('execCommand insertHTML'); return true; }
        } catch (e) { log.warn('execCommand failed:', e.message); }
        return false;
    }

    // -------------------------------------------------------------------------
    // 策略 D: Range insertNode（原策略 3）
    // -------------------------------------------------------------------------
    function insertViaRange(editor, doc, html) {
        try {
            editor.focus();
            const sel = doc.getSelection();
            const tmp = doc.createElement('div');
            tmp.innerHTML = html;
            const frag = doc.createDocumentFragment();
            while (tmp.firstChild) frag.appendChild(tmp.firstChild);
            if (sel.rangeCount) {
                const r = sel.getRangeAt(0);
                r.deleteContents(); r.insertNode(frag); r.collapse(false);
            } else { editor.appendChild(frag); }
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            log.ok('Range insertNode');
            return true;
        } catch (e) { log.warn('Range failed:', e.message); return false; }
    }

    // -------------------------------------------------------------------------
    // 策略 E: innerHTML（原策略 4，最后兜底）
    // -------------------------------------------------------------------------
    function insertViaDOM(editor, html, mode) {
        try {
            if (mode === 'replace') editor.innerHTML = html;
            else editor.innerHTML += html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            log.ok('innerHTML ' + mode);
            return true;
        } catch (e) { log.warn('innerHTML failed:', e.message); return false; }
    }

    function smartInsertFallback(code) {
        const html = cleanHTML(code);
        const r = findEditor();
        if (!r) { toast('未找到编辑器，请先点击编辑区域', 'error'); return false; }
        const { editor, doc } = r;
        try {
            editor.innerHTML = html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            // ProseMirror 规范化后可能在内容前自动插入一个空 <p>，延迟清理
            setTimeout(() => {
                const first = editor.firstElementChild;
                if (first && first.tagName === 'P' &&
                    (first.innerHTML === '' || first.innerHTML === '<br>' || !first.textContent.trim())) {
                    first.remove();
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    log.ok('已移除 ProseMirror 自动插入的空首行');
                }
            }, 80);
            log.ok('innerHTML replace');
            toast('插入成功 ✓'); return true;
        } catch (e) { log.warn('DOM replace failed:', e.message); }
        // 次选：innerHTML 追加
        if (insertViaDOM(editor, html, 'append'))   { toast('插入成功 ✓'); return true; }
        // 以下为兜底（可能样式受损）
        if (insertViaRange(editor, doc, html))      { toast('插入成功 ✓'); return true; }
        if (insertViaRenderCopy(editor, doc, html)) { toast('插入成功 ✓'); return true; }
        if (insertViaPaste(editor, doc, html))      { toast('插入成功 ✓'); return true; }
        if (insertViaExec(editor, doc, html))       { toast('插入成功 ✓'); return true; }
        toast('所有策略均失败', 'error'); return false;
    }

    function replaceAll(code) {
        const html = cleanHTML(code);
        const r = findEditor();
        if (!r) { toast('未找到编辑器', 'error'); return false; }
        insertViaDOM(r.editor, html, 'replace');
        toast('内容已替换');
        return true;
    }

    // =========================================================
    //  UI: Toast
    // =========================================================
    function toast(msg, type = 'success') {
        document.querySelectorAll('.wh-toast').forEach(el => el.remove());
        const el = document.createElement('div');
        el.className = `wh-toast wh-toast-${type}`;
        const icons = { success: '✓', error: '✕', warning: '!' };
        el.innerHTML = `<span style="font-size: 16px;">${icons[type] || '✓'}</span> ${msg}`;
        el.onclick = () => el.remove();
        document.body.appendChild(el);
        setTimeout(() => {
            el.style.animation = 'wh-fadeOut 0.3s forwards';
            setTimeout(() => el.remove(), 300);
        }, 3500);
    }

    // =========================================================
    //  UI: 主对话框
    // =========================================================
    function showDialog() {
        document.getElementById('wh-overlay')?.remove();

        const saved = Config.get('lastCode') || '';
        const all = [...PRESETS, ...getUserTemplates()];

        const overlay = document.createElement('div');
        overlay.id = 'wh-overlay';
        overlay.innerHTML = `
        <div id="wh-dialog">
            <div class="wh-header">
                <div>
                    <h2>HTML 插入器</h2>
                    <p>粘贴代码，点插入</p>
                </div>
                <button class="wh-close-btn" id="wh-close">✕</button>
            </div>

            <div class="wh-editor-area">
                <textarea class="wh-textarea" id="wh-code" placeholder="在这里粘贴 HTML 代码...">${saved.replace(/</g, '&lt;')}</textarea>
            </div>

            <div class="wh-actions">
                <button class="wh-btn wh-btn-primary" id="wh-insert">插入</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);

        // --- 事件 ---
        const code = document.getElementById('wh-code');

        document.getElementById('wh-close').onclick = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        // 插入
        document.getElementById('wh-insert').onclick = async () => {
            const c = code.value.trim();
            if (!c) { toast('请输入 HTML 代码', 'warning'); return; }
            Config.set('lastCode', c);
            overlay.remove();
            setTimeout(() => smartInsertFallback(c), 150);
        };

        // ESC 关闭
        const onKey = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } };
        document.addEventListener('keydown', onKey);
    }

    // =========================================================
    //  UI: 浮动按钮 (FAB)
    // =========================================================
    function createFAB() {
        if (document.getElementById('wh-fab')) return;
        const fab = document.createElement('button');
        fab.id = 'wh-fab';
        fab.title = 'HTML 插入器';
        fab.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
        fab.onclick = showDialog;
        document.body.appendChild(fab);
        log.ok('FAB 已就绪');
    }

    // =========================================================
    //  初始化 — 轮询等待编辑器出现
    // =========================================================
    function init() {
        log.info('等待编辑器...');
        let n = 0;
        const timer = setInterval(() => {
            n++;
            if (document.querySelector('.ProseMirror') || document.querySelectorAll('[contenteditable="true"]').length) {
                clearInterval(timer);
                log.ok(`编辑器就绪 (${n}次轮询)`);
                createFAB();
                return;
            }
            if (n >= 60) { clearInterval(timer); log.warn('超时, 强制创建'); createFAB(); }
        }, 500);
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

    log.info('加载完毕, 等待编辑器...');
})();
