---
name: start-multi-mission
description: Prepare two or more independent development missions as separate Git branches, worktrees, interactive Codex or Claude Code sessions, and pull requests. Use when the user wants to converse with each agent session independently or review and merge each task through its own PR. Do not use when one coordinating agent should combine all work into a single integration branch; use parallel-feature-development for that workflow.
---

# Start Multiple Missions

Create long-lived mission worktrees that the user owns as separate conversations and pull requests. Do not spawn implementation subagents, create an integration branch, or cherry-pick mission commits into a combined result.

Read [references/proposal-template.md](references/proposal-template.md) before requesting creation approval. Read [references/tool-adapters.md](references/tool-adapters.md) before preparing session commands or launching tmux. Read [references/independent-pr-workflow.md](references/independent-pr-workflow.md) when missions may touch related areas or one PR may merge before another.

## 1. Define Independent Missions

1. Read the applicable repository guidance and `docs/missions/README.md`.
2. Restate each requested outcome as a separate mission with a short title, lowercase kebab-case slug, scope, non-goals, and provisional acceptance properties.
3. Build a dependency and conflict map. Include shared components, router files, API schema, configuration, lockfiles, and generated files.
4. Create separate missions only when each task can be reviewed, merged, reverted, and continued without another mission's unmerged commits.
5. Move shared prerequisites into an earlier standalone mission or keep tightly coupled work in one mission. Do not hide stacked dependencies behind nominally independent PRs.
6. Choose and record one PR target branch and one base ref. Ordinarily use the same local target branch for both. The target must already contain `start-multi-mission`, `start-mission`, and the mission templates; land that infrastructure first instead of including it incidentally in every feature PR. Explain any deliberate base difference and do not call dependent or stacked work independent.
7. Propose the batch ID, mission IDs, titles, branches, worktree paths, ownership boundaries, target branch, and session host.
8. Obtain explicit user approval before creating branches, worktrees, mission documents, or interactive sessions.

Use batch IDs and mission slugs containing only lowercase letters, digits, and hyphens. Keep each at most 48 characters.

## 2. Create Branches And Worktrees

After approval, run from the main worktree:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs create \
  --batch 20260806-event-improvements \
  --date 20260806 \
  --base main \
  --target main \
  --mission 'event-filter=Filter events by status and tag' \
  --mission 'event-export=Export an event as iCalendar'
```

The manager creates one branch and worktree per mission:

```text
mission/20260806-event-filter
.mission-worktrees/20260806-event-improvements/20260806-event-filter
```

It runs the existing `start-mission` initializer in each worktree, so each branch receives its own `docs/missions/<mission-id>/` document set. It never creates issues, commits, pushes, PRs, or an integration branch.

After creation, seed each Mission Brief with only the approved initial intent, scope boundary, target branch, and context pointers. Leave conceptual-plan and test-design decisions to that mission's interactive session.

Do not copy ignored credentials or share `node_modules`. Each session installs its own dependencies when needed.

## 3. Start Independent Sessions

Print session commands by default:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs launch \
  --batch 20260806-event-improvements \
  --agent codex
```

The user opens each command in a separate terminal or editor session. Every session starts in its assigned worktree and resumes the existing mission through `start-mission`. The user can then discuss scope, the conceptual plan, tests, implementation, and PR readiness with that session independently.

When the user explicitly approves automatic local session startup, create one tmux window per mission:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs launch \
  --batch 20260806-event-improvements \
  --agent claude \
  --tmux \
  --yes
```

Do not launch nested agent CLIs without this separate approval. Do not use internal subagents as a substitute for the interactive sessions.

## 4. Let Each Mission Own Its PR

Each session must:

- Work only in its mission worktree and branch.
- Treat its Mission Brief as the source of truth.
- Obtain its own conceptual-plan and test-design approvals from the user.
- Commit only its mission implementation and mission documents.
- Ask before creating an issue, pushing, or opening its PR.
- Target the batch manifest's `targetBranch`.
- Produce its own Merge-Readiness Pack and report its own risks.

One mission must not merge, rebase, cherry-pick, or edit another mission branch. The batch coordinator monitors boundaries but does not integrate implementation commits.

## 5. Inspect The Batch

Inspect local branch and worktree state with:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs status \
  --batch 20260806-event-improvements
```

After the user permits remote read access and GitHub CLI authentication is available, include PR state with `--github`:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs status \
  --batch 20260806-event-improvements \
  --github
```

Report every mission separately: branch, worktree, dirty state, commits from the common base, Brief presence, and PR URL/state when requested.

If one PR merges first, the remaining session decides how to update its branch and revalidates its own acceptance properties. Do not silently rewrite another mission's history.

## 6. Clean Up Per Mission

Close the interactive session and require a clean worktree first. Confirm that the PR was merged or that the user explicitly abandoned the mission. Then ask for cleanup approval and run:

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs cleanup \
  --batch 20260806-event-improvements \
  --mission 20260806-event-filter \
  --require-merged \
  --yes
```

Omit `--mission` only when the user explicitly approves cleanup of the entire batch. Cleanup preserves mission branches and refuses dirty worktrees. Never infer cleanup approval from PR approval or merge completion.
