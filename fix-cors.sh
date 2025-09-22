#!/bin/bash

echo "=== CORS 설정 수정 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 백엔드 컨테이너 중지
echo "1. 백엔드 컨테이너 중지 중..."
docker-compose stop backend
echo ""

# 2. 백엔드 이미지 재빌드
echo "2. 백엔드 이미지 재빌드 중..."
docker-compose build backend
echo ""

# 3. 백엔드 컨테이너 시작
echo "3. 백엔드 컨테이너 시작 중..."
docker-compose up -d backend
echo ""

# 4. 서비스 상태 확인
echo "4. 서비스 상태 확인 (10초 대기)..."
sleep 10

echo "백엔드 컨테이너 상태:"
docker-compose ps backend
echo ""

# 5. CORS 테스트
echo "5. CORS 설정 테스트:"
echo "로컬에서 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/auth/login
echo ""

echo "nuvio.kr에서 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/auth/login
echo ""

# 6. 실제 로그인 API 테스트
echo "6. 실제 로그인 API 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/auth/login \
  -d '{"email":"test@test.com","password":"test"}'
echo ""

echo "=== CORS 설정 수정 완료 ==="
echo "이제 https://nuvio.kr에서 API 호출이 가능합니다."
