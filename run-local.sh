#!/bin/bash

echo "🚀 Intu ERP 로컬 개발 환경 시작..."

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose -f docker-compose.dev.yml down

# 백엔드 서비스만 시작 (프론트엔드는 로컬에서 실행)
echo "🚀 백엔드 서비스 시작 중..."
docker-compose -f docker-compose.dev.yml up -d postgres redis backend

# 상태 확인
echo "📊 서비스 상태 확인 중..."
sleep 5
docker-compose -f docker-compose.dev.yml ps

echo "🎉 로컬 개발 환경 준비 완료!"
echo "📝 다음 단계:"
echo "1. 프론트엔드 개발 서버 시작: cd frontend && npm run dev"
echo "2. 백엔드 API: http://localhost:3001/api"
echo "3. 프론트엔드: http://localhost:3000"
echo ""
echo "🔧 유용한 명령어:"
echo "- 로그 확인: docker-compose -f docker-compose.dev.yml logs -f"
echo "- 서비스 중지: docker-compose -f docker-compose.dev.yml down"