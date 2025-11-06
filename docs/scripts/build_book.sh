#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

CONTENT_ROOT="${CONTENT_ROOT:-}"
if [[ -z "${CONTENT_ROOT}" ]]; then
    if [[ -d "${REPO_ROOT}/src" ]]; then
        CONTENT_ROOT="${REPO_ROOT}/src"
    else
        CONTENT_ROOT="${REPO_ROOT}"
    fi
fi

SUMMARY_PATH="${SUMMARY_PATH:-${CONTENT_ROOT}/SUMMARY.md}"
SUMMARY_TITLE="${SUMMARY_TITLE:-Summary}"
BOOK_ROOT="${BOOK_ROOT:-${REPO_ROOT}}"

if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 not found in PATH" >&2
    exit 1
fi

if ! command -v mdbook >/dev/null 2>&1; then
    echo "mdbook not found in PATH. Install mdBook before running this script." >&2
    exit 1
fi

PY_ARGS=(
    --root "${CONTENT_ROOT}"
    --summary-path "${SUMMARY_PATH}"
    --title "${SUMMARY_TITLE}"
)

if [[ "${INCLUDE_ROOT_FILES:-0}" == "1" ]]; then
    PY_ARGS+=(--include-root-files)
fi

echo "Generating SUMMARY.md at ${SUMMARY_PATH}..."
python3 "${SCRIPT_DIR}/generate_summary.py" "${PY_ARGS[@]}"

echo "Running mdbook build in ${BOOK_ROOT}..."
mdbook build "${BOOK_ROOT}"

if [[ ! -d "${BOOK_ROOT}/book" ]] || [[ -z "$(ls -A "${BOOK_ROOT}/book" 2>/dev/null)" ]]; then
    echo "mdbook build did not produce any output in ${BOOK_ROOT}/book" >&2
    exit 1
fi

TARGET="/mnt/c/Apps/localweb/www/note"

if [[ -d "${TARGET}" ]]; then
    echo "Clearing existing contents in ${TARGET}..."
    find "${TARGET}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
else
    echo "Creating ${TARGET}..."
    mkdir -p "${TARGET}"
fi

echo "Copying built book to ${TARGET}..."
cp -a "${BOOK_ROOT}/book/." "${TARGET}/"