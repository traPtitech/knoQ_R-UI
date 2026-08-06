#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const templateSpecs = [
  {
    source: 'mission-brief.template.md',
    target: 'mission-brief.md',
    requiredTokens: [
      'mission_id: <YYYYMMDD-short-slug>',
      'branch: mission/<YYYYMMDD-short-slug>',
      '# Mission Brief: <ミッションの一文タイトル>',
      '<YYYY-MM-DD>'
    ]
  },
  {
    source: 'handoff.template.md',
    target: 'handoff.md',
    requiredTokens: [
      'mission_id: <YYYYMMDD-short-slug>',
      '# Handoff / Continuity Pack: <ミッションタイトル>',
      '<YYYY-MM-DDTHH:MM:SSZ>'
    ]
  },
  {
    source: 'merge-rationale.template.md',
    target: 'merge-rationale.md',
    requiredTokens: [
      'mission_id: <YYYYMMDD-short-slug>',
      '# Merge-Readiness Pack: <ミッションタイトル>',
      '<YYYY-MM-DDTHH:MM:SSZ>'
    ]
  }
]

const fail = (message) => {
  console.error(`error: ${message}`)
  process.exit(1)
}

const usage = () => {
  console.log(`Usage:
  node skills/start-mission/scripts/init-mission.mjs --id <YYYYMMDD-short-slug> --title <title>

Creates docs/missions/<id> from docs/missions/_templates after verifying:
  - the command is run at the Git repository root;
  - the checkout is clean and on mission/<id>;
  - the mission ID, templates, tokens, and destination are valid.

This command does not create branches, issues, commits, or network actions.`)
}

const runGit = (arguments_) => {
  try {
    return execFileSync('git', arguments_, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  } catch (error) {
    const stderr = error?.stderr?.toString().trim()
    fail(stderr || `git ${arguments_.join(' ')} failed`)
  }
}

const parseArguments = (arguments_) => {
  if (arguments_.length === 1 && ['--help', '-h'].includes(arguments_[0])) {
    usage()
    process.exit(0)
  }

  const options = {}
  for (let index = 0; index < arguments_.length; index += 1) {
    const option = arguments_[index]
    if (!['--id', '--title'].includes(option)) {
      fail(`unknown argument: ${option}`)
    }
    if (options[option]) {
      fail(`duplicate argument: ${option}`)
    }

    const value = arguments_[index + 1]
    if (!value || value.startsWith('--')) {
      fail(`${option} requires a value`)
    }

    options[option] = value
    index += 1
  }

  if (!options['--id']) {
    fail('--id is required')
  }
  if (!options['--title']) {
    fail('--title is required')
  }

  return { id: options['--id'], title: options['--title'] }
}

const dateFromMissionId = (id) => {
  const match = /^(\d{4})(\d{2})(\d{2})-([a-z0-9][a-z0-9-]{0,47})$/.exec(id)
  if (!match) {
    fail(
      'mission ID must match YYYYMMDD-<slug>, with a lowercase kebab-case slug of at most 48 characters'
    )
  }

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const normalized = date.toISOString().slice(0, 10)
  const expected = `${year}-${month}-${day}`
  if (normalized !== expected) {
    fail(`mission ID contains an invalid calendar date: ${id.slice(0, 8)}`)
  }

  return expected
}

const validateTitle = (title) => {
  if (!title.trim()) {
    fail('title must not be empty')
  }
  if (title !== title.trim()) {
    fail('title must not have leading or trailing whitespace')
  }
  if (/[\r\n]/.test(title)) {
    fail('title must be a single line')
  }
}

const assertRepositoryState = (id) => {
  const root = realpathSync(runGit(['rev-parse', '--show-toplevel']))
  const workingDirectory = realpathSync(process.cwd())
  if (workingDirectory !== root) {
    fail(`run from the repository root: ${root}`)
  }

  const branch = runGit(['symbolic-ref', '--quiet', '--short', 'HEAD'])
  const expectedBranch = `mission/${id}`
  if (branch !== expectedBranch) {
    fail(
      `expected branch ${expectedBranch}, found ${branch || '<detached HEAD>'}`
    )
  }

  const status = runGit([
    'status',
    '--porcelain=v1',
    '--untracked-files=normal'
  ])
  if (status) {
    fail('checkout is dirty; preserve or commit existing changes first')
  }

  return root
}

const loadTemplates = (templateDirectory) =>
  templateSpecs.map((spec) => {
    const sourcePath = join(templateDirectory, spec.source)
    if (!existsSync(sourcePath) || !lstatSync(sourcePath).isFile()) {
      fail(`required template is missing: ${sourcePath}`)
    }

    const content = readFileSync(sourcePath, 'utf8')
    for (const token of spec.requiredTokens) {
      if (!content.includes(token)) {
        fail(
          `required token ${JSON.stringify(token)} is missing from ${sourcePath}`
        )
      }
    }

    return { ...spec, content }
  })

const renderTemplate = (content, { id, title, date, initializedAt }) =>
  content
    .replaceAll('<YYYYMMDD-short-slug>', id)
    .replaceAll('<YYYY-MM-DDTHH:MM:SSZ>', initializedAt)
    .replaceAll('<YYYY-MM-DD>', date)
    .replace(/<ミッションの一文タイトル>|<ミッションタイトル>/g, () => title)

const initialize = ({ id, title }) => {
  const date = dateFromMissionId(id)
  validateTitle(title)
  const root = assertRepositoryState(id)
  const missionRoot = join(root, 'docs', 'missions')
  const templateDirectory = join(missionRoot, '_templates')
  const targetDirectory = join(missionRoot, id)

  if (existsSync(targetDirectory)) {
    fail(`mission target already exists: ${targetDirectory}`)
  }

  const templates = loadTemplates(templateDirectory)
  const initializedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const outputs = templates.map(({ target, content }) => ({
    target,
    content: renderTemplate(content, { id, title, date, initializedAt })
  }))

  mkdirSync(targetDirectory)
  try {
    for (const output of outputs) {
      writeFileSync(join(targetDirectory, output.target), output.content, {
        flag: 'wx'
      })
    }
  } catch (error) {
    rmSync(targetDirectory, { recursive: true, force: true })
    fail(`could not initialize mission documents: ${error.message}`)
  }

  console.log(`Initialized mission ${id} on mission/${id}:`)
  for (const output of outputs) {
    console.log(`  docs/missions/${id}/${output.target}`)
  }
}

const main = () => {
  const options = parseArguments(process.argv.slice(2))
  initialize(options)
}

main()
