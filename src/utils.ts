import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as md5File from 'md5-file'
import * as path from 'path'

export function restore_key(custom_cache_key: string): string {
  return `${process.env['RUNNER_OS']}-pip-download-cache-${custom_cache_key}`
}

export async function cache_key(
  requirement_files: string,
  custom_cache_key: string
): Promise<string> {
  const base = restore_key(custom_cache_key)
  const hash = await hashFiles(requirement_files)

  return Promise.resolve(`${base}-${hash}`)
}

export function pip_cache_directory(): string {
  switch (process.platform) {
    case 'linux':
      return '~/.cache/pip'
    case 'win32':
      return '~\\AppData\\Local\\pip\\Cache'
    case 'darwin':
      return '~/Library/Caches/pip'
    default:
      core.setFailed(
        `could not find pip cache directory for platform ${process.platform}`
      )
      return ''
  }
}

export function logWarning(message: string): void {
  const warningPrefix = '[warning]'
  core.info(`${warningPrefix}${message}`)
}

export async function hashFiles(patterns: string): Promise<string> {
  const result = crypto.createHash('md5')
  const githubWorkspace = process.cwd()
  const globber = await glob.create(patterns, {followSymbolicLinks: true})

  let hasMatch = false
  for await (const file of globber.globGenerator()) {
    if (!file.startsWith(`${githubWorkspace}${path.sep}`)) {
      core.info(`Ignore '${file}' since it is not under GITHUB_WORKSPACE.`)
      continue
    }
    if (fs.statSync(file).isDirectory()) {
      core.info(`Skip directory '${file}'.`)
      continue
    }

    core.debug(`hashing file ${file}`)

    const file_hash = md5File.sync(file)

    result.write(file_hash)
    if (!hasMatch) {
      hasMatch = true
    }
  }

  if (!hasMatch) {
    return Promise.reject(
      new Error(`could not find requirement-files with pattern ${patterns}`)
    )
  }

  result.end()
  return Promise.resolve(result.digest('hex'))
}
