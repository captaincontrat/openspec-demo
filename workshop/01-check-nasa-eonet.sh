#!/usr/bin/env bash
set -euo pipefail

URL="https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5"

step() {
  printf '\n==> %s\n' "$1"
}

if ! command -v curl >/dev/null 2>&1; then
  printf 'curl is required to run this script.\n' >&2
  exit 1
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

step "Calling NASA EONET"
http_code="$(
  curl \
    --silent \
    --show-error \
    --location \
    --max-time 20 \
    --output "$response_file" \
    --write-out '%{http_code}' \
    "$URL"
)"

if [[ "$http_code" != "200" ]]; then
  printf 'NASA EONET check failed: HTTP %s\n' "$http_code" >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

if ! grep -q '"events"' "$response_file"; then
  printf 'NASA EONET check failed: expected JSON payload containing "events".\n' >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

printf 'OK: NASA EONET responded with HTTP 200 and an "events" payload.\n'
printf 'Endpoint checked: %s\n' "$URL"
