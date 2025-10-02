#!/bin/bash

# SSL 자동 설정 스크립트 for nuvio.kr
echo "🔒 nuvio.kr SSL 인증서 설정 시작..."

# Certbot 설치 확인
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot 설치 중..."
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
fi

# SSL 디렉토리 생성
sudo mkdir -p /etc/nginx/ssl

# 임시 SSL 인증서 생성 (Let's Encrypt 발급 전까지)
echo "🔧 임시 SSL 인증서 생성 중..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=Nuvio/OU=IT/CN=nuvio.kr"

# Let's Encrypt SSL 인증서 발급
echo "🌐 Let's Encrypt SSL 인증서 발급 중..."
sudo certbot certonly --standalone -d nuvio.kr -d www.nuvio.kr --non-interactive --agree-tos --email admin@nuvio.kr

# 인증서 파일 복사
if [ -f "/etc/letsencrypt/live/nuvio.kr/fullchain.pem" ]; then
    echo "✅ Let's Encrypt 인증서 발견, 복사 중..."
    sudo cp /etc/letsencrypt/live/nuvio.kr/fullchain.pem /etc/nginx/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/nuvio.kr/privkey.pem /etc/nginx/ssl/key.pem
    sudo chmod 644 /etc/nginx/ssl/cert.pem
    sudo chmod 600 /etc/nginx/ssl/key.pem
    echo "✅ SSL 인증서 설정 완료!"
else
    echo "⚠️ Let's Encrypt 인증서 발급 실패, 임시 인증서 사용 중..."
fi

# 자동 갱신 설정
echo "🔄 자동 갱신 설정 중..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /path/to/your/project/docker-compose.prod.yml restart nginx") | crontab -

echo "🎉 SSL 설정 완료!"
echo "📋 다음 단계:"
echo "1. DNS A 레코드를 서버 IP로 설정: nuvio.kr → YOUR_SERVER_IP"
echo "2. 배포 실행: ./deploy.sh"
echo "3. 접속 확인: https://nuvio.kr"
