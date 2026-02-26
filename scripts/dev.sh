#!/usr/bin/env bash
# Dev server or tests with same DB env (requires pass and picker/postgres).
set -e
export PG_PASSWORD=$(pass show picker/postgres)
export PG_HOST=${PG_HOST:-localhost}
export PG_PORT=${PG_PORT:-5432}
export PG_USER=${PG_USER:-postgres}
export PG_DATABASE=${PG_DATABASE:-picker}
if [[ "${1:-}" == "test" ]]; then
  exec deno test -A
else
  exec deno run -A --watch main.ts
fi
