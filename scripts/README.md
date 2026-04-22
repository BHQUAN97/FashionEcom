# Scripts — FashionEcom

Backup / restore / ops tooling cho FashionEcom. Tat ca script duoc viet bash + `set -euo pipefail`.

## Muc luc

| Script | Muc dich |
|---|---|
| `backup-mysql.sh` | Dump MySQL gzipped, retention 7 ngay, optional rclone upload |
| `restore-mysql.sh` | Restore dump `.sql.gz` vao container MySQL (interactive hoac tu arg) |
| `backup-gdrive.sh` / `backup-gdrive.js` | Sync MySQL dump + uploads folder len Google Drive qua Service Account |
| `deploy.sh` / `quick-deploy.sh` / `update-deploy.sh` | Docker compose deploy workflows |
| `db-changelog.sh` | Ghi log migration applied |
| `docker-cleanup.sh` | Don `docker system prune` an toan |

---

## 1. `backup-mysql.sh`

Dump database va nen `.sql.gz` vao `BACKUP_DIR`. Xoa backup cu hon `RETENTION_DAYS`. Neu co `rclone` se upload len remote `r2:fashionecom-backups/mysql/`.

### Usage
```bash
# One-shot manual
./scripts/backup-mysql.sh

# Override config qua env vars
BACKUP_DIR=/tmp/fashionecom-backups DB_NAME=fashion_ecom RETENTION_DAYS=14 ./scripts/backup-mysql.sh

# Password: dat MYSQL_BACKUP_PASSWORD hoac luu DB_PASSWORD vao /opt/fashionecom/.env
export MYSQL_BACKUP_PASSWORD='xxx'
./scripts/backup-mysql.sh
```

### Env vars
- `BACKUP_DIR` (default `/opt/fashionecom/backups/mysql`)
- `RETENTION_DAYS` (default `7`)
- `DB_CONTAINER` (default `fashionecom-mysql`)
- `DB_NAME` (default `fashion_ecom`), `DB_USER` (default `fashionecom`)
- `MYSQL_BACKUP_PASSWORD` — bat buoc (hoac doc tu `/opt/fashionecom/.env`)

### Output
- File: `${BACKUP_DIR}/${DB_NAME}_YYYY-MM-DD_HH-MM.sql.gz`
- Log: `/var/log/fashionecom/backup.log`

---

## 2. `restore-mysql.sh`

Restore backup `.sql.gz` vao container MySQL. Verify gzip integrity, prompt confirmation, ghi log start/end/duration.

### Usage
```bash
# Interactive: script liet ke tat ca backup va cho chon
./scripts/restore-mysql.sh

# Restore file cu the
./scripts/restore-mysql.sh /opt/fashionecom/backups/mysql/fashion_ecom_2026-04-17_02-00.sql.gz

# Skip confirmation (dung cho CI / automation)
./scripts/restore-mysql.sh /opt/fashionecom/backups/mysql/fashion_ecom_2026-04-17_02-00.sql.gz --force
```

### Exit codes
| Code | Nghia |
|---|---|
| 0 | Success |
| 1 | File not found / directory missing |
| 2 | Gzip corrupted (`gunzip -t` fail) |
| 3 | MySQL restore failed / container khong chay / khong co password |
| 4 | User aborted (khong confirm hoac chon `q`) |

### Env vars
Cung nhom nhu backup + `LOG_FILE` (default `/var/log/fashionecom/restore.log`).

---

## 3. `backup-gdrive.sh` + `backup-gdrive.js`

Upload MySQL dump moi nhat va (optional) zip cua `backend/storage/` len Google Drive qua Service Account.

### Setup
```bash
cd scripts/
npm install     # googleapis, archiver, dotenv
cp .gdrive-credentials.example.json .gdrive-credentials.json
# Paste service account JSON vao .gdrive-credentials.json (gitignored)
```

### Env vars (them vao .env)
```
GDRIVE_ENABLED=true
GDRIVE_CREDENTIALS_PATH=./scripts/.gdrive-credentials.json
GDRIVE_FOLDER_ID=<folder_id_from_drive_url>
GDRIVE_DB_SUBFOLDER=database
GDRIVE_UPLOADS_SUBFOLDER=media
GDRIVE_KEEP_COUNT=14
BACKUP_DIR=/opt/fashionecom/backups
UPLOADS_DIR=./backend/storage
```

### Usage
```bash
# Upload both DB + media (default)
./scripts/backup-gdrive.sh

# Chi DB hoac media
./scripts/backup-gdrive.sh db
./scripts/backup-gdrive.sh media

# Dry-run (khong thuc su upload/delete)
node scripts/backup-gdrive.js --dry-run --force
```

Rotation: giu `GDRIVE_KEEP_COUNT` ban moi nhat, xoa cac ban cu hon.

---

## Cron setup

Tren VPS (xem `scripts/crontab.example` de biet chi tiet):

```cron
# Backup MySQL moi dem luc 2h sang
0 2 * * * /opt/fashionecom/scripts/backup-mysql.sh >> /var/log/fashionecom/backup.log 2>&1

# Sync len Google Drive luc 3h
0 3 * * * /opt/fashionecom/scripts/backup-gdrive.sh all >> /var/log/fashionecom/gdrive-backup.log 2>&1
```

Cai dat:
```bash
crontab -e
# paste cac dong tren, save
crontab -l   # verify
```

---

## Troubleshooting

### `ERROR: MYSQL_BACKUP_PASSWORD env var not set`
- Export env var truoc khi chay, hoac dam bao `/opt/fashionecom/.env` co dong `MYSQL_BACKUP_PASSWORD=...` hoac `DB_PASSWORD=...`.

### `Container "fashionecom-mysql" khong chay`
- `docker ps` kiem tra ten container. Override qua env: `DB_CONTAINER=fashionecom-mysql-1 ./restore-mysql.sh ...`.

### `File gzip bi corrupt`
- `gunzip -t file.sql.gz` de verify thu cong. Neu corrupt thi file dump loi — lay backup khac.

### Restore xong nhung app van doc du lieu cu
- Xoa cache Redis: `docker exec fashionecom-redis redis-cli FLUSHDB`
- Restart backend: `docker compose restart backend`

### Uploads bi mat sau khi `docker compose down -v`
- `docker compose down -v` xoa named volumes. Dev dung bind mount `./backend/storage` nen an toan.
- Prod backup rieng truoc khi prune — `backup-gdrive.sh media` se zip + upload `backend/storage/`.

### `googleapis not installed`
- `cd scripts && npm install`

### Permission denied khi chay restore
- `chmod +x scripts/restore-mysql.sh`
- Tren Windows dung Git Bash / WSL, khong dung cmd.exe.
