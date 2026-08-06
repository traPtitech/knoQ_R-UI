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
import { dirname, join } from 'node:path'
import process from 'node:process'

const requiredBasePaths = [
  'docs/missions/_templates/mission-brief.template.md',
  'docs/missions/_templates/handoff.template.md',
  'docs/missions/_templates/merge-rationale.template.md',
  'skills/start-mission/scripts/init-mission.mjs'
]

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
  node skills/start-multi-mission/scripts/multi-mission-manager.mjs create \\
    --batch <id> [--date YYYYMMDD] --base <ref> --target <branch> \\
    --mission '<slug>=<title>' --mission '<slug>=<title>' [...]

  node skills/start-multi-mission/scripts/multi-mission-manager.mjs status \\
    --batch <id> [--github]

  node skills/start-multi-mission/scripts/multi-mission-manager.mjs launch \\
    --batch <id> --agent <codex|claude> [--tmux --yes]

  node skills/start-multi-mission/scripts/multi-mission-manager.mjs cleanup \\
    --batch <id> [--mission <mission-id>] [--require-merged] --yes`)
}

const optionKey = (token) =>
  token.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())

const parseArguments = (arguments_) => {
  const [command, ...tokens] = arguments_
  const options = { missions: [] }
  const booleanOptions = new Set([
    '--github',
    '--tmux',
    '--yes',
    '--require-merged'
  ])
  const valueOptions = new Set([
    '--batch',
    '--date',
    '--base',
    '--target',
    '--mission',
    '--agent'
  ])

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (booleanOptions.has(token)) {
      const key = optionKey(token)
      if (options[key]) {
        fail(`duplicate argument: ${token}`)
      }
      options[key] = true
      continue
    }

    if (!valueOptions.has(token)) {
      fail(`unknown argument: ${token}`)
    }

    const value = tokens[index + 1]
    if (!value || value.startsWith('--')) {
      fail(`${token} requires a value`)
    }

    index += 1
    if (token === '--mission') {
      options.missions.push(value)
      continue
    }

    const key = optionKey(token)
    if (options[key] !== undefined) {
      fail(`duplicate argument: ${token}`)
    }
    options[key] = value
  }

  return { command, options }
}

const assertAllowedOptions = (options, allowed) => {
  const allowedSet = new Set(allowed)
  for (const [key, value] of Object.entries(options)) {
    const isEmptyMissions = key === 'missions' && value.length === 0
    if (!allowedSet.has(key) && !isEmptyMissions && value !== undefined) {
      fail(
        `option --${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is not valid for this command`
      )
    }
  }
}

const validateSegment = (value, label) => {
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(value)) {
    fail(`${label} must match ^[a-z0-9][a-z0-9-]{0,47}$`)
  }
}

const validateDate = (value) => {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value)
  if (!match) {
    fail('date must use YYYYMMDD')
  }

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const normalized = date.toISOString().slice(0, 10).replaceAll('-', '')
  if (normalized !== value) {
    fail(`date is not a valid calendar date: ${value}`)
  }

  return value
}

const localDate = () => {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const parseMissionSpec = (value, date) => {
  const separator = value.indexOf('=')
  if (separator <= 0 || separator === value.length - 1) {
    fail(`mission must use <slug>=<title>: ${value}`)
  }

  const slug = value.slice(0, separator)
  const title = value.slice(separator + 1)
  validateSegment(slug, 'mission slug')
  if (title !== title.trim() || /[\r\n]/.test(title)) {
    fail(`mission title must be one trimmed line: ${slug}`)
  }

  return {
    slug,
    title,
    id: `${date}-${slug}`,
    branch: `mission/${date}-${slug}`
  }
}

const currentRepositoryRoot = () => {
  const root = git(['rev-parse', '--show-toplevel'], { cwd: process.cwd() })
  if (!root) {
    fail('run this command inside a Git repository')
  }
  return realpathSync(root)
}

const mainRepositoryRoot = () => {
  const currentRoot = currentRepositoryRoot()
  const worktrees = git(['worktree', 'list', '--porcelain'], {
    cwd: currentRoot
  })
  const mainPath = worktrees.split('\n')[0]?.replace(/^worktree /, '')
  if (!mainPath) {
    fail('could not determine the main worktree')
  }
  return realpathSync(mainPath)
}

const assertMainWorktree = (root) => {
  if (currentRepositoryRoot() !== root) {
    fail(`run from the main worktree at ${root}`)
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

const manifestPathFor = (root, batchId) =>
  join(root, '.mission-worktrees', batchId, 'manifest.json')

const writeManifest = (path, manifest) => {
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

const loadManifest = (root, batchId) => {
  const path = manifestPathFor(root, batchId)
  if (!existsSync(path)) {
    fail(`batch manifest does not exist: ${path}`)
  }

  let manifest
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    fail(`batch manifest is not valid JSON: ${path}`)
  }

  if (
    manifest.version !== 1 ||
    manifest.kind !== 'multi-mission' ||
    manifest.repositoryRoot !== root ||
    manifest.batchId !== batchId
  ) {
    fail(`manifest does not belong to this repository and batch: ${path}`)
  }
  if (!Array.isArray(manifest.missions)) {
    fail(`manifest has no mission list: ${path}`)
  }

  validateDate(manifest.date)
  validateSegment(manifest.batchId, 'manifest batch ID')
  const batchRoot = dirname(path)
  for (const mission of manifest.missions) {
    validateSegment(mission.slug, 'manifest mission slug')
    const expectedId = `${manifest.date}-${mission.slug}`
    const expectedBranch = `mission/${expectedId}`
    const expectedPath = join(batchRoot, expectedId)
    if (
      mission.id !== expectedId ||
      mission.branch !== expectedBranch ||
      mission.path !== expectedPath
    ) {
      fail(`manifest contains an unexpected mission entry: ${mission.slug}`)
    }
  }

  return { manifest, path }
}

const branchExists = (root, branch) =>
  git(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], {
    cwd: root,
    allowFailure: true
  }) !== undefined

const commitFor = (root, reference, label) => {
  const commit = git(['rev-parse', '--verify', `${reference}^{commit}`], {
    cwd: root,
    allowFailure: true
  })
  if (commit === undefined) {
    fail(`${label} does not resolve to a commit: ${reference}`)
  }
  return commit
}

const assertMissionSupport = (root, commit, label) => {
  for (const path of requiredBasePaths) {
    const exists = git(['cat-file', '-e', `${commit}:${path}`], {
      cwd: root,
      allowFailure: true
    })
    if (exists === undefined) {
      fail(`${label} does not contain required mission support: ${path}`)
    }
  }
}

const create = (root, options) => {
  assertAllowedOptions(options, ['batch', 'date', 'base', 'target', 'missions'])
  if (!options.batch || !options.target) {
    fail('create requires --batch and --target')
  }
  if (options.missions.length < 2) {
    fail('create requires at least two --mission values')
  }

  validateSegment(options.batch, 'batch ID')
  const date = validateDate(options.date || localDate())
  const missions = options.missions.map((value) =>
    parseMissionSpec(value, date)
  )
  const slugs = missions.map((mission) => mission.slug)
  if (new Set(slugs).size !== slugs.length) {
    fail('mission slugs must be unique')
  }

  git(['check-ref-format', '--branch', options.target], { cwd: root })
  assertMainWorktree(root)
  assertClean(root)

  if (!branchExists(root, options.target)) {
    fail(`target branch does not exist locally: ${options.target}`)
  }

  const baseRef = options.base || options.target
  const baseCommit = commitFor(root, baseRef, 'base ref')
  const targetCommit = commitFor(root, options.target, 'target branch')
  assertMissionSupport(root, targetCommit, 'target branch')
  if (baseCommit !== targetCommit) {
    assertMissionSupport(root, baseCommit, 'base commit')
  }

  const batchRoot = join(root, '.mission-worktrees', options.batch)
  const manifestPath = manifestPathFor(root, options.batch)
  if (existsSync(manifestPath)) {
    fail(`batch already exists: ${options.batch}`)
  }

  for (const mission of missions) {
    mission.path = join(batchRoot, mission.id)
    if (branchExists(root, mission.branch)) {
      fail(`branch already exists: ${mission.branch}`)
    }
    if (existsSync(mission.path)) {
      fail(`worktree path already exists: ${mission.path}`)
    }
  }

  mkdirSync(batchRoot, { recursive: true })
  const manifest = {
    version: 1,
    kind: 'multi-mission',
    batchId: options.batch,
    date,
    createdAt: new Date().toISOString(),
    repositoryRoot: root,
    baseRef,
    baseCommit,
    targetBranch: options.target,
    targetCommitAtCreation: targetCommit,
    missions: missions.map((mission) => ({
      ...mission,
      initializedAt: null
    }))
  }
  writeManifest(manifestPath, manifest)

  for (const mission of manifest.missions) {
    git(
      [
        'worktree',
        'add',
        '--lock',
        '--reason',
        `start-multi-mission batch ${options.batch}`,
        '-b',
        mission.branch,
        mission.path,
        baseCommit
      ],
      { cwd: root }
    )

    const initializer = join(
      mission.path,
      'skills',
      'start-mission',
      'scripts',
      'init-mission.mjs'
    )
    run(
      process.execPath,
      [initializer, '--id', mission.id, '--title', mission.title],
      { cwd: mission.path, inherit: true }
    )
    mission.initializedAt = new Date().toISOString()
    writeManifest(manifestPath, manifest)
  }

  console.log(JSON.stringify(manifest, null, 2))
}

const pullRequestsFor = (root, manifest, mission) => {
  const output = run(
    'gh',
    [
      'pr',
      'list',
      '--head',
      mission.branch,
      '--base',
      manifest.targetBranch,
      '--state',
      'all',
      '--limit',
      '10',
      '--json',
      'number,url,state,isDraft,baseRefName,headRefName,mergedAt'
    ],
    { cwd: root }
  )

  try {
    return JSON.parse(output || '[]')
  } catch {
    fail(`gh returned invalid JSON for ${mission.branch}`)
  }
}

const missionStatus = (root, manifest, mission, includeGitHub) => {
  if (!existsSync(mission.path)) {
    return {
      ...mission,
      state: 'missing',
      pullRequests: includeGitHub
        ? pullRequestsFor(root, manifest, mission)
        : undefined
    }
  }

  const changes = git(
    ['status', '--porcelain=v1', '--untracked-files=normal'],
    { cwd: mission.path }
  )
  const head = git(['rev-parse', 'HEAD'], { cwd: mission.path })
  const currentBranch = git(['branch', '--show-current'], { cwd: mission.path })
  const commitCount = Number(
    git(['rev-list', '--count', `${manifest.baseCommit}..${head}`], {
      cwd: mission.path
    })
  )
  const descendsFromBase =
    git(['merge-base', '--is-ancestor', manifest.baseCommit, head], {
      cwd: mission.path,
      allowFailure: true
    }) !== undefined

  return {
    ...mission,
    state: changes ? 'dirty' : 'clean',
    head,
    currentBranch,
    branchMatches: currentBranch === mission.branch,
    commitCount,
    descendsFromBase,
    briefExists: existsSync(
      join(mission.path, 'docs', 'missions', mission.id, 'mission-brief.md')
    ),
    pullRequests: includeGitHub
      ? pullRequestsFor(root, manifest, mission)
      : undefined
  }
}

const status = (root, options) => {
  assertAllowedOptions(options, ['batch', 'github'])
  if (!options.batch) {
    fail('status requires --batch')
  }
  validateSegment(options.batch, 'batch ID')

  const { manifest } = loadManifest(root, options.batch)
  const missions = manifest.missions.map((mission) =>
    missionStatus(root, manifest, mission, Boolean(options.github))
  )
  console.log(JSON.stringify({ ...manifest, missions }, null, 2))
}

const shellQuote = (value) => `'${value.replaceAll("'", `'"'"'`)}'`

const sessionPrompt = (agent, mission) => {
  const invocation = agent === 'codex' ? '$start-mission' : '/start-mission'
  return `${invocation} Resume the existing mission ${mission.id}. Read its Mission Brief and continue scope alignment in this branch. Do not create another mission, branch, or worktree.`
}

const launchCommand = (agent, mission) => {
  const prompt = sessionPrompt(agent, mission)
  if (agent === 'codex') {
    return `codex -C ${shellQuote(mission.path)} ${shellQuote(prompt)}`
  }
  return `cd ${shellQuote(mission.path)} && claude --name ${shellQuote(mission.id)} ${shellQuote(prompt)}`
}

const launch = (root, options) => {
  assertAllowedOptions(options, ['batch', 'agent', 'tmux', 'yes'])
  if (!options.batch || !options.agent) {
    fail('launch requires --batch and --agent')
  }
  if (!['codex', 'claude'].includes(options.agent)) {
    fail('--agent must be codex or claude')
  }
  if (options.yes && !options.tmux) {
    fail('--yes is only valid with --tmux')
  }

  validateSegment(options.batch, 'batch ID')
  assertMainWorktree(root)
  const { manifest } = loadManifest(root, options.batch)
  for (const mission of manifest.missions) {
    if (!existsSync(mission.path)) {
      fail(`mission worktree is missing: ${mission.path}`)
    }
  }

  const commands = manifest.missions.map((mission) => ({
    id: mission.id,
    branch: mission.branch,
    path: mission.path,
    command: launchCommand(options.agent, mission)
  }))

  if (!options.tmux) {
    console.log(
      JSON.stringify(
        { batchId: manifest.batchId, agent: options.agent, commands },
        null,
        2
      )
    )
    return
  }
  if (!options.yes) {
    fail('tmux launch requires --yes after explicit user approval')
  }

  run('tmux', ['-V'])
  run(options.agent, ['--version'])
  const sessionName = `knoq-${manifest.batchId}`
  const existingSession = run('tmux', ['has-session', '-t', sessionName], {
    allowFailure: true
  })
  if (existingSession !== undefined) {
    fail(`tmux session already exists: ${sessionName}`)
  }

  commands.forEach((entry, index) => {
    const mission = manifest.missions[index]
    const args =
      index === 0
        ? [
            'new-session',
            '-d',
            '-s',
            sessionName,
            '-n',
            mission.slug,
            entry.command
          ]
        : [
            'new-window',
            '-d',
            '-t',
            sessionName,
            '-n',
            mission.slug,
            entry.command
          ]
    run('tmux', args)
  })

  console.log(
    JSON.stringify(
      {
        batchId: manifest.batchId,
        agent: options.agent,
        tmuxSession: sessionName,
        missionCount: commands.length,
        attachCommand: `tmux attach -t ${shellQuote(sessionName)}`
      },
      null,
      2
    )
  )
}

const cleanup = (root, options) => {
  assertAllowedOptions(options, ['batch', 'missions', 'requireMerged', 'yes'])
  if (!options.batch) {
    fail('cleanup requires --batch')
  }
  if (options.missions.length > 1) {
    fail('cleanup accepts at most one --mission')
  }
  if (!options.yes) {
    fail('cleanup requires --yes after explicit user approval')
  }

  validateSegment(options.batch, 'batch ID')
  assertMainWorktree(root)
  const { manifest, path: manifestPath } = loadManifest(root, options.batch)
  const requestedMission = options.missions[0]
  const selected = requestedMission
    ? manifest.missions.filter((mission) => mission.id === requestedMission)
    : manifest.missions
  if (selected.length === 0) {
    fail(`mission is not part of batch ${options.batch}: ${requestedMission}`)
  }

  for (const mission of selected) {
    if (existsSync(mission.path)) {
      const changes = git(
        ['status', '--porcelain=v1', '--untracked-files=normal'],
        { cwd: mission.path }
      )
      if (changes) {
        fail(`refusing to remove dirty worktree: ${mission.path}`)
      }
    }

    if (options.requireMerged) {
      const pullRequests = pullRequestsFor(root, manifest, mission)
      const hasMergedPullRequest = pullRequests.some(
        (pullRequest) => pullRequest.state === 'MERGED'
      )
      if (!hasMergedPullRequest) {
        fail(`no merged pull request found for ${mission.branch}`)
      }
    }
  }

  for (const mission of [...selected].reverse()) {
    git(['worktree', 'unlock', mission.path], {
      cwd: root,
      allowFailure: true
    })
    if (existsSync(mission.path)) {
      git(['worktree', 'remove', mission.path], { cwd: root })
    }
  }

  const selectedIds = new Set(selected.map((mission) => mission.id))
  manifest.missions = manifest.missions.filter(
    (mission) => !selectedIds.has(mission.id)
  )
  if (manifest.missions.length > 0) {
    writeManifest(manifestPath, manifest)
  } else {
    rmSync(manifestPath)
    const batchRoot = dirname(manifestPath)
    if (readdirSync(batchRoot).length === 0) {
      rmSync(batchRoot, { recursive: true })
    }
  }

  git(['worktree', 'prune'], { cwd: root })
  console.log(
    `Removed ${selected.length} mission worktree(s) from ${options.batch}; branches were preserved.`
  )
}

const main = () => {
  const arguments_ = process.argv.slice(2)
  if (arguments_.length === 0 || arguments_.includes('--help')) {
    usage()
    return
  }

  const { command, options } = parseArguments(arguments_)
  if (!['create', 'status', 'launch', 'cleanup'].includes(command)) {
    usage()
    fail(`unknown command: ${command}`)
  }

  const root = mainRepositoryRoot()
  if (command === 'create') {
    create(root, options)
    return
  }
  if (command === 'status') {
    status(root, options)
    return
  }
  if (command === 'launch') {
    launch(root, options)
    return
  }
  cleanup(root, options)
}

main()
