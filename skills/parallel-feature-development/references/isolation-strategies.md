# Isolation Strategy Reference

Use this reference only when deciding how to isolate parallel implementation agents.

## Decision Table

| Method                  | Source isolation                                                       | Runtime isolation                                | Startup cost                   | Ongoing cost                                     | Best fit                                            |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------ | ------------------------------------------------ | --------------------------------------------------- |
| Shared checkout         | None                                                                   | None                                             | Lowest                         | Lowest                                           | Read-only exploration with strict scopes            |
| Git worktrees           | Separate files, `HEAD`, and index; shared Git object database and refs | Host environment is shared                       | Low                            | Local disk for dependencies and builds           | Default for knoQ_R-UI feature work                  |
| Separate clones         | Separate working files and Git metadata                                | Host environment is shared                       | Medium                         | Duplicate Git objects and dependencies           | Independent credentials or remote operations        |
| Worktree plus container | Worktree-level source isolation                                        | Container-level process and dependency isolation | Medium to high                 | Images, containers, volumes, and ports           | Conflicting native toolchains or untrusted commands |
| GitHub Codespaces       | Remote checkout and branch per codespace                               | Dedicated remote VM and development container    | High without prebuilds         | Metered compute and storage                      | Remote collaboration or insufficient local capacity |
| Managed agent cloud     | Remote checkout per task                                               | Provider-managed task environment                | Medium after environment setup | Product usage and remote-environment constraints | Offloaded tasks and pull-request-oriented handoff   |

## Selection Rules

### Prefer Git Worktrees

Use worktrees when all tasks use the repository's existing Node.js toolchain and can be separated by feature or page ownership. They are fast to create and keep commits and indexes independent while sharing Git objects.

Account for these limits:

- A branch can be checked out in only one worktree at a time.
- Worktrees share refs and repository-level Git configuration.
- Each worktree needs its own ignored local files, dependencies, build output, and development-server port.
- Parallel edits to logically coupled files can still produce integration conflicts even when filesystem writes are isolated.

### Add Containers Deliberately

Use one container per worktree when tasks require incompatible tool versions, native services, stronger process isolation, or controlled execution of unfamiliar commands. Mount each agent's own worktree into only its own container.

Do not reuse the repository's production `Dockerfile` as a development environment without reviewing it. The current image builds static assets and serves them with Caddy; it does not provide an interactive development toolchain.

Container costs include image builds, multiple dependency stores, port allocation, filesystem performance on macOS, credential forwarding, and cleanup. A container with the same writable bind mount as another agent does not prevent source conflicts.

### Use Separate Clones Sparingly

Choose clones instead of worktrees only when agents must have separate Git configuration, remotes, credentials, object databases, or repository maintenance operations. Clones require repeated fetches and use more disk, and their branches are less convenient to inspect and integrate locally.

### Use Codespaces For Remote Capacity

Choose one codespace per branch when work must continue remotely, contributors need a reproducible hosted environment, or local CPU and memory are insufficient. Add a `.devcontainer/devcontainer.json` only as a separate approved change because it affects the development environment for the whole repository.

Before creating codespaces, confirm repository access, organization policy, spending limits, secret configuration, machine size, idle timeout, and cleanup ownership. Prebuilds reduce startup time but consume storage and require repository administration.

### Use Managed Agent Clouds For Offload

Choose a managed agent cloud when the user wants remote task environments and diff or pull-request handoff. Confirm that the repository and selected base commit are available remotely. Local uncommitted changes are not an appropriate base unless committed or otherwise transferred explicitly.

Cloud setup scripts can install dependencies, while agent-phase internet access and secrets follow the configured environment policy. Do not assume local credentials or services exist remotely.

## Security And Approval Boundaries

Obtain explicit user approval before:

- Creating billable cloud environments.
- Uploading code or data to a new remote service.
- Forwarding credentials or secrets into containers.
- Enabling broad network access.
- Pushing branches, opening pull requests, or merging into a user branch.
- Removing worktrees or containers.

Never weaken sandboxing merely to avoid an approval request.
