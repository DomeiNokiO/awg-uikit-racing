#!/bin/bash
# AWG-UIKIT-RACING build — minify css/js -> dist/ (tanpa dependency eksternal wajib)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
echo "── Build AWG-UIKIT-RACING ──"

minify_css() {
    perl -0pe 's{/\*.*?\*/}{}gs; s/\s+/ /g; s/\s*([{}:;,>])\s*/$1/g; s/;}/}/g; s/^ //; s/ $//' "$1"
}
minify_js() {
    if command -v npx >/dev/null 2>&1; then
        npx --yes terser@5 -c -m -- "$1" 2>/dev/null && return
    fi
    perl -0pe 's{^\s*/\*.*?\*/}{}gsm; s{^\s*//.*$}{}gm; s/\n{2,}/\n/g' "$1"
}

minify_css css/awg-uikit.css | sed "s|\.\./fonts/|fonts/|g" > dist/awg-uikit.min.css
minify_js js/awg-core.js > dist/awg-core.min.js
minify_js js/awg-select2.js > dist/awg-select2.min.js
minify_js js/awg-charts.js > dist/awg-charts.min.js
minify_js js/awg-datatable.js > dist/awg-datatable.min.js
minify_js js/awg-datepicker.js > dist/awg-datepicker.min.js
minify_js js/awg-widgets.js > dist/awg-widgets.min.js
minify_js js/awg-maps.js > dist/awg-maps.min.js
cp css/tokens.json dist/awg-tokens.json
cp css/awg-uikit.css dist/awg-uikit.css
cp js/awg-core.js dist/awg-core.js
cp js/awg-select2.js dist/awg-select2.js
cp js/awg-charts.js dist/awg-charts.js
cp js/awg-datatable.js dist/awg-datatable.js
cp js/awg-datepicker.js dist/awg-datepicker.js
cp js/awg-widgets.js dist/awg-widgets.js
cp js/awg-maps.js dist/awg-maps.js
mkdir -p dist/fonts dist/assets dist/libs/leaflet/images
cp fonts/*.woff2 dist/fonts/
cp assets/icons.svg dist/assets/
cp assets/pin-awg.svg dist/assets/
cp -r libs/leaflet/* dist/libs/leaflet/
sed "s|\.\./fonts/|fonts/|g" css/awg-uikit.css > dist/awg-uikit.css

total=0
for f in dist/*.min.*; do
    raw=$(wc -c < "$f"); gz=$(gzip -9c "$f" | wc -c)
    printf "%-26s %7s raw  %7s gzip\n" "$(basename "$f")" "$raw" "$gz"
    total=$((total + gz))
done
echo "TOTAL gzip: $total bytes"
echo "── Selesai ──"
