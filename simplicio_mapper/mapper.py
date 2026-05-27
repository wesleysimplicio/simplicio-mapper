"""Project mapper that emits the Simplicio machine-readable artifacts.

This is the Python port of ``bin/mapper-artifacts.js``. It produces
``.simplicio/project-map.json`` (schema ``simplicio.project-map/v1``) and
``.simplicio/precedent-index.json`` (schema ``simplicio.precedent-index/v1``)
as documented in ``SIMPLICIO_INTEGRATION.md``. Pure standard library, no
third-party dependencies.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from typing import Any, Callable

ARTIFACT_SCHEMA = "simplicio.project-map/v1"
PRECEDENT_SCHEMA = "simplicio.precedent-index/v1"
ARTIFACT_VERSION = 1

TEXT_EXTS = {
    ".md", ".txt", ".json", ".jsonc", ".yml", ".yaml", ".toml",
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".go", ".rs", ".java", ".kt", ".php", ".rb", ".cs",
    ".cshtml", ".razor", ".sh", ".ps1", ".env", "",
}

SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", "out", "coverage",
    ".next", ".nuxt", "playwright-report", "test-results", ".turbo",
    ".venv", "venv", "__pycache__", ".idea", ".vscode", ".simplicio",
    ".catalog", ".receipts",
}

CONFIG_FILES = {
    "package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml",
    "pom.xml", "build.gradle", "settings.gradle", "tsconfig.json",
    "vite.config.ts", "next.config.js", "angular.json", "Dockerfile",
}

LANGUAGE_BY_EXT = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".php": "php",
    ".rb": "ruby",
    ".cs": "csharp",
    ".cshtml": "razor",
    ".razor": "razor",
    ".md": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".sh": "shell",
    ".ps1": "powershell",
}

ENTRYPOINT_STEMS = {"index", "main", "server", "app", "program", "cli"}
TOKEN_STOPWORDS = {"src", "lib", "test", "tests", "index", "main"}


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _now_iso() -> str:
    return _iso(datetime.now(timezone.utc))


def _normalize_rel(file: str) -> str:
    return file.replace(os.sep, "/")


def _read_safe(file: str) -> str:
    try:
        with open(file, "r", encoding="utf-8", errors="replace") as handle:
            return handle.read()
    except OSError:
        return ""


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _parse_json_safe(file: str) -> dict:
    try:
        return json.loads(_read_safe(file) or "{}")
    except (ValueError, TypeError):
        return {}


def _walk(root: str):
    try:
        entries = sorted(os.scandir(root), key=lambda e: e.name)
    except OSError:
        return
    for entry in entries:
        if entry.name in SKIP_DIRS:
            continue
        if entry.is_dir(follow_symlinks=False):
            yield from _walk(entry.path)
        elif entry.is_file(follow_symlinks=False):
            yield entry.path


def _language_for(file: str) -> str:
    base = os.path.basename(file)
    if base == "Dockerfile":
        return "dockerfile"
    ext = os.path.splitext(file)[1].lower()
    if ext in LANGUAGE_BY_EXT:
        return LANGUAGE_BY_EXT[ext]
    return ext[1:] if ext else "text"


def _git_status_map(cwd: str) -> dict[str, str]:
    out: dict[str, str] = {}
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (OSError, subprocess.SubprocessError):
        return out
    if result.returncode != 0:
        return out
    for line in (result.stdout or "").split("\n"):
        if not line.strip():
            continue
        status = line[:2].strip() or "modified"
        raw = line[3:].strip()
        file = raw.split(" -> ")[-1] if " -> " in raw else raw
        out[_normalize_rel(file)] = status
    return out


def _collect_text_files(cwd: str) -> list[str]:
    files = []
    for file in _walk(cwd):
        ext = os.path.splitext(file)[1].lower()
        if ext not in TEXT_EXTS:
            continue
        try:
            if os.path.getsize(file) > 250_000:
                continue
        except OSError:
            continue
        files.append(file)
    return sorted(files)


def _parse_imports(text: str, language: str) -> list[str]:
    patterns: list[re.Pattern[str]] = []
    if language in ("javascript", "typescript"):
        patterns.append(re.compile(r"import\s+[^'\"]*['\"]([^'\"]+)['\"]"))
        patterns.append(re.compile(r"require\(['\"]([^'\"]+)['\"]\)"))
    elif language == "python":
        patterns.append(re.compile(r"^\s*from\s+([A-Za-z0-9_.]+)\s+import\s+", re.MULTILINE))
        patterns.append(re.compile(r"^\s*import\s+([A-Za-z0-9_.]+)", re.MULTILINE))
    elif language in ("csharp", "razor"):
        patterns.append(re.compile(r"^\s*using\s+([A-Za-z0-9_.]+)\s*;", re.MULTILINE))
    elif language == "go":
        patterns.append(re.compile(r'^\s*import\s+"([^"]+)"', re.MULTILINE))
    found: list[str] = []
    for pattern in patterns:
        for match in pattern.finditer(text):
            found.append(match.group(1))
    uniq = list(dict.fromkeys(found))
    return sorted(uniq[:20])


_SYMBOL_PATTERNS = [
    re.compile(r"\bclass\s+([A-Z][A-Za-z0-9_]*)"),
    re.compile(r"\bfunction\s+([A-Za-z0-9_]+)"),
    re.compile(r"\bexport\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)"),
    re.compile(r"\bexport\s+const\s+([A-Za-z0-9_]+)"),
    re.compile(r"\bdef\s+([A-Za-z0-9_]+)"),
    re.compile(r"\bfunc\s+([A-Za-z0-9_]+)"),
]


def _parse_symbols(text: str) -> list[str]:
    found: list[str] = []
    for pattern in _SYMBOL_PATTERNS:
        for match in pattern.finditer(text):
            found.append(match.group(1))
    uniq = list(dict.fromkeys(found))
    return sorted(uniq[:30])


_RE_TEST_PATH = re.compile(r"(\b|/)(__tests__|tests?|specs?)(/|\b)", re.IGNORECASE)
_RE_TEST_FILE = re.compile(r"\.(test|spec)\.[^.]+$", re.IGNORECASE)
_RE_CONFIG = re.compile(r"config|rc$|\.config\.", re.IGNORECASE)
_RE_ROUTE = re.compile(r"routes?|controllers?|pages?|app/", re.IGNORECASE)
_RE_UI = re.compile(r"components?|views?", re.IGNORECASE)
_RE_DOMAIN = re.compile(r"services?|repositories?|models?|entities?", re.IGNORECASE)


def _roles_for(rel: str, pkg: dict) -> list[str]:
    roles: set[str] = set()
    base = os.path.basename(rel)
    no_ext = re.sub(r"\.[^.]+$", "", base).lower()
    if _RE_TEST_PATH.search(rel) or _RE_TEST_FILE.search(base):
        roles.add("test")
    if base in CONFIG_FILES or _RE_CONFIG.search(base):
        roles.add("config")
    main_value = _normalize_rel(pkg["main"]) if isinstance(pkg.get("main"), str) else ""
    bin_field = pkg.get("bin")
    if isinstance(bin_field, str):
        bin_values = [_normalize_rel(bin_field)]
    elif isinstance(bin_field, dict):
        bin_values = [_normalize_rel(v) for v in bin_field.values() if isinstance(v, str)]
    else:
        bin_values = []
    if main_value == rel or rel in bin_values or no_ext in ENTRYPOINT_STEMS:
        roles.add("entrypoint")
    if _RE_ROUTE.search(rel):
        roles.add("route")
    if _RE_UI.search(rel):
        roles.add("ui")
    if _RE_DOMAIN.search(rel):
        roles.add("domain")
    return sorted(roles)


def _importance_for(meta: dict) -> float:
    score = 0.12
    roles = meta["roles"]
    if "entrypoint" in roles:
        score += 0.45
    if "test" in roles:
        score += 0.25
    if "config" in roles:
        score += 0.2
    if "domain" in roles:
        score += 0.2
    if meta["imports"]:
        score += 0.08
    if meta["exports"]:
        score += 0.08
    if meta["git_status"] and meta["git_status"] != "clean":
        score += 0.2
    return min(1.0, round(score, 2))


_RE_CAMEL = re.compile(r"([a-z])([A-Z])")
_RE_NON_ALNUM = re.compile(r"[^A-Za-z0-9]+")


def _token_words(value: Any) -> list[str]:
    spaced = _RE_CAMEL.sub(r"\1 \2", str(value or ""))
    out = []
    for part in _RE_NON_ALNUM.split(spaced):
        token = part.lower()
        if len(token) > 2 and token not in TOKEN_STOPWORDS:
            out.append(token)
    return out


def _collect_entities(files: list[dict]) -> list[dict]:
    scores: dict[str, int] = {}
    for file in files:
        stem = os.path.basename(file["path"])
        ext = os.path.splitext(file["path"])[1]
        if ext and stem.endswith(ext):
            stem = stem[: -len(ext)]
        for token in _token_words(stem):
            scores[token] = scores.get(token, 0) + 1
        for symbol in file.get("exports", []):
            for token in _token_words(symbol):
                scores[token] = scores.get(token, 0) + 2
    ordered = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    return [{"name": name, "score": score} for name, score in ordered[:30]]


_ARCH_CHECKS = [
    ("nextjs", re.compile(r"next")),
    ("react", re.compile(r"react")),
    ("vue", re.compile(r"vue")),
    ("angular", re.compile(r"angular|@angular")),
    ("express", re.compile(r"express")),
    ("nestjs", re.compile(r"nestjs|@nestjs")),
    ("fastapi", re.compile(r"fastapi")),
    ("django", re.compile(r"django")),
    ("dotnet", re.compile(r"aspnetcore|\.csproj|dotnet")),
    ("go", re.compile(r"\bgo\.mod\b|\bgin\b|\bfiber\b")),
    ("rust", re.compile(r"cargo\.toml|actix|axum")),
    ("playwright", re.compile(r"playwright")),
    ("stripe", re.compile(r"stripe")),
    ("prisma", re.compile(r"prisma")),
]


def _collect_architecture_signals(pkg: dict, corpus: str, stack: str) -> list[str]:
    text = f"{stack}\n{json.dumps(pkg)}\n{corpus}".lower()
    return sorted(name for name, rx in _ARCH_CHECKS if rx.search(text))


def _group_modules(files: list[dict]) -> list[dict]:
    groups: dict[str, dict] = {}
    for file in files:
        first = file["path"].split("/")[0] if "/" in file["path"] else "."
        group = groups.setdefault(first, {"name": first, "files": [], "roles": set()})
        group["files"].append(file["path"])
        group["roles"].update(file["roles"])
    result = []
    for group in sorted(groups.values(), key=lambda g: g["name"]):
        result.append({
            "name": group["name"],
            "files": group["files"][:20],
            "roles": sorted(group["roles"]),
            "file_count": len(group["files"]),
        })
    return result


def _detect_changed_files(files, previous_map, status_map, incremental) -> list[str]:
    previous = {f["path"]: f for f in previous_map.get("files", [])}
    changed = {file for file, status in status_map.items() if status != "clean"}
    if incremental:
        for file in files:
            before = previous.get(file["path"])
            if not before or before.get("file_hash") != file["file_hash"] or before.get("size_bytes") != file["size_bytes"]:
                changed.add(file["path"])
    present = {entry["path"] for entry in files}
    return sorted(file for file in changed if file in present)


def _load_previous_map(output_dir: str) -> dict:
    target = os.path.join(output_dir, "project-map.json")
    try:
        with open(target, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def _build_file_inventory(cwd: str, pkg: dict, status_map: dict) -> list[dict]:
    inventory = []
    for abs_path in _collect_text_files(cwd):
        rel = _normalize_rel(os.path.relpath(abs_path, cwd))
        text = _read_safe(abs_path)
        stat = os.stat(abs_path)
        language = _language_for(rel)
        roles = _roles_for(rel, pkg)
        imports = _parse_imports(text, language)
        exports = _parse_symbols(text)
        entry = {
            "path": rel,
            "language": language,
            "size_bytes": stat.st_size,
            "last_modified": _iso(datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)),
            "file_hash": _sha256(text),
            "git_status": status_map.get(rel, "clean"),
            "roles": roles,
            "imports": imports,
            "exports": exports,
        }
        entry["importance"] = _importance_for(entry)
        inventory.append(entry)
    return sorted(inventory, key=lambda e: e["path"])


_RE_PLACEHOLDER = re.compile(r"<[A-Z][A-Z0-9_]+>")
_PRECEDENT_PATTERNS = [
    (re.compile(r"\btest\s*\(|\bit\s*\(|\bdescribe\s*\(|\bdef\s+test_", re.IGNORECASE), "test"),
    (re.compile(r"\bclass\s+[A-Z]|\bfunction\s+\w+|\bdef\s+\w+|\bfunc\s+\w+", re.IGNORECASE), None),
    (re.compile(r"\btry\b|\bcatch\b|\bexcept\b|\bthrow\b", re.IGNORECASE), "error-handling"),
    (re.compile(r"\brouter\.|\bapp\.get\b|\bapp\.post\b|@app\.", re.IGNORECASE), "route"),
]


def _extract_snippet(lines: list[str], line_index: int, radius: int = 2) -> str:
    start = max(0, line_index - radius)
    end = min(len(lines), line_index + radius + 1)
    return "\n".join(lines[start:end])[:1200]


def _build_precedent_items(cwd: str, files: list[dict]) -> list[dict]:
    items = []
    for file in files:
        abs_path = os.path.join(cwd, file["path"])
        lines = _read_safe(abs_path).split("\n")
        is_test = "test" in file["roles"]
        for i, line in enumerate(lines):
            change_type = None
            for rx, fixed_type in _PRECEDENT_PATTERNS:
                if rx.search(line):
                    change_type = fixed_type if fixed_type is not None else ("test" if is_test else "feature")
                    break
            if change_type is None:
                continue
            snippet = _extract_snippet(lines, i)
            if _RE_PLACEHOLDER.search(snippet):
                break
            tags = list(dict.fromkeys(
                [r for r in file["roles"] if r]
                + ([file["language"]] if file["language"] else [])
                + _token_words(file["path"])
            ))[:10]
            items.append({
                "id": _sha256(f"{file['path']}:{i + 1}:{line}")[:16],
                "path": file["path"],
                "line": i + 1,
                "language": file["language"],
                "change_type": change_type,
                "tags": tags,
                "summary": f"{change_type} precedent in {file['path']}",
                "snippet": snippet,
            })
            break
    items.sort(key=lambda item: (item["path"], item["line"]))
    return items[:250]


def build_artifacts(cwd: str, meta: dict | None = None, incremental: bool = False,
                    output_dir: str = ".simplicio") -> dict:
    meta = meta or {}
    abs_cwd = os.path.abspath(cwd or os.getcwd())
    abs_out = os.path.abspath(os.path.join(abs_cwd, output_dir))
    pkg = _parse_json_safe(os.path.join(abs_cwd, "package.json"))
    status_map = _git_status_map(abs_cwd)
    previous_map = _load_previous_map(abs_out)
    files = _build_file_inventory(abs_cwd, pkg, status_map)
    corpus = "\n".join(_read_safe(os.path.join(abs_cwd, f["path"]))[:3000] for f in files[:80])
    changed_files = _detect_changed_files(files, previous_map, status_map, incremental)
    stack = meta.get("stack") or pkg.get("type") or "unknown"
    product_name = meta.get("product_name") or pkg.get("name") or os.path.basename(abs_cwd)
    architecture_signals = _collect_architecture_signals(pkg, corpus, stack)
    generated_at = _now_iso()

    if os.path.exists(os.path.join(abs_cwd, "pnpm-lock.yaml")):
        package_manager = "pnpm"
    elif os.path.exists(os.path.join(abs_cwd, "yarn.lock")):
        package_manager = "yarn"
    else:
        package_manager = "npm"

    web_signal = "react" in architecture_signals or "nextjs" in architecture_signals
    if meta.get("project_mode") == "monorepo":
        system_type = "monorepo"
    else:
        system_type = "web" if web_signal else "library-or-service"

    project_map = {
        "schema": ARTIFACT_SCHEMA,
        "version": ARTIFACT_VERSION,
        "generated_at": generated_at,
        "update_mode": "incremental" if incremental else "full",
        "product": {
            "name": product_name,
            "stack": stack,
            "project_mode": meta.get("project_mode", "root"),
        },
        "files": files,
        "entry_points": [f["path"] for f in files if "entrypoint" in f["roles"]],
        "test_files": [f["path"] for f in files if "test" in f["roles"]],
        "config_files": [f["path"] for f in files if "config" in f["roles"]],
        "modules": _group_modules(files),
        "entities": _collect_entities(files),
        "architecture": {
            "signals": architecture_signals,
            "system_type": system_type,
        },
        "dependencies": {
            "package_manager": package_manager,
            "manifest": "package.json" if pkg.get("name") else None,
            "runtime": sorted((pkg.get("dependencies") or {}).keys()),
            "dev": sorted((pkg.get("devDependencies") or {}).keys()),
        },
        "recent_changes": [
            {"path": file, "status": status_map.get(file, "modified")} for file in changed_files
        ],
        "changed_files": changed_files,
        "integration": {
            "dev_cli_mapper": "read .simplicio/project-map.json, then use .simplicio/precedent-index.json for task-specific examples",
            "contract": "SIMPLICIO_INTEGRATION.md",
        },
    }

    precedent_index = {
        "schema": PRECEDENT_SCHEMA,
        "version": ARTIFACT_VERSION,
        "generated_at": generated_at,
        "source_project_map": ".simplicio/project-map.json",
        "items": _build_precedent_items(abs_cwd, files),
    }

    return {"project_map": project_map, "precedent_index": precedent_index}


def _write_json_stable(file: str, data: Any) -> None:
    os.makedirs(os.path.dirname(file), exist_ok=True)
    with open(file, "w", encoding="utf-8") as handle:
        handle.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def write_mapping_artifacts(cwd: str, meta: dict | None = None, incremental: bool = False,
                            output_dir: str = ".simplicio",
                            log: Callable[[str], None] | None = None) -> dict:
    log = log or (lambda _line: None)
    abs_cwd = os.path.abspath(cwd or os.getcwd())
    abs_out = os.path.abspath(os.path.join(abs_cwd, output_dir))
    artifacts = build_artifacts(abs_cwd, meta, incremental, output_dir)
    project_map = artifacts["project_map"]
    precedent_index = artifacts["precedent_index"]
    project_map_path = os.path.join(abs_out, "project-map.json")
    precedent_path = os.path.join(abs_out, "precedent-index.json")
    _write_json_stable(project_map_path, project_map)
    _write_json_stable(precedent_path, precedent_index)
    log(f"-> wrote {os.path.relpath(project_map_path, abs_cwd)} "
        f"({len(project_map['files'])} files, {len(project_map['changed_files'])} changed)")
    log(f"-> wrote {os.path.relpath(precedent_path, abs_cwd)} "
        f"({len(precedent_index['items'])} precedents)")
    return {
        "project_map_path": project_map_path,
        "precedent_path": precedent_path,
        "project_map": project_map,
        "precedent_index": precedent_index,
    }
