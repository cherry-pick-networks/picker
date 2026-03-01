#!/usr/bin/env bash
# One-time setup for tips-derived workflow (Phase 10).
# Run from repo root: bash shared/context/scripts/setup.sh
# Prerequisites: bash, git, (optional) npx for cc-safe.

set -e
REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$REPO_ROOT"

echo "=== Setup (Phase 10 tips) ==="

# 1. Status line: ensure script is executable
SCRIPT_DIR="shared/context/scripts"
if [[ -f "$SCRIPT_DIR/context-bar.sh" ]]; then
  chmod +x "$SCRIPT_DIR/context-bar.sh"
  echo "[ok] context-bar.sh executable"
else
  echo "[skip] context-bar.sh not found"
fi

# 2. Approved-commands audit (cc-safe): document only; run manually when needed
echo "[info] Audit approved commands periodically (e.g. npx cc-safe .). See context.md §7."

# 3. Handoff: ensure template exists
HANDOFF="shared/context/handoff.md"
if [[ -f "$HANDOFF" ]]; then
  echo "[ok] handoff template at $HANDOFF"
else
  echo "[skip] $HANDOFF not found (create from template if needed)"
fi

echo "=== Done. Add to shell profile if desired: source $SCRIPT_DIR/context-bar.sh (then use _context_bar in PS1). ==="
