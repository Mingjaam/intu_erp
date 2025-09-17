# Intu ERP API 문서

## 개요

Intu ERP API는 RESTful API를 기반으로 하며, JSON 형태로 데이터를 주고받습니다.

## 기본 정보

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token

## 응답 형식

모든 API 응답은 다음과 같은 형식을 따릅니다:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "성공적으로 처리되었습니다"
}
```

## 인증

### 로그인
```http
POST /auth/login

Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 회원가입
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

### 프로필 조회
```http
GET /auth/profile
Authorization: Bearer <token>
```

## 사용자 관리

### 사용자 목록 조회
```http
GET /users?page=1&limit=10&search=홍길동
Authorization: Bearer <token>
```

### 사용자 상세 조회
```http
GET /users/{id}
Authorization: Bearer <token>
```

### 사용자 생성
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "role": "applicant",
  "phone": "010-1234-5678",
  "organizationId": "org-uuid"
}
```

### 사용자 수정
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "reviewer"
}
```

### 사용자 삭제
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

## 역할 기반 접근 제어

### 역할 종류
- `admin`: 시스템 관리자
- `operator`: 프로그램 운영자
- `reviewer`: 심사자
- `applicant`: 신청자

### 권한 매트릭스

| 기능 | Admin | Operator | Reviewer | Applicant |
|------|-------|----------|----------|-----------|
| 사용자 관리 | ✅ | ✅ | ❌ | ❌ |
| 조직 관리 | ✅ | ✅ | ❌ | ❌ |
| 프로그램 관리 | ✅ | ✅ | ❌ | ❌ |
| 신청 관리 | ✅ | ✅ | ✅ | ❌ |
| 방문 관리 | ✅ | ✅ | ❌ | ❌ |
| 보고서 | ✅ | ✅ | ❌ | ❌ |
| 내 신청서 | ✅ | ✅ | ✅ | ✅ |

## 에러 처리

API는 다음과 같은 HTTP 상태 코드를 사용합니다:

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복)
- `500`: 서버 오류

에러 응답 예시:
```json
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다",
  "data": null
}
```

## 프로그램 관리

### 프로그램 목록 조회
```http
GET /programs?page=1&limit=10&status=open&organizerId=org-uuid
Authorization: Bearer <token>
```

### 프로그램 상세 조회
```http
GET /programs/{id}
Authorization: Bearer <token>
```

### 프로그램 생성
```http
POST /programs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "마을 환경 개선 프로젝트",
  "description": "마을의 환경을 개선하고 주민들의 삶의 질을 향상시키는 프로젝트입니다.",
  "organizerId": "org-uuid",
  "status": "open",
  "applyStart": "2025-01-01T00:00:00Z",
  "applyEnd": "2025-01-31T23:59:59Z",
  "applicationForm": {},
  "metadata": {}
}
```

### 프로그램 수정
```http
PATCH /programs/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 프로그램 제목",
  "status": "closed"
}
```

### 프로그램 삭제
```http
DELETE /programs/{id}
Authorization: Bearer <token>
```

### 프로그램 통계 조회
```http
GET /programs/{id}/stats
Authorization: Bearer <token>
```

## 신청서 관리

### 신청서 제출
```http
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "programId": "program-uuid",
  "payload": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "address": "서울시 강남구",
    "motivation": "지원 동기",
    "experience": "관련 경험"
  }
}
```

### 신청서 목록 조회
```http
GET /applications?page=1&limit=10&programId=program-uuid&status=submitted
Authorization: Bearer <token>
```

### 신청서 상세 조회
```http
GET /applications/{id}
Authorization: Bearer <token>
```

### 신청서 수정
```http
PATCH /applications/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "payload": {
    "name": "수정된 이름",
    "phone": "010-9876-5432"
  }
}
```

### 신청서 철회
```http
PATCH /applications/{id}/withdraw
Authorization: Bearer <token>
```

### 프로그램별 신청서 목록
```http
GET /applications/programs/{programId}
Authorization: Bearer <token>
```

### 프로그램별 신청서 통계
```http
GET /applications/programs/{programId}/stats
Authorization: Bearer <token>
```

## 선정 관리

### 선정 처리
```http
POST /selections
Authorization: Bearer <token>
Content-Type: application/json

{
  "applicationId": "application-uuid",
  "selected": true,
  "reason": "우수한 신청서로 선정되었습니다.",
  "criteria": {
    "score": 85,
    "criteria": ["창의성", "실현가능성"]
  }
}
```

