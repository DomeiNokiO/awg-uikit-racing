/* ============================================================
   AWG-UIKIT-RACING — Select2-style (vanilla JS)
   Author : AWGNET-RACING & AGENT AI TEAM
   Global : window.AwgSelect  +  auto-mount [data-awg-select]
   Fitur  : single & multiple, pencarian, option groups,
            remote/async source, tagging (create), clearable,
            max selection, keyboard nav penuh (↑↓ Enter Esc),
            sinkron ke <select> asli (form submit tetap standard),
            render custom via formatter.
   API    : AwgSelect.create(elOrSelect, opts) → instance
            instance.setValue(v) / getValue() / refresh() / destroy()
   ============================================================ */
(function () {
    'use strict';

    let zCount = 2050;

    class AwgSelect {
        /* opts: {
            multiple, placeholder, allowClear, tags, max, minChars,
            search: true|false, source: null | fn(query, cb(list)),
            formatter: null | fn(item) → html string (sudah di-escape pemanggil),
            onChange: fn(values), noResultText
        } */
        constructor(select, opts = {}) {
            if (select._awgSel) return select._awgSel;   // idempoten
            this.el = select;
            this.o = Object.assign({
                multiple: select.multiple, placeholder: select.dataset.awgPlaceholder || 'Pilih…',
                allowClear: true, tags: false, max: 0, minChars: 1, search: true,
                source: null, formatter: null, onChange: null, noResultText: 'Tidak ada hasil'
            }, opts);

            // items dari <option> asli (jika tidak remote)
            this.data = this.o.source ? [] : this._readDom();
            this.selected = new Set((select.value ? select.value.split(',') : []));
            this._build();
            this._bind();
            select._awgSel = this;
            select.classList.add('awg-hide');
            this.renderSelection();
        }

        /* ---------- baca <option> asli ---------- */
        _readDom() {
            const items = [];
            this.el.querySelectorAll('option, optgroup').forEach(node => {
                if (node.tagName === 'OPTGROUP') {
                    node.querySelectorAll('option').forEach(op => items.push(this._opt(op, node.label)));
                } else if (node.tagName === 'OPTION') items.push(this._opt(node, null));
            });
            return items;
        }
        _opt(op, group) {
            return {
                value: op.value, text: op.textContent.trim(), group,
                disabled: op.disabled, extra: op.dataset.awgNote || ''
            };
        }

        /* ---------- markup ---------- */
        _build() {
            const wrap = document.createElement('div');
            wrap.className = 'awg-sel' + (this.el.disabled ? ' disabled' : '');
            wrap.innerHTML = `
                <div class="awg-sel-trigger" tabindex="0" role="combobox" aria-haspopup="listbox" aria-expanded="false">
                    <span class="awg-sel-content"></span>
                    <input type="text" class="awg-sel-inline-search awg-hide" autocomplete="off">
                </div>
                <button type="button" class="awg-sel-clear" tabindex="-1" title="Bersihkan">✕</button>
                <div class="awg-sel-panel" role="listbox">
                    <div class="awg-sel-search"><input type="text" placeholder="Cari…" autocomplete="off"></div>
                    <div class="awg-sel-results"></div>
                    <div class="awg-sel-footer awg-hide"><span class="awg-sel-count"></span><button type="button" data-act="clearAll">Bersihkan semua</button></div>
                </div>`;
            this.el.parentNode.insertBefore(wrap, this.el.nextSibling);
            this.wrap = wrap;
            this.trigger = wrap.querySelector('.awg-sel-trigger');
            this.content = wrap.querySelector('.awg-sel-content');
            this.inlineSearch = wrap.querySelector('.awg-sel-inline-search');
            this.clearBtn = wrap.querySelector('.awg-sel-clear');
            this.panel = wrap.querySelector('.awg-sel-panel');
            this.searchWrap = wrap.querySelector('.awg-sel-search');
            this.searchInput = this.searchWrap.querySelector('input');
            this.results = wrap.querySelector('.awg-sel-results');
            this.footer = wrap.querySelector('.awg-sel-footer');
            if (!this.o.search) this.searchWrap.style.display = 'none';
            if (this.o.multiple) {
                // multi-select Select2: pencarian lewat inline chip, bukan kolom panel
                this.searchWrap.style.display = 'none';
                this.inlineSearch.classList.remove('awg-hide');
            }
            // posisi panel: balik ke atas bila ruang bawah sempit
            this._flip = () => {
                const r = this.trigger.getBoundingClientRect();
                const fits = innerHeight - r.bottom > 300;
                this.panel.classList.toggle('up', !fits);
            };
        }

        /* ---------- events ---------- */
        _bind() {
            this.trigger.addEventListener('click', e => {
                if (this.wrap.classList.contains('disabled')) return;
                this.isOpen() ? this.close() : this.open();
                if (this.o.multiple) { e.stopPropagation(); this.searchInput.focus(); }
            });
            this.clearBtn.addEventListener('click', e => { e.stopPropagation(); this.clear(); });
            this.searchInput.addEventListener('input', () => this._query());
            this.inlineSearch.addEventListener('input', () => { this._query(); });
            this.inlineSearch.addEventListener('blur', () => { if (this.inlineSearch.value === '' ) this.searchInput.value=''; });

            document.addEventListener('click', e => {
                if (this.isOpen() && !this.wrap.contains(e.target)) this.close();
            });

            this.panel.addEventListener('mousedown', e => {
                const opt = e.target.closest('.awg-sel-opt');
                if (!opt || opt.classList.contains('disabled')) return;
                e.preventDefault();
                this._pick(opt.dataset.v === '__create__' ? opt.dataset.raw : opt.dataset.v);
            });

            this.footer.querySelector('[data-act=clearAll]').addEventListener('click', () => this.clear());

            // keyboard
            this.wrap.addEventListener('keydown', e => this._keys(e));
            this.el.form && this.el.form.addEventListener('reset', () => setTimeout(() => this._resetFromDom(), 0));
            // validasi ikut state asli
            new MutationObserver(() => {
                this.wrap.classList.toggle('is-invalid', this.el.classList.contains('is-invalid'));
            }).observe(this.el, { attributes: true, attributeFilter: ['class'] });
        }

        isOpen() { return this.wrap.classList.contains('open'); }

        _q() { return this.o.multiple ? this.inlineSearch.value : this.searchInput.value; }

        open() {
            this.closeAllOthers();
            this.wrap.classList.add('open');
            this.trigger.setAttribute('aria-expanded', 'true');
            this._flip();
            this._render(this._q());
            const focusEl = this.o.multiple ? this.inlineSearch : this.searchInput;
            setTimeout(() => focusEl.focus({ preventScroll: true }), 10);
        }
        close() {
            this.wrap.classList.remove('open');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.searchInput.value = ''; this.inlineSearch.value = '';
            this._hover = null;
        }
        closeAllOthers() {
            document.querySelectorAll('.awg-sel.open').forEach(w => { if (w !== this.wrap) w.classList.remove('open'); });
            document.querySelectorAll('.awg-sel-panel').forEach(p => { if (p !== this.panel && p.style.zIndex === String(zCount)) p.style.zIndex = ''; });
            this.panel.style.zIndex = ++zCount;
        }

        /* ---------- render opsi ---------- */
        _filtered(q) {
            q = (q || '').toLowerCase();
            return this.data.filter(i => !q || i.text.toLowerCase().includes(q));
        }
        _render(q) {
            q = q || '';
            const items = this._filtered(q);
            let html = '', lastGroup = null;
            const markFn = text => {
                if (!q) return Awg_esc(text);
                const idx = text.toLowerCase().indexOf(q.toLowerCase());
                if (idx < 0) return Awg_esc(text);
                return Awg_esc(text.slice(0, idx)) + '<mark>' + Awg_esc(text.slice(idx, idx + q.length)) + '</mark>' + Awg_esc(text.slice(idx + q.length));
            };
            items.forEach(i => {
                if (i.group && i.group !== lastGroup) {
                    html += `<div class="awg-sel-group-label">${Awg_esc(i.group)}</div>`; lastGroup = i.group;
                }
                const sel = this.selected.has(i.value) ? ' selected' : '';
                const dis = i.disabled ? ' disabled' : '';
                const label = this.o.formatter ? this.o.formatter(i) : markFn(i.text);
                html += `<div class="awg-sel-opt${sel}${dis}" data-v="${Awg_attr(i.value)}">${label}
                    ${i.extra ? `<span class="opt-note">${Awg_esc(i.extra)}</span>` : ''}</div>`;
            });
            // tagging: opsi "buat baru"
            if (this.o.tags && q.trim() && !this.data.some(d => d.text.toLowerCase() === q.trim().toLowerCase())) {
                html += `<div class="awg-sel-opt" data-v="__create__" data-raw="${Awg_attr(q.trim())}">
                    ➕ Tambahkan “<b>${Awg_esc(q.trim())}</b>”</div>`;
            }
            if (!items.length && !this.o.tags) html = `<div class="awg-sel-empty">${Awg_esc(this.o.noResultText)}</div>`;
            this.results.innerHTML = html;
            this._hover = null;
            if (this.o.multiple && this.data.length) {
                this.footer.classList.remove('awg-hide');
                this.footer.querySelector('.awg-sel-count').textContent =
                    `${this.selected.size} dipilih${this.o.max ? ' / maks ' + this.o.max : ''}`;
            } else this.footer.classList.add('awg-hide');
        }
        _query() {
            const q = (this.searchInput.value || this.inlineSearch.value || '');
            if (this.o.source) {   // remote / async
                if (q.length < this.o.minChars && q.length > 0) return;
                clearTimeout(this._t);
                this.results.innerHTML = '<div class="awg-sel-loading"><span class="awg-spinner sm"></span> Memuat…</div>';
                this._t = setTimeout(() => {
                    this.o.source(q, list => {
                        this.data = list.map(i => typeof i === 'string' ? { value: i, text: i } : i);
                        this._render(q);
                    });
                }, 220);
            } else this._render(q);
        }

        /* ---------- pilih / hapus ---------- */
        _pick(val) {
            if (val == null) return;
            if (this.o.multiple) {
                if (this.selected.has(val)) this.selected.delete(val);
                else {
                    if (this.o.max && this.selected.size >= this.o.max) { shake(this.wrap); return; }
                    this.selected.add(val);
                }
                this.searchInput.value = ''; this.inlineSearch.value = '';
                this._render('');
                // biarkan tetap terbuka untuk multi
                this.inlineSearch.focus({ preventScroll: true });
            } else {
                this.selected = new Set([val]);
                this.close();
            }
            this.renderSelection();
            this._syncDom();
            this.o.onChange && this.o.onChange(this.getValue());
        }
        _unpick(val) {
            this.selected.delete(val);
            this.renderSelection(); this._syncDom();
            this.o.onChange && this.o.onChange(this.getValue());
            if (this.isOpen()) this._render(this.searchInput.value);
        }

        /* ---------- tampil nilai ---------- */
        renderSelection() {
            const items = this.data.filter(i => this.selected.has(i.value));
            // untuk remote: item terpilih yang belum ada di data → pakai cache
            this.selected.forEach(v => {
                if (!items.some(i => i.value === v) && this._cacheText(v)) items.push({ value: v, text: this._cacheText(v) });
            });
            this.wrap.classList.toggle('has-value', items.length > 0);
            if (!this.o.multiple) {
                this.content.innerHTML = items.length
                    ? `<span class="awg-sel-value">${Awg_esc(items[0].text)}</span>`
                    : `<span class="awg-sel-placeholder">${Awg_esc(this.o.placeholder)}</span>`;
                this.inlineSearch.classList.add('awg-hide');
                this.searchInput.classList.remove('awg-hide');
                this._cacheSet(items[0] && items[0].value, items[0] && items[0].text);
            } else {
                this.content.innerHTML = items.map(i =>
                    `<span class="awg-sel-chip">${Awg_esc(i.text)}<span class="x" data-x="${Awg_attr(i.value)}">×</span></span>`).join('');
                this.content.querySelectorAll('.x').forEach(x =>
                    x.addEventListener('click', e => { e.stopPropagation(); this._unpick(x.dataset.x); }));
                if (this.isOpen()) { this.inlineSearch.focus(); }
            }
        }
        _cacheText(v) { return (this._texts || (this._texts = {}))[v]; }
        _cacheSet(v, t) { if (v && t) (this._texts || (this._texts = {}))[v] = t; }

        /* ---------- sinkron ke <select> asli ---------- */
        _syncDom() {
            const vals = Array.from(this.selected);
            // pastikan opsi nilai tags/remote ada di DOM
            vals.forEach(v => {
                if (!this.el.querySelector(`option[value="${CSS.escape(v)}"]`)) {
                    const op = document.createElement('option');
                    op.value = v; op.textContent = this._cacheText(v) || v;
                    this.el.appendChild(op);
                }
            });
            Array.from(this.el.options).forEach(op => { op.selected = this.selected.has(op.value); });
            this.el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        _resetFromDom() {
            this.selected = new Set(Array.from(this.el.selectedOptions).map(o => o.value));
            this.renderSelection();
        }

        /* ---------- keyboard ---------- */
        _keys(e) {
            if (!this.isOpen() && (e.key === 'Enter' || e.key === ' ') && e.target === this.trigger) {
                e.preventDefault(); this.open(); return;
            }
            if (!this.isOpen() && e.key === 'ArrowDown') { this.open(); return; }
            const opts = () => Array.from(this.results.querySelectorAll('.awg-sel-opt:not(.disabled)'));
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                if (!this.isOpen()) { this.open(); return; }
                e.preventDefault();
                const list = opts(); if (!list.length) return;
                let i = list.indexOf(this._hover);
                i = e.key === 'ArrowDown' ? Math.min(list.length - 1, i + 1) : Math.max(0, i - 1);
                list.forEach(x => x.classList.remove('hover'));
                this._hover = list[i]; this._hover.classList.add('hover');
                this._hover.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                if (!this.isOpen()) return;
                e.preventDefault();
                const t = this._hover || opts()[0];
                if (t) t.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            } else if (e.key === 'Escape') {
                this.close(); this.trigger.focus();
            } else if (e.key === 'Backspace' && this.o.multiple && !this._q()) {
                const last = Array.from(this.selected).pop();
                if (last) this._unpick(last);
            }
        }

        /* ---------- API publik ---------- */
        getValue() {
            const arr = Array.from(this.selected);
            return this.o.multiple ? arr : (arr[0] || '');
        }
        setValue(v) {
            let arr = (Array.isArray(v) ? v : (v == null ? [] : String(v).split(','))).filter(x => x !== '');
            if (this.o.multiple && this.o.max && arr.length > this.o.max) {
                arr = arr.slice(0, this.o.max); shake(this.wrap);
            }
            this.selected = new Set(arr);
            this.renderSelection(); this._syncDom();
        }
        setOptions(list) {   // untuk remote/manual: ganti katalog data
            this.data = list.map(i => typeof i === 'string' ? { value: i, text: i } : i);
            this.data.forEach(i => this._cacheSet(i.value, i.text));
            if (this.isOpen()) this._render(this.searchInput.value);
            this.renderSelection();
        }
        refresh() { this.renderSelection(); }
        clear() { this.selected.clear(); this.renderSelection(); this._syncDom(); this.o.onChange && this.o.onChange(this.getValue()); if (this.isOpen()) this._render(''); }
        destroy() { this.wrap.remove(); this.el.classList.remove('awg-hide'); this.el._awgSel = null; }
    }

    /* ---------- helpers escape ---------- */
    function Awg_esc(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function Awg_attr(s) { return Awg_esc(s); }
    function shake(el) {
        el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    }

    /* ---------- auto-mount ---------- */
    function mount() {
        document.querySelectorAll('select[data-awg-select]').forEach(sel => {
            if (sel._awgSel) return;
            const cfg = {};
            try { Object.assign(cfg, JSON.parse(sel.dataset.awgSelect || '{}')); } catch (e) {}
            new AwgSelect(sel, cfg);
        });
        // form reset via reset() tanpa event: intercept
        document.querySelectorAll('form').forEach(f => {
            const orig = f.reset.bind(f);
            f.reset = () => { orig(); f.querySelectorAll('select[data-awg-select]').forEach(s => s._awgSel && s._awgSel._resetFromDom()); };
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();

    window.AwgSelect = AwgSelect;
    window.AwgSelect.mount = mount;   // panggil lagi utk konten dinamis (modal AJAX)
})();
