---
name: bump-version-after-build
enabled: true
event: bash
pattern: bun\s+run\s+build|vite\s+build|bun\s+build
action: warn
---

**Version Bump Required After Build**

After this build completes successfully, you MUST bump the version. Follow these steps:

1. **Check if the version was already bumped** in this session by comparing `package.json` version with the last git-committed version:
   ```bash
   git diff HEAD -- package.json | grep '"version"'
   ```
   If the version was already changed, skip bumping.

2. **Determine the bump type** by reviewing what changed since the last version bump:
   - `major` - Breaking changes, large rewrites, API changes
   - `minor` - New features, new badges, new UI components, new permissions
   - `patch` - Bug fixes, selector updates, style tweaks, refactors

3. **Run the appropriate bump command:**
   - `bun run bump` (patch - default for fixes/tweaks)
   - `bun run bump:minor` (new features)
   - `bun run bump:major` (breaking changes)

This updates both `package.json` and `manifest.config.ts` automatically.
