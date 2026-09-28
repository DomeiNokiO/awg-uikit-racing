/* ===========================================================
   AWG-UIKIT-RACING — Maps adapter (vanilla JS, optional)
   Author : AWGNET-RACING & AGENT AI TEAM
   Provides unified API around Leaflet (self-hosted), Google Maps,
   and MapLibre GL. Falls back to a static OpenStreetMap tile URL.
   Usage:
     <div id="mymap" data-awg-map='{"lat":-7.42,"lng":109.24,"zoom":13}'></div>
     <script src="libs/leaflet/leaflet.js"></script>
     <script src="js/awg-maps.js"></script>
     AwgMap.init();   // or auto-mount
   =========================================================== */
(function () {
    'use strict';
    const d = document, w = window, L = w.L;

    class AwgMap {
        constructor(root, opts) {
            this.el = typeof root === 'string' ? d.querySelector(root) : root;
            if (!this.el) return null;
            this.o = Object.assign({ provider: 'leaflet', lat: -7.5, lng: 109.2, zoom: 6,
                markers: [], fit: true, onReady: null, tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }, opts);
            // read inline JSON first, then data attrs
            try { Object.assign(this.o, JSON.parse(this.el.dataset.awgMap || '{}')); } catch (e) {}
            ['provider','lat','lng','zoom','tileUrl','attribution'].forEach(k => { if (this.el.dataset['awgMap' + k[0].toUpperCase()+k.slice(1)]) this.o[k] = this.el.dataset['awgMap' + k[0].toUpperCase()+k.slice(1)]; });
            this.el.classList.add('awg-map');
            if (this.o.provider === 'leaflet') this._leaflet();
            else if (this.o.provider === 'gmaps') this._gmaps();
            else if (this.o.provider === 'maplibre') this._maplibre();
            else this._noLib();
            this.el._awgMap = this;
        }

        _leaflet() {
            if (!L) { this._noLib(); return; }
            this.map = L.map(this.el).setView([this.o.lat, this.o.lng], this.o.zoom);
            L.tileLayer(this.o.tileUrl, { attribution: this.o.attribution, maxZoom: 19 }).addTo(this.map);
            this.markers = [];
            this._drawMarkers();
            if (this.o.fit && this.markers.length) this.map.fitBounds(this.markers.map(m => m.getLatLng()), { padding: [20, 20], maxZoom: 16 });
            this.o.onReady && this.o.onReady(this);
        }

        _gmaps() {
            if (!w.google || !w.google.maps) { this._noLib(); return; }
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
            if (!w.maplibregl) { this._noLib(); return; }
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

        _noLib() {
            this.el.innerHTML = '<div class="awg-map-fallback"><svg class="awg-ic xl"><use href="assets/icons.svg#ic-map"></use></svg><p>Library peta tidak tersedia.</p><small>Cocokkan setting provider atau muat Leaflet/Google Maps.</small></div>';
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
            else this.map.setCenter([lng, lat]);
        }
    }

    function mount(root) {
        (root || d).querySelectorAll('[data-awg-map]').forEach(el => { if (!el._awgMap) new AwgMap(el); });
    }
    if (d.readyState === 'complete') setTimeout(mount, 0);
    else if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mount);
    else mount(); // interactive
    w.addEventListener('load', () => { setTimeout(mount, 50); }); // fallback for async libs
    w.AwgMap = AwgMap; w.AwgMap.mount = mount;
})();
