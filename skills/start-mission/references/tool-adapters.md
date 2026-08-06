# Tool Adapter Reference

The workflow in `SKILL.md` is host-neutral. Map discovery, consultation gates, parallel execution, and outward actions to the active product without changing the shared governance rules.

## Codex

- Discover the skill through `.agents/skills/start-mission`, which points to the canonical directory under `skills/`.
- Invoke it explicitly as `$start-mission`, or request a governed mission in natural language.
- Use Codex plan/user-input controls for the conceptual-plan and test-design Consultation Request Packs. A plan-control transition is not itself approval; require an affirmative user response to the proposed decision.
- Use Codex subagents only through a referenced skill that calls for them, such as `$parallel-feature-development`. Keep the coordinating conversation responsible for the Brief and user decisions.
- Read applicable `AGENTS.md` files before planning or editing. Treat `agents/openai.yaml` as optional UI metadata, not part of the workflow contract.

## Claude Code

- Discover the skill through `.claude/skills/start-mission`, which points to the same canonical directory under `skills/`.
- Invoke it explicitly as `/start-mission`, or request a governed mission in natural language.
- Use plan mode and `AskUserQuestion` as appropriate for the two Consultation Request Packs. Exiting plan mode is not sufficient when the user has not affirmatively approved the specific conceptual plan or test design.
- Use Claude Code subagents only through a referenced skill that calls for them, such as `/parallel-feature-development`. Keep the coordinating conversation responsible for the Brief and user decisions.
- Read applicable `CLAUDE.md` and `AGENTS.md` files before planning or editing. Verify the working directory explicitly when hooks or scripts run from a linked worktree.

## GitHub And Git Operations

- Use an available GitHub connector or `gh` CLI to create an issue or pull request. Before invoking either, show the exact title and body to the user and obtain explicit approval.
- Use normal Git tooling to inspect state and create the agreed mission branch. Do not hide, stash, discard, or commit pre-existing user changes to satisfy the initializer's clean-tree requirement.
- Treat push, pull-request creation, and branch/worktree removal as separate outward or destructive actions. Ask immediately before each action and state the exact branch, remote, repository, or paths affected.
- Use `skills/start-mission/scripts/init-mission.mjs` from the repository root in every host. Do not reimplement its template substitution with host editing tools.

## Shared Rules

- Keep the canonical implementation in `skills/start-mission`; do not create product-specific copies.
- Preserve continuation detection and both mandatory consultation gates regardless of the host's planning interface.
- Record approved decisions in the Mission Brief immediately. Chat or plan-mode state is not the source of truth.
- Never let a host permission grant substitute for user approval of an issue, push, pull request, or cleanup.
