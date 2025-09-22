#!/bin/bash

echo "=== 클라우드 서버 연결 문제 진단 스크립트 ==="
echo "실행 시간: $(date)"
echo ""

# 1. 현재 실행 중인 프로세스 확인
echo "1. 현재 실행 중인 Node.js 프로세스:"
ps aux | grep node | grep -v grep
echo ""

# 2. 포트 사용 상태 확인
echo "2. 포트 3000, 3001, 80, 443 사용 상태:"
netstat -tulpn | grep -E ':(3000|3001|80|443)\s'
echo ""

# 3. Docker 컨테이너 상태 확인
echo "3. Docker 컨테이너 상태:"
docker ps -a
echo ""

# 4. Docker Compose 서비스 상태 확인
echo "4. Docker Compose 서비스 상태:"
if [ -f "docker-compose.yml" ]; then
    docker-compose ps
else
    echo "docker-compose.yml 파일을 찾을 수 없습니다."
fi
echo ""

# 5. Nginx 상태 확인
echo "5. Nginx 상태:"
systemctl status nginx 2>/dev/null || service nginx status 2>/dev/null || echo "Nginx 서비스 상태를 확인할 수 없습니다."
echo ""

# 6. 네트워크 연결 테스트
echo "6. 로컬 포트 연결 테스트:"
echo "포트 3000 (프론트엔드):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "연결 실패"
echo ""

echo "포트 3001 (백엔드):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "연결 실패"
echo ""

# 7. 환경 변수 확인
echo "7. 환경 변수 확인:"
if [ -f ".env" ]; then
    echo "=== .env 파일 내용 ==="
    cat .env
elif [ -f "env.cloud" ]; then
    echo "=== env.cloud 파일 내용 ==="
    cat env.cloud
else
    echo "환경 변수 파일을 찾을 수 없습니다."
fi
echo ""

# 8. 로그 확인
echo "8. 최근 로그 확인:"
echo "Docker 로그 (최근 20줄):"
docker-compose logs --tail=20 2>/dev/null || echo "Docker Compose 로그를 확인할 수 없습니다."
echo ""

echo "=== 진단 완료 ==="
