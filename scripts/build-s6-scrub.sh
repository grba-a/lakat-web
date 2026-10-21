#!/usr/bin/env bash
# Hero S6 za skrol (Petar 21. 10.: „napravi scrolling mehaniku"): klipovi s kauča spojeni u jedan video koji skrol
# vrti naprijed i natrag, i šank zasebno. Ključna sličica svake 4 (-g 4): skok na bilo koje vrijeme dekodira najviše
# 3 sličice, a video je ~2,5× manji nego sa svakom ključnom (4 MB umjesto 10,6 MB za kauč).
# Izvor su Higgsfield originali u vaultu (Codex Job 30); c5 (mahanje na vratima) Petar je izbacio.
set -euo pipefail
FF="${FF:-$HOME/Projects/lakat-promo/node_modules/ffmpeg-static/ffmpeg}"
SRC="${SRC:-$HOME/vault/00-Inbox/codex-lakat/2026-10-20-higgsfield-s6}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/video/s6"
CRF="${CRF:-30}"
mkdir -p "$OUT"
X264=(-c:v libx264 -preset slow -crf "$CRF" -g 4 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an)

# Kauč: c1 · c2 · c3a · c3b · c3c v1, svi cijeli (Petar 21. 10.: „ne moraš ovaj put rezati nijedan dio"; u c3c se vidi
# kako Krigla trči kroz vrata i vrata se otvore na svjetlo).
"$FF" -y -hide_banner -loglevel error \
  -i "$SRC/izlaz/c1-petak1-2.mp4" -i "$SRC/izlaz/c2-petak2-3.mp4" \
  -i "$SRC/izlaz/c3a-v1-mobitel-kling-pro.mp4" -i "$SRC/izlaz/c3b-kling-omni-pro.mp4" \
  -i "$SRC/izlaz/c3c-skok-prazan-kling-pro-v1-rezerva.mp4" \
  -filter_complex "\
[0:v]fps=24,scale=1080:1920,setsar=1[a];[1:v]fps=24,scale=1080:1920,setsar=1[b];[2:v]fps=24,scale=1080:1920,setsar=1[c];\
[3:v]fps=24,scale=1080:1920,setsar=1[d];[4:v]fps=24,scale=1080:1920,setsar=1[e];\
[a][b][c][d][e]concat=n=5:v=1,scale=720:1280:flags=lanczos[v]" \
  -map "[v]" "${X264[@]}" "$OUT/kauc.mp4"

# Šank: c4 bez bočnih traka (sredina 1728×1080 = 16:10, Codex README), 960×600.
"$FF" -y -hide_banner -loglevel error -i "$SRC/izlaz/c4-sank-kucanje.mp4" \
  -vf "crop=1728:1080:96:0,scale=960:600:flags=lanczos,fps=24" "${X264[@]}" "$OUT/sank.mp4"

ls -la "$OUT/kauc.mp4" "$OUT/sank.mp4"
