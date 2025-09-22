#!/bin/bash

# 포트 충돌 문제 해결 스크립트
echo "🔧 포트 충돌 문제 해결 중..."

# 1. 기존 컨테이너 중지
echo "🛑 기존 컨테이너 중지 중..."
docker-compose down 2>/dev/null || true

# 2. 포트 3000, 3001, 5432, 6379 사용 중인 프로세스 확인
echo "🔍 포트 사용 중인 프로세스 확인 중..."

# 포트 3000 확인
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  포트 3000이 사용 중입니다."
    echo "   사용 중인 프로세스:"
    lsof -i :3000
    echo "   프로세스 종료 중..."
    sudo kill -9 $(lsof -ti :3000) 2>/dev/null || true
fi

# 포트 3001 확인
if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  포트 3001이 사용 중입니다."
    echo "   사용 중인 프로세스:"
    lsof -i :3001
    echo "   프로세스 종료 중..."
    sudo kill -9 $(lsof -ti :3001) 2>/dev/null || true
fi

# 포트 5432 확인
if lsof -i :5432 >/dev/null 2>&1; then
    echo "⚠️  포트 5432가 사용 중입니다."
    echo "   사용 중인 프로세스:"
    lsof -i :5432
    echo "   프로세스 종료 중..."
    sudo kill -9 $(lsof -ti :5432) 2>/dev/null || true
fi

# 포트 6379 확인
if lsof -i :6379 >/dev/null 2>&1; then
    echo "⚠️  포트 6379가 사용 중입니다."
    echo "   사용 중인 프로세스:"
    lsof -i :6379
    echo "   프로세스 종료 중..."
    sudo kill -9 $(lsof -ti :6379) 2>/dev/null || true
fi

# 3. Docker 컨테이너 정리
echo "🧹 Docker 컨테이너 정리 중..."
docker container prune -f

# 4. 포트 재확인
echo "✅ 포트 상태 재확인 중..."
echo "   포트 3000: $(lsof -i :3000 >/dev/null 2>&1 && echo '사용 중' || echo '사용 가능')"
echo "   포트 3001: $(lsof -i :3001 >/dev/null 2>&1 && echo '사용 중' || echo '사용 가능')"
echo "   포트 5432: $(lsof -i :5432 >/dev/null 2>&1 && echo '사용 중' || echo '사용 가능')"
echo "   포트 6379: $(lsof -i :6379 >/dev/null 2>&1 && echo '사용 중' || echo '사용 가능')"

echo ""
echo "🎉 포트 충돌 문제 해결 완료!"
echo "   이제 ./run-nuvio.sh를 다시 실행하세요."
echo ""
