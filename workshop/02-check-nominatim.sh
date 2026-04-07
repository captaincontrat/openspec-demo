#!/usr/bin/env bash
set -euo pipefail

BASE_USER_AGENT="openspec-demo-workshop/1.0"
USER_AGENT="$BASE_USER_AGENT"

if [[ -n "${WORKSHOP_CONTACT_EMAIL:-}" ]]; then
  USER_AGENT="$BASE_USER_AGENT (${WORKSHOP_CONTACT_EMAIL})"
fi

URL="https://nominatim.openstreetmap.org/reverse?lat=48.8566&lon=2.3522&format=jsonv2&zoom=10&addressdetails=1"

step() {
  printf '\n==> %s\n' "$1"
}

if ! command -v curl >/dev/null 2>&1; then
  printf 'curl is required to run this script.\n' >&2
  exit 1
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

step "Calling Nominatim reverse geocoding"
http_code="$(
  curl \
    --silent \
    --show-error \
    --location \
    --max-time 20 \
    --header "User-Agent: $USER_AGENT" \
    --output "$response_file" \
    --write-out '%{http_code}' \
    "$URL"
)"

if [[ "$http_code" != "200" ]]; then
  printf 'Nominatim check failed: HTTP %s\n' "$http_code" >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

if ! grep -q '"display_name"' "$response_file"; then
  printf 'Nominatim check failed: expected JSON payload containing "display_name".\n' >&2
  sed -n '1,20p' "$response_file" >&2
  exit 1
fi

printf 'OK: Nominatim responded with HTTP 200 and a "display_name" field.\n'
printf 'Endpoint checked: %s\n' "$URL"
printf 'User-Agent used: %s\n' "$USER_AGENT"
