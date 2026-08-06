---
name: start-mission
description: Start or resume a governed knoQ_R-UI development mission from scope alignment through evidence-based closeout. Use for substantial features, bug fixes, refactors, or investigations that need a Mission Brief, explicit conceptual-plan and test-design consultations, continuity across sessions, and a Merge-Readiness Pack. Do not use for questions, reviews, or trivial one-file edits that do not warrant mission governance.
---

# Start Mission

Coordinate one substantial development task through Mission Engineering, Context Engineering, and evidence-based closeout. Keep `docs/missions/<mission-id>/mission-brief.md` as the current source of truth. Record outcomes and reasons, not a transcript of exploration.

Read [references/tool-adapters.md](references/tool-adapters.md) before interacting with the user or using host-specific controls. Read `docs/missions/README.md` and its linked guides when present; they define the repository's mission document semantics.

## 1. Check Scope And Continuation

1. Read the applicable `AGENTS.md`, `CLAUDE.md`, and repository guidance before planning or editing.
2. Restate the request as a testable intent with explicit in-scope and out-of-scope boundaries. Ask only the minimum questions needed to remove material ambiguity.
3. Decide whether mission governance is proportional. Handle a question, review, or trivial isolated edit without creating a mission.
4. Search `docs/missions/*/mission-brief.md` for the request, referenced issue, branch, or mission ID. Also inspect the current `mission/*` branch, if any.
5. If this is a continuation, do not create another issue, branch, or document set. Verify the current branch matches the Brief, then read the Brief and `handoff.md`, load only their active context pointers, refresh stale current-state fields, and resume at the first incomplete gate.

## 2. Establish The Mission

For a new mission:

1. Choose `YYYYMMDD-<short-slug>`. Use the current repository-local date and a lowercase kebab-case slug of at most 48 characters.
2. Decide with the user whether GitHub tracking is needed. If it is, prepare an issue draft containing motivation, scope, non-goals, and provisional acceptance properties. Present the exact title and body, and create nothing until the user explicitly approves that draft. Record the resulting issue reference in the Brief.
3. Require a clean checkout. Create and enter `mission/<mission-id>` from the agreed base. If that branch already exists, investigate whether this is a continuation instead of overwriting it.
4. Initialize the document set only after entering the mission branch:

```bash
node skills/start-mission/scripts/init-mission.mjs \
  --id 20260806-example-mission \
  --title 'Example mission'
```

The initializer only copies and fills repository templates. It deliberately refuses dirty, detached, non-root, wrong-branch, malformed-ID, missing-template, missing-token, and existing-target states. It never creates a branch, issue, commit, or network action.

5. Fill the Brief's intent, must/should constraints, non-goals, provisional property-based acceptance conditions, task-specific autonomy boundary, and issue reference. Do not prescribe detailed implementation steps.

## 3. Select Context Deliberately

Start from the smallest working set:

1. Pin only always-applicable repository guidance and sources necessary to make the next decision.
2. If a context-card index exists, select cards by `load_when`, tags, priority, retirement status, and source pointer. Do not load every card or copy card contents into the Brief.
3. Add file, card, issue, or design-document pointers to the Brief with their must/should strength and the question each source answers.
4. Treat newly discovered context as a change to the working set. Remove or de-prioritize unused context, preserve source pointers when compressing it, and keep exploration logs outside the main narrative. Roll only conclusions, reasons, and evidence pointers back into the Brief.

## 4. Consult On The Conceptual Plan

This gate is mandatory before implementation.

1. Compare at least two viable approaches when a meaningful alternative exists. Define the coarse approach, checkpoints, and slow-mode triggers without turning the Brief into a step-by-step implementation script.
2. Present a Consultation Request Pack containing:
   - decision requested;
   - why the decision matters now;
   - options and tradeoffs;
   - recommendation;
   - proposed conceptual plan and acceptance properties.
3. Obtain explicit user approval. Do not begin implementation before approval.
4. Immediately write the approved plan, acceptance properties, decision rationale, `last_updated`, and changelog entry into the Brief.
5. If the approved plan contains at least two genuinely independent implementation tasks, follow [parallel-feature-development](../parallel-feature-development/SKILL.md) after plan approval. Do not reproduce its worktree, delegation, integration, or cleanup workflow here.

## 5. Consult On Test Design

This gate is mandatory before full implementation.

1. Map every acceptance property or invariant to a focused test method and expected machine-readable evidence. Include relevant failure paths and regression boundaries.
2. Present the proposed mapping as a Consultation Request Pack, with alternatives and a recommendation where test strategy has meaningful tradeoffs.
3. Obtain explicit user approval before writing the full implementation. Small read-only investigations and disposable probes are allowed; product changes that pre-empt the test-design decision are not.
4. Roll the approved mapping and rationale into the Brief before continuing. If the user changes a property or test boundary, update the Brief first.

## 6. Implement And Keep The Brief Fresh

Work autonomously inside the approved plan and autonomy envelope. Run focused checks early, then broaden validation according to risk and repository guidance.

Update the Brief immediately when scope, constraints, acceptance properties, context pointers, checkpoints, or approved decisions change. Record the decision and why it changed. Stop for another Consultation Request Pack when a slow-mode trigger fires or work would cross the autonomy boundary.

When a session, coordinator, or implementation owner changes, update `handoff.md` with only the minimum reproducible state: completed work, current work, next action, effective decisions and reasons, active context pointers with strength and provenance, blockers, and validation state. Keep the Brief and handoff consistent; do not paste chat transcripts or raw exploration logs.

## 7. Close With Evidence

Complete `merge-rationale.md` as the Merge-Readiness Pack (MRPack):

- summarize what changed, what did not, and why;
- map each acceptance property to its test, evidence pointer, and status;
- identify important changed areas and compatibility impact;
- record commands and results, source commit, environment, and generation time;
- summarize exploration conclusions and provenance without raw logs;
- record consultations, approvals, deviations, unresolved risks, and any coded non-merge root cause.

Validate the final implementation and mission documents. Keep failed or unavailable checks visible. Update the handoff if any work remains; otherwise mark the Brief and MRPack consistently ready for review.

Report the branch, mission document paths, implementation summary, validation evidence, and remaining risks. A local commit does not authorize an outward action. Present the exact proposed action and obtain separate explicit user approval before each push, pull-request creation, or branch/worktree cleanup. Never infer cleanup approval from implementation or merge approval.
