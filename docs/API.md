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

## Swagger 문서

API 문서는 Swagger UI를 통해 확인할 수 있습니다:
- URL: `http://localhost:3001/api/docs`
