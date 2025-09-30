#!/bin/bash

# 배포 스크립트
echo "🚀 Intu ERP 배포 시작..."

# 환경 변수 파일 확인
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다."
    echo "📝 env.production.example을 복사하여 .env.production을 생성하고 설정을 수정하세요."
    cp env.production.example .env.production
    echo "✅ .env.production 파일이 생성되었습니다. 설정을 수정한 후 다시 실행하세요."
    exit 1
fi

# Docker 및 Docker Compose 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되지 않았습니다."
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# 이미지 빌드
echo "🔨 이미지 빌드 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

# 서비스 시작
echo "🚀 서비스 시작 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 상태 확인
echo "📊 서비스 상태 확인 중..."
sleep 10
docker-compose -f docker-compose.prod.yml ps

# 헬스 체크
echo "🏥 헬스 체크 중..."
for i in {1..30}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ 서비스가 정상적으로 시작되었습니다!"
        echo "🌐 웹사이트: https://nuvio.kr"
        echo "📚 API 문서: https://nuvio.kr/api/docs"
        echo "🔒 SSL 상태: HTTPS 자동 리다이렉트 설정됨"
        break
    fi
    echo "⏳ 서비스 시작 대기 중... ($i/30)"
    sleep 2
done

echo "🎉 배포 완료!"
