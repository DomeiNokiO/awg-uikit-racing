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

minify_css css/awg-uikit.css > dist/awg-uikit.min.css
minify_js js/awg-core.js > dist/awg-core.min.js
minify_js js/awg-select2.js > dist/awg-select2.min.js
cp css/tokens.json dist/awg-tokens.json
cp css/awg-uikit.css dist/awg-uikit.css
cp js/awg-core.js dist/awg-core.js
cp js/awg-select2.js dist/awg-select2.js

total=0
for f in dist/*.min.*; do
    raw=$(wc -c < "$f"); gz=$(gzip -9c "$f" | wc -c)
    printf "%-26s %7s raw  %7s gzip\n" "$(basename "$f")" "$raw" "$gz"
    total=$((total + gz))
done
echo "TOTAL gzip: $total bytes"
echo "── Selesai ──"
