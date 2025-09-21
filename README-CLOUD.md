# 클라우딩 컴퓨터용 ERP 시스템 실행 가이드

## 🚀 빠른 시작

### 1. 프로젝트 클론
```bash
git clone -b test --single-branch https://github.com/Mingjaam/intu_erp.git
cd intu_erp
```

### 2. 자동 실행
```bash
./run-cloud.sh
```

### 3. 수동 실행 (선택사항)
```bash
# 환경 변수 설정
cp env.cloud .env

# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 📋 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **데이터베이스**: localhost:5432
- **Redis**: localhost:6379

## 🔧 관리 명령어

```bash
# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart backend
docker-compose restart frontend

# 로그 확인
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# 서비스 상태 확인
docker-compose ps
```

## 🛡️ 보안 설정

### 방화벽 설정
```bash
# 포트 열기
sudo ufw allow 3000
sudo ufw allow 3001

# 특정 IP만 허용 (권장)
sudo ufw allow from YOUR_IP to any port 3000
sudo ufw allow from YOUR_IP to any port 3001
```

### nuvio.kr 도메인 사용시

#### 도메인이 이미 연결된 경우 (권장)
```bash
# 1. 간단 실행 (도메인 연결됨)
./run-nuvio.sh

# 2. 브라우저에서 https://nuvio.kr 접속
```

#### 도메인 설정이 필요한 경우
```bash
# 1. 도메인 설정 스크립트 실행
./setup-nuvio-domain.sh

# 2. SSL 인증서 설치
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d nuvio.kr -d www.nuvio.kr

# 3. 환경 변수 업데이트
cp env.cloud .env
# .env 파일에서 CORS_ORIGIN과 FRONTEND_URL이 https://nuvio.kr로 설정됨

# 4. ERP 시스템 실행
./run-cloud.sh
```

### 다른 도메인 사용시
```bash
# .env 파일에서 CORS_ORIGIN 수정
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

## 🔍 문제 해결

### Docker 권한 문제 (가장 흔한 문제)
```bash
# 1. 자동 해결 (권장)
./fix-docker-permissions.sh

# 2. 수동 해결
sudo usermod -aG docker $USER
sudo systemctl start docker
sudo systemctl enable docker
sudo chmod 666 /var/run/docker.sock

# 3. 새 터미널 세션 시작 또는 그룹 적용
newgrp docker

# 4. Docker 테스트
docker ps
```

### 포트 충돌 (가장 흔한 문제)
```bash
# 1. 자동 해결 (권장)
./fix-port-conflict.sh

# 2. 수동 해결
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5432
sudo netstat -tulpn | grep :6379

# 프로세스 종료
sudo kill -9 PID

# 3. Docker 컨테이너 정리
docker-compose down
docker container prune -f
```

### Docker 문제
```bash
# Docker 재시작
sudo systemctl restart docker

# 컨테이너 완전 삭제
docker-compose down
docker system prune -f
docker-compose up --build -d
```

### 메모리 부족
```bash
# Docker 메모리 제한 설정
docker-compose down
docker-compose up -d --memory=1g postgres redis backend frontend
```

## 📊 모니터링

### 시스템 리소스 확인
```bash
# CPU, 메모리 사용량
htop

# Docker 리소스 사용량
docker stats

# 디스크 사용량
df -h
```

### 로그 모니터링
```bash
# 실시간 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔄 업데이트

```bash
# 최신 코드 가져오기
git pull origin test

# 서비스 재시작
docker-compose down
docker-compose up --build -d
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Docker가 정상 실행 중인지
2. 포트 3000, 3001이 사용 가능한지
3. 방화벽 설정이 올바른지
4. 로그에 오류 메시지가 있는지

## 🎯 주요 기능

- ✅ 프로그램 신청서 관리
- ✅ 신청서 심사 (합격/불합격)
- ✅ 입금 상태 관리
- ✅ 매출 통계
- ✅ 사용자 관리
- ✅ 파일 업로드
