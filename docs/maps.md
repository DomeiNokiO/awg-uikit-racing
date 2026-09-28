# 🗺️ Maps — AWG-UIKIT-RACING

Adapter peta seragam untuk **Leaflet** (self-hosted), **Google Maps**, dan **MapLibre GL`. Tidak memakai CDN apabila pakai Leaflet: semua file sudah ada di `libs/leaflet/`.

## Pakai Leaflet (default, lokal)
```html
<link rel="stylesheet" href="libs/leaflet/leaflet.css">
<script src="libs/leaflet/leaflet.js"></script>
<script src="js/awg-maps.js"></script>

<div data-awg-map='{"lat":-7.4211,"lng":109.2404,"zoom":14,"markers":[{"lat":-7.4211,"lng":109.2404,"title":"ODC","popup":"<b>ODC</b><br>OLT ZTE C320"}]}'></div>
```

## Provider lain
Tambahkan `data-awg-map-provider="gmaps"` atau `"maplibre"`. Muat library terkait sendiri (kunci API masing-masing).

## API
- `AwgMap.mount(root)` — mount ulang setelah konten dinamis.
- `map.addMarker({lat,lng,title,popup})`
- `map.pan(lat, lng, zoom)`

## CSS
`.awg-map` memiliki tinggi default 320px. Ubah via inline style atau utility class.
