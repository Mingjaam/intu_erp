#!/bin/bash

echo "=== 종합 환경변수 및 CORS 설정 확인 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 루트 환경변수 확인
echo "1. 루트 .env 파일 확인:"
if [ -f ".env" ]; then
    echo "=== .env 파일 내용 ==="
    cat .env
else
    echo ".env 파일이 없습니다."
fi
echo ""

# 2. 프론트엔드 환경변수 확인
echo "2. 프론트엔드 환경변수 확인:"
if [ -f "frontend/.env.local" ]; then
    echo "=== frontend/.env.local 내용 ==="
    cat frontend/.env.local
elif [ -f "frontend/.env" ]; then
    echo "=== frontend/.env 내용 ==="
    cat frontend/.env
else
    echo "프론트엔드 환경변수 파일이 없습니다."
fi
echo ""

# 3. Docker Compose 환경변수 확인
echo "3. Docker Compose 환경변수 확인:"
echo "=== docker-compose.yml의 환경변수 설정 ==="
grep -A 20 "environment:" docker-compose.yml
echo ""

# 4. 백엔드 CORS 설정 확인
echo "4. 백엔드 CORS 설정 확인:"
echo "=== backend/src/main.ts의 CORS 설정 ==="
grep -A 15 "CORS 설정" backend/src/main.ts
echo ""

# 5. 프론트엔드 API URL 설정 확인
echo "5. 프론트엔드 API URL 설정 확인:"
echo "=== frontend/src/lib/api.ts의 API_BASE_URL ==="
grep -A 2 "API_BASE_URL" frontend/src/lib/api.ts
echo ""

# 6. Nginx 설정 확인
echo "6. Nginx 설정 확인:"
if [ -f "nginx-nuvio.conf" ]; then
    echo "=== nginx-nuvio.conf 내용 ==="
    cat nginx-nuvio.conf
else
    echo "nginx-nuvio.conf 파일이 없습니다."
fi
echo ""

# 7. 현재 실행 중인 컨테이너 환경변수 확인
echo "7. 실행 중인 컨테이너 환경변수 확인:"
echo "=== 백엔드 컨테이너 환경변수 ==="
docker exec intu_erp_backend env | grep -E "(CORS|API|URL|NODE_ENV)" | sort
echo ""

echo "=== 프론트엔드 컨테이너 환경변수 ==="
docker exec intu_erp_frontend env | grep -E "(API|URL|NODE_ENV)" | sort
echo ""

# 8. 서비스 상태 확인
echo "8. 서비스 상태 확인:"
echo "=== Docker 컨테이너 상태 ==="
docker-compose ps
echo ""

echo "=== 포트 사용 상태 ==="
netstat -tulpn | grep -E ':(3000|3001|80|443)\s'
echo ""

# 9. API 연결 테스트
echo "9. API 연결 테스트:"
echo "=== 로컬에서 백엔드 API 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
echo ""

echo "=== nuvio.kr에서 백엔드 API 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
echo ""

# 10. CORS 테스트
echo "10. CORS 테스트:"
echo "=== nuvio.kr에서 CORS preflight 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://nuvio.kr/api/auth/login || echo "연결 실패"
echo ""

# 11. 프론트엔드 접근 테스트
echo "11. 프론트엔드 접근 테스트:"
echo "=== nuvio.kr 프론트엔드 접근 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/ || echo "연결 실패"
echo ""

echo "=== 종합 확인 완료 ==="
echo ""
echo "📋 확인 사항 요약:"
echo "1. 백엔드 CORS: https://nuvio.kr 허용되어야 함"
echo "2. 프론트엔드 API URL: https://nuvio.kr/api 이어야 함"
echo "3. Nginx 프록시: /api -> 백엔드, / -> 프론트엔드"
echo "4. 모든 서비스: 정상 실행 상태여야 함"
