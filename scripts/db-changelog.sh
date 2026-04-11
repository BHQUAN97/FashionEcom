#!/usr/bin/env bash
# =============================================
# Author:      FashionEcom
# Create date: 2026-04-11
# Description: Chay SQL changelog theo thu tu version/filename.
#              Theo doi trang thai qua bang schema_changelog.
# Usage:
#   bash scripts/db-changelog.sh [host] [--status]
# =============================================

set -euo pipefail

# ── Config tu env hoac default ──────────────
DB_HOST="${DB_HOST:-${1:-localhost}}"
DB_PORT="${DB_PORT:-3309}"
DB_USERNAME="${DB_USERNAME:-fashionecom}"
DB_PASSWORD="${DB_PASSWORD:-fashionecom_dev}"
DB_NAME="${DB_NAME:-fashion_ecom}"

CHANGELOG_DIR="$(cd "$(dirname "$0")/../db/changelog" && pwd)"
STATUS_ONLY=false

# ── Parse args ──────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --status) STATUS_ONLY=true ;;
    -*) echo "Unknown flag: $arg"; exit 1 ;;
    *)
      # Arg dau tien khong phai flag la host
      if [ "$arg" != "$DB_HOST" ]; then
        DB_HOST="$arg"
      fi
      ;;
  esac
done

# ── MySQL command helper ────────────────────
run_sql() {
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" -N -e "$1"
}

run_sql_batch() {
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" < "$1"
}

# ── Tao bang schema_changelog neu chua co ───
run_sql "
CREATE TABLE IF NOT EXISTS schema_changelog (
    changelog_id    INT AUTO_INCREMENT PRIMARY KEY,
    filename        VARCHAR(255) NOT NULL,
    applied_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checksum        VARCHAR(64) NULL,
    UNIQUE KEY uix_schema_changelog_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci
    COMMENT='Theo doi cac file SQL changelog da chay';
"

# ── Lay danh sach file da apply ─────────────
APPLIED=$(run_sql "SELECT filename FROM schema_changelog ORDER BY changelog_id;")

# ── Lay danh sach SQL files (sorted) ────────
if [ ! -d "$CHANGELOG_DIR" ]; then
  echo "ERROR: Changelog directory not found: $CHANGELOG_DIR"
  exit 1
fi

# Sort theo ten file (version prefix dam bao thu tu)
SQL_FILES=$(find "$CHANGELOG_DIR" -name "*.sql" -type f | sort)

if [ -z "$SQL_FILES" ]; then
  echo "Khong co file SQL nao trong $CHANGELOG_DIR"
  exit 0
fi

# ── Mode: --status ──────────────────────────
if [ "$STATUS_ONLY" = true ]; then
  echo "=== Schema Changelog Status ==="
  echo "Host: $DB_HOST:$DB_PORT / $DB_NAME"
  echo ""
  while IFS= read -r file; do
    fname=$(basename "$file")
    if echo "$APPLIED" | grep -qF "$fname"; then
      echo "  [OK] $fname"
    else
      echo "  [--] $fname (pending)"
    fi
  done <<< "$SQL_FILES"
  echo ""
  PENDING_COUNT=$(while IFS= read -r file; do
    fname=$(basename "$file")
    echo "$APPLIED" | grep -qF "$fname" || echo "x"
  done <<< "$SQL_FILES" | wc -l)
  echo "Pending: $PENDING_COUNT file(s)"
  exit 0
fi

# ── Chay pending files ──────────────────────
echo "=== FashionEcom DB Changelog ==="
echo "Host: $DB_HOST:$DB_PORT / $DB_NAME"
echo ""

APPLIED_COUNT=0
SKIPPED_COUNT=0

while IFS= read -r file; do
  fname=$(basename "$file")

  # Kiem tra da apply chua
  if echo "$APPLIED" | grep -qF "$fname"; then
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  echo "Applying: $fname ..."

  # Chay SQL file
  if run_sql_batch "$file"; then
    # Ghi nhan vao schema_changelog
    CHECKSUM=$(sha256sum "$file" | awk '{print $1}')
    run_sql "INSERT INTO schema_changelog (filename, checksum) VALUES ('$fname', '$CHECKSUM');"
    echo "  -> OK"
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
  else
    echo "  -> FAILED! Dung lai."
    exit 1
  fi
done <<< "$SQL_FILES"

echo ""
echo "Xong: $APPLIED_COUNT applied, $SKIPPED_COUNT skipped."
