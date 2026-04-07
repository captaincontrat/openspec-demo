#!/usr/bin/env bash
set -euo pipefail

URL="https://air-quality-api.open-meteo.com/v1/air-quality?latitude=48.8566&longitude=2.3522&hourly=pm10,pm2_5,us_aqi&forecast_days=1"

step() {
  printf '\n==> %s\n' "$1"
}

if ! command -v curl >/dev/null 2>&1; then
  printf 'curl is required to run this script.\n' >&2
  exit 1
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

step "Calling Open-Meteo air-quality API"
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
  printf 'Open-Meteo air-quality check failed: HTTP %s\n' "$http_code" >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

if ! grep -q '"hourly"' "$response_file"; then
  printf 'Open-Meteo air-quality check failed: expected JSON payload containing "hourly".\n' >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

printf 'OK: Open-Meteo air-quality responded with HTTP 200 and an "hourly" payload.\n'
printf 'Endpoint checked: %s\n' "$URL"
