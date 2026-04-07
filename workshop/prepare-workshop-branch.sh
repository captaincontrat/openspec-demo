#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

base_branch="main"
branch_name=""
dry_run=0

usage() {
  cat <<'EOF'
Usage: ./workshop/prepare-workshop-branch.sh [--branch <name>] [--base <branch>] [--dry-run]

Creates the dated participant base branch for the workshop:
- switches to the base branch
- creates the workshop branch
- removes the workshop/ folder
- commits the removal so participant branches do not inherit facilitator files

Options:
  --branch <name>        Override the default branch name (default: workshop-YYYY-MM-DD)
  --base <branch>        Base branch to branch from (default: main)
  --dry-run              Print the git commands without executing them
  -h, --help             Show this help
EOF
}

step() {
  printf '\n==> %s\n' "$1"
}

run_cmd() {
  if (( dry_run )); then
    printf '[dry-run]'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        printf 'The --branch option requires a value.\n\n' >&2
        usage >&2
        exit 1
      fi
      branch_name="${2:-}"
      shift 2
      ;;
    --base)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        printf 'The --base option requires a value.\n\n' >&2
        usage >&2
        exit 1
      fi
      base_branch="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run=1
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

if [[ -z "$branch_name" ]]; then
  branch_name="workshop-$(date +%Y-%m-%d)"
fi

cd "$REPO_ROOT"

if ! command -v git >/dev/null 2>&1; then
  printf 'git is required to run this script.\n' >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Working tree must be clean before preparing the workshop branch.\n' >&2
  printf 'Commit or stash your changes, then rerun this script.\n' >&2
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/$base_branch"; then
  printf 'Base branch "%s" does not exist locally.\n' "$base_branch" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$branch_name"; then
  printf 'Branch "%s" already exists locally.\n' "$branch_name" >&2
  exit 1
fi

if [[ ! -d "$REPO_ROOT/workshop" ]]; then
  printf 'The workshop/ directory was not found.\n' >&2
  exit 1
fi

step "Switching to base branch ${base_branch}"
run_cmd git switch "$base_branch"

step "Creating workshop branch ${branch_name}"
run_cmd git switch -c "$branch_name"

step "Removing facilitator files from participant base branch"
run_cmd git rm -r workshop

step "Creating commit"
if (( dry_run )); then
  printf '[dry-run] git commit -m "Remove workshop facilitator files from participant base branch"\n'
else
  git commit -m "$(cat <<'EOF'
Remove workshop facilitator files from participant base branch
EOF
)"
fi

printf '\nWorkshop branch ready: %s\n' "$branch_name"
printf 'Participants can now create their own branches from this base branch.\n'
