/* ============================================================
   AWG-UIKIT-RACING — Charts (SVG murni, zero dependensi)
   Author : AWGNET-RACING & AGENT AI TEAM
   Global : window.AwgChart
   Tipe   : line/area (multi-seri + crosshair tooltip), bar
            (grouped, hover value), donut (center total), gauge
            (semi-circular + zona aman/waspada/merah), sparkline
   Prinsip NMS: real-time friendly — chart.update(data) murah,
   reademe theme-aware (ikut --awg-*) dan re-render saat dark/light.
   ============================================================ */
(function () {
    'use strict';

    const NS = 'http://www.w3.org/2000/svg';
    const COLORS = ['var(--awg-brand)', 'var(--awg-ok)', 'var(--awg-warn)', 'var(--awg-bad)', 'var(--awg-info)', '#8b5cf6'];

    /* ---------- css-var resolver (agar warna dark/light live) ---------- */
    function cssVar(v) {
        if (v && v.startsWith('var(')) {
            const name = v.slice(4, -1).trim();
            return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
        }
        return v;
    }
    function el(tag, attrs, parent) {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    function niceMax(v) {
        if (v <= 0) return 1;
        const p = Math.pow(10, Math.floor(Math.log10(v)));
        const n = v / p;
        return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
    }

    class Chart {
        constructor(target, opts) {
            this.el = typeof target === 'string' ? document.querySelector(target) : target;
            if (!this.el) return null;
            this.o = Object.assign({
                type: 'line', height: 240, labels: [], series: [],
                names: null, colors: null, fill: true, area: true, smooth: true,
                yFmt: null, unit: '', legend: true, tooltip: true,
                max: null, donut: false, total: null, gaugeMax: 100, gaugeZones: [70, 90],
                value: 0, barHorizontal: false
            }, opts);
            this.o.type = this.o.type.toLowerCase();
            this.el.classList.add('awg-chart');
            this.el.style.setProperty('--awg-chart-h', this.o.height + 'px');
            this._uid = 'awgc' + Math.random().toString(36).slice(2, 8);
            this.render(this.o);
            // re-render saat tema berubah
            document.addEventListener('awg:theme', () => this._last && this.update(this._last.data, this._last.opts));
            if ('ResizeObserver' in window) {
                this._ro = new ResizeObserver(() => {
                    clearTimeout(this._rt);
                    this._rt = setTimeout(() => this._last && this.update(this._last.data, this._last.opts), 120);
                });
                this._ro.observe(this.el);
            }
        }

        /* ================== RENDER ================== */
        update(data, extra) {
            const o = Object.assign({}, this.o, extra || {});
            if (data) {
                if (Array.isArray(data[0])) o.series = data;            // [[...],[...]]
                else if (typeof data[0] === 'number') o.series = [data]; // [..]
                else if (data.labels) { o.labels = data.labels; o.series = data.series || o.series; }
                else if (this.o.type === 'gauge') o.value = data;
                else if (this.o.type === 'donut') o.series = [data];
                else o.series = data;
            }
            this._last = { data: data || (this._last && this._last.data), opts: o };
            this.el.innerHTML = '';
            const W = Math.max(160, this.el.clientWidth || this.el.parentElement?.clientWidth || 320);
            const H = o.height;
            const svg = el('svg', { width: '100%', height: H, viewBox: `0 0 ${W} ${H}`, class: 'awg-chart-svg' }, this.el);
            this._svg = svg; this._W = W; this._H = H;

            const defs = el('defs', {}, svg);
            this.defs = defs;

            if (o.type === 'donut') this._donut(svg, o);
            else if (o.type === 'gauge') this._gauge(svg, o);
            else if (o.type === 'bar') this._bars(svg, o);
            else this._line(svg, o);

            if (o.legend && o.series.length > 1 && !o.donut) this._legend(o);
        }
        render(o) { this.update(null, o); }

        pad(o) { return { l: o.type === 'bar' && o.barHorizontal ? 90 : 44, r: 10, t: 14, b: 26 }; }

        /* ---------- LINE / AREA ---------- */
        _line(svg, o) {
            const p = this.pad(o), W = this._W, H = this._H;
            const iw = W - p.l - p.r, ih = H - p.t - p.b;
            const series = o.series.map(s => s.map(Number));
            const n = Math.max(...series.map(s => s.length), o.labels.length, 1);
            const maxV = o.max || niceMax(Math.max(0.0001, ...series.flat()));
            const X = i => p.l + (n === 1 ? iw / 2 : iw * i / (n - 1));
            const Y = v => p.t + ih - (Math.min(v, maxV) / maxV) * ih;

            // grid + label Y
            for (let g = 0; g <= 4; g++) {
                const v = maxV * g / 4, y = Y(v);
                el('line', { x1: p.l, x2: W - p.r, y1: y, y2: y, class: 'awg-chart-grid' }, svg);
                const t = el('text', { x: p.l - 6, y: y + 3.5, class: 'awg-chart-axis', 'text-anchor': 'end' }, svg);
                t.textContent = this._fmt(v, o);
            }
            // label X (maks ±6)
            const step = Math.max(1, Math.round(n / 6));
            for (let i = 0; i < n; i += step) {
                const t = el('text', { x: X(i), y: H - 8, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg);
                t.textContent = o.labels[i] ?? '';
            }

            series.forEach((s, si) => {
                const color = cssVar((o.colors || COLORS)[si % COLORS.length]);
                let d = '';
                s.forEach((v, i) => {
                    const x = X(i), y = Y(v);
                    if (!d) d = `M${x},${y}`;
                    else if (o.smooth) {
                        const [px, py] = [X(i - 1), Y(s[i - 1])];
                        const cx = (px + x) / 2;
                        d += ` C${cx},${py} ${cx},${y} ${x},${y}`;
                    } else d += ` L${x},${y}`;
                });
                if (o.area && series.length <= 2) {
                    const gid = this._uid + 'g' + si;
                    const lg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, this.defs);
                    el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': .28 }, lg);
                    el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': .02 }, lg);
                    el('path', { d: d + ` L${X(s.length - 1)},${p.t + ih} L${X(0)},${p.t + ih} Z`, fill: `url(#${gid})`, stroke: 'none' }, svg);
                }
                el('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', class: 'awg-chart-line' }, svg);
            });

            // crosshair + tooltip
            if (o.tooltip) {
                const hit = el('rect', { x: p.l, y: p.t, width: iw, height: ih, fill: 'transparent' }, svg);
                const ch = el('line', { y1: p.t, y2: p.t + ih, class: 'awg-chart-cross awg-hide' }, svg);
                const dots = series.map((s, si) => el('circle', { r: 3.5, class: 'awg-chart-dot awg-hide', fill: cssVar((o.colors || COLORS)[si % COLORS.length]) }, svg));
                const tip = document.createElement('div');
                tip.className = 'awg-chart-tip awg-hide';
                this.el.appendChild(tip);
                const move = e => {
                    const r = this.el.getBoundingClientRect();
                    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
                    const i = Math.max(0, Math.min(n - 1, Math.round((cx - p.l) / (iw / Math.max(1, n - 1)) * 1)));
                    const x = X(i);
                    ch.classList.remove('awg-hide'); ch.setAttribute('x1', x); ch.setAttribute('x2', x);
                    dots.forEach((d, si) => { d.classList.remove('awg-hide'); d.setAttribute('cx', x); d.setAttribute('cy', Y((series[si] || [])[i] ?? 0)); });
                    tip.innerHTML = `<b>${this._esc(o.labels[i] ?? ('#' + i))}</b>` + series.map((s, si) =>
                        `<span><i style="background:${cssVar((o.colors || COLORS)[si % COLORS.length])}"></i>${this._esc((o.names || [])[si] || ('Seri ' + (si + 1)))}: <b>${this._fmt(s[i], o)}</b></span>`).join('');
                    tip.classList.remove('awg-hide');
                    const tw = tip.offsetWidth;
                    tip.style.left = Math.max(4, Math.min(r.width - tw - 4, x + 10)) + 'px';
                    tip.style.top = '10px';
                };
                const leave = () => { tip.classList.add('awg-hide'); ch.classList.add('awg-hide'); dots.forEach(d => d.classList.add('awg-hide')); };
                hit.addEventListener('mousemove', move);
                hit.addEventListener('touchmove', move, { passive: true });
                hit.addEventListener('mouseleave', leave);
                hit.addEventListener('touchend', leave);
            }
        }

        /* ---------- BAR ---------- */
        _bars(svg, o) {
            const p = this.pad(o), W = this._W, H = this._H;
            const iw = W - p.l - p.r, ih = H - p.t - p.b;
            const series = o.series.map(s => s.map(Number));
            const groups = Math.max(o.labels.length, series[0]?.length || 0);
            const maxV = o.max || niceMax(Math.max(0.0001, ...series.flat()));
            const gw = iw / Math.max(1, groups);
            const bw = Math.max(4, Math.min(34, gw * .7 / series.length));

            for (let g = 0; g <= 4; g++) {
                const v = maxV * g / 4, y = p.t + ih - (v / maxV) * ih;
                el('line', { x1: p.l, x2: W - p.r, y1: y, y2: y, class: 'awg-chart-grid' }, svg);
                const t = el('text', { x: p.l - 6, y: y + 3.5, class: 'awg-chart-axis', 'text-anchor': 'end' }, svg);
                t.textContent = this._fmt(v, o);
            }
            for (let g = 0; g < groups; g++) {
                const cx = p.l + gw * g + gw / 2;
                series.forEach((s, si) => {
                    const v = s[g] ?? 0;
                    const h = Math.max(1, (v / maxV) * ih);
                    const x = cx - bw * series.length / 2 + bw * si;
                    const color = cssVar((o.colors || COLORS)[si % COLORS.length]);
                    const r = el('rect', { x, y: p.t + ih - h, width: bw - 2, height: h, rx: 3, fill: color, class: 'awg-chart-bar' }, svg);
                    const tt = el('title', {}, r); tt.textContent = `${o.labels[g]} · ${(o.names||[])[si]||''}: ${this._fmt(v,o)}`;
                });
                const t = el('text', { x: cx, y: H - 8, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg);
                t.textContent = (o.labels[g] || '').slice(0, 9);
            }
        }

        /* ---------- DONUT ---------- */
        _donut(svg, o) {
            const W = this._W, H = this._H, cx = W / 2, cy = H / 2;
            const r = Math.min(W, H) / 2 - 8, th = Math.max(14, r * .32);
            const vals = o.series[0].map(Number);
            const sum = vals.reduce((a, b) => a + b, 0) || 1;
            let a0 = -Math.PI / 2;
            const colors = o.colors || COLORS;
            vals.forEach((v, i) => {
                const a1 = a0 + v / sum * Math.PI * 2;
                const large = (a1 - a0) > Math.PI ? 1 : 0;
                const [x0, y0] = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
                const [x1, y1] = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
                const path = el('path', {
                    d: `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`,
                    fill: 'none', stroke: cssVar(colors[i % colors.length]), 'stroke-width': th,
                    'stroke-linecap': vals.filter(x => x > 0).length > 1 ? 'butt' : 'round', class: 'awg-chart-arc'
                }, svg);
                const tt = el('title', {}, path);
                tt.textContent = `${(o.names || [])[i] || i}: ${v}`;
                a0 = a1;
            });
            const center = o.total ?? Math.round(sum);
            const t1 = el('text', { x: cx, y: cy - 2, class: 'awg-chart-center-num', 'text-anchor': 'middle' }, svg);
            t1.textContent = center;
            const t2 = el('text', { x: cx, y: cy + 16, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg);
            t2.textContent = o.unit || '';
            this._donutLegend(vals, colors);
        }
        _donutLegend(vals, colors) {
            const box = document.createElement('div');
            box.className = 'awg-chart-dlegend';
            vals.forEach((v, i) => {
                box.insertAdjacentHTML('beforeend',
                    `<span><i style="background:${cssVar(colors[i % colors.length])}"></i>${this._esc((this.o.names || [])[i] || ('S' + i))} <b>${v}</b></span>`);
            });
            this.el.appendChild(box);
        }

        /* ---------- GAUGE (semi-circle, zona NMS) ---------- */
        _gauge(svg, o) {
            const W = this._W, H = this._H;
            const cx = W / 2, cy = H * .82, r = Math.max(30, Math.min(W / 2 - 12, H * .74));
            const th = Math.max(12, r * .2);
            const max = o.gaugeMax || 100;
            const aOf = v => Math.PI + (Math.min(1, Math.max(0, v / max))) * Math.PI;
            const P = (a, rad) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
            const arc = (v0, v1, attrs) => {
                const a0 = aOf(v0), a1 = aOf(v1);
                if (a1 - a0 <= 0.0001) return null;
                const large = (a1 - a0) > Math.PI ? 1 : 0;
                return el('path', Object.assign({
                    d: `M${P(a0, r)} A${r},${r} 0 ${large} 1 ${P(a1, r)}`,
                    fill: 'none', 'stroke-width': th, class: ''
                }, attrs || {}), svg);
            };
            const [z1, z2] = (o.gaugeZones || [70, 90]).map(Number);
            // track 3 zona (redup)
            arc(0, z1, { stroke: cssVar('var(--awg-ok)'), opacity: .28 });
            arc(z1, z2, { stroke: cssVar('var(--awg-warn)'), opacity: .28 });
            arc(z2, max, { stroke: cssVar('var(--awg-bad)'), opacity: .28 });
            // isi terang sesuai nilai
            const col = o.value >= z2 ? cssVar('var(--awg-bad)') : o.value >= z1 ? cssVar('var(--awg-warn)') : cssVar('var(--awg-ok)');
            const fillP = arc(0, o.value, { stroke: col, 'stroke-linecap': 'round', class: 'awg-chart-gauge-fill' });
            // label min/max + nilai tengah
            const t1 = el('text', { x: cx, y: cy - th * .4, class: 'awg-chart-center-num', 'text-anchor': 'middle' }, svg);
            t1.textContent = this._fmt(o.value, o);
            t1.setAttribute('fill', col);
            const t2 = el('text', { x: cx, y: cy + 12, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg);
            t2.textContent = (o.names && o.names[0]) || '';
            const tMin = el('text', { x: cx - r, y: cy + 14, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg); tMin.textContent = '0';
            const tMax = el('text', { x: cx + r, y: cy + 14, class: 'awg-chart-axis', 'text-anchor': 'middle' }, svg); tMax.textContent = max;
        }

        /* ---------- LEGEND garis/bar ---------- */
        _legend(o) {
            const box = document.createElement('div');
            box.className = 'awg-chart-legend';
            (o.names || o.series.map((_, i) => 'Seri ' + (i + 1))).forEach((nm, i) => {
                box.insertAdjacentHTML('beforeend',
                    `<span><i style="background:${cssVar((o.colors || COLORS)[i % COLORS.length])}"></i>${this._esc(nm)}</span>`);
            });
            this.el.appendChild(box);
        }

        _fmt(v, o) {
            if (o.yFmt) return o.yFmt(v);
            if (o.type === 'gauge' || o.unit === '%') return Math.round(v) + '%';
            v = Number(v) || 0;
            if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k';
            return v % 1 ? v.toFixed(1) : String(v);
        }
        _esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
        destroy() { this._ro && this._ro.disconnect(); this.el.innerHTML = ''; }
    }

    /* ---------- auto-mount deklaratif ----------
       <div data-awg-chart="line" data-series='[[1,2,3]]' data-labels='["a","b","c"]'
            data-names='["In"]' data-height="200" data-unit="%"></div> */
    function mount(root) {
        (root || document).querySelectorAll('[data-awg-chart]').forEach(el => {
            if (el._awgChart) return;
            const read = (n, d) => { try { return JSON.parse(el.dataset[n]); } catch (e) { return d; } };
            let series = read('series', [[0]]);
            // data dari textContent (JSON) juga boleh: <div data-awg-chart="line">[[…]]</div>
            if (el.textContent.trim().startsWith('[')) { try { series = JSON.parse(el.textContent); el.textContent = ''; } catch (e) {} }
            const o = {
                type: el.dataset.awgChart, series,
                labels: read('labels', []), names: read('names', null), colors: read('colors', null),
                height: +el.dataset.awgHeight || 240, unit: el.dataset.awgUnit || '',
                value: +el.dataset.awgValue || 0, total: el.dataset.awgTotal != null ? +el.dataset.awgTotal : null,
                gaugeMax: +el.dataset.awgMax || 100
            };
            if (el.dataset.awgZones) o.gaugeZones = el.dataset.awgZones.split(',').map(Number);
            if (el.dataset.awgArea === 'false') o.area = false;
            if (el.dataset.awgSmooth === 'false') o.smooth = false;
            el._awgChart = new Chart(el, o);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount());
    else mount();

    window.AwgChart = Chart;
    window.AwgChart.mount = mount;
})();
