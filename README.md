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

### 1. 사용자 & 조직 관리
- 회원가입, 로그인, 역할 기반 접근 제어
- 조직(마을, 기관) 엔터티 관리
- 사용자 ↔ 조직 관계 관리

### 2. 프로그램 관리
- 프로그램 생성 및 관리
- 신청 기간 설정
- 다단계 신청 폼 (JSONB)

### 3. 신청 & 선정
- 신청서 작성 및 제출
- 심사자 점수 입력
- 선정/탈락 처리

### 4. 방문 & 후속 관리
- 방문 예약 및 결과 기록
- 후속 협업 추적

### 5. 보고서 & 대시보드
- KPI 대시보드
- 데이터 내보내기 (CSV/Excel)
- 통계 및 차트

### 6. 감사 & 로그
- 모든 변경 내역 기록
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
cp .env.example .env
# 환경 변수 수정
```

3. **Docker로 로컬 환경 실행**
```bash
docker-compose up -d
```

4. **데이터베이스 마이그레이션**
```bash
cd backend
npm run migration:run
```

5. **개발 서버 실행**
```bash
# 백엔드
cd backend
npm run start:dev

# 프론트엔드
cd frontend
npm run dev
```

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
