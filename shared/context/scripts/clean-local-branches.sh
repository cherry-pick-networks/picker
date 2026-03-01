#!/usr/bin/env sh
# Leave only main locally and sync with origin/main.
# Run from repo root: sh shared/context/scripts/clean-local-branches.sh
# Steps: checkout main, fetch + reset to origin/main, delete other local branches.

set -e
cd "$(git rev-parse --show-toplevel)"
git checkout main
git fetch origin
git reset --hard origin/main
git for-each-ref --format="%(refname:short)" refs/heads/ | while read b; do
  [ "$b" = main ] && continue
  git branch -D "$b"
done
