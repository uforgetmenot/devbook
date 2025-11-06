#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

CONTENT_ROOT="${CONTENT_ROOT:-${REPO_ROOT}}"
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

echo "Generating SUMMARY.md at ${SUMMARY_PATH}..."
python3 "${SCRIPT_DIR}/generate_summary.py" \
    --root "${CONTENT_ROOT}" \
    --summary-path "${SUMMARY_PATH}" \
    --title "${SUMMARY_TITLE}"

echo "Running mdbook build in ${BOOK_ROOT}..."
mdbook build "${BOOK_ROOT}"

if [[ ! -d "${BOOK_ROOT}/book" ]] || [[ -z "$(ls -A "${BOOK_ROOT}/book" 2>/dev/null)" ]]; then
    echo "mdbook build did not produce any output in ${BOOK_ROOT}/book" >&2
    exit 1
fi

echo "Patching built HTML to enable Chinese search..."
# Inject segmentit right after mark.min.js and switch searcher.js to theme/searcher.js
while IFS= read -r -d '' html; do
    if ! grep -q "theme/segmentit.umd.js" "$html"; then
        # Handle both root and nested paths
        if grep -q "<script src=\"mark.min.js\"" "$html"; then
            sed -i -e "/<script src=\"mark.min.js\"/a \\        <script src=\"theme\/segmentit.umd.js\" type=\"text\/javascript\" charset=\"utf-8\"><\/script>" "$html"
        elif grep -q "<script src=\"\.\./mark.min.js\"" "$html"; then
            sed -i -e "/<script src=\"\.\..*mark.min.js\"/a \\        <script src=\"..\/theme\/segmentit.umd.js\" type=\"text\/javascript\" charset=\"utf-8\"><\/script>" "$html"
        fi
    fi
    # Replace root-relative searcher in both root and nested pages
    sed -i -e "s#<script src=\"searcher.js\"#<script src=\"theme/searcher.js\"#g" "$html"
    sed -i -e "s#<script src=\"\.\./searcher.js\"#<script src=\"../theme/searcher.js\"#g" "$html"
done < <(find "${BOOK_ROOT}/book" -type f -name "*.html" -print0)

echo "Done. Chinese search enabled."

echo "Book successfully built at ${BOOK_ROOT}/book"