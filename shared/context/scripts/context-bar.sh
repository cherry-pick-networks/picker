#!/usr/bin/env bash
# Status line for AI/tooling context: directory, git, optional token/model info.
# Source or run from shell; integrate with status line (e.g. tmux, or print before prompt).
# Usage: source shared/context/scripts/context-bar.sh   OR   ./context-bar.sh

_context_bar() {
  local dir="${PWD##*/}"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" || branch=""
  local status=""
  [[ -n "$(git status --porcelain 2>/dev/null)" ]] && status=" *"
  printf "[%s%s%s] " "$dir" "${branch:+ $branch}" "$status"
}

# If executed, print once; if sourced, define function only (call _context_bar when needed).
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  _context_bar
fi
