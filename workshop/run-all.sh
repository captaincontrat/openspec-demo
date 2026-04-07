#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

step() {
  printf '\n==> %s\n' "$1"
}

scripts=(
  "01-check-nasa-eonet.sh"
  "02-check-nominatim.sh"
  "03-check-open-meteo-weather.sh"
  "04-check-open-meteo-air-quality.sh"
)

for script_name in "${scripts[@]}"; do
  step "Running ${script_name}"
  "$SCRIPT_DIR/$script_name"
done

printf '\nAll workshop API checks passed.\n'
