#!/bin/bash

# 클라우딩 컴퓨터용 실행 스크립트
# 사용법: ./run-cloud.sh

echo "🚀 클라우딩 컴퓨터용 ERP 시스템 시작..."

# 0. Docker 권한 확인
echo "🔍 Docker 권한 확인 중..."
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Docker 권한 문제가 감지되었습니다."
    echo "🔧 Docker 권한 문제를 해결하겠습니다..."
    
    # Docker 권한 해결
    sudo usermod -aG docker $USER
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo chmod 666 /var/run/docker.sock
    
    echo "⚠️  Docker 권한이 수정되었습니다."
    echo "   새 터미널 세션을 시작하거나 'newgrp docker' 명령어를 실행하세요."
    echo "   그 후 다시 ./run-cloud.sh를 실행하세요."
    exit 1
fi

# 1. 환경 변수 파일 설정
if [ ! -f .env ]; then
    echo "📝 환경 변수 파일 생성 중..."
    cp env.cloud .env
    echo "✅ .env 파일이 생성되었습니다."
    echo "⚠️  필요시 .env 파일을 수정하세요."
else
    echo "✅ .env 파일이 이미 존재합니다."
fi

# 2. Docker 서비스 중지 (이미 실행 중인 경우)
echo "🛑 기존 서비스 중지 중..."
docker-compose down 2>/dev/null || true

# 3. Docker 이미지 빌드 및 실행
echo "🔨 Docker 이미지 빌드 및 실행 중..."
docker-compose up --build -d

# 4. 서비스 상태 확인
echo "⏳ 서비스 시작 대기 중..."
sleep 10

# 5. 서비스 상태 확인
echo "📊 서비스 상태 확인 중..."
docker-compose ps

# 6. 로그 확인
echo "📋 최근 로그 확인 중..."
docker-compose logs --tail=20

# 7. 접속 정보 출력
echo ""
echo "🎉 ERP 시스템이 성공적으로 시작되었습니다!"
echo ""
echo "📱 접속 정보:"
echo "   프론트엔드: http://localhost:3000"
echo "   백엔드 API: http://localhost:3001"
echo "   데이터베이스: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "🔧 관리 명령어:"
echo "   서비스 중지: docker-compose down"
echo "   로그 확인: docker-compose logs -f"
echo "   서비스 재시작: docker-compose restart"
echo ""
echo "⚠️  방화벽 설정이 필요한 경우:"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 3001"
echo ""
