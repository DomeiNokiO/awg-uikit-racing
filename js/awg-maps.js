/* ===========================================================
   AWG-UIKIT-RACING — Maps adapter (vanilla JS, optional)
   Author : AWGNET-RACING & AGENT AI TEAM
   Provides unified API around Leaflet (self-hosted), Google Maps,
   and MapLibre GL. Falls back to a static OpenStreetMap tile URL
   plus a self-rendered SVG demo fallback when tiles fail/offline.
   Usage:
     <div id="mymap" data-awg-map='{"lat":-7.42,"lng":109.24,"zoom":13}'></div>
     <script src="libs/leaflet/leaflet.js"></script>
     <script src="js/awg-maps.js"></script>
   =========================================================== */
(function () {
    'use strict';
    const d = document, w = window, L = w.L;

    class AwgMap {
        constructor(root, opts) {
            this.el = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.el) return null;
            this.o = Object.assign({
                provider: 'leaflet', lat: -7.5, lng: 109.2, zoom: 6,
                markers: [], fit: true, onReady: null,
                tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                demoFallback: true
            }, opts);
            try { Object.assign(this.o, JSON.parse(this.el.dataset.awgMap || '{}')); } catch (e) {}
            ['provider','lat','lng','zoom','tileUrl','attribution','demoFallback'].forEach(k => {
                const key = 'awgMap' + k[0].toUpperCase() + k.slice(1);
                if (this.el.dataset[key] !== undefined) this.o[k] = this.el.dataset[key];
            });
            this.el.classList.add('awg-map');
            if (this.o.provider === 'leaflet') this._leaflet();
            else if (this.o.provider === 'gmaps') this._gmaps();
            else if (this.o.provider === 'maplibre') this._maplibre();
            else this._noLib();
            this.el._awgMap = this;
        }

        _leaflet() {
            if (!L) { this._noLib('Leaflet tidak dimuat.'); return; }
            this.map = L.map(this.el).setView([this.o.lat, this.o.lng], this.o.zoom);
            const layer = L.tileLayer(this.o.tileUrl, { attribution: this.o.attribution, maxZoom: 19 }).addTo(this.map);
            this.markers = [];
            this._drawMarkers();
            if (this.o.fit && this.markers.length) {
                this.map.fitBounds(this.markers.map(m => m.getLatLng()), { padding: [20, 20], maxZoom: 16 });
            }
            this.o.onReady && this.o.onReady(this);
            if (!this.o.demoFallback) return;
            layer.on('tileerror', () => { if (!this.__demoActive) this.__renderDemoFallback(); });
            setTimeout(() => {
                if (this.__demoActive) return;
                const tiles = this.el.querySelectorAll('.leaflet-tile');
                const loaded = Array.from(tiles).some(t => t.complete && t.naturalWidth > 0);
                if (tiles.length > 0 && !loaded) this.__renderDemoFallback();
            }, 2500);
        }

        _gmaps() {
            if (!w.google || !w.google.maps) { this._noLib('Google Maps library tidak tersedia.'); return; }
            this.map = new google.maps.Map(this.el, { center: { lat: this.o.lat, lng: this.o.lng }, zoom: this.o.zoom });
            this.markers = [];
            (this.o.markers || []).forEach(m => {
                const gm = new google.maps.Marker({ position: { lat: m.lat, lng: m.lng }, map: this.map, title: m.title || '' });
                if (m.popup) { const inf = new google.maps.InfoWindow({ content: m.popup }); gm.addListener('click', () => inf.open(this.map, gm)); }
                this.markers.push(gm);
            });
            this.o.onReady && this.o.onReady(this);
        }

        _maplibre() {
            if (!w.maplibregl) { this._noLib('MapLibre library tidak tersedia.'); return; }
            this.map = new maplibregl.Map({ container: this.el, style: this.o.style || { version: 8, sources: { osm: { type: 'raster', tiles: [this.o.tileUrl], tileSize: 256, attribution: this.o.attribution } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] }, center: [this.o.lng, this.o.lat], zoom: this.o.zoom });
            this.markers = [];
            (this.o.markers || []).forEach(m => {
                const el = document.createElement('div'); el.className = 'awg-map-pin';
                const mk = new maplibregl.Marker(el).setLngLat([m.lng, m.lat]).addTo(this.map);
                if (m.popup) mk.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(m.popup));
                this.markers.push(mk);
            });
            this.o.onReady && this.o.onReady(this);
        }

        _noLib(msg) {
            this.el.innerHTML = '<div class="awg-map-fallback"><svg class="awg-ic xl"><use href="assets/icons.svg#ic-map"></use></svg><p>' + (msg || 'Library peta tidak tersedia.') + '</p><small>Muat Leaflet, Google Maps, atau MapLibre.</small></div>';
        }

        __renderDemoFallback() {
            this.__demoActive = true;
            this.el.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.className = 'awg-map';
            wrap.style.cssText = 'width:100%;height:100%;min-height:280px;position:relative;overflow:hidden;background:linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 100%);border-radius:var(--awg-radius);';
            const title = document.createElement('h4');
            title.textContent = 'Peta Node Demo (Offline Fallback)';
            title.style.cssText = 'position:absolute;top:.8rem;left:.8rem;right:.8rem;z-index:3;margin:0;background:rgba(255,255,255,.9);padding:.45rem .75rem;border-radius:8px;font-size:.78rem;font-weight:700;box-shadow:var(--awg-shadow);';
            wrap.appendChild(title);
            const markers = (this.o.markers || []);
            const wBox = Math.max(this.el.clientWidth || 600, 300), hBox = 280;
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%'); svg.setAttribute('viewBox', `0 0 ${wBox} ${hBox}`);
            svg.style.cssText = 'position:absolute;inset:0;display:block;';
            for (let i = 0; i <= wBox; i += 60) { const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); line.setAttribute('x1', i); line.setAttribute('y1', 0); line.setAttribute('x2', i); line.setAttribute('y2', hBox); line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '1'); svg.appendChild(line); }
            for (let i = 0; i <= hBox; i += 60) { const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); line.setAttribute('x1', 0); line.setAttribute('y1', i); line.setAttribute('x2', wBox); line.setAttribute('y2', i); line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '1'); svg.appendChild(line); }
            [[20,140,580,140,'#94a3b8'],[140,20,160,260,'#94a3b8'],[320,20,300,260,'#94a3b8'],[460,20,480,260,'#94a3b8']].forEach(([x1,y1,x2,y2,stroke])=>{
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('stroke', stroke); line.setAttribute('stroke-width', '4'); line.setAttribute('stroke-linecap', 'round');
                svg.appendChild(line);
            });
            const lats = markers.map(m => m.lat), lngs = markers.map(m => m.lng);
            const minLat = Math.min(...lats) || this.o.lat, maxLat = Math.max(...lats) || this.o.lat;
            const minLng = Math.min(...lngs) || this.o.lng, maxLng = Math.max(...lngs) || this.o.lng;
            const padLat = Math.max(0.005, (maxLat - minLat) * 0.2), padLng = Math.max(0.005, (maxLng - minLng) * 0.2);
            function yy(lat) { return hBox - ((lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * hBox; }
            function xx(lng) { return ((lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * wBox; }
            markers.forEach((m, i) => {
                const cx = xx(m.lng), cy = yy(m.lat);
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const col = i === 0 ? '#2563eb' : (m.popup && String(m.popup).includes('DOWN') ? '#dc2626' : '#16a34a');
                const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                pulse.setAttribute('cx', cx); pulse.setAttribute('cy', cy); pulse.setAttribute('r', 12); pulse.setAttribute('fill', col); pulse.setAttribute('opacity', .18);
                g.appendChild(pulse);
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', 7); circle.setAttribute('fill', col); circle.setAttribute('stroke', '#fff'); circle.setAttribute('stroke-width', '2');
                g.appendChild(circle);
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', cx); text.setAttribute('y', cy - 14); text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#0f172a'); text.setAttribute('font-size', '11'); text.setAttribute('font-weight', '700');
                text.textContent = m.title || ('Node ' + (i + 1));
                g.appendChild(text);
                const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                tip.textContent = m.popup ? String(m.popup).replace(/<[^>]+>/g, ' ') : (m.title || 'Node');
                g.appendChild(tip);
                svg.appendChild(g);
            });
            wrap.appendChild(svg);
            this.el.appendChild(wrap);
        }

        _drawMarkers() {
            (this.o.markers || []).forEach(m => {
                const mk = L.marker([m.lat, m.lng]).addTo(this.map);
                if (m.popup) mk.bindPopup(m.popup);
                if (m.title) mk.bindTooltip(m.title);
                this.markers.push(mk);
            });
        }

        addMarker(m) {
            if (!this.map) return;
            if (L && this.map instanceof L.Map) {
                const mk = L.marker([m.lat, m.lng]).addTo(this.map);
                if (m.popup) mk.bindPopup(m.popup);
                this.markers.push(mk);
            }
        }

        pan(lat, lng, zoom) {
            if (!this.map) return;
            if (L && this.map instanceof L.Map) this.map.setView([lat, lng], zoom || this.map.getZoom());
            else if (w.google && this.map instanceof google.maps.Map) this.map.panTo({ lat, lng });
            else if (this.map.setCenter) this.map.setCenter([lng, lat]);
        }
    }

    function mount(root) {
        (root || d).querySelectorAll('[data-awg-map]').forEach(el => { if (!el._awgMap) new AwgMap(el); });
    }
    if (d.readyState === 'complete') setTimeout(mount, 0);
    else if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mount);
    else mount();
    w.addEventListener('load', () => { setTimeout(mount, 50); });
    w.AwgMap = AwgMap; w.AwgMap.mount = mount;
})();
