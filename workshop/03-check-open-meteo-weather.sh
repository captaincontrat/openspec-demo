#!/usr/bin/env bash
set -euo pipefail

URL="https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,wind_speed_10m"

step() {
  printf '\n==> %s\n' "$1"
}

if ! command -v curl >/dev/null 2>&1; then
  printf 'curl is required to run this script.\n' >&2
  exit 1
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

step "Calling Open-Meteo weather API"
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
  printf 'Open-Meteo weather check failed: HTTP %s\n' "$http_code" >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

if ! grep -q '"current"' "$response_file"; then
  printf 'Open-Meteo weather check failed: expected JSON payload containing "current".\n' >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

printf 'OK: Open-Meteo weather responded with HTTP 200 and a "current" payload.\n'
printf 'Endpoint checked: %s\n' "$URL"
