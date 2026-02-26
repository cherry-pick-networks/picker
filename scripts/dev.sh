#!/usr/bin/env bash
# Dev server, tests, or any command with same DB env (requires pass and picker/postgres).
# Usage: ./scripts/dev.sh [test | <command...>]
#   No args → dev server (watch).  test → deno test -A.  Else → exec "$@".
set -e
export PG_PASSWORD=$(pass show picker/postgres)
export PG_HOST=${PG_HOST:-localhost}
export PG_PORT=${PG_PORT:-5432}
export PG_USER=${PG_USER:-postgres}
export PG_DATABASE=${PG_DATABASE:-picker}
if [[ $# -eq 0 ]]; then
  exec deno run -A --watch main.ts
elif [[ "${1:-}" == "test" ]]; then
  exec deno test -A
else
  exec "$@"
fi
