import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as exec from '@actions/exec'
import * as utils from './utils'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    const requirement_files = core.getInput('requirement_files', {
      required: true
    })
    const custom_cache_key = core.getInput('custom_cache_key_element', {
      required: true
    })
    const custom_virtualenv_dir = core.getInput('custom_virtualenv_dir', {
      required: true
    })

    const virtualenv_dir = await utils.virtualenv_directory(
      custom_virtualenv_dir
    )
    core.saveState('VIRTUALENV_DIRECTORY', virtualenv_dir)
    core.setOutput('virtualenv-directory', virtualenv_dir)

    const cache_key = await utils.cache_key(requirement_files, custom_cache_key)

    core.saveState('VIRTUALENV_CACHE_KEY', cache_key)
    core.info(`cache key: ${cache_key}`)
    core.info(`directory to cache: ${virtualenv_dir}`)

    const matched_key = await cache.restoreCache(
      [virtualenv_dir],
      cache_key,
      []
    )
    core.saveState('VIRTUALENV_CACHE_MATCHED_KEY', matched_key)

    if (!matched_key) {
      core.info('Cache not found. creating new virtualenv')
      core.setOutput('cache-hit', false.toString())

      await exec.exec('python', ['-m', 'venv', virtualenv_dir])
    } else {
      core.info(`Cache restored from key: ${matched_key}`)
      core.setOutput('cache-hit', true.toString())
    }

    // do what venv/bin/activate normally does
    core.exportVariable('VIRTUAL_ENV', virtualenv_dir)

    if (process.platform === 'win32') {
      core.addPath(`${virtualenv_dir}${path.sep}Scripts`)
    } else {
      core.addPath(`${virtualenv_dir}${path.sep}bin`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
