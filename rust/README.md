# simplicio-mapper-rs

Optional Rust acceleration crate for [simplicio-mapper](https://pypi.org/project/simplicio-mapper/).

Exposes two PyO3-bound functions used by the mapper's hot paths:

- `sha256_hex(text)` — content hash for the file inventory.
- `parse_imports(text, language)` — language-aware import extractor for
  JavaScript/TypeScript, Python, C#/Razor and Go.

The Python package falls back to pure-Python equivalents when this crate is not
installed, so it remains entirely optional.

## Build (development)

```bash
pip install maturin
cd rust
maturin develop --release
```

This builds the extension into the active virtualenv as
`simplicio_mapper_rs`.

## Build a wheel

```bash
maturin build --release
```

Wheels are written to `target/wheels/`.

## License

MIT
