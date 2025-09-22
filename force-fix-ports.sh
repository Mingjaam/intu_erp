#!/bin/bash

# 강력한 포트 충돌 해결 스크립트
echo "💥 강력한 포트 충돌 해결 중..."

# 1. 모든 관련 서비스 중지
echo "🛑 모든 관련 서비스 중지 중..."
sudo systemctl stop redis 2>/dev/null || true
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop mysql 2>/dev/null || true

# 2. Docker 완전 정리
echo "🧹 Docker 완전 정리 중..."
docker-compose down 2>/dev/null || true
docker container prune -f
docker network prune -f
docker volume prune -f

# 3. 포트 사용 중인 모든 프로세스 강제 종료
echo "💀 포트 사용 중인 프로세스 강제 종료 중..."

# 포트 3000
if sudo lsof -i :3000 >/dev/null 2>&1; then
    echo "   포트 3000 프로세스 종료 중..."
    sudo kill -9 $(sudo lsof -ti :3000) 2>/dev/null || true
fi

# 포트 3001
if sudo lsof -i :3001 >/dev/null 2>&1; then
    echo "   포트 3001 프로세스 종료 중..."
    sudo kill -9 $(sudo lsof -ti :3001) 2>/dev/null || true
fi

# 포트 5432
if sudo lsof -i :5432 >/dev/null 2>&1; then
    echo "   포트 5432 프로세스 종료 중..."
    sudo kill -9 $(sudo lsof -ti :5432) 2>/dev/null || true
fi

# 포트 6379
if sudo lsof -i :6379 >/dev/null 2>&1; then
    echo "   포트 6379 프로세스 종료 중..."
    sudo kill -9 $(sudo lsof -ti :6379) 2>/dev/null || true
fi

# 4. 추가 Redis 프로세스 확인 및 종료
echo "🔍 Redis 관련 프로세스 추가 확인 중..."
sudo pkill -f redis 2>/dev/null || true
sudo pkill -f redis-server 2>/dev/null || true

# 5. 포트 상태 최종 확인
echo "✅ 포트 상태 최종 확인 중..."
echo "   포트 3000: $(sudo lsof -i :3000 >/dev/null 2>&1 && echo '❌ 사용 중' || echo '✅ 사용 가능')"
echo "   포트 3001: $(sudo lsof -i :3001 >/dev/null 2>&1 && echo '❌ 사용 중' || echo '✅ 사용 가능')"
echo "   포트 5432: $(sudo lsof -i :5432 >/dev/null 2>&1 && echo '❌ 사용 중' || echo '✅ 사용 가능')"
echo "   포트 6379: $(sudo lsof -i :6379 >/dev/null 2>&1 && echo '❌ 사용 중' || echo '✅ 사용 가능')"

# 6. 잠시 대기
echo "⏳ 3초 대기 중..."
sleep 3

echo ""
echo "🎉 강력한 포트 충돌 해결 완료!"
echo "   이제 ./run-nuvio.sh를 실행하세요."
echo ""
