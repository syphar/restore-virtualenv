import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as utils from './utils'

async function run(): Promise<void> {
  try {
    const matched_key = core.getState('VIRTUALENV_CACHE_MATCHED_KEY')
    const cache_key = core.getState('VIRTUALENV_CACHE_KEY')
    const cache_path = core.getState('VIRTUALENV_DIRECTORY')
    if (matched_key === cache_key) {
      core.info('Cache hit occurred when restoring, not saving cache.') // eslint-disable-line i18n-text/no-en
      return
    }
    try {
      await cache.saveCache([cache_path], cache_key)
    } catch (error) {
      const error_ = error as Error

      // see https://github.com/actions/cache/blob/0781355a23dac32fd3bac414512f4b903437991a/src/save.ts#L43-L54
      if (error_.name === cache.ValidationError.name) {
        throw error
      } else if (error_.name === cache.ReserveCacheError.name) {
        core.info(error_.message)
      } else {
        utils.logWarning(error_.message)
      }
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
