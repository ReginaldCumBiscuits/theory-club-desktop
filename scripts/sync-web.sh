#!/bin/sh
# Copies the Theory Club web app into the desktop shell, wrapped as a full
# UTF-8 document (the artifact source is a page body).
# Usage: scripts/sync-web.sh path/to/theory-club.html
set -e
SRC="${1:-../theory-club.html}"
OUT="$(dirname "$0")/../web/index.html"
{
  printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  printf '<title>Theory Club</title></head><body>\n'
  cat "$SRC"
  printf '\n</body></html>\n'
} > "$OUT"
echo "web/index.html updated from $SRC"
