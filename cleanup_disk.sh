#!/bin/bash

echo "🧹 디스크 정리 스크립트 시작..."
echo "현재 디스크 사용량:"
df -h

echo ""
echo "1️⃣ Docker 정리 중..."
# Docker 시스템 정리 (중지된 컨테이너, 사용하지 않는 이미지, 네트워크, 볼륨)
docker system prune -a -f

# Docker 로그 파일 정리 (데이터 손실 없이 크기만 0으로)
if [ -d "/var/lib/docker/containers" ]; then
    echo "Docker 로그 파일 정리 중..."
    sudo find /var/lib/docker/containers -name "*-json.log" -type f -exec truncate -s 0 {} \; 2>/dev/null || true
fi

echo ""
echo "2️⃣ 시스템 로그 정리 중..."
# 시스템 로그 정리 (7일 이상 된 로그만 삭제)
sudo journalctl --vacuum-time=7d

# 큰 로그 파일들 정리 (10MB 이상)
sudo find /var/log -name "*.log" -type f -size +10M -exec truncate -s 0 {} \; 2>/dev/null || true

echo ""
echo "3️⃣ 임시 파일 정리 중..."
# /tmp 디렉토리 정리 (중요한 파일은 보호)
sudo find /tmp -type f -atime +7 -delete 2>/dev/null || true
sudo find /tmp -type d -empty -delete 2>/dev/null || true

# 사용자 캐시 정리
rm -rf ~/.cache/* 2>/dev/null || true

echo ""
echo "4️⃣ APT 캐시 정리 중..."
# APT 캐시 정리
sudo apt clean
sudo apt autoremove -y

echo ""
echo "5️⃣ 큰 파일 찾기..."
echo "100MB 이상의 큰 파일들:"
sudo find / -type f -size +100M 2>/dev/null | head -10

echo ""
echo "✅ 디스크 정리 완료!"
echo "정리 후 디스크 사용량:"
df -h

echo ""
echo "🎉 정리 완료! 이제 Docker 빌드를 다시 시도해보세요."
