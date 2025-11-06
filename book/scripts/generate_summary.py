#!/usr/bin/env python3
"""
Utility for generating an mdBook-compatible SUMMARY.md by walking a markdown
directory tree. Titles are derived from the first level-1 heading when
available, and fall back to the file or directory name with common numeric
prefixes removed.
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Set


DEFAULT_IGNORE_DIRS = {
    ".git",
    ".github",
    ".vscode",
    ".idea",
    ".venv",
    ".mypy_cache",
    "__pycache__",
    "node_modules",
    "scripts",
    "target",
    "build",
    "book",
    "dist",
}
DEFAULT_IGNORE_FILES = {"SUMMARY.md"}
MD_SUFFIXES = {".md", ".markdown", ".mdown"}
INDEX_NAME_PREFERENCE = ("Context.md", "context.md", "Content.md", "content.md")
INDEX_FILENAME_SET = {name.lower() for name in INDEX_NAME_PREFERENCE}


@dataclass
class SummaryNode:
    title: str
    source_path: Optional[Path] = None
    children: List["SummaryNode"] = field(default_factory=list)

    def has_children(self) -> bool:
        return bool(self.children)


def natural_sort_key(value: str) -> Sequence[object]:
    parts = re.split(r"(\d+)", value)
    return [int(part) if part.isdigit() else part.lower() for part in parts]


def clean_title_from_name(name: str) -> str:
    # Drop file extension if present
    stem = Path(name).stem
    if not stem:
        stem = name
    stem = stem.replace("_", " ").replace("-", " ").strip()
    cleaned = re.sub(r"^\d+[\s\.]*", "", stem)
    return cleaned or stem


def extract_title_from_file(path: Path) -> Optional[str]:
    try:
        with path.open("r", encoding="utf-8", errors="ignore") as handle:
            for raw_line in handle:
                line = raw_line.lstrip("\ufeff").strip()
                if not line:
                    continue
                if line.startswith("#"):
                    # collect the portion after leading hashes
                    heading = line.lstrip("#").strip()
                    if heading:
                        return heading
    except FileNotFoundError:
        return None
    return None


def pick_directory_title(directory: Path, default_file: Optional[Path]) -> str:
    if default_file:
        heading = extract_title_from_file(default_file)
        if heading:
            return heading
    return clean_title_from_name(directory.name)


def pick_file_title(file_path: Path) -> str:
    heading = extract_title_from_file(file_path)
    if heading:
        return heading
    return clean_title_from_name(file_path.name)


def is_ignored_dir(path: Path, ignored: Set[str]) -> bool:
    name = path.name
    return name in ignored or name.startswith(".")


def is_ignored_file(path: Path, ignored: Set[str]) -> bool:
    name = path.name
    if name in ignored or name.startswith("."):
        return True
    return path.suffix.lower() not in MD_SUFFIXES


def find_default_file(directory: Path) -> Optional[Path]:
    candidates = [
        "README.md",
        "Readme.md",
        "readme.md",
        "index.md",
        "Index.md",
        "INDEX.md",
        "Content.md",
        "content.md",
        "Context.md",
        "context.md",
    ]
    for candidate in candidates:
        candidate_path = directory / candidate
        if candidate_path.is_file():
            return candidate_path
    return None


def is_index_file(path: Path) -> bool:
    return path.name.lower() in INDEX_FILENAME_SET


def find_existing_index_file(directory: Path) -> Optional[Path]:
    for name in INDEX_NAME_PREFERENCE:
        candidate = directory / name
        if candidate.is_file():
            return candidate
    return None


def build_file_node(file_path: Path) -> SummaryNode:
    title = pick_file_title(file_path)
    return SummaryNode(title=title, source_path=file_path)


def build_directory_node(
    directory: Path, ignored_dirs: Set[str], ignored_files: Set[str]
) -> Optional[SummaryNode]:
    entries: List[SummaryNode] = []
    index_file = find_existing_index_file(directory)

    subdirs = sorted(
        [d for d in directory.iterdir() if d.is_dir() and not is_ignored_dir(d, ignored_dirs)],
        key=lambda d: natural_sort_key(d.name),
    )
    markdown_files = sorted(
        [
            f
            for f in directory.iterdir()
            if f.is_file() and not is_ignored_file(f, ignored_files)
        ],
        key=lambda f: natural_sort_key(f.name),
    )

    files_without_index: List[Path] = []
    for file_path in markdown_files:
        if index_file and file_path.resolve() == index_file.resolve():
            continue
        files_without_index.append(file_path)

    for file_path in files_without_index:
        entries.append(build_file_node(file_path))

    for subdir in subdirs:
        child = build_directory_node(subdir, ignored_dirs, ignored_files)
        if child:
            entries.append(child)

    has_non_index_files = bool(files_without_index)
    has_entries = bool(entries)

    created_index = False
    if not index_file and has_entries and not has_non_index_files:
        index_file = directory / "Content.md"
        created_index = True

    default_file = find_default_file(directory)
    if index_file and (created_index or default_file is None or is_index_file(default_file)):
        default_file = index_file
    elif default_file is None and files_without_index:
        default_file = files_without_index[0]

    if index_file and has_entries:
        existing_heading = extract_title_from_file(index_file) if index_file.exists() else None
        index_title = existing_heading or clean_title_from_name(directory.name)
        write_directory_index(index_file, index_title, entries, directory)
    elif index_file and created_index and not has_entries:
        index_title = clean_title_from_name(directory.name)
        write_directory_index(index_file, index_title, entries, directory)

    if not default_file and not has_entries:
        return None

    if default_file:
        entries = [
            entry
            for entry in entries
            if not (
                entry.source_path
                and entry.source_path.resolve() == default_file.resolve()
            )
        ]

    title = pick_directory_title(directory, default_file)
    node = SummaryNode(title=title, source_path=default_file, children=entries)
    return node


def collect_root_nodes(
    root: Path, ignored_dirs: Set[str], ignored_files: Set[str]
) -> List[SummaryNode]:
    nodes: List[SummaryNode] = []

    files = sorted(
        [
            f
            for f in root.iterdir()
            if f.is_file() and not is_ignored_file(f, ignored_files)
        ],
        key=lambda item: natural_sort_key(item.name),
    )
    subdirs = sorted(
        [d for d in root.iterdir() if d.is_dir() and not is_ignored_dir(d, ignored_dirs)],
        key=lambda item: natural_sort_key(item.name),
    )

    for file_path in files:
        nodes.append(build_file_node(file_path))

    for directory in subdirs:
        node = build_directory_node(directory, ignored_dirs, ignored_files)
        if node:
            nodes.append(node)

    return nodes


def format_nodes(
    nodes: Iterable[SummaryNode],
    summary_dir: Path,
    depth: int = 0,
    indent_size: int = 4,
) -> List[str]:
    lines: List[str] = []
    for node in nodes:
        if node.source_path:
            indent = " " * indent_size * depth
            relative_path = Path(os.path.relpath(node.source_path, start=summary_dir))
            link = relative_path.as_posix()
            lines.append(f"{indent}- [{node.title}]({link})")
            child_depth = depth + 1
        else:
            heading_level = min(6, depth + 1)
            if lines and lines[-1] != "":
                lines.append("")
            lines.append(f"{'#' * heading_level} {node.title}")
            lines.append("")
            child_depth = 0

        if node.children:
            child_lines = format_nodes(node.children, summary_dir, child_depth, indent_size)
            lines.extend(child_lines)
            if not node.source_path and child_lines and child_lines[-1] != "":
                lines.append("")
    return lines


def write_directory_index(
    index_path: Path, title: str, entries: Sequence[SummaryNode], base_dir: Path
) -> None:
    lines: List[str] = [f"# {title}", ""]
    if entries:
        lines.extend(format_nodes(entries, base_dir))
    if lines and lines[-1] != "":
        lines.append("")
    index_path.parent.mkdir(parents=True, exist_ok=True)
    index_path.write_text("\n".join(lines), encoding="utf-8")


def write_summary(summary_path: Path, nodes: Sequence[SummaryNode], title: str) -> None:
    summary_lines = ["# " + title, ""]
    summary_dir = summary_path.parent
    summary_lines.extend(format_nodes(nodes, summary_dir))

    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate an mdBook SUMMARY.md file by scanning markdown files."
    )
    parser.add_argument(
        "--root",
        default=".",
        type=Path,
        help="Root directory containing markdown content (default: current directory).",
    )
    parser.add_argument(
        "--summary-path",
        type=Path,
        help="Output path for SUMMARY.md (default: <root>/SUMMARY.md).",
    )
    parser.add_argument(
        "--title",
        default="Summary",
        help="Title to use for the summary document (default: Summary).",
    )
    parser.add_argument(
        "--ignore-dir",
        action="append",
        default=[],
        dest="ignore_dirs",
        help="Additional directory name to ignore. Can be specified multiple times.",
    )
    parser.add_argument(
        "--ignore-file",
        action="append",
        default=[],
        dest="ignore_files",
        help="Additional file name to ignore. Can be specified multiple times.",
    )
    parser.add_argument(
        "--include-root-files",
        action="store_true",
        help="Include markdown files directly under the root directory.",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = parse_args(argv)
    root = args.root.resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Content root directory not found: {root}")

    summary_path = args.summary_path or (root / "SUMMARY.md")
    summary_path = summary_path.resolve()

    ignored_dirs = set(DEFAULT_IGNORE_DIRS)
    ignored_dirs.update(args.ignore_dirs)
    ignored_files = set(DEFAULT_IGNORE_FILES)
    ignored_files.update(args.ignore_files)

    nodes = collect_root_nodes(root, ignored_dirs, ignored_files)
    if not args.include_root_files:
        nodes = [
            node
            for node in nodes
            if node.source_path is None or node.source_path.parent != root
        ]

    if not nodes:
        raise SystemExit("No markdown content discovered. SUMMARY.md will not be created.")

    write_summary(summary_path, nodes, args.title)


if __name__ == "__main__":
    main()
