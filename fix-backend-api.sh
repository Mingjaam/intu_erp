#!/bin/bash

echo "=== 백엔드 API 문제 해결 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 백엔드 API 엔드포인트 테스트
echo "1. 백엔드 API 엔드포인트 테스트:"
echo "루트 엔드포인트:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/ || echo "연결 실패"
echo ""

echo "API 루트:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api || echo "연결 실패"
echo ""

echo "API 문서:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/docs || echo "연결 실패"
echo ""

echo "헬스 체크:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
echo ""

# 2. 백엔드 컨테이너 로그 확인
echo "2. 백엔드 컨테이너 상세 로그:"
docker logs intu_erp_backend --tail=50
echo ""

# 3. 백엔드 컨테이너 내부 상태 확인
echo "3. 백엔드 컨테이너 내부 상태:"
echo "실행 중인 프로세스:"
docker exec intu_erp_backend ps aux
echo ""

echo "포트 리스닝 상태:"
docker exec intu_erp_backend netstat -tulpn
echo ""

echo "환경 변수 확인:"
docker exec intu_erp_backend env | grep -E "(PORT|NODE_ENV|CORS)"
echo ""

# 4. 백엔드 컨테이너 재시작
echo "4. 백엔드 컨테이너 재시작:"
docker-compose restart intu_erp_backend
echo ""

# 5. 재시작 후 상태 확인
echo "5. 재시작 후 상태 확인 (10초 대기):"
sleep 10

echo "백엔드 상태:"
docker-compose ps intu_erp_backend
echo ""

echo "API 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api || echo "연결 실패"
echo ""

echo "로그인 엔드포인트 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' || echo "연결 실패"
echo ""

echo "=== 백엔드 API 문제 해결 완료 ==="
