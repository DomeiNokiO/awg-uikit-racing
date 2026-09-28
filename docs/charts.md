# 📊 Charts / NMS — AWG-UIKIT-RACING (`js/awg-charts.js`)

Grafik **SVG murni tanpa library** — cocok untuk NMS/monitoring ISP: trafik uplink, utilisasi, CPU/RAM gauge, status ONT.
Ukuran ±3.8 KB gzip, **tema-aware** (ikon ikut dark/light otomatis), **responsif** (ResizeObserver), ringan untuk update tiap 2 detik.

## Tipe yang tersedia
| `type` | Untuk NMS | Contoh kebutuhan |
|---|---|---|
| `line` / `area` | time-series | trafik In/Out Mbps, latency, loss, sesi PPPoE, temperature |
| `bar` | kategori | utilisasi per interface/pon/port |
| `donut` | komposisi | status ONT (online/degraded/offline), split pelanggan |
| `gauge` | threshold | CPU/RAM/disk — zona aman(warna redup) & isi terang sesuai nilai |

## Deklaratif (paling gampang)
```html
<div data-awg-chart="line" data-awg-height="240"
     data-labels='["-12m","-11m","…","-1m"]'
     data-names='["In (Rx)","Out (Tx)"]'
     data-series='[[420,438,…],[128,140,…]]'></div>

<div data-awg-chart="bar" data-max="100" data-unit="%"
     data-labels='["ether1","ether2"]' data-series='[[76,58]]'></div>

<div data-awg-chart="gauge" data-awg-value="38" data-awg-max="100"
     data-awg-zones="70,90" data-awg-unit="%" data-names='["% CPU"]'></div>

<div data-awg-chart="donut" data-series='[[312,14,7]]'
     data-names='["Online","Degraded","Offline"]'
     data-colors='["var(--awg-ok)","var(--awg-warn)","var(--awg-bad)"]'
     data-awg-total="333" data-awg-unit="total ONT"></div>
```
Data juga boleh lewat textContent: `<div data-awg-chart="line">[[1,2,3]]</div>`.
`data-awg-area="false"` → garis tanpa fill (sparkline), `data-awg-smooth="false"` → garis patah.

## API JS
```js
const c = new AwgChart(el, {
    type: 'line', height: 240, labels: [...], series: [[...],[...]],
    names: ['In','Out'],            // legenda + tooltip
    colors: ['var(--awg-brand)','var(--awg-ok)'],   // var() ikut tema
    max: 100, unit: '%',            // sumbu Y / label gauge
    smooth: true, area: true, tooltip: true, legend: true,
    yFmt: v => Awg.rupiah(v),      // formatter custom
    gaugeMax: 100, gaugeZones: [70, 90]
});
c.update([inD, outD]);              // time-series: array seri (murah, tiap polling)
c.update(42);                       // gauge: angka tunggal
c.update([312, 14, 7]);             // donut: angka per kategori
c.destroy();
```

## Pola real-time NMS (polling 2–5 detik)
```js
let inD = [], labels = [];
async function tick() {
    const j = await fetch('/nms/traffic?if=ether1').then(r => r.json());
    labels = [...labels.slice(-(N-1)), j.time];
    inD    = [...inD.slice(-(N-1)), j.mbps];
    chart.update({ labels, series: [inD] });
}
setInterval(tick, 2000);
```
`update()` me-render ulang SVG kecil — tidak bikin layout jank.

## Interaksi
- **line/area**: hover/sentuh panel → crosshair + titik + tooltip per seri (nama seri + nilai terformat). Sentuh (mobile) didukung `touchmove`.
- **bar**: hover bar → `<title>` native (nama · seri · nilai), highlight redup.
- **donut**: hover arc → `<title>`; legenda di bawah + angka total di tengah.
- **gauge**: label 0/max di ujung, angka tengah bewarna sesuai zona (ok/warn/bad).

## Theme & responsif
- Warna pakai CSS var → ganti tema = warna ikut; chart juga **re-render otomatis** saat `awg:theme`.
- Lebar mengikuti container (`viewBox` di-generate dari `clientWidth`) — di kartu 1 kolom HP tetap pas.
- Sumbu Y pakai `niceMax` (1/2/5×10ⁿ) supaya angka grid rapi.

## Integrasi data nyata (Mikrotik / ZTE OLT)
Endpoint-mu yang bentukkan JSON, contoh PHP/artisan quick:
```json
{ "labels": ["08:00","08:01"], "series": [[812,830],[180,192]] }
```
Sumber metrik umum: SNMP `ifInOctets/ifOutOctets` (delta ×8/detik = bps), Mikrotik `/interface/monitor-traffic`, `cpu-load`, `freememory`; ZTE: utilisasi PON, ONT count, RSSI lemah (SNMP Enterprise / CLI parsing). Simpan time-series di RRDB/InfluxDB/Prometheus — kit ini **hanya visualisasi**, tidak menyimpan data.

## Batas & catatan
- Bukan pengganti Grafana untuk dashboard ribuan panel; targetnya komponen UI embedded (halaman NMS internal, laporan, modal detail).
- Ribuan titik per seri: downsampling dulu (rata-rata per bucket) sebelum `update`.
- Semua teks di-escape internal (`_esc`) — aman untuk nama interface dari DB.
