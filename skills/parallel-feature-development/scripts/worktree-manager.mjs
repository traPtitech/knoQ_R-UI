#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const skillDirectory = resolve(scriptDirectory, '..')

const fail = (message) => {
  console.error(`error: ${message}`)
  process.exit(1)
}

const run = (command, args, options = {}) => {
  try {
    return execFileSync(command, args, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe']
    })?.trim()
  } catch (error) {
    if (options.allowFailure) {
      return undefined
    }

    const stderr = error?.stderr?.toString().trim()
    fail(stderr || `${command} ${args.join(' ')} failed`)
  }
}

const git = (args, options = {}) => run('git', args, options)

const usage = () => {
  console.log(`Usage:
  node ${skillDirectory}/scripts/worktree-manager.mjs create --run <id> --base <ref> --task <slug> [--task <slug> ...] [--install]
  node ${skillDirectory}/scripts/worktree-manager.mjs status --run <id>
  node ${skillDirectory}/scripts/worktree-manager.mjs cleanup --run <id> --yes`)
}

const parseArguments = (arguments_) => {
  const [command, ...tokens] = arguments_
  const options = { tasks: [] }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token === '--install') {
      options.install = true
      continue
    }

    if (token === '--yes') {
      options.yes = true
      continue
    }

    if (!['--run', '--base', '--task'].includes(token)) {
      fail(`unknown argument: ${token}`)
    }

    const value = tokens[index + 1]
    if (!value || value.startsWith('--')) {
      fail(`${token} requires a value`)
    }

    index += 1
    if (token === '--task') {
      options.tasks.push(value)
    } else {
      options[token.slice(2)] = value
    }
  }

  return { command, options }
}

const validateSegment = (value, label) => {
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(value)) {
    fail(`${label} must match ^[a-z0-9][a-z0-9-]{0,47}$`)
  }
}

const repositoryRoot = () => {
  const root = git(['rev-parse', '--show-toplevel'], { cwd: process.cwd() })
  if (!root) {
    fail('run this command inside a Git repository')
  }
  return realpathSync(root)
}

const assertMainWorktree = (root) => {
  const worktreeList = git(['worktree', 'list', '--porcelain'], { cwd: root })
  const mainPath = worktreeList.split('\n')[0]?.replace(/^worktree /, '')

  if (!mainPath || realpathSync(mainPath) !== root) {
    fail(`run from the main worktree at ${mainPath || '<unknown>'}`)
  }
}

const assertClean = (root) => {
  const status = git(['status', '--porcelain=v1', '--untracked-files=normal'], {
    cwd: root
  })

  if (status) {
    fail(
      'the main worktree is not clean; preserve or commit existing changes first'
    )
  }
}

const manifestPathFor = (root, runId) =>
  join(root, '.agent-worktrees', runId, 'manifest.json')

const loadManifest = (root, runId) => {
  const manifestPath = manifestPathFor(root, runId)
  if (!existsSync(manifestPath)) {
    fail(`manifest does not exist: ${manifestPath}`)
  }

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    fail(`manifest is not valid JSON: ${manifestPath}`)
  }

  if (manifest.version !== 1 || manifest.repositoryRoot !== root) {
    fail(`manifest does not belong to this repository: ${manifestPath}`)
  }

  if (!Array.isArray(manifest.worktrees)) {
    fail(`manifest has no worktree list: ${manifestPath}`)
  }

  const runRoot = dirname(manifestPath)
  for (const worktree of manifest.worktrees) {
    validateSegment(worktree.task, 'manifest task slug')
    const expectedPath = join(runRoot, worktree.task)
    const expectedBranch = `agent/${runId}/${worktree.task}`
    if (worktree.path !== expectedPath || worktree.branch !== expectedBranch) {
      fail(`manifest contains an unexpected worktree entry: ${worktree.task}`)
    }
  }

  return manifest
}

const writeManifest = (manifestPath, manifest) => {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

const branchExists = (root, branch) =>
  git(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], {
    cwd: root,
    allowFailure: true
  }) !== undefined

