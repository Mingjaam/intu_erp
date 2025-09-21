#!/bin/bash

# nuvio.kr 도메인 설정 스크립트
echo "🌐 nuvio.kr 도메인 설정 시작..."

# 1. Nginx 설치 확인
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx 설치 중..."
    sudo apt update
    sudo apt install -y nginx
fi

# 2. Nginx 설정 파일 복사
echo "📝 Nginx 설정 파일 복사 중..."
sudo cp nginx-nuvio.conf /etc/nginx/sites-available/nuvio.kr

# 3. 사이트 활성화
echo "🔗 사이트 활성화 중..."
sudo ln -sf /etc/nginx/sites-available/nuvio.kr /etc/nginx/sites-enabled/

# 4. 기본 사이트 비활성화 (충돌 방지)
echo "🚫 기본 사이트 비활성화 중..."
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Nginx 설정 테스트
echo "🧪 Nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo "✅ Nginx 설정이 올바릅니다."
else
    echo "❌ Nginx 설정에 오류가 있습니다."
    exit 1
fi

# 6. Nginx 재시작
echo "🔄 Nginx 재시작 중..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. 방화벽 설정
echo "🔥 방화벽 설정 중..."
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443

# 8. SSL 인증서 설치 안내
echo ""
echo "🔒 SSL 인증서 설치가 필요합니다:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d nuvio.kr -d www.nuvio.kr"
echo ""

# 9. DNS 설정 안내
echo "🌍 DNS 설정 확인:"
echo "   A 레코드: nuvio.kr → 서버 IP"
echo "   CNAME 레코드: www.nuvio.kr → nuvio.kr"
echo ""

# 10. 환경 변수 업데이트 안내
echo "⚙️  환경 변수 업데이트:"
echo "   cp env.cloud .env"
echo "   # .env 파일에서 CORS_ORIGIN과 FRONTEND_URL이 https://nuvio.kr로 설정되었는지 확인"
echo ""

echo "🎉 nuvio.kr 도메인 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. DNS 설정 (A 레코드, CNAME 레코드)"
echo "   2. SSL 인증서 설치"
echo "   3. 환경 변수 업데이트"
echo "   4. ERP 시스템 실행"
echo ""
