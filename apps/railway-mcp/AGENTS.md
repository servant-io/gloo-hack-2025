## Planning & Progress Logs

Every initiative must tie to a declared objective. Create or update a Markdown log in `plan_and_progress/` (e.g., `plan_and_progress/auth-refresh.md`) before writing code. Capture the goal, high-level steps, and "done" criteria, then record outcomes as work progresses so the next contributor has context. General initiatives can use the `_template.md` whereas specific features can use the `_feature-template.md` as necessary.

## Status & Completion

Each `plan_and_progress/*.md` should clearly communicate where the work stands and when it's done.

- **Status field**: Add near the top of the doc.
  - Allowed: `Planned`, `In Progress`, `Blocked`, `Completed`, `Archived`.
- **Done criteria**: List objective checks that must pass (e.g., "No service-role usage", "RLS enforced", "Typecheck passes").
- **Verification**: Note commands run (lint/typecheck/build) and a brief result. Link to logs if applicable.
- **Outcomes**: Summarize what changed and the impact. Include links to PRs/commits.
- **Follow-ups**: Track any deferred items or improvements.

Completion checklist:

- Status is set to `Completed` with date.
- All items in Done criteria are satisfied.
- Outcomes and Verification sections filled in.
- Docs/config updated as needed (e.g., README, env guidance).

## Archiving Completed Items

When the `plan_and_progress/` folder gets noisy (10+ items), move stale `Completed` items to `plan_and_progress/archive/`. Prefix filenames with the completion date, e.g., `2025-09-21-supabase-clerk-alignment.md`. Keep `In Progress` items in the root folder for visibility.

## Coding Style & Naming Conventions

Prettier 3 enforces two-space indentation and double quotes. ESLint configs are strict; avoid disabling rules without alignment. Use `camelCase` for variables/functions, `PascalCase` for React components, and `kebab-case` for route segment folders in `app/`. Keep UI primitives generic in `packages/ui`; app-specific styles belong in `apps/web`.

## React useEffect Guidelines

**Before using 'useEffect, read:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

Common cases where 'useEffect is NOT needed:

- Transforming data for rendering (use variables or useMemo instead)
- Handling user events (use event handlers instead)
- Resetting state when props change (use key prop or calculate during render)
  -Updating state based on props/state changes (calculate during render)

• Only use 'useEffect for:

- Synchronizing with external systems (APIs, DOM, third-party libraries)
- Cleanup that must happen when component unmounts
