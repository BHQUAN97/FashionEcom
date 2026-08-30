# FashionEcom Backups

Daily backups. Encrypted with AES-256 if BACKUP_ENCRYPT_KEY is set.

Decrypt: gpg --decrypt --output FILE FILE.gpg

Structure: fashionecom/YYYY-MM-DD/{fashion_ecom.sql.gz, uploads.zip}
