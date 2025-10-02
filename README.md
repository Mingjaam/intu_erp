# Intu ERP

마을 관리 시스템

## 🚀 빠른 시작

### 로컬 개발 환경

```bash
# 1. 백엔드 서비스 시작 (Docker)
./run-local.sh

# 2. 프론트엔드 개발 서버 시작 (로컬)
cd frontend
npm install
npm run dev
```

**접속 정보:**
- 프론트엔드: http://localhost:3000 (로컬) / https://nuvio.kr (프로덕션)
- 백엔드 API: http://localhost:3001/api (로컬) / https://nuvio.kr/api (프로덕션)

### 프로덕션 배포

```bash
# 1. 환경 변수 설정
cp env.production.example .env.production
# .env.production 파일을 편집하여 실제 값 설정

# 2. 프로덕션 배포
./deploy.sh
```

## 📁 프로젝트 구조

```
intu_erp/
├── frontend/          # Next.js 프론트엔드
├── backend/           # NestJS 백엔드
├── nginx/             # Nginx 설정
├── docker-compose.yml # 로컬 개발용
├── docker-compose.dev.yml    # 로컬 개발용 (백엔드만)
├── docker-compose.prod.yml   # 프로덕션용
├── run-local.sh       # 로컬 개발 스크립트
├── deploy.sh          # 프로덕션 배포 스크립트
└── env.production.example # 프로덕션 환경 변수 예시
```

## 🔧 개발 환경 설정

### 로컬 개발 (권장)
- **프론트엔드**: 로컬에서 `npm run dev`로 실행
- **백엔드**: Docker에서 실행 (데이터베이스, Redis 포함)

```bash
# 백엔드 서비스만 Docker로 실행
./run-local.sh

# 프론트엔드 로컬 실행
cd frontend
npm install
npm run dev
```

### 전체 Docker 개발
```bash
# 모든 서비스 Docker로 실행
docker-compose up -d
```

## 🌐 프로덕션 배포

### 클라우드 서버 배포

1. **환경 변수 설정**
```bash
cp env.production.example .env.production
# .env.production 파일 편집
```

2. **배포 실행**
```bash
./deploy.sh
```

### 환경 변수 설정

`.env.production` 파일에 다음 값들을 설정:

```env
# 데이터베이스
DB_PASSWORD=your_secure_password
DB_SSL=false

# JWT
JWT_SECRET=your_super_secure_jwt_secret

# URL
FRONTEND_URL=https://nuvio.kr
API_URL=https://nuvio.kr/api
```

## 🛠️ 유용한 명령어

### 로컬 개발
```bash
# 백엔드 서비스 시작
./run-local.sh

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 서비스 중지
docker-compose -f docker-compose.dev.yml down
```

### 프로덕션
```bash
# 배포
./deploy.sh

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 중지
docker-compose -f docker-compose.prod.yml down
```

## 🔐 기본 계정

로컬 개발 시 자동으로 생성되는 어드민 계정:
- **이메일**: admin@nuvio.kr
- **비밀번호**: admin123!

## 📝 API 문서

- **Swagger**: http://localhost:3001/api/docs (개발 환경)
- **프로덕션**: https://nuvio.kr/api/docs

## 🐛 트러블슈팅

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :3001

# 포트 변경 (docker-compose.yml 수정)
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres
```

### 메모리 부족
```bash
# Docker 메모리 사용량 확인
docker stats

# 불필요한 컨테이너 정리
docker system prune
```

## 📞 지원

문제가 발생하면 이슈를 등록하거나 개발팀에 문의해주세요.