#!/bin/bash

echo "=== 서비스 재시작 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 기존 서비스 중지
echo "1. 기존 서비스 중지 중..."
docker-compose down 2>/dev/null || echo "Docker Compose 중지 완료"
pkill -f "node.*3000" 2>/dev/null || echo "프론트엔드 프로세스 중지 완료"
pkill -f "node.*3001" 2>/dev/null || echo "백엔드 프로세스 중지 완료"
echo ""

# 2. 포트 정리
echo "2. 포트 정리 중..."
sudo fuser -k 3000/tcp 2>/dev/null || echo "포트 3000 정리 완료"
sudo fuser -k 3001/tcp 2>/dev/null || echo "포트 3001 정리 완료"
echo ""

# 3. Docker 이미지 정리 (선택사항)
echo "3. Docker 이미지 정리 중..."
docker system prune -f
echo ""

# 4. 환경 변수 설정
echo "4. 환경 변수 설정..."
if [ -f "env.cloud" ]; then
    cp env.cloud .env
    echo "env.cloud를 .env로 복사했습니다."
elif [ -f ".env" ]; then
    echo ".env 파일이 이미 존재합니다."
else
    echo "환경 변수 파일이 없습니다. 기본 설정을 사용합니다."
fi
echo ""

# 5. 의존성 설치
echo "5. 의존성 설치 중..."
if [ -d "backend" ]; then
    echo "백엔드 의존성 설치..."
    cd backend && npm install && cd ..
fi

if [ -d "frontend" ]; then
    echo "프론트엔드 의존성 설치..."
    cd frontend && npm install && cd ..
fi
echo ""

# 6. 서비스 시작
echo "6. 서비스 시작 중..."
echo "Docker Compose로 서비스 시작..."
docker-compose up -d

# 7. 서비스 상태 확인
echo "7. 서비스 상태 확인..."
sleep 10
echo "Docker 컨테이너 상태:"
docker-compose ps

echo ""
echo "포트 사용 상태:"
netstat -tulpn | grep -E ':(3000|3001|80|443)\s'

echo ""
echo "=== 서비스 재시작 완료 ==="
echo "프론트엔드: http://localhost:3000"
echo "백엔드: http://localhost:3001"
