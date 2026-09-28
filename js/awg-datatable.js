/* ============================================================
   AWG-UIKIT-RACING — DataTable  (js/awg-datatable.js)
   Author : AWGNET-RACING & AGENT AI TEAM
   Global : window.AwgTable   (set AwgTable.icon for sprite path)
   Features: global search · per-column sort (auto numeric) ·
            pagination · row/mass select + bulk bar · empty-state ·
            reload() for AJAX. Zero dependencies.
   Usage  : <table class="awg-table" data-awg-table='{"page":10,"select":true}'>
   ============================================================ */
(function () {
    'use strict';
    const d = document;
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    function toNum(t) {
        const n = parseFloat(String(t).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
        return isNaN(n) ? null : n;
    }

    class AwgTable {
        static icon = 'assets/icons.svg';
        constructor(target, opts) {
            const t = typeof target === 'string' ? d.querySelector(target) : target;
            if (!t) return null;
            this.t = t;
            this.o = Object.assign({
                page: 10, per: [10, 25, 50, 100], search: true, sort: true,
                select: false, info: true, placeholder: 'Cari di tabel…', onBulk: null
            }, opts);
            this.st = { q: '', sortCol: -1, dir: 1, page: 1, size: this.o.page, sel: new Set() };
            this._build(); this.read(); this.draw();
        }

        /* ---------- toolbar / bulk / pager / bind ---------- */
        _build() {
            const t = this.t, o = this.o;
            const wrap = t.closest('.awg-table-wrap') || t;
            const bar = d.createElement('div');
            bar.className = 'awg-dt-bar';
            if (o.search) bar.insertAdjacentHTML('beforeend',
                `<label class="awg-dt-search"><svg class="awg-ic sm"><use href="${AwgTable.icon}#ic-search"></use></svg>
                 <input class="awg-input awg-input-sm" type="search" placeholder="${esc(o.placeholder)}" aria-label="Cari"></label>`);
            if (o.info) bar.insertAdjacentHTML('beforeend', '<span class="awg-dt-info awg-small awg-muted"></span>');
            if (o.search && o.per.length) bar.insertAdjacentHTML('beforeend',
                `<label class="awg-dt-per awg-small awg-muted">Baris:
                 <select class="awg-select awg-select-sm awg-dt-size">${o.per.map(n => `<option ${n === o.page ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`);
            wrap.before(bar); this.bar = bar;

            if (o.select) {
                const th = d.createElement('th');
                th.className = 'awg-dt-check awg-dt-nosort';
                th.innerHTML = '<input type="checkbox" class="awg-check-input" aria-label="Pilih semua">';
                t.querySelector('thead tr')?.prepend(th);
                this.selTh = th;
                th.firstElementChild.addEventListener('change', e => {
                    (this.view()).forEach(r => e.target.checked ? this.st.sel.add(r.id) : this.st.sel.delete(r.id));
                    this.draw();
                });
                const bulk = d.createElement('div');
                bulk.className = 'awg-dt-bulk'; bulk.hidden = true;
                bulk.innerHTML = `<span><b class="awg-dt-bulk-n">0</b> rows selected</span>
                    <div class="awg-flex" style="margin-left:auto;gap:.4rem">
                        <button type="button" class="awg-btn awg-btn-soft awg-btn-sm" data-bulk>Hapus</button>
                        <button type="button" class="awg-btn awg-btn-ghost awg-btn-sm" data-clear>Bersihkan</button>
                    </div>`;
                bar.after(bulk); this.bulk = bulk;
                bulk.querySelector('[data-clear]').addEventListener('click', () => { this.st.sel.clear(); this.draw(); });
                bulk.querySelector('[data-bulk]').addEventListener('click', () => {
                    const ids = [...this.st.sel];
                    if (o.onBulk) o.onBulk(ids, this);
                    t.dispatchEvent(new CustomEvent('awg:bulk', { bubbles: true, detail: { ids, table: this } }));
                });
            }
            if (o.sort) t.querySelectorAll('thead th').forEach((th, ci) => {
                if (th.classList.contains('awg-dt-nosort') || th.hasAttribute('data-awg-nosort')) return;
                th.classList.add('awg-dt-sortable');
                const col = o.select ? ci - 1 : ci;
                th.addEventListener('click', () => {
                    if (this.st.sortCol === col) this.st.dir *= -1; else { this.st.sortCol = col; this.st.dir = 1; }
                    t.querySelectorAll('thead th').forEach(h => h.classList.remove('awg-dt-asc', 'awg-dt-desc'));
                    th.classList.add(this.st.dir === 1 ? 'awg-dt-asc' : 'awg-dt-desc');
                    this.draw();
                    t.dispatchEvent(new CustomEvent('awg:sort', { bubbles: true, detail: { col, dir: this.st.dir } }));
                });
            });
            const pg = d.createElement('div'); pg.className = 'awg-pager awg-dt-pager'; wrap.after(pg); this.pgEl = pg;
            bar.querySelector('input[type=search]')?.addEventListener('input', e => { this.st.q = e.target.value.toLowerCase(); this.st.page = 1; this.draw(); });
            bar.querySelector('.awg-dt-size')?.addEventListener('change', e => { this.st.size = +e.target.value; this.st.page = 1; this.draw(); });
        }

        /* ---------- model ---------- */
        read() {
            this.all = [...this.t.querySelectorAll('tbody tr')].map((tr, i) => ({
                id: tr.dataset.awgId || String(i + 1),
                cells: [...tr.children].map(td => td.textContent.trim()),
                html: tr.innerHTML
            }));
            this.all.forEach(r => r._num = r.cells.map(toNum));
        }
        view() {
            let r = this.all;
            if (this.st.q) r = r.filter(x => x.cells.join(' ').toLowerCase().includes(this.st.q));
            const c = this.st.sortCol;
            if (c > -1) r = [...r].sort((a, b) => {
                const na = a._num[c], nb = b._num[c];
                if (na !== null && nb !== null) return (na - nb) * this.st.dir;
                return a.cells[c].localeCompare(b.cells[c], 'id', { numeric: true }) * this.st.dir;
            });
            return r;
        }
        draw() {
            const rows = this.view(), size = this.st.size;
            const pages = Math.max(1, Math.ceil(rows.length / size));
            this.st.page = Math.min(Math.max(1, this.st.page), pages);
            const page = rows.slice((this.st.page - 1) * size, (this.st.page - 1) * size + size);
            const tb = this.t.querySelector('tbody');
            if (!rows.length) {
                tb.innerHTML = `<tr class="awg-dt-empty-row"><td colspan="99"><div class="awg-empty">
                    <span class="ico"><svg class="awg-ic lg"><use href="${AwgTable.icon}#ic-folder"></use></svg></span>
                    <b>Tidak ada hasil</b><span class="awg-tiny awg-muted">Coba kata kunci lain</span></div></td></tr>`;
            } else {
                tb.innerHTML = '';
                page.forEach(x => {
                    const tr = d.createElement('tr');
                    tr.dataset.awgId = x.id;
                    if (this.o.select) {
                        const td = d.createElement('td');
                        td.className = 'awg-dt-check';
                        td.innerHTML = `<input type="checkbox" class="awg-check-input" ${this.st.sel.has(x.id) ? 'checked' : ''} aria-label="Pilih baris">`;
                        td.firstElementChild.addEventListener('change', e => {
                            e.target.checked ? this.st.sel.add(x.id) : this.st.sel.delete(x.id);
                            this._selHead(rows); this.syncBulk();
                        });
                        tr.appendChild(td);
                    }
                    tr.insertAdjacentHTML('beforeend', x.html);
                    tb.appendChild(tr);
                });
            }
            this._selHead(rows); this.syncBulk();
            const info = this.bar.querySelector('.awg-dt-info');
            if (info) info.textContent = rows.length
                ? `Menampilkan ${(this.st.page - 1) * size + 1}–${Math.min(this.st.page * size, rows.length)} dari ${rows.length} baris`
                : '0 baris';
            this._pager(pages);
            this.t.dispatchEvent(new CustomEvent('awg:draw', { bubbles: true, detail: { shown: rows.length, total: this.all.length, page: this.st.page, pages } }));
        }
        _selHead(rows) {
            if (!this.selTh) return;
            const vis = rows.filter(r => this.st.sel.has(r.id)).length;
            const cb = this.selTh.firstElementChild;
            cb.checked = rows.length > 0 && vis === rows.length;
            cb.indeterminate = vis > 0 && vis < rows.length;
        }
        syncBulk() {
            if (!this.bulk) return;
            const n = this.st.sel.size;
            this.bulk.hidden = n === 0;
            this.bulk.querySelector('.awg-dt-bulk-n').textContent = n;
        }
        _pager(pages) {
            const P = this.pgEl, cur = this.st.page;
            P.innerHTML = '';
            const add = (html, fn, dis, act) => {
                const b = d.createElement('button');
                b.innerHTML = html;
                if (dis) b.disabled = true;
                if (act) b.classList.add('active');
                if (fn && !dis) b.addEventListener('click', () => { this.st.page = fn; this.draw(); });
                P.appendChild(b);
            };
            add('«', Math.max(1, cur - 1), cur === 1);
            const win = [];
            for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 1) win.push(i);
            let prev = 0;
            for (const i of win) {
                if (i > prev + 1) { const s = d.createElement('span'); s.className = 'gap'; s.textContent = '…'; P.appendChild(s); }
                add(String(i), i, false, i === cur);
                prev = i;
            }
            add('»', Math.min(pages, cur + 1), cur === pages);
        }

        /* ---------- public API ---------- */
        reload(rowsHtml) {                       // after AJAX: new tbody content (without check column)
            this.t.querySelector('tbody').innerHTML = rowsHtml;
            this.st.sel.clear(); this.st.page = 1; this.read(); this.draw();
        }
        getSelected() { return [...this.st.sel]; }
        setSearch(q) { this.st.q = String(q).toLowerCase(); this.st.page = 1; this.draw(); }
        destroy() {
            this.bar?.remove(); this.bulk?.remove(); this.pgEl?.remove();
            this.selTh?.remove(); this.draw === null;
        }
    }

    function mount(root) {
        (root || document).querySelectorAll('table[data-awg-table]').forEach(t => {
            if (t._awgTable) return;
            let o = {};
            try { o = JSON.parse(t.dataset.awgTable || '{}'); } catch (e) { }
            t._awgTable = new AwgTable(t, o);
        });
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', () => mount());
    else
        setTimeout(mount, 0);
    mount();   // fail-safe: jalankan langsung saat script berakhir (idempoten)

    window.AwgTable = AwgTable;
    window.AwgTable.mount = mount;
})();
