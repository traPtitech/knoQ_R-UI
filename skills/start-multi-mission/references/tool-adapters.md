# Tool Adapter Reference

Keep branch, worktree, Mission Brief, PR, and approval behavior identical across hosts. Product-specific commands affect only how the user opens an interactive session.

## Codex

- Discover the skill through `.agents/skills/start-multi-mission`.
- Invoke it explicitly as `$start-multi-mission`, or request separate interactive missions and PRs in natural language.
- Start a prepared mission with `codex -C <absolute-worktree-path> '<prompt>'`.
- The generated prompt invokes `$start-mission` and tells the session to resume the existing mission instead of creating another branch.
- Use Codex CLI commands by default because the manager can generate and verify them deterministically.
- In a Codex UI that supports local workspaces, open each prepared worktree as a separate workspace, start a separate conversation, and invoke `$start-mission` with the mission ID. The manager does not automate UI workspace creation.
- Use a separate terminal, tmux window, or Codex UI workspace for each worktree. Do not replace these user-visible conversations with Codex subagents.

## Claude Code

- Discover the skill through `.claude/skills/start-multi-mission`.
- Invoke it explicitly as `/start-multi-mission`, or request separate interactive missions and PRs in natural language.
- Start a prepared mission by changing to its worktree and running `claude --name <mission-id> '<prompt>'`.
- The generated prompt invokes `/start-mission` and tells the session to resume the existing mission.
- Do not use Claude Code's `--worktree` option after this skill has prepared worktrees. The manager owns the exact branch names, paths, and mission documents.

## tmux

- `launch --tmux --yes` creates one detached tmux session named `knoq-<batch-id>` and one window per mission.
- The same external tmux layout is used for Codex and Claude Code so batch behavior remains host-neutral.
- Attach with the command printed by the manager. Switch windows to converse with each mission independently.
- Exit the agent process in a window before cleaning up its worktree.

## Shared Rules

- Printing commands does not start sessions and does not require launch approval beyond worktree creation.
- Starting tmux windows launches multiple billable agent sessions. Present the agent, session name, worktrees, and mission count immediately before requesting approval.
- Never add permission-bypass flags to generated Codex or Claude commands.
- Each session obtains its own approval before issue creation, push, or PR creation.
