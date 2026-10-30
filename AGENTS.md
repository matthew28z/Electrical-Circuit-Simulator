# AGENTS.md — Mandatory Agent Constraints

## 1. File Placement & Tree Rules (Strict Invariants)
- **Directory boundaries are strict:**
  - Route calculation & math engine logic strictly into `src/app/calculation/`.
  - Route runtime, traversal, and application logic into `src/app/logic/`.
  - Never introduce new root-level folders or dump helper files outside their domain directory.
- **Protected files (DO NOT MODIFY without explicit instruction):**
  - `src/app/logic/menu.ts`
  - Global state schemas, shared lifecycle managers, and state mutation signatures.
- **Modular extension over mutation:** If new functionality is required, create a discrete submodule in the matching domain directory and import it where needed. Do not inject inline helper logic into existing core routines.

## 2. Code Style & Implementation Protocol
- **Strictly inspect and match patterns before writing:**
  - Before writing or editing any code, read `src/app/logic/paths.ts`, `src/app/logic/current.ts`, and the files in `src/app/calculation/`.
  - Mirror existing naming conventions, data structures, return patterns, and error handling seen in those files.
- **State contracts:** Treat existing state objects and global arrays as immutable interfaces. Do not modify property signatures, data shapes, or dispatch flows.

## 3. Tool Execution & Build Verification
- **Test execution rule:** NEVER invoke `npm test` or run the entire test suite. Execute only targeted tests covering the changed files (e.g., `npx vitest run path/to/target.test.ts`).
- **Pre-completion gate:**
  - Run `npx tsc --noEmit` to verify type safety.
  - If running `npm run build`, ensure artifacts in `dist/` are neither committed nor staged. Never use `git add .`—stage only explicitly modified source files.
## 4. Git & Branching
- Never commit directly to `main` or `master`.
- Work exclusively inside a dedicated feature branch created for the task.