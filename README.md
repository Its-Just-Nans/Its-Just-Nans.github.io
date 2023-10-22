# Its-Just-Nans.github.io

Website on [GitHub pages](https://its-just-nans.github.io) !

## Branches

- `v1` old website in VanillaJS
- `v2` old website in [Svelte](https://svelte.dev)
- `main` current website in [Astro](https://astro.build)

## Dev

```sh
# clone data repo
git submodule update --recursive --init
# install pre-commit
python -m pip install -u pre-commit
# install pre-commit hook
python -m pre_commit install

# useful command
python -m pre_commit run --all-files
```