const create = (root, options) => {
  const runId = options.run
  if (!runId) {
    fail('--run is required')
  }
  validateSegment(runId, 'run ID')

  if (options.tasks.length === 0) {
    fail('at least one --task is required')
  }

  const tasks = [...new Set(options.tasks)]
  if (tasks.length !== options.tasks.length) {
    fail('task slugs must be unique')
  }
  tasks.forEach((task) => validateSegment(task, 'task slug'))

  assertMainWorktree(root)
  assertClean(root)

  const baseRef = options.base || 'HEAD'
  const baseCommit = git(['rev-parse', '--verify', `${baseRef}^{commit}`], {
    cwd: root
  })
  const runRoot = join(root, '.agent-worktrees', runId)
  const manifestPath = manifestPathFor(root, runId)

  if (existsSync(manifestPath)) {
    fail(`run already exists: ${runId}`)
  }

  for (const task of tasks) {
    const branch = `agent/${runId}/${task}`
    const worktreePath = join(runRoot, task)

    if (branchExists(root, branch)) {
      fail(`branch already exists: ${branch}`)
    }
    if (existsSync(worktreePath)) {
      fail(`worktree path already exists: ${worktreePath}`)
    }
  }

  mkdirSync(runRoot, { recursive: true })
  const manifest = {
    version: 1,
    runId,
    createdAt: new Date().toISOString(),
    repositoryRoot: root,
    baseRef,
    baseCommit,
    worktrees: []
  }
  writeManifest(manifestPath, manifest)

  for (const task of tasks) {
    const branch = `agent/${runId}/${task}`
    const worktreePath = join(runRoot, task)

    git(
      [
        'worktree',
        'add',
        '--lock',
        '--reason',
        `parallel-feature-development run ${runId}`,
        '-b',
        branch,
        worktreePath,
        baseCommit
      ],
      { cwd: root }
    )

    manifest.worktrees.push({ task, branch, path: worktreePath })
    writeManifest(manifestPath, manifest)

    if (options.install) {
      run('npm', ['ci'], { cwd: worktreePath, inherit: true })
    }
  }

  console.log(JSON.stringify(manifest, null, 2))
}

const status = (root, options) => {
  const runId = options.run
  if (!runId) {
    fail('--run is required')
  }
  validateSegment(runId, 'run ID')

  const manifest = loadManifest(root, runId)
  const worktrees = manifest.worktrees.map((worktree) => {
    if (!existsSync(worktree.path)) {
      return { ...worktree, state: 'missing' }
    }

    const changes = git(
      ['status', '--porcelain=v1', '--untracked-files=normal'],
      { cwd: worktree.path }
    )
    const head = git(['rev-parse', 'HEAD'], { cwd: worktree.path })
    const commitCount = Number(
      git(['rev-list', '--count', `${manifest.baseCommit}..${head}`], {
        cwd: worktree.path
      })
    )
    const descendsFromBase =
      git(['merge-base', '--is-ancestor', manifest.baseCommit, head], {
        cwd: worktree.path,
        allowFailure: true
      }) !== undefined

    return {
      ...worktree,
      state: changes ? 'dirty' : 'clean',
      head,
      commitCount,
      descendsFromBase
    }
  })

  console.log(JSON.stringify({ ...manifest, worktrees }, null, 2))
}

const cleanup = (root, options) => {
  const runId = options.run
  if (!runId) {
    fail('--run is required')
  }
  validateSegment(runId, 'run ID')

  if (!options.yes) {
    fail('cleanup requires --yes after explicit user approval')
  }

  assertMainWorktree(root)
  const manifest = loadManifest(root, runId)

  for (const worktree of manifest.worktrees) {
    if (!existsSync(worktree.path)) {
      continue
    }

    const changes = git(
      ['status', '--porcelain=v1', '--untracked-files=normal'],
      { cwd: worktree.path }
    )
    if (changes) {
      fail(`refusing to remove dirty worktree: ${worktree.path}`)
    }
  }

  for (const worktree of [...manifest.worktrees].reverse()) {
    git(['worktree', 'unlock', worktree.path], {
      cwd: root,
      allowFailure: true
    })

    if (!existsSync(worktree.path)) {
      continue
    }

    git(['worktree', 'remove', worktree.path], { cwd: root })
  }

  const manifestPath = manifestPathFor(root, runId)
  rmSync(manifestPath)
  const runRoot = dirname(manifestPath)
  if (readdirSync(runRoot).length === 0) {
    rmSync(runRoot, { recursive: true })
  }

  git(['worktree', 'prune'], { cwd: root })
  console.log(`Removed worktrees for ${runId}; task branches were preserved.`)
}

const main = () => {
  const { command, options } = parseArguments(process.argv.slice(2))

  if (!command || command === '--help' || command === '-h') {
    usage()
    return
  }

  if (!['create', 'status', 'cleanup'].includes(command)) {
    usage()
    fail(`unknown command: ${command}`)
  }

  const root = repositoryRoot()
  if (command === 'create') {
    create(root, options)
  } else if (command === 'status') {
    status(root, options)
  } else {
    cleanup(root, options)
  }
}

main()
