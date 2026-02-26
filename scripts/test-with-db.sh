#!/usr/bin/env bash
# Run tests with same DB env as scripts/dev.sh (requires pass and picker/postgres).
set -e
export PG_PASSWORD=$(pass show picker/postgres)
export PG_HOST=${PG_HOST:-localhost}
export PG_PORT=${PG_PORT:-5432}
export PG_USER=${PG_USER:-postgres}
export PG_DATABASE=${PG_DATABASE:-picker}
exec deno test -A
