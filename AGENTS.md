# Instructions For Autonomous Agents

## 1. Style & Architecture Reference
- Before writing or refactoring code, inspect these reference files to mirror the project's architecture and coding conventions:
  - `src/app/logic/paths.ts`
  - `src/app/logic/current.ts`
  - All files in `src/app/calculation/`
- Read all existing documentation (even if draft/incomplete) to align with existing data-handling patterns.

## 2. Invariants & Protected Scope
- **DO NOT modify core architecture files** (e.g., `src/app/logic/menu.ts`) unless explicitly instructed. Keep changes strictly within the assigned task's scope or introduce new modular files.
- **DO NOT alter global state contracts:** Do not change how global arrays or shared state objects operate, as the broader codebase depends on their existing interface and lifecycle.
- Maintain the established directory structure. Place new modules into their respective domain directories (`logic/`, `calculation/`, etc.).

## 3. Testing & Verification Rules
- Do NOT run the entire test suite (`npm test`) automatically.
- Only run targeted tests directly relevant to the modified files.
- New code must never break existing test suites unless the prompt explicitly orders a contract update.
- Always verify changes locally before finishing:
  - Run `npx tsc --noEmit` to ensure zero TypeScript errors.
  - Run `npm run build` to verify clean compilation.

## 4. Git & Branching
- Always create and commit changes to a dedicated feature branch. Never commit directly to `main` unless instructed.