### 선정 목록 조회
```http
GET /selections?page=1&limit=10&programId=program-uuid&selected=true
Authorization: Bearer <token>
```

### 선정 상세 조회
```http
GET /selections/{id}
Authorization: Bearer <token>
```

### 선정 수정
```http
PATCH /selections/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "selected": false,
  "reason": "수정된 사유"
}
```

### 프로그램별 선정 목록
```http
GET /selections/programs/{programId}
Authorization: Bearer <token>
```

### 프로그램별 선정 통계
```http
GET /selections/programs/{programId}/stats
Authorization: Bearer <token>
```

## 방문 관리

### 방문 예약
```http
POST /visits
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationId": "org-uuid",
  "programId": "program-uuid",
  "scheduledAt": "2025-02-15T10:00:00Z",
  "notes": "방문 목적 및 내용",
  "outcome": {}
}
```

### 방문 목록 조회
```http
GET /visits?page=1&limit=10&organizationId=org-uuid&status=scheduled
Authorization: Bearer <token>
```

### 방문 상세 조회
```http
GET /visits/{id}
Authorization: Bearer <token>
```

### 방문 수정
```http
PATCH /visits/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledAt": "2025-02-16T10:00:00Z",
  "notes": "수정된 방문 내용"
}
```

### 방문 완료 처리
```http
PATCH /visits/{id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "outcome": {
    "result": "성공",
    "notes": "방문 결과 메모"
  }
}
```

### 방문 취소
```http
PATCH /visits/{id}/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "취소 사유"
}
```

### 프로그램별 방문 목록
```http
GET /visits/programs/{programId}
Authorization: Bearer <token>
```

### 프로그램별 방문 통계
```http
GET /visits/programs/{programId}/stats
Authorization: Bearer <token>
```

## 조직 관리

### 조직 목록 조회
```http
GET /organizations?page=1&limit=10&type=village&search=행복
Authorization: Bearer <token>
```

### 조직 상세 조회
```http
GET /organizations/{id}
Authorization: Bearer <token>
```

### 조직 생성
```http
POST /organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "행복마을회",
  "type": "village",
  "address": "서울시 강남구 테헤란로 123",
  "contact": "02-1234-5678",
  "description": "지역 주민들의 복지 향상을 위한 마을회"
}
```

### 조직 수정
```http
PATCH /organizations/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "수정된 조직명",
  "contact": "02-9876-5432"
}
```

### 조직 삭제
```http
DELETE /organizations/{id}
Authorization: Bearer <token>
```

### 조직 통계 조회
```http
GET /organizations/{id}/stats
Authorization: Bearer <token>
```

### 조직 유형별 통계
```http
GET /organizations/types
Authorization: Bearer <token>
```

## 역할 기반 접근 제어

### 역할 종류
- `admin`: 시스템 관리자
- `operator`: 프로그램 운영자
- `reviewer`: 심사자
- `applicant`: 신청자

### 권한 매트릭스

| 기능 | Admin | Operator | Reviewer | Applicant |
|------|-------|----------|----------|-----------|
| 사용자 관리 | ✅ | ✅ | ❌ | ❌ |
| 조직 관리 | ✅ | ✅ | ❌ | ❌ |
| 프로그램 관리 | ✅ | ✅ | ❌ | ❌ |
| 신청서 관리 | ✅ | ✅ | ✅ | ✅ |
| 선정 관리 | ✅ | ✅ | ✅ | ❌ |
| 방문 관리 | ✅ | ✅ | ✅ | ❌ |
| 통계 조회 | ✅ | ✅ | ✅ | ❌ |

## 에러 처리

API는 다음과 같은 HTTP 상태 코드를 사용합니다:

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복)
- `500`: 서버 오류

에러 응답 예시:
```json
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다",
  "data": null
}
```

## 프론트엔드 라우팅

### 인증 관련 페이지
- **로그인/회원가입**: `/auth/login`
- **루트 페이지**: `/` (역할별 자동 리다이렉트)

### 사용자 페이지
- **프로그램 목록**: `/programs`
- **프로그램 상세**: `/programs/[id]`
- **프로그램 신청**: `/programs/[id]/apply`
- **내 신청 목록**: `/applications`
- **신청 상세**: `/applications/[id]`

### 관리자 페이지
- **관리자 대시보드**: `/admin`
- **프로그램 관리**: `/admin/programs`
- **신청자 관리**: `/admin/programs/[id]/applications`

## Swagger 문서

API 문서는 Swagger UI를 통해 확인할 수 있습니다:
- URL: `http://localhost:3001/api/docs`
