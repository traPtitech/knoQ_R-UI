# Creation Proposal Template

Use this structure before requesting approval. Fill it with repository evidence rather than treating the examples as fixed values.

## Batch

- Batch ID and purpose
- Local target branch and base ref
- Session host: Codex CLI, Codex UI, or Claude Code
- Launch mode: printed commands by default; tmux only with separate approval

## Missions

For every mission, state:

- ID, title, branch, and worktree path
- Outcome and ownership boundary
- Non-goals
- Provisional acceptance properties and likely evidence
- Files or subsystems likely to change
- Its independently reviewable, mergeable, revertible, and resumable rationale

## Dependency And Conflict Map

Call out shared components, routes, API schemas, configuration, lockfiles, generated files, and dependencies. Resolve shared prerequisites before calling the missions independent.

## Approval Request

Name the exact branches, worktree root, Mission documents, and session commands that will be prepared. Explicitly say that no issue, commit, push, PR, or interactive session will be created yet. Ask for one clear approval to run `create`; request tmux launch separately later.
