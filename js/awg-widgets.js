/* ============================================================
   AWG-UIKIT-RACING — Widgets  (js/awg-widgets.js)
   Author : AWGNET-RACING & AGENT AI TEAM
   Berisi : 1) Wizard stepper   window.AwgWizard
            2) Treeview checkbox window.AwgTree
            3) Command palette   Ctrl+K / Cmd+K   window.AwgPalette
            4) Kanban drag-drop  window.AwgKanban
            5) Lightbox gambar   window.AwgLightbox
            6) Skeleton loaders  window.AwgSkeleton
            7) Timeline vert/horiz window.AwgTimeline
            8) Tour / onboarding window.AwgTour
   Prinsip: deklaratif via data-awg-*, nol dependensi.
   ============================================================ */
(function () {
    'use strict';
    const d = document;
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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



    /* ============ 6. UPLOAD GRID (drag-drop + preview + progress) ============ */
    let _uploadId = 0;
    class AwgUpload {
        constructor(root, opts = {}) {
            this.r = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.r) return null;
            this.o = Object.assign({
                multiple: true, maxSize: 5 * 1024 * 1024, maxFiles: 12,
                accept: '', url: '', autoUpload: true,
                onAdd: null, onRemove: null, onProgress: null, onDone: null
            }, opts);
            if (this.r.dataset.awgUpload) {
                try { Object.assign(this.o, JSON.parse(this.r.dataset.awgUpload)); } catch (e) {}
            }
            this.items = [];
            this._ensureLayout();
            this._bind();
            this.r._awgUpload = this;
        }
        _ensureLayout() {
            this.zone = this.r.querySelector('.awg-upload-zone') || this.r.querySelector('[data-awg-upload-zone]');
            this.list = this.r.querySelector('.awg-upload-list') || this.r.querySelector('[data-awg-upload-list]');
            this.input = this.r.querySelector('input[type=file]');
            if (!this.zone) {
                this.zone = d.createElement('label');
                this.zone.className = 'awg-upload-zone';
                this.zone.innerHTML = `<svg class="awg-ic icon" style="width:2.4rem;height:2.4rem"><use href="assets/icons.svg#ic-cloud-upload"></use></svg><b>Seret file ke sini</b><span class="awg-tiny">atau klik untuk pilih — max ${this._fmtSize(this.o.maxSize)}</span><input type="file" ${this.o.multiple ? 'multiple' : ''} ${this.o.accept ? 'accept="' + esc(this.o.accept) + '"' : ''}>`;
                this.r.appendChild(this.zone);
                this.input = this.zone.querySelector('input');
            }
            if (!this.list) {
                this.list = d.createElement('div');
                this.list.className = 'awg-upload-list';
                this.r.appendChild(this.list);
            }
        }
        _bind() {
            ['dragenter','dragover','dragleave','drop'].forEach(evt => {
                this.zone.addEventListener(evt, e => {
                    e.preventDefault(); e.stopPropagation();
                    this.zone.classList.toggle('dragover', evt === 'dragenter' || evt === 'dragover');
                    if (evt === 'drop') this.add(e.dataTransfer.files);
                });
            });
            this.input.addEventListener('change', e => { this.add(e.target.files); this.input.value = ''; });
        }
        _fmtSize(n) {
            if (n < 1024) return n + ' B';
            if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
            return (n / (1024 * 1024)).toFixed(1) + ' MB';
        }
        _accept(file) {
            if (this.o.maxFiles && this.items.length >= this.o.maxFiles) {
                Awg.toast(`Maksimal ${this.o.maxFiles} file`, 'warn'); return false;
            }
            if (file.size > this.o.maxSize) {
                Awg.toast(`${file.name} melebihi ${this._fmtSize(this.o.maxSize)}`, 'warn'); return false;
            }
            if (this.o.accept) {
                const ok = this.o.accept.split(',').some(p => {
                    p = p.trim();
                    if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase());
                    if (p.includes('*')) return new RegExp('^' + p.replace(/\*/g, '.*') + '$', 'i').test(file.type);
                    return file.type === p;
                });
                if (!ok) { Awg.toast(`${file.name} tidak sesuai format`, 'warn'); return false; }
            }
            return true;
        }
        add(files) {
            Array.from(files || []).forEach(f => {
                if (!this._accept(f)) return;
                const id = ++_uploadId;
                const item = { id, file: f, el: null, progress: 0 };
                this.items.push(item);
                this._renderCard(item);
                this.o.onAdd && this.o.onAdd(item, this);
                this.r.dispatchEvent(new CustomEvent('awg:upload', { bubbles: true, detail: { type: 'add', item, upload: this } }));
                if (this.o.autoUpload) this._upload(item);
            });
        }
        _renderCard(item) {
            const isImg = item.file.type.startsWith('image/');
            const el = d.createElement('div');
            el.className = 'awg-upload-card';
            el.dataset.awgUploadId = item.id;
            el.innerHTML = `
                <div class="awg-upload-thumb"></div>
                <div class="awg-upload-info"><div class="name">${esc(item.file.name)}</div><div class="meta">${esc(this._fmtSize(item.file.size))}</div></div>
                <div class="awg-upload-progress"><span></span></div>
                <button type="button" class="rm" aria-label="Hapus">✕</button>`;
            const thumb = el.querySelector('.awg-upload-thumb');
            if (isImg) {
                const img = d.createElement('img');
                img.alt = esc(item.file.name);
                const url = URL.createObjectURL(item.file);
                item.objectUrl = url;
                img.src = url;
                thumb.appendChild(img);
            } else {
                thumb.innerHTML = `<svg class="awg-ic file-ico"><use href="assets/icons.svg#ic-file"></use></svg>`;
            }
            el.querySelector('.rm').addEventListener('click', () => this.remove(item.id));
            item.el = el;
            this.list.appendChild(el);
        }
        setProgress(id, pct, status) {
            const item = this.items.find(i => i.id === id);
            if (!item) return;
            item.progress = Math.max(0, Math.min(100, pct));
            const bar = item.el.querySelector('.awg-upload-progress > span');
            bar.style.width = item.progress + '%';
            if (status === 'ok') bar.parentElement.classList.add('ok');
            if (status === 'bad') bar.parentElement.classList.add('bad');
            this.o.onProgress && this.o.onProgress(item, this);
            this.r.dispatchEvent(new CustomEvent('awg:upload', { bubbles: true, detail: { type: 'progress', item, upload: this } }));
        }
        _upload(item) {
            if (this.o.url) {
                const fd = new FormData();
                fd.append('file', item.file);
                fetch(this.o.url, { method: 'POST', body: fd })
                    .then(r => { if (!r.ok) throw new Error(r.statusText); return r; })
                    .then(() => { this.setProgress(item.id, 100, 'ok'); this.o.onDone && this.o.onDone(item, this); })
                    .catch(e => { this.setProgress(item.id, 100, 'bad'); Awg.toast('Upload gagal: ' + e.message, 'bad'); });
                return;
            }
            // demo simulation
            let p = 0;
            const t = setInterval(() => {
                p += Math.random() * 14;
                if (p >= 100) { p = 100; clearInterval(t); this.setProgress(item.id, 100, 'ok'); this.o.onDone && this.o.onDone(item, this); }
                else this.setProgress(item.id, p);
            }, 120);
        }
        remove(id) {
            const idx = this.items.findIndex(i => i.id === id);
            if (idx < 0) return;
            const item = this.items[idx];
            if (item.objectUrl) URL.revokeObjectURL(item.objectUrl);
            item.el.remove();
            this.items.splice(idx, 1);
            this.o.onRemove && this.o.onRemove(item, this);
            this.r.dispatchEvent(new CustomEvent('awg:upload', { bubbles: true, detail: { type: 'remove', item, upload: this } }));
        }
        files() { return this.items.map(i => i.file); }
        clear() { [...this.items].forEach(i => this.remove(i.id)); }
    }

    /* ============ 7. INLINE-EDIT TABLE CELLS ============ */
    class AwgEditable {
        constructor(root, opts = {}) {
            this.r = (typeof root === 'string' ? d.querySelector(root) : root) || d;
            this.o = Object.assign({ onSave: null }, opts);
            this._handler = e => {
                const el = e.target.closest('.awg-editable');
                if (el && !el.querySelector('input,select,textarea')) this._edit(el);
            };
            this.r.addEventListener('click', this._handler);
            if (this.r !== d) this.r._awgEditable = this;
        }
        _edit(el) {
            const type = el.dataset.awgEditable || 'text';
            const old = el.textContent.trim();
            const options = (el.dataset.awgOptions || '').split(',').filter(Boolean);
            let field;
            if (type === 'select' || options.length) {
                field = d.createElement('select');
                field.className = 'awg-editable-input awg-editable-select';
                options.forEach(v => {
                    const opt = d.createElement('option');
                    opt.value = v; opt.textContent = v;
                    if (v === old) opt.selected = true;
                    field.appendChild(opt);
                });
            } else {
                field = d.createElement('input');
                field.type = type === 'number' ? 'number' : 'text';
                field.className = 'awg-editable-input';
                field.value = old;
                if (el.dataset.awgPlaceholder) field.placeholder = el.dataset.awgPlaceholder;
            }
            el.textContent = '';
            el.appendChild(field);
            field.focus();
            const save = () => {
                const val = field.value.trim();
                const evt = new CustomEvent('awg:edit', { bubbles: true, cancelable: true, detail: { el, name: el.dataset.awgName || '', oldValue: old, newValue: val } });
                el.dispatchEvent(evt);
                if (!evt.defaultPrevented) el.textContent = val || old;
                this._finish(el, old);
                if (!evt.defaultPrevented && this.o.onSave) this.o.onSave(el.dataset.awgName || '', val || old, el);
            };
            const cancel = () => { el.textContent = old; this._finish(el, old); };
            field.addEventListener('blur', save);
            field.addEventListener('keydown', e => {
                if (e.key === 'Enter') { e.preventDefault(); field.blur(); }
                else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
            });
        }
        _finish(el, old) {
            el.textContent = el.textContent.trim() || old;
        }
        destroy() { this.r.removeEventListener('click', this._handler); }
    }

    /* ============ 8. SKELETON LOADER HELPERS ============ */
    const Skeleton = {
        show(elOrSel, variant = 'text') {
            const el = typeof elOrSel === 'string' ? d.querySelector(elOrSel) : elOrSel;
            if (!el) return null;
            el.dataset.awgSkeletonOriginal = el.innerHTML;
            el.setAttribute('aria-busy', 'true');
            el.innerHTML = '<span class="awg-skel ' + variant + '"></span>';
            return el;
        },
        hide(elOrSel) {
            const el = typeof elOrSel === 'string' ? d.querySelector(elOrSel) : elOrSel;
            if (!el || !el.dataset.awgSkeletonOriginal) return;
            el.innerHTML = el.dataset.awgSkeletonOriginal;
            el.removeAttribute('aria-busy');
            delete el.dataset.awgSkeletonOriginal;
            AwgWidgets.mount(el);
        },
        replace(sel, variant = 'text') {
            const el = typeof sel === 'string' ? d.querySelector(sel) : sel;
            if (!el) return;
            el.innerHTML = '<span class="awg-skel ' + variant + '"></span>';
            el.setAttribute('aria-busy', 'true');
        }
    };

    /* ============ 7. TIMELINE COMPONENT (vertical/horizontal) ============ */
    class AwgTimeline {
        constructor(root, opts = {}) {
            this.r = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.r) return null;
            this.o = Object.assign({ horizontal: false, onChange: null }, opts);
            if (this.o.horizontal) this.r.classList.add('horizontal');
            this.r.classList.add('awg-timeline');
            this.items = [...this.r.querySelectorAll(':scope > .awg-tl-item')];
            this._render();
            this.r._awgTimeline = this;
        }
        setHorizontal(v) {
            this.r.classList.toggle('horizontal', !!v);
            this.o.horizontal = !!v;
        }
        mark(index, state = 'done') {
            const it = this.items[index];
            if (!it) return;
            ['done','pending','bad'].forEach(s => it.classList.remove(s));
            it.classList.add(state);
            this.o.onChange && this.o.onChange(index, state, this);
        }
        _render() {
            // ensure proper wrappers if missing
            this.items.forEach((it, i) => {
                if (!it.querySelector('.awg-tl-title')) {
                    const b = it.querySelector('b');
                    if (b) { b.classList.add('awg-tl-title'); }
                }
            });
        }
    }

    /* ============ 8. TOUR / ONBOARDING OVERLAY ============ */
    class AwgTour {
        constructor(steps, opts = {}) {
            this.steps = steps || [];
            this.o = Object.assign({ onStep: null, onEnd: null, onSkip: null, labels: { next: 'Lanjut', prev: 'Kembali', finish: 'Selesai', skip: 'Lewati' } }, opts);
            this.i = 0;
            this.bd = null; this.spot = null; this.card = null;
        }
        start() {
            if (!this.steps.length) return;
            this.i = 0;
            this._mount();
            this._step(0);
        }
        _mount() {
            if (this.bd) return;
            this.bd = d.createElement('div');
            this.bd.className = 'awg-tour-backdrop open';
            this.spot = d.createElement('div');
            this.spot.className = 'awg-tour-spotlight';
            this.card = d.createElement('div');
            this.card.className = 'awg-tour-card';
            this.card.setAttribute('role', 'dialog');
            this.card.setAttribute('aria-modal', 'true');
            d.body.appendChild(this.bd);
            d.body.appendChild(this.spot);
            d.body.appendChild(this.card);
            this.bd.addEventListener('click', () => this.end());
        }
        _step(n) {
            this.i = Math.max(0, Math.min(this.steps.length - 1, n));
            const s = this.steps[this.i];
            const target = s.target ? (typeof s.target === 'string' ? d.querySelector(s.target) : s.target) : null;
            this._position(target);
            this._renderCard(s, target);
            this.o.onStep && this.o.onStep(this.i, s, this);
        }
        _position(target) {
            if (!target) { this.spot.style.display = 'none'; this.card.style.top = '15vh'; this.card.style.left = '50%'; this.card.style.transform = 'translateX(-50%)'; return; }
            const r = target.getBoundingClientRect();
            const pad = 8;
            this.spot.style.display = 'block';
            this.spot.style.top = (r.top - pad) + 'px';
            this.spot.style.left = (r.left - pad) + 'px';
            this.spot.style.width = (r.width + pad * 2) + 'px';
            this.spot.style.height = (r.height + pad * 2) + 'px';
            // position card below target, fallback above
            const cardHeight = 180, margin = 12;
            let top = r.bottom + margin + window.scrollY;
            let left = Math.max(8, Math.min(window.innerWidth - this.card.offsetWidth - 8, r.left + window.scrollX));
            if (top + cardHeight > window.innerHeight + window.scrollY && r.top - cardHeight - margin > 0) {
                top = r.top - cardHeight - margin + window.scrollY;
            }
            this.card.style.top = top + 'px';
            this.card.style.left = left + 'px';
            this.card.style.transform = 'none';
        }
        _renderCard(s, target) {
            const L = this.o.labels;
            const isLast = this.i === this.steps.length - 1;
            this.card.innerHTML = `
                <div class="head"><h4>${esc(s.title || '')}</h4><button class="x awg-btn awg-btn-ghost awg-btn-sm awg-btn-icon" aria-label="Tutup">✕</button></div>
                <p>${esc(s.text || '')}</p>
                <div class="foot">
                    <div class="steps">${this.steps.map((_, j) => `<i class="${j === this.i ? 'active' : ''}"></i>`).join('')}</div>
                    <div class="nav">
                        ${this.i > 0 ? `<button class="awg-btn awg-btn-ghost" data-tour-prev>${L.prev}</button>` : ''}
                        ${!isLast ? `<button class="awg-btn awg-btn-ghost" data-tour-skip>${L.skip}</button>` : ''}
                        <button class="awg-btn awg-btn-primary" data-tour-next>${isLast ? L.finish : L.next}</button>
                    </div>
                </div>`;
            this.card.querySelector('[data-tour-next]').addEventListener('click', () => isLast ? this.end() : this._step(this.i + 1));
            const prev = this.card.querySelector('[data-tour-prev]');
            if (prev) prev.addEventListener('click', () => this._step(this.i - 1));
            const skip = this.card.querySelector('[data-tour-skip]');
            if (skip) skip.addEventListener('click', () => { this.o.onSkip && this.o.onSkip(this.i, this); this.end(); });
            this.card.querySelector('.x').addEventListener('click', () => this.end());
            // focus management
            const first = this.card.querySelector('button');
            if (first) first.focus();
            // scroll target into view
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        next() { if (this.i < this.steps.length - 1) this._step(this.i + 1); else this.end(); }
        prev() { this._step(Math.max(0, this.i - 1)); }
        end() {
            if (!this.bd) return;
            this.bd.classList.remove('open');
            this.spot?.remove();
            this.card?.remove();
            this.bd.remove();
            this.bd = this.spot = this.card = null;
            this.o.onEnd && this.o.onEnd(this);
        }
    }

    /* ============ AUTO-MOUNT UNIFIED ============ */
    function mount(root) {
        (root || d).querySelectorAll('[data-awg-wizard]').forEach(w => { if (!w._awgWizard) new AwgWizard(w); });
        (root || d).querySelectorAll('[data-awg-tree]').forEach(t => { if (!t._awgTree) new AwgTree(t); });
        (root || d).querySelectorAll('[data-awg-kanban]').forEach(k => { if (!k._awgKanban) new AwgKanban(k); });
        (root || d).querySelectorAll('[data-awg-timeline]').forEach(t => {
            if (!t._awgTimeline) new AwgTimeline(t, { horizontal: t.dataset.awgTimeline === 'horizontal' });
        });
        (root || d).querySelectorAll('[data-awg-upload]').forEach(u => { if (!u._awgUpload) new AwgUpload(u); });
        (root || d).querySelectorAll('[data-awg-editable-scope], table[data-awg-editable], .awg-table[data-awg-editable]').forEach(scope => {
            if (!scope._awgEditable) { new AwgEditable(scope); scope._awgEditable = true; }
        });
        // palette: collect from window.AwgPaletteItems OR [data-palette-item]
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
        d.addEventListener('DOMContentLoaded', () => mount());
    else
        setTimeout(() => mount(), 0);

    /* ============ 10. GAUGE / METER (SVG arc, ISP-grade) ============ */
    /* Usage: new AwgGauge(el, {value: -67, min:-90, max:-40, unit:'dBm', label:'RSSI', zones:[[bad,ok,warn]]}) */
    class AwgGauge {
        constructor(root, opts) {
            this.el = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.el) return null;
            this.o = Object.assign({
                value: 0, min: 0, max: 100, unit: '', label: '',
                size: 132, stroke: 11, decimals: 0,
                good: [60, 100], warn: [30, 60],   // rentang relatif (0-100 persen nilai)
                format: null
            }, opts);
            try { Object.assign(this.o, JSON.parse(this.el.dataset.awgGauge || '{}')); } catch (e) {}
            this.el.classList.add('awg-gauge');
            this._draw();
            this.el._awgGauge = this;
        }
        _pct() {
            const { value, min, max } = this.o;
            return Math.max(0, Math.min(1, (Number(value) - min) / (max - min || 1)));
        }
        _color() {
            const p = this._pct() * 100;
            const { good, warn } = this.o;
            if (p >= warn[0] && p < good[0]) return cssVar2('--awg-warn');
            return p >= good[0] ? cssVar2('--awg-ok') : cssVar2('--awg-bad');
        }
        _draw() {
            const o = this.o, S = o.size, cx = S / 2, cy = S / 2 + 6, r = S / 2 - o.stroke;
            const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;           // arc 270°
            const pol = (a, rr) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
            const arc = (a0_, a1_, rr) => {
                const [x1, y1] = pol(a0_, rr), [x2, y2] = pol(a1_, rr);
                const large = a1_ - a0_ > Math.PI ? 1 : 0;
                return `M${x1.toFixed(2)},${y1.toFixed(2)} A${rr},${rr} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
            };
            const pct = this._pct();
            const col = this._color();
            const val = o.format ? o.format(o.value) : Number(o.value).toFixed(o.decimals);
            this.el.innerHTML = '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', S); svg.setAttribute('height', S - 10);
            svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
            svg.innerHTML =
                `<path d="${arc(a0, a1, r)}" fill="none" stroke="var(--awg-line)" stroke-width="${o.stroke}" stroke-linecap="round"/>` +
                (pct > 0.005 ? `<path d="${arc(a0, a0 + (a1 - a0) * pct, r)}" fill="none" stroke="${col}" stroke-width="${o.stroke}" stroke-linecap="round"/>` : '') +
                `<text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="${S * 0.21}" font-weight="700" fill="var(--awg-ink)" font-family="var(--awg-font)">${val}</text>` +
                `<text x="${cx}" y="${cy + S * 0.2}" text-anchor="middle" font-size="${S * 0.095}" font-weight="600" fill="var(--awg-ink-2)" font-family="var(--awg-font)">${o.unit}</text>`;
            this.el.appendChild(svg);
            if (o.label) {
                const lb = d.createElement('span');
                lb.className = 'unit'; lb.textContent = o.label;
                this.el.appendChild(lb);
            }
        }
        set(value) { this.o.value = value; this._draw(); }
    }
    function cssVar2(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
    }
    function mountGauges(root) {
        (root || d).querySelectorAll('[data-awg-gauge]').forEach(el => {
            if (!el._awgGauge) new AwgGauge(el);
        });
    }

    window.AwgWizard = AwgWizard; window.AwgTree = AwgTree;
    window.AwgPalette = Palette;   window.AwgKanban = AwgKanban; window.AwgLightbox = Lightbox;
    window.AwgSkeleton = Skeleton; window.AwgTimeline = AwgTimeline; window.AwgTour = AwgTour;
    window.AwgUpload = AwgUpload;  window.AwgEditable = AwgEditable;
    window.AwgGauge = AwgGauge;    window.AwgWidgets = { mount, mountGauges };
    document.addEventListener('DOMContentLoaded', () => mountGauges());
})();
