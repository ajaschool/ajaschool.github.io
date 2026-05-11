#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 로컬 전용 환경 변수 로드 (.env, gitignore 처리됨)
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_ROOT/.env"
  set +a
fi

# REMOTE_TARGET: 로컬 ~/.ssh/config 에 정의된 SSH alias (실제 IP/Key는 ssh config 에서 관리)
REMOTE_TARGET="${REMOTE_TARGET:-ajaschool-dev}"
REMOTE_HOME="${REMOTE_HOME:-/home/ubuntu}"
REMOTE_ARCHIVE="$REMOTE_HOME/company.tar.gz"
REMOTE_EXTRACT_DIR="$REMOTE_HOME/company"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/company}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/company.ajaschool.com}"
ARCHIVE_PATH="${ARCHIVE_PATH:-/tmp/company.tar.gz}"

STAGING_DIR="$(mktemp -d -t aja-company-XXXXXX)/company"
mkdir -p "$STAGING_DIR"

cleanup() {
  rm -rf "$(dirname "$STAGING_DIR")"
}
trap cleanup EXIT

echo "==> 정적 자산을 스테이징 폴더로 복사"
rsync -a \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='.vscode' \
  --exclude='.DS_Store' \
  --exclude='scripts' \
  --exclude='docs' \
  --exclude='README.md' \
  "$PROJECT_ROOT"/ "$STAGING_DIR"/

echo "==> 압축"
rm -f "$ARCHIVE_PATH"
tar -czf "$ARCHIVE_PATH" -C "$(dirname "$STAGING_DIR")" company

echo "==> EC2 업로드 ($REMOTE_TARGET${REMOTE_IP:+ / $REMOTE_IP})"
scp "$ARCHIVE_PATH" "$REMOTE_TARGET:$REMOTE_ARCHIVE"

echo "==> 원격 서버 배포"
ssh "$REMOTE_TARGET" bash <<EOF
set -euo pipefail

REMOTE_ARCHIVE="$REMOTE_ARCHIVE"
REMOTE_EXTRACT_DIR="$REMOTE_EXTRACT_DIR"
DEPLOY_DIR="$DEPLOY_DIR"
NGINX_SITE="$NGINX_SITE"

cd "\$(dirname "\$REMOTE_ARCHIVE")"
rm -rf "\$REMOTE_EXTRACT_DIR"
tar -xzf "\$REMOTE_ARCHIVE"

sudo rm -rf "\$DEPLOY_DIR"
sudo mkdir -p "\$DEPLOY_DIR"
sudo cp -r "\$REMOTE_EXTRACT_DIR"/* "\$DEPLOY_DIR"/
sudo chown -R www-data:www-data "\$DEPLOY_DIR"
sudo find "\$DEPLOY_DIR" -type d -exec chmod 755 {} \;
sudo find "\$DEPLOY_DIR" -type f -exec chmod 644 {} \;

echo "==> nginx 설정 확인"
grep -n "root /var/www/company;\\|index index.html;" "\$NGINX_SITE"

echo "==> nginx 반영"
sudo nginx -t
sudo systemctl reload nginx

echo "==> 배포 결과 확인"
curl -I https://company.ajaschool.com
EOF

echo "==> 배포 완료"
