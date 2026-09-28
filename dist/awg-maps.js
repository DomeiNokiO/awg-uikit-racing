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
            if (this.map) { try { this.map.remove(); } catch(e){} }
            const rect = this.el.getBoundingClientRect();
            const wBox = Math.max(Math.floor(rect.width), this.el.clientWidth || 600);
            const hBox = Math.max(Math.floor(rect.height), 280);
            const markers = (this.o.markers || []);
            const lats = markers.length ? markers.map(m => m.lat) : [this.o.lat];
            const lngs = markers.length ? markers.map(m => m.lng) : [this.o.lng];
            let minLat = Math.min(...lats), maxLat = Math.max(...lats);
            let minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
            if (!markers.length) { minLat -= 0.02; maxLat += 0.02; minLng -= 0.02; maxLng += 0.02; }
            const padLat = Math.max(0.005, (maxLat - minLat) * 0.25);
            const padLng = Math.max(0.005, (maxLng - minLng) * 0.25);

            const svgNS = 'http://www.w3.org/2000/svg';
            this.el.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.className = 'awg-map';
            wrap.style.cssText = `width:100%;height:${hBox}px;position:relative;overflow:hidden;background:linear-gradient(135deg,#dbeafe 0%,#eff6ff 100%);border-radius:var(--awg-radius);`;

            const title = document.createElement('h4');
            title.textContent = 'Peta Node Demo (Offline Fallback)';
            title.style.cssText = 'position:absolute;top:.8rem;left:.8rem;right:.8rem;z-index:3;margin:0;background:rgba(255,255,255,.92);padding:.45rem .75rem;border-radius:8px;font-size:.78rem;font-weight:700;box-shadow:var(--awg-shadow);';
            wrap.appendChild(title);

            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.setAttribute('viewBox', `0 0 ${wBox} ${hBox}`);
            svg.style.cssText = 'position:absolute;inset:0;display:block;';

            // blocks / "buildings"
            const blocks = [
                [60,60,120,100,'#bfdbfe'], [180,50,260,120,'#bfdbfe'], [340,80,420,150,'#bfdbfe'],
                [520,40,620,130,'#bfdbfe'], [680,70,760,160,'#bfdbfe'],
                [40,200,130,260,'#c7d2fe'], [200,230,290,290,'#c7d2fe'], [360,210,460,280,'#c7d2fe'],
                [540,250,640,310,'#c7d2fe'], [700,220,780,300,'#c7d2fe'],
                [90,350,170,410,'#ddd6fe'], [260,340,350,420,'#ddd6fe'], [440,360,540,420,'#ddd6fe'],
                [620,350,720,410,'#ddd6fe']
            ];
            blocks.forEach(([x1,y1,x2,y2,fill])=>{
                const rect = document.createElementNS(svgNS, 'rect');
                rect.setAttribute('x', x1); rect.setAttribute('y', y1);
                rect.setAttribute('width', x2-x1); rect.setAttribute('height', y2-y1);
                rect.setAttribute('fill', fill); rect.setAttribute('rx', 4);
                svg.appendChild(rect);
            });

            // roads
            const roads = [
                [0,145,wBox,145,'#64748b',5], [0,285,wBox,285,'#64748b',5],
                [140,0,140,hBox,'#64748b',5], [330,0,330,hBox,'#64748b',5], [560,0,560,hBox,'#64748b',5], [720,0,720,hBox,'#64748b',5]
            ];
            roads.forEach(([x1,y1,x2,y2,stroke,width])=>{
                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('stroke', stroke); line.setAttribute('stroke-width', width); line.setAttribute('stroke-linecap', 'round');
                svg.appendChild(line);
            });

            function yy(lat) { return hBox - ((lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * hBox; }
            function xx(lng) { return ((lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * wBox; }

            markers.forEach((m, i) => {
                const cx = xx(m.lng), cy = yy(m.lat);
                const col = i === 0 ? '#2563eb' : (String(m.popup || '').includes('DOWN') ? '#dc2626' : '#16a34a');
                const g = document.createElementNS(svgNS, 'g');
                g.setAttribute('transform', `translate(${cx}, ${cy})`);
                g.style.cursor = 'pointer';

                const pin = document.createElementNS(svgNS, 'path');
                pin.setAttribute('d', 'M0,-22 C-7,-22 -12,-16 -12,-10 C-12,-2 -2,10 0,22 C2,10 12,-2 12,-10 C12,-16 7,-22 0,-22 Z');
                pin.setAttribute('fill', col); pin.setAttribute('stroke', '#fff'); pin.setAttribute('stroke-width', '2.5');
                g.appendChild(pin);

                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('x', 0); label.setAttribute('y', -34); label.setAttribute('text-anchor', 'middle');
                label.setAttribute('fill', '#0f172a'); label.setAttribute('font-size', '12'); label.setAttribute('font-weight', '700');
                label.setAttribute('style', 'text-shadow:0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;');
                label.textContent = m.title || ('Node ' + (i + 1));
                g.appendChild(label);

                const tip = document.createElementNS(svgNS, 'title');
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
