#!/bin/bash

# Docker 권한 문제 해결 스크립트
echo "🔧 Docker 권한 문제 해결 중..."

# 1. 현재 사용자를 docker 그룹에 추가
echo "👤 사용자를 docker 그룹에 추가 중..."
sudo usermod -aG docker $USER

# 2. Docker 서비스 상태 확인 및 시작
echo "🐳 Docker 서비스 상태 확인 중..."
sudo systemctl status docker

# 3. Docker 서비스 시작 (중지된 경우)
echo "🚀 Docker 서비스 시작 중..."
sudo systemctl start docker
sudo systemctl enable docker

# 4. Docker 소켓 권한 확인
echo "🔐 Docker 소켓 권한 확인 중..."
ls -la /var/run/docker.sock

# 5. Docker 소켓 권한 수정
echo "🔧 Docker 소켓 권한 수정 중..."
sudo chmod 666 /var/run/docker.sock

# 6. Docker 테스트
echo "✅ Docker 테스트 중..."
docker --version
docker ps

echo ""
echo "🎉 Docker 권한 문제 해결 완료!"
echo ""
echo "⚠️  중요: 다음 중 하나를 선택하세요:"
echo "   1. 새 터미널 세션을 시작하세요 (권장)"
echo "   2. 또는 다음 명령어를 실행하세요:"
echo "      newgrp docker"
echo ""
echo "그 후 다시 ./run-cloud.sh를 실행하세요."
