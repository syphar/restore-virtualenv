import * as core from '@actions/core'
// import * as cache from '@actions/cache'
// import * as utils from './utils'

async function run(): Promise<void> {
  core.setFailed('asfdf')
  // try {
  //   const matched_key = core.getState('PIP_CACHE_MATCHED_KEY')
  //   const cache_key = core.getState('PIP_CACHE_KEY')
  //   const cache_path = core.getState('PIP_CACHE_DIRECTORY')
  //   if (matched_key === cache_key) {
  //     core.info('Cache hit occurred when restoring, not saving cache.')
  //     return
  //   }
  //   try {
  //     await cache.saveCache([cache_path], cache_key)
  //   } catch (error) {
  //     // see https://github.com/actions/cache/blob/0781355a23dac32fd3bac414512f4b903437991a/src/save.ts#L43-L54
  //     if (error.name === cache.ValidationError.name) {
  //       throw error
  //     } else if (error.name === cache.ReserveCacheError.name) {
  //       core.info(error.message)
  //     } else {
  //       utils.logWarning(error.message)
  //     }
  //   }
  // } catch (error) {
  //   core.setFailed(error.message)
  // }
}

run()
