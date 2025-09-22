#!/bin/bash

echo "=== 백엔드 문제 진단 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 백엔드 컨테이너 로그 확인
echo "1. 백엔드 컨테이너 로그 확인:"
docker logs intu_erp_backend --tail=50
echo ""

# 2. 백엔드 컨테이너 상태 확인
echo "2. 백엔드 컨테이너 상태 확인:"
docker inspect intu_erp_backend | grep -A 10 -B 5 "ExitCode"
echo ""

# 3. 백엔드 컨테이너 재시작 시도
echo "3. 백엔드 컨테이너 재시작 시도:"
docker-compose restart backend
echo ""

# 4. 재시작 후 상태 확인
echo "4. 재시작 후 상태 확인 (10초 대기):"
sleep 10

echo "백엔드 컨테이너 상태:"
docker-compose ps backend
echo ""

# 5. 백엔드 로그 다시 확인
echo "5. 재시작 후 백엔드 로그:"
docker logs intu_erp_backend --tail=30
echo ""

# 6. 백엔드 컨테이너 내부 확인
echo "6. 백엔드 컨테이너 내부 확인:"
if docker ps | grep -q intu_erp_backend; then
    echo "실행 중인 프로세스:"
    docker exec intu_erp_backend ps aux
    echo ""
    echo "포트 리스닝 상태:"
    docker exec intu_erp_backend netstat -tulpn
    echo ""
    echo "환경변수 확인:"
    docker exec intu_erp_backend env | grep -E "(CORS|NODE_ENV|PORT)"
else
    echo "백엔드 컨테이너가 실행되지 않음"
fi
echo ""

# 7. API 테스트
echo "7. API 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
echo ""

echo "=== 백엔드 문제 진단 완료 ==="
