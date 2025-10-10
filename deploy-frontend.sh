#!/bin/bash

echo "🚀 Intu ERP 프론트엔드 배포 시작..."

# 환경 변수 파일 확인
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다!"
    echo "📝 .env.production 파일을 생성하고 필요한 환경 변수를 설정해주세요."
    exit 1
fi

# 기존 프론트엔드 컨테이너 정리
echo "🧹 기존 프론트엔드 컨테이너 정리 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production stop frontend
docker-compose -f docker-compose.prod.yml --env-file .env.production rm -f frontend

# 프론트엔드 이미지 빌드
echo "🔨 프론트엔드 이미지 빌드 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production build frontend

# 프론트엔드 서비스 시작
echo "🚀 프론트엔드 서비스 시작 중..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d frontend

# 상태 확인
echo "📊 프론트엔드 서비스 상태 확인 중..."
sleep 5
docker-compose -f docker-compose.prod.yml --env-file .env.production ps frontend

# 헬스 체크
echo "🏥 프론트엔드 헬스 체크 중..."
for i in {1..20}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 프론트엔드 서비스가 정상적으로 시작되었습니다."
        break
    fi
    echo "⏳ 프론트엔드 시작 대기 중... ($i/20)"
    sleep 3
done

echo "🎉 프론트엔드 배포 완료!"
echo "🌐 프론트엔드 접속: http://localhost:3000"
echo ""
echo "🔧 유용한 명령어:"
echo "- 프론트엔드 로그 확인: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend"
echo "- 프론트엔드 중지: docker-compose -f docker-compose.prod.yml --env-file .env.production stop frontend"
echo "- 전체 서비스 중지: docker-compose -f docker-compose.prod.yml --env-file .env.production down"
