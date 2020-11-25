import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as utils from './utils'

async function run(): Promise<void> {
  try {
    const requirement_files = core.getInput('requirement_files', {
      required: true
    })
    const custom_cache_key = core.getInput('custom_cache_key_element', {
      required: true
    })

    const cache_dir: string = utils.pip_cache_directory()
    core.saveState('PIP_CACHE_DIRECTORY', cache_dir)
    core.setOutput('pip-cache-directory', cache_dir)

    const cache_key: string = await utils.cache_key(
      requirement_files,
      custom_cache_key
    )
    core.saveState('PIP_CACHE_KEY', cache_key)

    core.info(`cache key: ${cache_key}`)
    core.info(`directory to cache: ${cache_dir}`)

    const matched_key = await cache.restoreCache([cache_dir], cache_key, [
      utils.restore_key(custom_cache_key)
    ])
    if (!matched_key) {
      core.info('Cache not found')
      core.setOutput('cache-hit', false.toString())
      return
    }

    const isExactKeyMatch = matched_key === cache_key
    core.saveState('PIP_CACHE_MATCHED_KEY', matched_key)
    core.setOutput('cache-hit', isExactKeyMatch.toString())

    core.info(`Cache restored from key: ${matched_key}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
