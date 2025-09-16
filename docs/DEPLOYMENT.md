# 배포 가이드

## 로컬 개발 환경 설정

### 1. 사전 요구사항
- Node.js 18 이상
- Docker & Docker Compose
- Git

### 2. 프로젝트 클론 및 설정
```bash
git clone <repository-url>
cd intu_erp
npm run setup
```

### 3. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 필요한 값들을 설정
```

### 4. Docker로 로컬 환경 실행
```bash
# 모든 서비스 시작
npm run docker:up

# 로그 확인
npm run docker:logs

# 서비스 중지
npm run docker:down
```

### 5. 개발 서버 실행
```bash
# 백엔드와 프론트엔드를 동시에 실행
npm run dev

# 또는 개별 실행
npm run dev:backend  # 백엔드만
npm run dev:frontend # 프론트엔드만
```

## 프로덕션 배포

### 1. Docker 이미지 빌드
```bash
# 전체 프로젝트 빌드
npm run build

# Docker 이미지 빌드
npm run docker:build
```

### 2. 환경 변수 설정
프로덕션 환경에서는 다음 환경 변수들을 설정해야 합니다:

```env
# 데이터베이스
DATABASE_URL=postgresql://username:password@host:5432/intu_erp
POSTGRES_DB=intu_erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=intu-erp-files

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 애플리케이션
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### 3. 데이터베이스 마이그레이션
```bash
cd backend
npm run migration:run
```

### 4. 서비스 시작
```bash
# Docker Compose로 실행
docker-compose -f docker-compose.prod.yml up -d

# 또는 개별 서비스 실행
npm run start:backend
npm run start:frontend
```

## CI/CD 파이프라인

### GitHub Actions
프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 제공합니다.

#### 트리거 조건
- `main` 브랜치 푸시: 프로덕션 배포
- `develop` 브랜치 푸시: 스테이징 배포
- Pull Request: 테스트 및 빌드 검증

#### 파이프라인 단계
1. **테스트**: 백엔드 및 프론트엔드 테스트 실행
2. **빌드**: 애플리케이션 빌드 및 Docker 이미지 생성
3. **배포**: 환경에 따른 자동 배포

### 환경별 배포
- **스테이징**: `develop` 브랜치 → 스테이징 환경
- **프로덕션**: `main` 브랜치 → 프로덕션 환경

## 모니터링 및 로그

### 로그 확인
```bash
# Docker Compose 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 헬스 체크
- **백엔드**: `http://localhost:3001/api/health`
- **프론트엔드**: `http://localhost:3000`

## 보안 고려사항

### 1. 환경 변수 보안
- 민감한 정보는 환경 변수로 관리
- `.env` 파일은 버전 관리에서 제외
- 프로덕션에서는 시크릿 관리 서비스 사용

### 2. 데이터베이스 보안
- 강력한 비밀번호 사용
- 네트워크 접근 제한
- 정기적인 백업

### 3. API 보안
- JWT 토큰 만료 시간 설정
- CORS 정책 적용
- Rate Limiting 적용

## 트러블슈팅

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :3001

# 포트 변경
# docker-compose.yml에서 포트 매핑 수정
```

#### 2. 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres
```

#### 3. 메모리 부족
```bash
# Docker 메모리 사용량 확인
docker stats

# 불필요한 컨테이너 정리
docker system prune
```

## 백업 및 복구

### 데이터베이스 백업
```bash
# 백업 생성
docker-compose exec postgres pg_dump -U postgres intu_erp > backup.sql

# 복구
docker-compose exec -T postgres psql -U postgres intu_erp < backup.sql
```

### 파일 백업
```bash
# 업로드된 파일 백업 (S3 사용 시)
aws s3 sync s3://your-bucket/uploads ./backups/uploads
```
