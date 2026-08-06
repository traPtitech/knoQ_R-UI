# Tool Adapter Reference

The workflow in `SKILL.md` is host-neutral. Use this reference to map skill discovery, invocation, and parallel-worker controls to the active agent product.

## Codex

- Discover the skill through `.agents/skills/parallel-feature-development`, which is a symlink to the canonical directory under `skills/`.
- Invoke it explicitly as `$parallel-feature-development`, or request the workflow in natural language.
- Use Codex subagents as the parallel workers. Keep the main conversation as coordinator, and do not launch nested `codex exec` processes.
- Use the host's subagent controls to start, steer, wait for, and follow up with workers.
- Read applicable `AGENTS.md` files before planning or editing.
- Treat `agents/openai.yaml` as optional Codex UI metadata. It is not part of the shared workflow contract.

## Claude Code

- Discover the skill through `.claude/skills/parallel-feature-development`, which is a symlink to the same canonical directory under `skills/`.
- Invoke it explicitly as `/parallel-feature-development`, or request the workflow in natural language.
- Use Claude Code subagents for independent tasks. Use agent teams only when workers need peer-to-peer coordination and the feature is worth the additional coordination cost.
- Keep the main conversation as coordinator. Do not add `context: fork` to this skill because the coordinator must retain user context and manage multiple workers.
- Read applicable `CLAUDE.md` and `AGENTS.md` files before planning or editing.
- When using hooks or scripts from a linked worktree, verify their working directory explicitly instead of assuming they run from that worktree.

## Shared Rules

- Keep the canonical implementation in `skills/parallel-feature-development`; do not edit separate product-specific copies.
- Do not add broad permission grants or product-specific tool restrictions to the shared `SKILL.md` frontmatter.
- Use the canonical `skills/parallel-feature-development/scripts/worktree-manager.mjs` path in commands so instructions behave the same in either host.
- Preserve the approval boundaries, worktree ownership rules, integration review, and cleanup checks regardless of the host product.
