#!/usr/bin/env bash
# Stop hook: runs vue-tsc once per task completion if source files were edited.
# Exit 2 with stderr sends type errors back to the model so it can fix them
# before the turn ends. stop_hook_active guards against infinite loops.
set -uo pipefail

INPUT="$(cat)"
STOP_HOOK_ACTIVE="$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false')"
SESSION_ID="$(printf '%s' "$INPUT" | jq -r '.session_id // "default"')"

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Only run vue-tsc if this session edited source files (sentinel set by format.sh).
SENTINEL="/tmp/claude-knoq-dirty.${SESSION_ID}"
[ -f "$SENTINEL" ] || exit 0
rm -f "$SENTINEL"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

cd "$PROJECT_DIR" || exit 0

OUT="$(npx --no-install vue-tsc --noEmit 2>&1)"
EXIT=$?

if [ $EXIT -ne 0 ]; then
  {
    echo "vue-tsc reported type errors. Please fix them before finishing:"
    echo "$OUT"
  } >&2
  exit 2
fi

exit 0
