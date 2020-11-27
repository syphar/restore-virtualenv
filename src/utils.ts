import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as md5File from 'md5-file'
import * as path from 'path'

export async function python_version(): Promise<string> {
  let output = ''

  const options: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }

  await exec.exec(
    'python',
    ['-c', 'import sys;print("{}{}".format(*sys.version_info[:2]))'],
    options
  )

  return output.trim()
}

export async function cache_key(
  requirement_files: string,
  custom_cache_key: string
): Promise<string> {
  const py_version = await python_version()
  const base = `${process.env['RUNNER_OS']}-virtualenv-cache-py${py_version}-${custom_cache_key}`
  const hash = await hashFiles(requirement_files)

  return `${base}-${hash}`
}

export async function virtualenv_directory(): Promise<string> {
  if (process.platform == 'win32') {
    const home = `${process.env['HOMEDRIVE']}${process.env['HOMEPATH']}`
  } else {
    const home = process.env['HOME']
  }

  const virtualenv_base = `${home}${path.sep}.virtualenvs`
  await io.mkdirP(virtualenv_base)

  return `${virtualenv_base}${path.sep}.venv`
}

export function logWarning(message: string): void {
  const warningPrefix = '[warning] '
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

    const file_hash = await md5File.default(file)

    result.write(file_hash)
    if (!hasMatch) {
      hasMatch = true
    }
  }

  if (!hasMatch) {
    throw new Error(`could not find requirement-files with pattern ${patterns}`)
  }

  result.end()
  return result.digest('hex')
}
