# Independent Pull Request Workflow

## Independence Test

A mission is independent only when it can be reviewed, merged, reverted, and resumed from the shared base without requiring another mission's unmerged implementation.

Treat these as dependency signals:

- Two tasks need the same new shared component or schema change.
- One task imports a symbol introduced only by another task.
- Both tasks must edit a high-conflict registry, router, lockfile, or generated artifact.
- One task's acceptance properties cannot pass until another task merges.

Create a prerequisite mission first, combine the tasks, or explicitly adopt stacked PRs. Do not call stacked PRs independent.

## PR Ownership

Each mission session owns one branch, Mission Brief, test evidence, Merge-Readiness Pack, and PR. It asks the user separately before push and PR creation. The PR targets the batch manifest's `targetBranch` and contains no commits copied from sibling missions.

The batch coordinator may inspect status and report conflicts. It must not cherry-pick mission commits into an integration branch or resolve implementation conflicts on behalf of all sessions.

## After Another PR Merges

The remaining mission may now be behind its target branch. Its own session must:

1. Inspect the target-branch changes and overlap.
2. Explain whether merge or rebase is appropriate under repository policy.
3. Obtain approval before history rewriting or other protected Git operations.
4. Update its branch, resolve conflicts only in its worktree, and rerun its acceptance evidence.
5. Update its Mission Brief and Merge-Readiness Pack with the new base and validation provenance.

## Cleanup

Close the interactive agent session before removing its worktree. Prefer `cleanup --require-merged` when a GitHub PR exists. Without it, cleanup requires an explicit user statement that the mission is abandoned or otherwise safe to remove. Cleanup keeps the branch so committed work remains recoverable.
