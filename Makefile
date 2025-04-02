.PHONY: dev build minor major

# Default target
all: build

# Development using Bun
dev:
	bun run dev

# Build the plugin
build:
	bun run build

# Bump patch version, build, and create release
patch:
	npm version patch
	bun run build
	sleep 1
	git push && git push origin $(shell git describe --tags --abbrev=0)
	@echo "Patch version released"

# Bump minor version, build, and create release
minor:
	npm version minor
	bun run build
	sleep 1
	git push && git push origin $(shell git describe --tags --abbrev=0)
	@echo "Minor version released"

# Bump major version, build, and create release
major:
	npm version major
	bun run build
	sleep 1
	git push && git push origin $(shell git describe --tags --abbrev=0)
	@echo "Major version released"

# Help command
help:
	@echo "Available commands:"
	@echo "  make dev    - Run development server with Bun"
	@echo "  make build  - Build the plugin"
	@echo "  make patch  - Bump patch version, build, and release"
	@echo "  make minor  - Bump minor version, build, and release"
	@echo "  make major  - Bump major version, build, and release"
