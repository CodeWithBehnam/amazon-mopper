---
name: lint-after-file-change
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx)$
action: warn
---

**TypeScript Check Required**

You just edited a TypeScript file. After completing your current batch of edits, you MUST run a type check:

```bash
bunx tsc --noEmit
```

If there are type errors:
1. Read the error output carefully
2. Fix each error in the relevant files
3. Re-run `bunx tsc --noEmit` to verify all errors are resolved
4. Only then continue with the next task

Do NOT skip this step or defer it to later.
