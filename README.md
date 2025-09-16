# Intu ERP - 풀스택 ERP 웹 애플리케이션

신청자, 수혜자, 프로그램, 후속 활동을 관리할 수 있는 ERP 시스템입니다.

## 기술 스택

### 백엔드
- **Framework**: NestJS (Node.js, TypeScript)
- **Database**: PostgreSQL (JSONB 지원)
- **Cache/Queue**: Redis
- **Authentication**: JWT
- **File Storage**: AWS S3
- **ORM**: TypeORM

### 프론트엔드
- **Framework**: Next.js 14 (React, TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query
- **Forms**: React Hook Form + Yup
- **API Client**: OpenAPI TypeScript

### 인프라
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Database**: AWS RDS (PostgreSQL)
- **File Storage**: AWS S3

## 프로젝트 구조

```
intu_erp/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── auth/           # 인증/인가 모듈
│   │   ├── users/          # 사용자 관리
│   │   ├── organizations/  # 조직 관리
│   │   ├── programs/       # 프로그램 관리
│   │   ├── applications/   # 신청 관리
│   │   ├── visits/         # 방문 관리
│   │   ├── audit/          # 감사 로그
│   │   └── common/         # 공통 모듈
│   ├── prisma/             # 데이터베이스 스키마
│   └── docker/
├── frontend/               # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # App Router
│   │   ├── components/     # UI 컴포넌트
│   │   ├── lib/            # 유틸리티
│   │   ├── hooks/          # 커스텀 훅
│   │   └── types/          # TypeScript 타입
│   └── public/
├── docker-compose.yml      # 로컬 개발 환경
├── .github/workflows/      # CI/CD 파이프라인
└── docs/                   # 문서
```

## 핵심 기능

### 1. 사용자 & 조직 관리 ✅
- JWT 기반 인증 시스템
- 역할 기반 접근 제어 (관리자/운영자/심사자/신청자)
- 조직(마을, 기관, 기업, NGO) 관리
- 사용자 ↔ 조직 관계 관리

### 2. 프로그램 관리 ✅
- 프로그램 CRUD (생성/조회/수정/삭제)
- 상태 관리 (임시저장/모집중/종료/보관)
- 신청 기간 설정 및 관리
- 프로그램별 통계 제공

### 3. 신청서 관리 ✅
- 폼 기반 신청서 작성 및 제출
- 로그인된 사용자 정보 자동 채움
- 신청서 상태 관리 (제출됨/심사중/선정됨/탈락/철회됨)
- 신청서 수정 및 철회 기능

### 4. 선정 관리 ✅
- 신청서 심사 및 점수 입력
- 선정/탈락 처리
- 심사 기준 및 사유 기록
- 선정 결과 통계

### 5. 방문 관리 ✅
- 방문 예약 및 일정 관리
- 방문 완료/취소 처리
- 방문 결과 및 후속 조치 기록
- 방문 통계 및 추적

### 6. 조직 관리 ✅
- 조직 CRUD (생성/조회/수정/삭제)
- 조직 유형별 관리 (마을/기관/기업/NGO)
- 조직별 통계 및 현황
- 조직 검색 및 필터링

### 7. 대시보드 & 통계 ✅
- 실시간 KPI 대시보드
- 프로그램별 신청/선정 통계
- 조직별 활동 현황
- 방문 및 후속 활동 추적

### 8. 감사 & 로그 ✅
- 모든 변경 내역 자동 기록
- 사용자 활동 추적
- 시스템 전역 감사 로그

## 시작하기

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd intu_erp
```

2. **환경 변수 설정**
```bash
cp env.example .env
# 환경 변수 수정
```

3. **PostgreSQL 설치 및 설정**
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15
createdb intu_erp

# 환경 변수 설정
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/intu_erp"
export NODE_ENV="development"
export JWT_SECRET="your-super-secret-jwt-key-for-development"
export JWT_EXPIRES_IN="7d"
export PORT=3001
export CORS_ORIGIN="http://localhost:3000"
```

4. **의존성 설치**
```bash
# 루트 디렉토리
npm install

# 백엔드
cd backend
npm install

# 프론트엔드
cd ../frontend
npm install
```

5. **개발 서버 실행**
```bash
# 백엔드 (터미널 1)
cd backend
npm run start:dev

# 프론트엔드 (터미널 2)
cd frontend
npm run dev
```

6. **접속**
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001/api
- API 문서: http://localhost:3001/api/docs

## API 문서

- Swagger UI: http://localhost:3001/api/docs
- OpenAPI Spec: http://localhost:3001/api/docs-json

## 배포

### 스테이징 환경
- URL: https://staging.intu-erp.com
- 자동 배포: `develop` 브랜치 푸시 시

### 운영 환경
- URL: https://intu-erp.com
- 자동 배포: `main` 브랜치 푸시 시

## 라이선스

MIT License
