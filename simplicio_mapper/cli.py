"""Command-line entry point for simplicio-mapper.

Mirrors ``bin/map.js``: generates or refreshes the machine-readable mapper
artifacts under ``.simplicio/``. Exposed as the ``simplicio-mapper`` and
``llm-project-mapper`` console scripts (see ``pyproject.toml``).
"""

from __future__ import annotations

import json
import os
import sys
import time
from typing import Sequence

from . import __version__
from .mapper import write_mapping_artifacts

HELP_TEXT = """simplicio-mapper map

Generate or update machine-readable mapper artifacts.

USAGE
  simplicio-mapper map [--root <dir>] [--incremental] [--watch]
  simplicio-mapper update [--root <dir>] [--watch]

OPTIONS
  --root <dir>          Project root to map. Defaults to cwd.
  --stack <name>        Stack hint when .starter-meta.json is absent.
  --product-name <name> Product name hint when .starter-meta.json is absent.
  --out <dir>           Artifact directory. Defaults to .simplicio.
  --incremental         Record changed files and update existing artifacts.
  --watch               Re-run mapping when local files change.
  --silent              Minimal output.
  -V, --version         Show version and exit.
  -h, --help            Show this help
"""


def _read_json_safe(file: str) -> dict:
    try:
        with open(file, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def _parse_args(argv: Sequence[str]) -> dict:
    opts = {
        "root": os.getcwd(),
        "out": ".simplicio",
        "stack": "",
        "product_name": "",
        "incremental": False,
        "watch": False,
        "silent": False,
    }
    command = "update" if argv and argv[0] == "update" else "map"
    if command == "update":
        opts["incremental"] = True
    i = 1 if argv and argv[0] in ("map", "update") else 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--root":
            i += 1
            opts["root"] = argv[i]
        elif arg == "--out":
            i += 1
            opts["out"] = argv[i]
        elif arg == "--stack":
            i += 1
            opts["stack"] = argv[i]
        elif arg == "--product-name":
            i += 1
            opts["product_name"] = argv[i]
        elif arg == "--incremental":
            opts["incremental"] = True
        elif arg == "--watch":
            opts["watch"] = True
        elif arg == "--silent":
            opts["silent"] = True
        elif arg in ("-h", "--help"):
            print(HELP_TEXT)
            sys.exit(0)
        elif arg in ("-V", "--version"):
            print(__version__)
            sys.exit(0)
        else:
            print(f"Unknown map option: {arg}", file=sys.stderr)
            print("Run `simplicio-mapper map --help` for usage.", file=sys.stderr)
            sys.exit(2)
        i += 1
    return opts


def _run_once(opts: dict) -> dict:
    root = os.path.abspath(opts["root"])
    meta = dict(_read_json_safe(os.path.join(root, ".starter-meta.json")))
    if opts["stack"]:
        meta["stack"] = opts["stack"]
    if opts["product_name"]:
        meta["product_name"] = opts["product_name"]
    log = (lambda _line: None) if opts["silent"] else print
    return write_mapping_artifacts(
        cwd=root,
        meta=meta,
        incremental=opts["incremental"],
        output_dir=opts["out"],
        log=log,
    )


def _signature(root: str, out: str) -> tuple:
    abs_out = os.path.abspath(os.path.join(root, out))
    entries = []
    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules") and os.path.abspath(os.path.join(current, d)) != abs_out]
        for name in files:
            path = os.path.join(current, name)
            try:
                stat = os.stat(path)
            except OSError:
                continue
            entries.append((path, stat.st_mtime_ns, stat.st_size))
    return tuple(sorted(entries))


def _watch(opts: dict) -> None:
    root = os.path.abspath(opts["root"])
    print(f"watching {root} for mapper updates...")
    last = _signature(root, opts["out"])
    try:
        while True:
            time.sleep(0.5)
            current = _signature(root, opts["out"])
            if current != last:
                last = current
                try:
                    _run_once({**opts, "incremental": True})
                except Exception as error:  # noqa: BLE001 - watch loop must not crash
                    print(f"map update failed: {error}", file=sys.stderr)
    except KeyboardInterrupt:
        pass


def main(argv: Sequence[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    opts = _parse_args(argv)
    _run_once(opts)
    if opts["watch"]:
        _watch(opts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
