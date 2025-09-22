#!/bin/bash

echo "=== 데이터베이스 SSL 문제 해결 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 현재 백엔드 환경변수 확인
echo "1. 현재 백엔드 환경변수 확인:"
docker exec intu_erp_backend env | grep -E "(NODE_ENV|SSL)" || echo "백엔드 컨테이너가 실행되지 않음"
echo ""

# 2. Docker Compose에서 NODE_ENV를 development로 변경
echo "2. Docker Compose에서 NODE_ENV를 development로 변경:"
sed -i 's/NODE_ENV: production/NODE_ENV: development/' docker-compose.yml
echo "변경 완료"
echo ""

# 3. 변경된 설정 확인
echo "3. 변경된 설정 확인:"
grep -A 5 -B 5 "NODE_ENV" docker-compose.yml
echo ""

# 4. 모든 서비스 중지
echo "4. 모든 서비스 중지:"
docker-compose down
echo ""

# 5. 백엔드만 재빌드 및 시작
echo "5. 백엔드 재빌드 및 시작:"
docker-compose up -d backend
echo ""

# 6. 백엔드 상태 확인
echo "6. 백엔드 상태 확인 (15초 대기):"
sleep 15

echo "백엔드 컨테이너 상태:"
docker-compose ps backend
echo ""

# 7. 백엔드 로그 확인
echo "7. 백엔드 로그 확인:"
docker logs intu_erp_backend --tail=20
echo ""

# 8. API 테스트
echo "8. API 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
echo ""

# 9. CORS 테스트
echo "9. CORS 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/auth/login || echo "연결 실패"
echo ""

echo "=== 데이터베이스 SSL 문제 해결 완료 ==="
echo "백엔드가 정상적으로 실행되어야 합니다."
