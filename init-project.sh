#!/usr/bin/env bash
set -euo pipefail

MIN_NODE_VERSION="20.19.0"

usage() {
  cat <<'EOF'
Usage: ./init-project.sh [--help]

Initializes this repository following README.md:
- checks Node.js >= 20.19.0
- installs or updates @fission-ai/openspec globally
- installs openspec shell completions

Options:
  -h, --help            Show this help
EOF
}

step() {
  printf '\n==> %s\n' "$1"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js %s or newer is required. Install the LTS release from https://nodejs.org/.\n' "$MIN_NODE_VERSION" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm was not found on PATH. Reinstall Node.js from https://nodejs.org/ and try again.\n' >&2
  exit 1
fi

step "Checking Node.js version"
current_node_version="$(node -p 'process.versions.node')"

IFS=. read -r current_major current_minor current_patch <<<"$current_node_version"
IFS=. read -r min_major min_minor min_patch <<<"$MIN_NODE_VERSION"

if (( current_major < min_major \
  || (current_major == min_major && current_minor < min_minor) \
  || (current_major == min_major && current_minor == min_minor && current_patch < min_patch) )); then
  printf 'Node.js %s detected. Need >= %s.\n' "$current_node_version" "$MIN_NODE_VERSION" >&2
  exit 1
fi

printf 'Node.js %s OK.\n' "$current_node_version"

step "Installing or updating @fission-ai/openspec"
npm install -g @fission-ai/openspec@latest

if ! command -v openspec >/dev/null 2>&1; then
  printf 'The openspec command is not available on PATH after installation. Open a new shell or fix the npm global bin path, then rerun this script.\n' >&2
  exit 1
fi

step "Installing openspec shell completions"
openspec completion install

printf '\nInitialization complete.\n'
printf 'Next step: open this repository in Cursor if it is not already open.\n'
