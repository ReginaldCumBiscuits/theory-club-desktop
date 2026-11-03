#!/bin/sh
# Builds the app from its modules in app/ and copies it into the desktop shell (web/index.html),
# wrapped as a full UTF-8 document (the app source is a page body).
# Usage: scripts/sync-web.sh            build from app/ (the normal way)
#        scripts/sync-web.sh FILE.html  use an already-built single file instead
set -e
DIR="$(dirname "$0")"
OUT="$DIR/../web/index.html"
if [ -n "$1" ]; then SRC="$1"; else SRC="$DIR/../dist/theory-club.html"; node "$DIR/build-app.mjs" "$SRC" >/dev/null; fi
{
  printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  printf '<title>Theory Club</title></head><body>\n'
  cat "$SRC"
  printf '\n</body></html>\n'
} > "$OUT"
echo "web/index.html updated from $SRC"
