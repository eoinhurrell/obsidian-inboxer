default: build

dev:
    bun run dev

build:
    bun run build

patch:
    just _release patch

minor:
    just _release minor

major:
    just _release major

[private]
_release bump:
    #!/usr/bin/env bash
    set -eo pipefail
    NEW_TAG=$(npm version "{{bump}}")
    bun run build
    git push
    git push origin "$NEW_TAG"
    echo "Released ${NEW_TAG}"
