# restore-pip-download-cache

#### 1-liner to restore the pip download cache
<p align="center">
  <a href="https://github.com/syphar/restore-pip-download-cache"><img alt="restore-pip-download-cache status" src="https://github.com/syphar/restore-pip-download-cache/workflows/build-test/badge.svg"></a>
</p>

GitHub Action caches improve build times and reduce network dependencies. However, when creating github actions for
python I find myself repeating some patterns. On of them is restoring the pip download cache, which is
why this action was created.

On top, writing the correct cache logic is [tricky](https://github.com/actions/cache/blob/0781355a23dac32fd3bac414512f4b903437991a/examples.md#python---pip). You need to understand how the [cache action](https://github.com/actions/cache) (keys and restore keys) work. Did you know the default cache will not save the cache if restoring had an exact match? Or that the current cache on github side is insert-only and never updates a cache key?  Also, the default cache action will not store the updated cache
when there was a test-failure.

`restore-pip-download-cache` is a simple 1-liner that covers all use-cases, correctly:
- Caches the pip download cache directory
- Works on Ubuntu, MacOS and Windows
- Restore keys take the OS into account
- will use any typical requirements file to build the cache key (poetry, pipenv, pip-requirements-txt)
- cache will also be updated when the build failed, assuming the download cache never breaks.
- Builds on the [native cache functionality of GitHub Actions](https://github.com/actions/toolkit/tree/master/packages/cache), same as [v2 of the generic cache action](https://github.com/actions/cache/issues/55#issuecomment-629433225)

## Usage

Add this step before any `pip install`:
```yml
- uses: syphar/restore-pip-download-cache@v1
```

For example:

`.github/workflows/ci.yml`
```yml
name: CI

on: [push]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1

    - uses: syphar/restore-pip-download-cache@v1

    - name: Install dependencies
      run: pip install -r requirements.txt

    - name: Test
      run: py.test
```

## inputs

### `requirement_files`

When the default does not suffice you can provide a [glob pattern](https://github.com/actions/toolkit/tree/1cc56db0ff126f4d65aeb83798852e02a2c180c3/packages/glob) for the files that, when changed, likely change the pip download cache.

Most of the time that is the requirements-files.

Default for this input is:
```
requirements*.txt
**/requirements*.txt
**/requirements/*.txt
**/Pipfile.lock
**/poetry.lock
```

### `custom_cache_key_element`
For testing and cache-busting you can provide a string that will included in the generated cache-key.

Default is: `v1`

## License

The project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
