/* ============================================================
   AWG-UIKIT-RACING — Widgets  (js/awg-widgets.js)
   Author : AWGNET-RACING & AGENT AI TEAM
   Berisi : 1) Wizard stepper   window.AwgWizard
            2) Treeview checkbox window.AwgTree
            3) Command palette   Ctrl+K / Cmd+K   window.AwgPalette
            4) Kanban drag-drop  window.AwgKanban
            5) Lightbox gambar   window.AwgLightbox
   Prinsip: deklaratif via data-awg-*, nol dependensi.
   ============================================================ */
(function () {
    'use strict';
    const d = document;
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    /* ============ 1. WIZARD STEPPER ============ */
    class AwgWizard {
        constructor(root, opts) {
            this.r = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.r) return null;
            this.o = Object.assign({ validate: true, onDone: null, onChange: null }, opts);
            if (this.r.dataset.awgWizardValidate === 'false') this.o.validate = false;
            this.steps = [...this.r.querySelectorAll('[data-awg-wstep]')];
            this.panes = [...this.r.querySelectorAll('[data-awg-wpane]')];
            this.n = 0;
            this.r.querySelectorAll('[data-awg-wnext]').forEach(b => b.addEventListener('click', () => this.next()));
            this.r.querySelectorAll('[data-awg-wprev]').forEach(b => b.addEventListener('click', () => this.prev()));
            this.steps.forEach((s, i) => s.addEventListener('click', () => { if (i < this.n) this.goto(i); })); // kembali bebas, maju via tombol
            if (this.r.dataset.awgWizard) {
                // wizard diaktifkan via data-awg-wizard pada ancestor, tapi langkah harus discan
                this.r = this.r.closest('[data-awg-wizard]') || this.r;
                this.steps = [...this.r.querySelectorAll('[data-awg-wstep]')];
                this.panes = [...this.r.querySelectorAll('[data-awg-wpane]')];
            }
            this.goto(0);
            if (this.steps.length) this.r._awgWizard = this;
        }
        _panel() { return this.panes[this.n]; }
        valid() {
            if (!this.o.validate) return true;
            const p = this._panel(); if (!p) return true;
            let ok = true;
            p.querySelectorAll('[required]').forEach(el => {
                const bad = el.willValidate && !el.checkValidity();
                const field = el.closest('.awg-field');
                if (field) field.classList.toggle('awg-invalid', bad);
                const err = field?.querySelector('.awg-error');
                if (err) err.textContent = bad ? (el.dataset.msgRequired || 'Wajib diisi') : '';
                if (bad) ok = false;
            });
            p.querySelectorAll('[data-awg-email]').forEach(el => {
                const bad = el.value && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(el.value);
                const f = el.closest('.awg-field'); if (f) f.classList.toggle('awg-invalid', bad);
                const e = f?.querySelector('.awg-error'); if (e) e.textContent = bad ? 'Format email tidak valid' : '';
                if (bad) ok = false;
            });
            return ok;
        }
        goto(i) {
            this.n = Math.max(0, Math.min(this.steps.length - 1, i));
            this.steps.forEach((s, j) => {
                s.classList.toggle('done', j < this.n);
                s.classList.toggle('active', j === this.n);
            });
            this.panes.forEach((p, j) => p.classList.toggle('awg-hide', j !== this.n));
            const last = this.n === this.steps.length - 1;
            this.r.querySelectorAll('[data-awg-wnext]').forEach(b => b.classList.toggle('awg-hide', last));
            this.r.querySelectorAll('[data-awg-wfinish]').forEach(b => b.classList.toggle('awg-hide', !last));
            this.r.querySelectorAll('[data-awg-wprev]').forEach(b => b.classList.toggle('awg-hide', this.n === 0));
            this.o.onChange && this.o.onChange(this.n, this);
            this.r.dispatchEvent(new CustomEvent('awg:wizard', { bubbles: true, detail: { step: this.n, total: this.steps.length } }));
        }
        next() { if (!this.valid()) return; if (this.n < this.steps.length - 1) this.goto(this.n + 1); }
        prev() { this.goto(this.n - 1); }
        finish() { this.o.onDone && this.o.onDone(this); }
    }

    /* ============ 2. TREEVIEW CHECKBOX ============ */
    class AwgTree {
        constructor(root, opts) {
            this.r = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.r) return null;
            this.o = Object.assign({ onChange: null }, opts);
            this.r.classList.add('awg-tree');
            this.r.addEventListener('change', e => {
                if (e.target.type !== 'checkbox') return;
                const node = e.target.closest('li');
                node.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = e.target.checked);
                this._up(node.parentElement.closest('li'));
                this._syncToggles();
                this.o.onChange && this.o.onChange(this.checked(), this);
                this.r.dispatchEvent(new CustomEvent('awg:tree', { bubbles: true, detail: { checked: this.checked() } }));
            });
            // toggle expand/collapse
            this.r.addEventListener('click', e => {
                const tg = e.target.closest('.awg-tree-tgl');
                if (!tg) return;
                const li = tg.closest('li');
                li.classList.toggle('open');
                tg.setAttribute('aria-expanded', li.classList.contains('open'));
            });
            this._syncToggles();
            this.r._awgTree = this;
        }
        _up(li) {
            while (li) {
                const kids = [...li.querySelectorAll(':scope > ul > li > label input[type=checkbox]')];
                const own = li.querySelector(':scope > label input[type=checkbox]');
                const on = kids.filter(k => k.checked).length;
                if (own) {
                    own.checked = on === kids.length && kids.length > 0;
                    own.indeterminate = on > 0 && on < kids.length;
                }
                li = li.parentElement.closest('li');
            }
        }
        _syncToggles() {
            this.r.querySelectorAll('li').forEach(li => {
                const has = li.querySelector(':scope > ul');
                const tg = li.querySelector(':scope > .awg-tree-tgl');
                if (tg) tg.hidden = !has;
            });
        }
        checked() {
            return [...this.r.querySelectorAll('input[type=checkbox]')]
                .filter(c => c.checked && !c.indeterminate)
                .map(c => c.value);
        }
        set(ids) {
            this.r.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = ids.includes(c.value));
            [...this.r.querySelectorAll('li')].reverse().forEach(li => this._up(li));
        }
    }

    /* ============ 3. COMMAND PALETTE (Ctrl/Cmd+K) ============ */
    const Palette = {
        items: [], _idx: 0, _el: null,
        init(items) {
            this.items = items || [];
            if (!Palette._bound) {
                d.addEventListener('keydown', e => {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); Palette.open(); }
                });
                Palette._bound = true;
            }
        },
        set data(v) { this.items = v || []; },        // setter agar AwgPalette.data = [...] jalan di DOMContentLoaded
        open(custom) {
            if (custom) this.items = custom;
            this._el = d.createElement('div');
            this._el.className = 'awg-palette';
            this._el.innerHTML = `<div class="awg-palette-box" role="dialog" aria-modal="true">
                <input class="awg-input awg-palette-input" type="text" placeholder="Ketik perintah atau cari…" aria-label="Perintah" autocomplete="off">
                <div class="awg-palette-list" role="listbox"></div>
                <div class="awg-palette-foot awg-tiny awg-muted"><span class="awg-kbd">↑↓</span> pilih · <span class="awg-kbd">Enter</span> jalankan · <span class="awg-kbd">Esc</span> tutup</div>
            </div>`;
            d.body.appendChild(this._el);
            d.body.classList.add('awg-lock');
            const inp = this._el.querySelector('input'), list = this._el.querySelector('.awg-palette-list');
            this._idx = 0;
            const draw = () => {
                const q = inp.value.toLowerCase().trim();
                const hits = (q ? this.items.filter(i => (i.label + ' ' + (i.hint || '')).toLowerCase().includes(q)) : this.items).slice(0, 12);
                this._hits = hits;
                this._idx = Math.min(this._idx, Math.max(0, hits.length - 1));
                list.innerHTML = hits.length ? hits.map((it, i) => `
                    <button type="button" class="awg-palette-item${i === this._idx ? ' cur' : ''}" data-i="${i}" role="option">
                        <svg class="awg-ic sm"><use href="assets/icons.svg#${it.icon || 'ic-pointer'}"></use></svg>
                        <span>${esc(it.label)}</span><small class="awg-tiny awg-muted">${esc(it.hint || '')}</small>
                    </button>`).join('')
                    : '<div class="awg-palette-empty awg-small awg-muted">Tidak ada hasil</div>';
                list.querySelector('.cur')?.scrollIntoView({ block: 'nearest' });
            };
            const run = (it) => {
                if (!it) return;
                this.close();
                if (it.action) it.action(this);
                else if (it.href) location.href = it.href;
                d.dispatchEvent(new CustomEvent('awg:palette', { detail: { item: it } }));
            };
            inp.addEventListener('input', () => { this._idx = 0; draw(); });
            inp.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); this._idx = Math.min(this._idx + 1, (this._hits || []).length - 1); draw(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); this._idx = Math.max(0, this._idx - 1); draw(); }
                else if (e.key === 'Enter') { e.preventDefault(); run((this._hits || [])[this._idx]); }
                else if (e.key === 'Escape') { e.preventDefault(); this.close(); }
            });
            list.addEventListener('click', e => run(this._hits[+e.target.closest('[data-i]')?.dataset.i ?? -1]));
            this._el.addEventListener('mousedown', e => { if (e.target === this._el) this.close(); });
            draw();
            requestAnimationFrame(() => inp.focus());
        },
        close() { this._el?.remove(); this._el = null; d.body.classList.remove('awg-lock'); }
    };

    /* ============ 4. KANBAN (drag & drop native) ============ */
    class AwgKanban {
        constructor(root, opts) {
            this.r = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.r) return null;
            this.o = Object.assign({ onMove: null }, opts);
            this.r.classList.add('awg-kanban');
            this.r.addEventListener('dragstart', e => {
                const c = e.target.closest('.awg-kb-card'); if (!c) return;
                this.drag = c; c.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                try { e.dataTransfer.setData('text/plain', c.dataset.kbId); } catch (x) { }
            });
            this.r.addEventListener('dragend', () => { this.drag?.classList.remove('dragging'); this.r.querySelectorAll('.awg-kb-over').forEach(x => x.classList.remove('awg-kb-over')); this.drag = null; });
            this.r.addEventListener('dragover', e => {
                const col = e.target.closest('.awg-kb-col'); if (!col || !this.drag) return;
                e.preventDefault(); e.dataTransfer.dropEffect = 'move';
                this.r.querySelectorAll('.awg-kb-over').forEach(x => x !== col && x.classList.remove('awg-kb-over'));
                col.classList.add('awg-kb-over');
                const list = col.querySelector('.awg-kb-list');
                const after = this._after(list, e.clientY);
                if (after == null) list.appendChild(this.drag); else list.insertBefore(this.drag, after);
            });
            this.r.addEventListener('drop', e => {
                e.preventDefault();
                const col = e.target.closest('.awg-kb-col');
                if (col && this.drag) this._emit(col);
            });
            // keyboard: fokus card + panah kiri/kanan pindah kolom (alt)
            this.r.addEventListener('keydown', e => {
                const c = e.target.closest('.awg-kb-card'); if (!c) return;
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const cols = [...this.r.querySelectorAll('.awg-kb-col')];
                    const cur = cols.indexOf(c.closest('.awg-kb-col'));
                    const nx = cols[cur + (e.key === 'ArrowRight' ? 1 : -1)];
                    if (nx) { nx.querySelector('.awg-kb-list').appendChild(c); this._emit(nx); c.focus(); }
                }
            });
            this.r._awgKanban = this;
        }
        _after(list, y) {
            const els = [...list.querySelectorAll('.awg-kb-card:not(.dragging)')];
            let best = null, bestOff = -Infinity;
            for (const el of els) {
                const b = el.getBoundingClientRect();
                const off = y - b.top - b.height / 2;
                if (off < 0 && off > bestOff) { bestOff = off; best = el; }
            }
            return best;
        }
        _emit(col) {
            const data = this.state();
            this.o.onMove && this.o.onMove(data, this);
            this.r.dispatchEvent(new CustomEvent('awg:kanban', { bubbles: true, detail: data }));
        }
        state() {
            const cols = {};
            this.r.querySelectorAll('.awg-kb-col').forEach(c => {
                cols[c.dataset.kb] = [...c.querySelectorAll('.awg-kb-card')].map(x => x.dataset.kbId);
            });
            return cols;
        }
    }

    /* ============ 5. LIGHTBOX ============ */
    const Lightbox = {
        _list: [], _i: 0, _el: null,
        open(src, caption, group) {
            if (group && this._list.every(im => im.src !== src)) {
                this._list = [...d.querySelectorAll(`[data-awg-lightbox="${group}"] img, img[data-awg-lightbox="${group}"], img[data-awg-lightbox-group="${group}"]`)];
                this._i = 0;
            }
            if (this._list.length) {
                this._i = Math.max(0, this._list.findIndex(im => im.src === src));
                src = this._list[this._i].src; caption = caption || this._list[this._i].alt;
            }
            this._show(src, caption);
        },
        _show(src, cap) {
            if (!this._el) {
                this._el = d.createElement('div');
                this._el.className = 'awg-lightbox';
                this._el.innerHTML = `<button class="awg-lb-x" aria-label="Tutup"><svg class="awg-ic xl"><use href="assets/icons.svg#ic-x"></use></svg></button>
                    <figure><img alt=""><figcaption></figcaption></figure>
                    <button class="awg-lb-nav prev" aria-label="Sebelumnya"><svg class="awg-ic lg" style="transform:rotate(180deg)"><use href="assets/icons.svg#ic-chevron-right"></use></svg></button>
                    <button class="awg-lb-nav next" aria-label="Berikutnya"><svg class="awg-ic lg"><use href="assets/icons.svg#ic-chevron-right"></use></svg></button>`;
                d.body.appendChild(this._el);
                d.body.classList.add('awg-lock');
                const close = () => { this._el?.remove(); this._el = null; d.body.classList.remove('awg-lock'); d.removeEventListener('keydown', keys); };
                const keys = e => {
                    if (e.key === 'Escape') close();
                    if (e.key === 'ArrowRight') this._go(1);
                    if (e.key === 'ArrowLeft') this._go(-1);
                };
                d.addEventListener('keydown', keys);
                this._el.addEventListener('click', e => { if (e.target === this._el || e.target.closest('.awg-lb-x')) close(); });
                this._el.querySelector('.next').addEventListener('click', () => this._go(1));
                this._el.querySelector('.prev').addEventListener('click', () => this._go(-1));
            }
            const img = this._el.querySelector('img');
            img.src = src;
            img.onload = () => img.classList.add('ready');
            img.classList.remove('ready');
            this._el.querySelector('figcaption').textContent = cap || '';
            const multi = this._list.length > 1;
            this._el.querySelectorAll('.awg-lb-nav').forEach(b => b.hidden = !multi);
        },
        _go(dir) {
            if (this._list.length < 2) return;
            this._i = (this._i + dir + this._list.length) % this._list.length;
            this._show(this._list[this._i].src, this._list[this._i].alt);
        }
    };

    /* ============ delegasi klik global ============ */
    let _lbDown = null;
    d.addEventListener('mousedown', e => { _lbDown = e.target.closest('[data-awg-lightbox]'); });
    d.addEventListener('click', e => {
        const lb = e.target.closest('[data-awg-lightbox]');
        if (lb && lb === _lbDown) {
            const img = lb.tagName === 'IMG' ? lb : lb.querySelector('img');
            Lightbox.open(img?.src || lb.dataset.awgLightbox, img?.alt || lb.dataset.awgLightboxCaption || '', lb.dataset.awgLightbox || img?.dataset.awgLightboxGroup || '');
        }
        const pal = e.target.closest('[data-awg-palette]');
        if (pal) { Palette.open(); }
    });

    /* ============ auto-mount ============ */
    function mount(root) {
        (root || d).querySelectorAll('[data-awg-wizard]').forEach(w => { if (!w._awgWizard) new AwgWizard(w); });
        (root || d).querySelectorAll('[data-awg-tree]').forEach(t => { if (!t._awgTree) new AwgTree(t); });
        (root || d).querySelectorAll('[data-awg-kanban]').forEach(k => { if (!k._awgKanban) new AwgKanban(k); });
        // palette: kumpulkan item dari window.AwgPalette.items ATAU [data-palette-item]
        const items = (window.AwgPaletteItems || []);
        if (items.length) Palette.init(items);
        else {
            const dom = [...(root || d).querySelectorAll('[data-palette-item]')].map(el => ({
                label: el.dataset.paletteItem, hint: el.dataset.hint || '',
                icon: el.dataset.icon || 'ic-pointer',
                action: () => { el.dispatchEvent(new CustomEvent('awg:palette-run', { bubbles: true })); }
            }));
            if (dom.length) Palette.init(dom);
        }
    }
    if (d.readyState === 'loading')
        d.addEventListener('DOMContentLoaded', mount);
    else
        setTimeout(mount, 0);
    mount();   // fail-safe: jalankan langsung saat script berakhir (idempoten)

    window.AwgWizard = AwgWizard; window.AwgTree = AwgTree;
    window.AwgPalette = Palette;   window.AwgKanban = AwgKanban; window.AwgLightbox = Lightbox;
    window.AwgWidgets = { mount };
})();
