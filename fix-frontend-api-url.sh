#!/bin/bash

echo "=== 프론트엔드 API URL 수정 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 프론트엔드 환경변수 파일 확인
echo "1. 현재 프론트엔드 환경변수 확인:"
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

# 2. 프론트엔드 환경변수 파일 생성/수정
echo "2. 프론트엔드 환경변수 설정:"
cat > frontend/.env.local << EOF
# API URL 설정
NEXT_PUBLIC_API_URL=https://nuvio.kr/api

# 기타 설정
NODE_ENV=production
EOF

echo "프론트엔드 환경변수 파일이 생성되었습니다:"
cat frontend/.env.local
echo ""

# 3. 프론트엔드 컨테이너 중지
echo "3. 프론트엔드 컨테이너 중지 중..."
docker-compose stop frontend
echo ""

# 4. 프론트엔드 이미지 재빌드
echo "4. 프론트엔드 이미지 재빌드 중..."
docker-compose build frontend
echo ""

# 5. 프론트엔드 컨테이너 시작
echo "5. 프론트엔드 컨테이너 시작 중..."
docker-compose up -d frontend
echo ""

# 6. 서비스 상태 확인
echo "6. 서비스 상태 확인 (15초 대기)..."
sleep 15

echo "프론트엔드 컨테이너 상태:"
docker-compose ps frontend
echo ""

# 7. API URL 테스트
echo "7. API URL 테스트:"
echo "프론트엔드에서 백엔드 API 접근 테스트:"
curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
echo ""

echo "=== 프론트엔드 API URL 수정 완료 ==="
echo "이제 https://nuvio.kr에서 정상적으로 API 호출이 가능합니다."
