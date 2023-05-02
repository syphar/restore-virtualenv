# restore-virtualenv

**this package is not maintained any more.**

Most of its functionality was added to the standard `setup-python` action, see
https://github.com/actions/setup-python#caching-packages-dependencies.

If you want to take over maintenance of this action, just contact me directly.



------------------


## 1-liner to create or restore a python virtualenv
<p align="center">
  <a href="https://github.com/syphar/restore-virtualenv"><img alt="restore-virtualenv status" src="https://github.com/syphar/restore-virtualenv/workflows/CI/badge.svg"></a>
</p>

GitHub Action caches improve build times and reduce network dependencies. However, when creating github actions for
python I find myself repeating some patterns. One of them is loading a cached virtualenv for a python app. In the end, most of the pull requests don't change requirements.

The default python tutorials you find mostly use `pip install` directly into the system python installation. This breaks the third-party / standard library detection in `isort`.

Writing the correct cache logic is [tricky](https://github.com/actions/cache/blob/0781355a23dac32fd3bac414512f4b903437991a/examples.md#python---pip). You need to understand how the [cache action](https://github.com/actions/cache) (keys and restore keys) work. Did you know the default cache will not save the cache if restoring had an exact match? Or that the current cache on github side is insert-only and never updates a cache key?

`restore-virtualenv` is a simple 1-liner that
- gives you either an new virtualenv, or restores an old one based on the requirements-file.
- Works on Ubuntu, MacOS and Windows
- sets `$VIRTUAL_ENV` and `$PATH` environment for the virtualenv.
- Restore keys take the OS into account, and the major and minor python version. for patch-updates the virtualenv can be reused.
- will use any typical requirements file to build the cache key (poetry, pipenv, pip-requirements-txt)
- Builds on the [native cache functionality of GitHub Actions](https://github.com/actions/toolkit/tree/master/packages/cache), same as [v2 of the generic cache action](https://github.com/actions/cache/issues/55#issuecomment-629433225)

## Usage

Add this step before any `pip install` and after your `actions/setup-python` step:
```yml
- uses: syphar/restore-virtualenv@v1
```

For example:

`.github/workflows/ci.yml`
```yaml
name: CI

on: [push]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1

    - uses: actions/setup-python@v2

    - uses: syphar/restore-virtualenv@v1
      id: cache-virtualenv
      with:
        requirement_files: requirements.txt  # this is optional

    - uses: syphar/restore-pip-download-cache@v1
      if: steps.cache-virtualenv.outputs.cache-hit != 'true'

      # the package installation will only be executed when the
      # requirements-files have changed.
    - run: pip install -r requirements.txt
      if: steps.cache-virtualenv.outputs.cache-hit != 'true'

    - name: Test
      run: py.test
```

This action can also be used if you want to have multiple jobs running in parallel that should use the same virtualenv.

`.github/workflows/ci.yml`
```yaml
name: CI

on: [push]

jobs:
  create-virtualenv:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-python@v2
    - uses: syphar/restore-virtualenv@v1
      id: cache-virtualenv

    - uses: syphar/restore-pip-download-cache@v1
      if: steps.cache-virtualenv.outputs.cache-hit != 'true'

    - run: pip install -r requirements.txt
      if: steps.cache-virtualenv.outputs.cache-hit != 'true'

  linter:
    needs: create-virtualenv
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-python@v2
    - uses: syphar/restore-virtualenv@v1
      id: cache-virtualenv

    - run: flake8
    - run: pydocstyle
    - run: isort . --diff --check-only
    - run: black --check --diff .

  tests:
    needs: create-virtualenv
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-python@v2
    - uses: syphar/restore-virtualenv@v1
      id: cache-virtualenv

    - run: py.test
```

## inputs

### `requirement_files`

When the default does not suffice you can provide a [glob pattern](https://github.com/actions/toolkit/tree/1cc56db0ff126f4d65aeb83798852e02a2c180c3/packages/glob) for the files that, when changed, change the virtualenv.

Most of the time that is the requirements-files.

Default for this input is:
```
**/requirements*.txt
**/requirements/*.txt
**/Pipfile.lock
**/poetry.lock
```

### `custom_cache_key_element`
For testing and cache-busting you can provide a string that will included in the generated cache-key.

Default is: `v1`

### `custom_virtualenv_dir`
By default the virtual environment will be created under `~/.venv`. With this input you can define a custom directory, relative to the home-directory.

## License

The project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
