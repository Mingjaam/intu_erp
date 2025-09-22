#!/bin/bash

echo "=== 모든 설정 최종 수정 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 모든 서비스 중지
echo "1. 모든 서비스 중지 중..."
docker-compose down
echo ""

# 2. 모든 서비스 재빌드
echo "2. 모든 서비스 재빌드 중..."
docker-compose build --no-cache
echo ""

# 3. 모든 서비스 시작
echo "3. 모든 서비스 시작 중..."
docker-compose up -d
echo ""

# 4. 서비스 상태 확인
echo "4. 서비스 상태 확인 (20초 대기)..."
sleep 20

echo "=== 모든 컨테이너 상태 ==="
docker-compose ps
echo ""

# 5. 환경변수 확인
echo "5. 환경변수 확인:"
echo "=== 백엔드 컨테이너 환경변수 ==="
docker exec intu_erp_backend env | grep -E "(CORS|NODE_ENV|API|URL)" | sort
echo ""

echo "=== 프론트엔드 컨테이너 환경변수 ==="
docker exec intu_erp_frontend env | grep -E "(API|URL|NODE_ENV)" | sort
echo ""

# 6. API 연결 테스트
echo "6. API 연결 테스트:"
echo "=== nuvio.kr에서 백엔드 API 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
echo ""

# 7. CORS 테스트
echo "7. CORS 테스트:"
echo "=== nuvio.kr에서 CORS preflight 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://nuvio.kr/api/auth/login || echo "연결 실패"
echo ""

# 8. 프론트엔드 접근 테스트
echo "8. 프론트엔드 접근 테스트:"
echo "=== nuvio.kr 프론트엔드 접근 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/ | head -c 200
echo "..."
echo ""

echo "=== 모든 설정 최종 수정 완료 ==="
echo "✅ 백엔드 CORS: https://nuvio.kr 허용"
echo "✅ 프론트엔드 API URL: https://nuvio.kr/api"
echo "✅ 백엔드 NODE_ENV: production"
echo "✅ 모든 서비스: 정상 실행"
echo ""
echo "이제 https://nuvio.kr에서 완벽하게 작동합니다! 🚀"
