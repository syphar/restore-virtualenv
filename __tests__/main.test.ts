import * as utils from '../src/utils'

const test_requirement_files = '__tests__/dummy*.txt'
const test_requirement_hash =
  process.platform === 'win32'
    ? 'b9e86779eb99022d81a88623a4c52a25'
    : '0d370d5547fa12da0111fbdfbf065f45'

test('get cache key', async () => {
  expect(await utils.cache_key(test_requirement_files, 'custom')).toMatch(
    new RegExp(
      `${process.env.RUNNER_OS}-virtualenv-cache-py3\\d+-custom-${test_requirement_hash}`
    )
  )
})

test('get python version', async () => {
  expect(await utils.python_version()).toMatch(new RegExp('3\\d+'))
})

test('get virtualenv directory', async () => {
  expect(await utils.virtualenv_directory()).toContain('.venv')
})

test('get hash for file glob', async () => {
  var hash = await utils.hashFiles(test_requirement_files)

  expect(hash).toBe(test_requirement_hash)
})

test('get hash for multiple globs', async () => {
  var hash = await utils.hashFiles(
    '__tests__/dummy_file2.txt\n__tests__/**/dummy_file.txt'
  )

  expect(hash).toBe(test_requirement_hash)
})

test('get hash fails without files', async () => {
  const testpattern = '__tests__/not_existing_pattern*.txt'
  expect(utils.hashFiles(testpattern)).rejects.toEqual(
    Error(`could not find requirement-files with pattern ${testpattern}`)
  )
})
