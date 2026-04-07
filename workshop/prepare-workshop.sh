#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Usage: ./workshop/prepare-workshop.sh [--branch <name>] [--base <branch>] [--dry-run]

Recommended facilitator entrypoint for workshop day:
- runs all public API readiness checks
- creates the dated participant base branch
- removes the workshop/ folder from that new branch

Options:
  --branch <name>        Override the default branch name (default: workshop-YYYY-MM-DD)
  --base <branch>        Base branch to branch from (default: main)
  --dry-run              Keep API checks live, but print git branch commands instead of executing them
  -h, --help             Show this help
EOF
}

step() {
  printf '\n==> %s\n' "$1"
}

branch_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        printf 'The --branch option requires a value.\n\n' >&2
        usage >&2
        exit 1
      fi
      branch_args+=("$1" "$2")
      shift 2
      ;;
    --base)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        printf 'The --base option requires a value.\n\n' >&2
        usage >&2
        exit 1
      fi
      branch_args+=("$1" "$2")
      shift 2
      ;;
    --dry-run)
      branch_args+=("$1")
      shift
      ;;
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
done

step "Running public API readiness checks"
"$SCRIPT_DIR/run-all.sh"

step "Preparing participant base branch"
exec "$SCRIPT_DIR/prepare-workshop-branch.sh" "${branch_args[@]}"
