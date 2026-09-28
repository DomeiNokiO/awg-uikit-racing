/* ============================================================
   AWG-UIKIT-RACING — Datepicker  (js/awg-datepicker.js)
   Author : AWGNET-RACING & AGENT AI TEAM
   Global : window.AwgDate
   Fitur  : kalender popup lokal, format Indonesia, min/max ISO,
            rentang (grup start↔end), keyboard (↑↓←→ PgUp/PgDn),
            "Hari ini" + Bersih, AwgDate.iso(input) utk nilai ISO.
   Pakai  : <input class="awg-input" data-awg-date readonly
                     data-awg-min="2026-09-01" data-awg-max="2026-12-31">
            range: dua input dengan data-awg-range="laporan"
   ============================================================ */
(function () {
    'use strict';
    const d = document;
    const MON = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const DAY = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const pad = n => String(n).padStart(2, '0');
    const iso = dt => dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
    const parse = s => { if (!s) return null; const [y, m, dd] = String(s).split('-').map(Number); return isNaN(y) ? null : new Date(y, m - 1, dd); };
    const fmt = dt => dt.getDate() + ' ' + MON[dt.getMonth()] + ' ' + dt.getFullYear();
    const sameDay = (a, b) => a && b && iso(a) === iso(b);
    const mondayFirst = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - ((dt.getDay() + 6) % 7));
    function disp2iso(v) {
        if (!v) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        const p = String(v).trim().split(/\s+/);
        if (p.length === 3) {
            const mi = MON.findIndex(x => x.slice(0, 3).toLowerCase() === p[1].slice(0, 3).toLowerCase());
            if (mi >= 0) { const dd = +p[0], y = +p[2]; if (dd && y) return y + '-' + pad(mi + 1) + '-' + pad(dd); }
        }
        return null;
    }

    const groups = {};                 // nama-grup -> [AwgDate start, AwgDate end]
    let opened = null;

    class AwgDate {
        static DAY_HEAD = DAY; static MON = MON;
        constructor(input, opts) {
            this.i = typeof input === 'string' ? d.querySelector(input) : input;
            if (!this.i) return null;
            this.o = Object.assign({ min: null, max: null }, opts);
            if (this.i.dataset.awgMin) this.o.min = this.i.dataset.awgMin;
            if (this.i.dataset.awgMax) this.o.max = this.i.dataset.awgMax;
            this.i.classList.add('awg-dp-input');
            this.i.readOnly = true;
            this.i.setAttribute('autocomplete', 'off');
            const g = this.i.dataset.awgRange;
            if (g) { (groups[g] = groups[g] || []).push(this); }
            this.i.addEventListener('click', () => this.open());
            this.i.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); this.open(); } });
            this.i._awgDate = this;
        }
        /* nilai */
        get iso() { return this.i.dataset.iso || null; }
        get date() { return parse(this.iso); }
        set(v, silent) {
            const dt = typeof v === 'string' ? parse(disp2iso(v)) || v : v;
            this.i.dataset.iso = dt ? iso(dt) : '';
            this.i.value = dt ? fmt(dt) : '';
            if (!silent) this.i.dispatchEvent(new CustomEvent('awg:date', { bubbles: true, detail: { iso: this.i.dataset.iso } }));
        }
        /* batas efektif utk mode range */
        limits() {
            let min = this.o.min, max = this.o.max;
            const g = this.i.dataset.awgRange;
            if (g && groups[g]?.length === 2) {
                const idx = groups[g].indexOf(this);
                const other = groups[g][1 - idx];
                if (other?.iso) (idx === 0 ? max = other.iso : min = other.iso);
            }
            return { min, max };
        }
        open() {
            if (opened && opened !== this) opened.close();
            opened = this;
            this.pop = d.createElement('div');
            this.pop.className = 'awg-dp';
            this.i.closest('.awg-field')?.classList.add('awg-dp-active');
            d.body.appendChild(this.pop);
            this.view = this.date || parse(this.limits().min) || new Date();
            this.fd = this.date || new Date();
            this.render(); this.place(); this.bind();
            this.pop.addEventListener('mousedown', e => e.preventDefault());
            this.pop.addEventListener('keydown', e => this._keys(e));
            this.pop.tabIndex = -1;
            requestAnimationFrame(() => this.pop.focus());
            const out = e => { if (!this.pop.contains(e.target) && e.target !== this.i) this.close(); };
            setTimeout(() => d.addEventListener('mousedown', out), 0);
            this._out = out;
        }
        close() {
            if (!this.pop) return;
            this.pop.remove(); this.pop = null;
            this.i.closest('.awg-field')?.classList.remove('awg-dp-active');
            d.removeEventListener('mousedown', this._out);
            opened = null;
        }
        place() {
            const r = this.i.getBoundingClientRect();
            const pw = this.pop.offsetWidth, ph = this.pop.offsetHeight;
            let x = r.left + scrollX, y = r.bottom + scrollY + 4;
            if (x + pw > scrollX + innerWidth - 8) x = scrollX + innerWidth - pw - 8;
            if (y + ph > scrollY + innerHeight - 8) y = r.top + scrollY - ph - 4;
            this.pop.style.left = Math.max(8, x) + 'px';
            this.pop.style.top = Math.max(8, y) + 'px';
        }
        render() {
            const v = new Date(this.view.getFullYear(), this.view.getMonth(), 1);
            const { min, max } = this.limits();
            const minD = parse(min), maxD = parse(max);
            const today = new Date();
            const first = mondayFirst(v);
            let h = `<div class="awg-dp-head">
                <button type="button" class="awg-dp-nav" data-nav="-1" aria-label="Bulan sebelumnya"><svg class="awg-ic sm" style="transform:rotate(180deg)"><use href="assets/icons.svg#ic-chevron-right"></use></svg></button>
                <b>${MON[v.getMonth()]} ${v.getFullYear()}</b>
                <button type="button" class="awg-dp-nav" data-nav="1" aria-label="Bulan berikutnya"><svg class="awg-ic sm"><use href="assets/icons.svg#ic-chevron-right"></use></svg></button>
              </div><div class="awg-dp-days">` + DAY.map(x => `<span>${x}</span>`).join('') + `</div><div class="awg-dp-grid" role="grid">`;
            for (let i = 0; i < 42; i++) {
                const dt = new Date(first); dt.setDate(first.getDate() + i);
                const inMonth = dt.getMonth() === v.getMonth();
                const isToday = sameDay(dt, today);
                const dis = (minD && dt < minD) || (maxD && dt > maxD);
                const sel = sameDay(dt, this.date);
                const foc = sameDay(dt, this.fd) && inMonth;
                h += `<button type="button" role="gridcell" data-iso="${iso(dt)}" class="awg-dp-cell${inMonth ? '' : ' other'}${isToday ? ' today' : ''}${sel ? ' sel' : ''}${foc ? ' foc' : ''}${dis ? ' dis' : ''}"${dis ? ' disabled' : ''}>${dt.getDate()}</button>`;
            }
            h += `</div><div class="awg-dp-foot">
                <button type="button" data-q="today">Hari ini</button>
                <button type="button" data-q="clear">Bersihkan</button></div>`;
            this.pop.innerHTML = h;
        }
        _pick(dtStr) {
            this.set(dtStr);
            const g = this.i.dataset.awgRange;
            if (g && groups[g]?.length === 2) {
                const idx = groups[g].indexOf(this);
                const other = groups[g][1 - idx];
                if (other?.iso) {
                    const bad = idx === 0 ? this.iso > other.iso : this.iso < other.iso;
                    if (bad) other.set(null);
                }
                // auto buka pasangan
                const next = groups[g][1 - idx];
                setTimeout(() => { this.close(); next && !next.iso && next.open(); }, 60);
                return;
            }
            this.close();
        }
        _keys(e) {
            const K = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
            if (K[e.key]) {
                e.preventDefault();
                this.fd = new Date(this.fd.getFullYear(), this.fd.getMonth(), this.fd.getDate() + K[e.key]);
                if (this.fd.getMonth() !== this.view.getMonth()) this.view = new Date(this.fd);
                this.render(); return;
            }
            if (e.key === 'PageUp' || e.key === 'PageDown') {
                e.preventDefault();
                const m = e.key === 'PageUp' ? -1 : 1;
                this.view = new Date(this.view.getFullYear(), this.view.getMonth() + m, 1);
                this.fd = new Date(this.view.getFullYear(), this.view.getMonth(), Math.min(this.fd.getDate(), 28));
                this.render(); return;
            }
            if (e.key === 'Enter') { e.preventDefault(); this._pick(iso(this.fd)); return; }
            if (e.key === 'Escape') { e.preventDefault(); this.close(); this.i.focus(); }
        }
        bind() {
            this.pop.addEventListener('click', e => {
                const nav = e.target.closest('[data-nav]');
                if (nav) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + (+nav.dataset.nav), 1); this.render(); return; }
                const cell = e.target.closest('.awg-dp-cell');
                if (cell && !cell.disabled) { this._pick(cell.dataset.iso); return; }
                const q = e.target.closest('[data-q]');
                if (q) {
                    if (q.dataset.q === 'today') this._pick(iso(new Date()));
                    else { this.set(null); this.close(); }
                }
            });
        }
    }
    /* open() panggil bind dulu */
    const _open = AwgDate.prototype.open;
    AwgDate.prototype.open = function () { _open.call(this); this.pop && this.bind(); };

    function isoOf(input) { return input.dataset.iso || disp2iso(input.value) || null; }

    function mount(root) {
        (root || d).querySelectorAll('input[data-awg-date]').forEach(i => { if (!i._awgDate) new AwgDate(i); });
    }
    if (d.readyState === 'loading')
        d.addEventListener('DOMContentLoaded', mount);
    else
        setTimeout(mount, 0);
    mount();   // fail-safe: jalankan langsung saat script berakhir (idempoten)

    window.AwgDate = AwgDate;
    window.AwgDate.mount = mount;
    window.AwgDate.iso = isoOf;
})();
