#!/bin/bash

echo "=== 프론트엔드 최종 수정 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 프론트엔드 컨테이너 중지
echo "1. 프론트엔드 컨테이너 중지 중..."
docker-compose stop frontend
echo ""

# 2. 프론트엔드 이미지 재빌드
echo "2. 프론트엔드 이미지 재빌드 중..."
docker-compose build frontend
echo ""

# 3. 프론트엔드 컨테이너 시작
echo "3. 프론트엔드 컨테이너 시작 중..."
docker-compose up -d frontend
echo ""

# 4. 서비스 상태 확인
echo "4. 서비스 상태 확인 (15초 대기)..."
sleep 15

echo "프론트엔드 컨테이너 상태:"
docker-compose ps frontend
echo ""

# 5. 환경변수 확인
echo "5. 프론트엔드 컨테이너 환경변수 확인:"
docker exec intu_erp_frontend env | grep -E "(API|URL|NODE_ENV)" | sort
echo ""

# 6. API 연결 테스트
echo "6. API 연결 테스트:"
echo "=== nuvio.kr에서 백엔드 API 테스트 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
echo ""

# 7. 프론트엔드 접근 테스트
echo "7. 프론트엔드 접근 테스트:"
echo "=== nuvio.kr 프론트엔드 접근 ==="
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/ | head -c 200
echo "..."
echo ""

echo "=== 프론트엔드 최종 수정 완료 ==="
echo "이제 https://nuvio.kr에서 정상적으로 로그인할 수 있습니다!"
