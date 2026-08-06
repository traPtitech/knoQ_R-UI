---
name: parallel-feature-development
description: Coordinate two or more independent feature implementations in parallel by assigning supported subagents or agent-team workers to isolated Git worktrees and branches, then reviewing and integrating their commits. Use when a user asks to implement multiple features, issues, or UI changes concurrently in the knoQ_R-UI repository, especially when simultaneous edits in one checkout could conflict. Do not use for a single feature, tightly coupled changes, or read-only parallel research.
---

# Parallel Feature Development

Implement independent features concurrently without allowing agents to edit the same checkout. Keep planning, integration, destructive operations, and user communication in the coordinating agent.

## Preconditions

1. Read the applicable repository guidance, including `AGENTS.md`, `CLAUDE.md`, and `docs/conventions.md` when present, before planning.
2. Run from the repository's main worktree, not from a linked worktree.
3. Require a clean working tree, including untracked files. Never stash, commit, discard, or copy existing user changes automatically.
4. Require at least two implementation tasks that can make meaningful progress independently.
5. Use the host agent's supported parallel-worker mechanism. If parallel workers are unavailable, create the worktrees only after approval and tell the user how to open one agent session in each worktree. Do not launch nested agent CLI processes automatically.

## Choose The Isolation Level

Use Git worktrees by default. Read [references/tool-adapters.md](references/tool-adapters.md) before delegation to map this workflow to the current agent host. Read [references/isolation-strategies.md](references/isolation-strategies.md) when the user requests containers, Codespaces, cloud execution, or stronger isolation.

- Use worktrees for normal Vue, TypeScript, UnoCSS, test, and documentation changes.
- Add a container per worktree only when native dependencies, untrusted commands, conflicting toolchains, or service isolation justify the overhead.
- Use Codespaces or a managed agent cloud only when the user asks for remote execution or local resource constraints make local work impractical. Obtain approval before creating billable or remote resources.

Containers do not replace source isolation. Never bind-mount one writable checkout into multiple agents.

## Phase 1: Plan Without Editing

1. Restate each requested feature as a bounded deliverable with acceptance criteria.
2. Build a dependency graph and a file-ownership map. Include likely pages, feature directories, shared components, router files, API schema, tests, and configuration.
3. Move shared prerequisites into an explicit serial phase. Do not assign the same writable file to two agents.
4. Identify high-conflict files such as `src/router/index.ts`, `uno.config.ts`, `package.json`, lockfiles, generated API schema, and shared UI components. Reserve them for the coordinating agent unless one task has exclusive ownership.
5. Inventory ignored local files required for development. Do not copy `.env` files, credentials, or other ignored data into worktrees without explicit approval.
6. Propose the base ref, task slugs, branch names, worktree paths, ownership map, serial prerequisites, integration order, and validation commands.
7. Ask for user approval before creating worktrees or spawning implementation agents.

Use lowercase task slugs containing only letters, digits, and hyphens. Keep each slug at most 48 characters.

## Phase 2: Create Isolated Worktrees

After approval, choose a run ID such as `20260806-153000` and run:

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs create \
  --run 20260806-153000 \
  --base HEAD \
  --task event-pagination \
  --task profile-editor \
  --task room-search \
  --task integration
```

The script creates:

```text
.agent-worktrees/<run-id>/<task>
agent/<run-id>/<task>
```

It also writes an ignored manifest under `.agent-worktrees/<run-id>/manifest.json`. Treat the manifest as runtime state, not a repository artifact.

Install dependencies separately in each implementation worktree with `npm ci`. Run installations concurrently only when network and disk capacity allow it. Do not share or symlink `node_modules`; Vite and other tools may write caches inside it.

## Phase 3: Delegate Implementation

Start one supported parallel worker per independent implementation task, up to the available concurrency limit. Keep one coordinator slot available. The coordinating conversation must retain the user's context; do not delegate this entire workflow to a single forked worker. Pass each worker a prompt containing all of the following:

- The absolute worktree path and expected branch.
- The feature requirements and acceptance criteria.
- The files and directories it owns.
- Shared files it must not modify.
- The applicable repository instructions and verification commands.
- A unique development-server port when browser validation is needed.
- A requirement to report unexpected dependencies or ownership conflicts before editing outside its scope.
- A prohibition on pushing, merging, rebasing, deleting worktrees, or editing another task's worktree.
- A requirement to commit its completed, verified implementation on its assigned branch.

Use this prompt structure:

```text
Work only in <absolute-worktree-path> on branch <branch>.
Confirm the repository root and branch before editing.

Deliverable: <bounded feature>
Acceptance criteria: <criteria>
Owned paths: <paths>
Do not edit: <shared or other-agent paths>

Read the applicable AGENTS.md and CLAUDE.md files and docs/conventions.md. Install dependencies with npm ci if needed.
Run focused tests, npm run lint, and npm run type-check. Run browser validation on port <port> when the feature changes visible UI.
If work requires a file outside the owned paths, stop that part and report the dependency to the coordinating agent.
Commit the verified implementation. Do not push, merge, rebase, or manage worktrees.

Return the commit SHA, changed files, validation results, and remaining risks.
```

While agents run, route requirement changes only to the affected agent. If two tasks discover a shared prerequisite, pause those edits and implement the prerequisite serially before resuming from a common base.

## Phase 4: Review Agent Results

Wait for all implementation agents, then inspect status with:

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs status \
  --run <run-id>
```

For every task:

1. Verify the reported commit exists on the expected branch and descends from the recorded base commit.
2. Inspect `git diff --stat <base>..<branch>` and `git diff <base>..<branch>`.
3. Confirm the worktree is clean and changed files match the ownership map.
4. Confirm focused tests actually exercised the changed behavior.
5. Ask the assigned worker to repair incomplete or out-of-scope work in its own worktree.

Do not integrate a task merely because it has a commit.

## Phase 5: Integrate Serially

Use the dedicated integration worktree and branch. Cherry-pick approved task commits in dependency order. Resolve integration conflicts only in that worktree; never make agents race on a conflict.

After integration, run:

```bash
npm ci
npm run lint
npm run type-check
npm exec -- vitest run
npm run build
```

For user-visible changes, start Vite on an unused port and validate the integrated behavior in a browser. Add or update focused tests when the implementation changes behavior that can be covered reliably.

If integration exposes an architectural mismatch, fix it on the integration branch or send a narrowly scoped follow-up to one assigned worker. Do not silently broaden another worker's ownership.

## Phase 6: Report And Hand Off

Report:

- Base commit and integration branch.
- One row per task with branch, commit, changed files, and validation result.
- Integration validation results.
- Conflicts resolved and decisions made.
- Remaining risks or manual checks.

Do not merge into the user's target branch, push branches, open pull requests, or remove worktrees until the user explicitly approves those operations.

After cleanup approval, run:

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs cleanup \
  --run <run-id> \
  --yes
```

Cleanup refuses dirty worktrees and preserves all task branches.
