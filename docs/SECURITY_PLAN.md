# Term 프로젝트 수행 계획서: 보안을 고려한 개발

## 1. 응용 프로그램 소개 및 시스템 아키텍처

### 1.1 응용 프로그램 개요

**nuvio**는 국가에서 시행하는 청년 마을 사업의 사업자들의 요청을 받아 외주방식으로 개발한 웹 기반의 SaaS(Software as a Service) 프로그램입니다. 본 시스템은 신청자, 수혜자, 프로그램, 후속 활동을 통합 관리하는 마을 관리 시스템으로, 조직 관리, 프로그램 신청 및 선발, 방문 관리, 예산 관리, 사용자 리포트 등 다양한 기능을 제공합니다.

본 프로젝트는 2025년 12월 중 구독제로 배포될 예정이며, 다수의 청년 마을 사업 사업자들이 사용할 예정입니다. 이에 따라 대량의 개인정보를 처리하게 되며, 구독제 SaaS 서비스의 특성상 지속적인 보안 관리가 필수적입니다. 따라서 본 Term 프로젝트를 통해 체계적인 보안 강화를 수행하는 것이 적절하다고 판단하였습니다.

본 시스템은 사용자 유형에 따라 다른 기능을 제공합니다. **일반 사용자(신청자)**의 경우 청년 마을의 프로그램 신청 기능이 주요 기능이며, 프로그램 조회, 신청서 작성 및 제출, 신청 현황 확인 등을 수행할 수 있습니다. **운영자(관리자, 운영자, 직원)**의 경우 ERP 기능을 제공받으며, 프로그램 관리, 신청자 관리, 선발 관리, 방문 관리, 예산 관리 등의 업무를 수행할 수 있습니다. 또한 운영자는 국가에 제출해야 할 보고서 생성 등의 편의 기능을 제공받아 업무 효율성을 높일 수 있는 통합 플랫폼입니다.

### 1.2 시스템 아키텍처 (Architecture Design)

본 시스템은 **3-Tier Architecture**를 기반으로 설계되었습니다:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Frontend)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js (React) - 사용자 인터페이스                  │   │
│  │  - 사용자 인증 및 세션 관리                            │   │
│  │  - RESTful API 호출                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/TLS
                         │ JWT Token
┌────────────────────────▼────────────────────────────────────┐
│              Application Layer (Backend API)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NestJS (Node.js/TypeScript)                         │   │
│  │  - RESTful API 서버                                   │   │
│  │  - JWT 기반 인증/인가                                  │   │
│  │  - 비즈니스 로직 처리                                  │   │
│  │  - 데이터 검증 및 변환                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nginx Reverse Proxy                                 │   │
│  │  - SSL/TLS 종료                                       │   │
│  │  - 요청 라우팅                                        │   │
│  │  - 정적 파일 서빙                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Encrypted Connection
┌────────────────────────▼────────────────────────────────────┐
│                  Data Layer (Database)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                          │   │
│  │  - 사용자 정보, 프로그램, 신청서 등 저장              │   │
│  │  - 관계형 데이터 관리                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Redis                                               │   │
│  │  - 세션 캐시                                         │   │
│  │  - 임시 데이터 저장                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**주요 구성 요소:**

1. **Frontend (Next.js)**: 사용자 인터페이스 제공, 클라이언트 측 라우팅 및 상태 관리
2. **Backend (NestJS)**: RESTful API 제공, 비즈니스 로직 처리, 인증/인가
3. **Nginx**: 리버스 프록시, SSL/TLS 종료, 로드 밸런싱
4. **PostgreSQL**: 관계형 데이터베이스, 영구 데이터 저장
5. **Redis**: 캐시 및 세션 저장소

**인증 흐름:**
- 사용자 로그인 → 비밀번호 검증 (bcrypt) → JWT 토큰 발급 → 클라이언트 저장
- 이후 요청 시 JWT 토큰을 Authorization 헤더에 포함하여 전송
- 서버에서 JWT 검증 후 사용자 정보 추출 및 권한 확인

---

## 2. 현재 보안적으로 잘 충족한 부분

본 시스템은 기본적인 보안 요구사항을 상당 부분 충족하고 있습니다. 현재 구현된 주요 보안 기능은 다음과 같습니다:

### 2.1 해싱을 활용한 비밀번호 보안

**구현 내용:**
- **bcrypt 해싱 알고리즘 사용**: 비밀번호를 저장할 때 bcrypt 해싱 알고리즘을 사용하여 salt rounds 12로 해싱
- **비밀번호 평문 저장 방지**: 데이터베이스에 비밀번호 평문이 아닌 해시값만 저장
- **비밀번호 검증**: 로그인 시 `bcrypt.compare()`를 사용하여 입력된 비밀번호와 저장된 해시값 비교

**보안 요구사항 충족:**
- 비밀번호 기밀성 보장: 데이터베이스 유출 시에도 원본 비밀번호 복구 불가능
- 무차별 대입 공격 방어: bcrypt의 느린 해싱 속도로 인한 공격 비용 증가

**구현 위치:**
```74:74:backend/src/auth/auth.service.ts
const hashedPassword = await bcrypt.hash(registerDto.password, 12);
```

### 2.2 공개키 기반 JWT 인증 시스템

**구현 내용:**
- **JWT(JSON Web Token) 기반 인증**: Passport.js와 passport-jwt 전략을 사용한 토큰 기반 인증
- **Bearer Token 인증**: Authorization 헤더의 Bearer 토큰 방식으로 인증
- **토큰 검증 및 사용자 정보 추출**: JWT Strategy에서 토큰 검증 후 사용자 정보를 요청 객체에 주입
- **사용자 활성화 상태 확인**: JWT Strategy에서 `isActive` 필드를 확인하여 비활성화된 사용자 접근 차단

**보안 요구사항 충족:**
- 인증 무결성 보장: JWT 서명을 통한 토큰 변조 방지
- 사용자 인증 상태 관리: 비활성화된 사용자의 접근 차단

**구현 위치:**
```16:34:backend/src/auth/strategies/jwt.strategy.ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: configService.get<string>('JWT_SECRET'),
});

async validate(payload: any) {
  const user = await this.userRepository.findOne({
    where: { id: payload.sub },
    relations: ['organization'],
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException();
  }

  return user;
}
```

### 2.3 역할 기반 접근 제어(RBAC)

**구현 내용:**
- **역할 기반 권한 관리**: ADMIN, OPERATOR, STAFF, APPLICANT 4가지 역할 정의
- **RolesGuard 구현**: 컨트롤러 및 엔드포인트 레벨에서 역할 기반 접근 제어
- **@Roles 데코레이터**: 메서드 및 클래스에 필요한 역할을 명시적으로 지정
- **세밀한 권한 제어**: 각 API 엔드포인트별로 필요한 최소 권한만 부여

**보안 요구사항 충족:**
- 최소 권한 원칙 준수: 사용자는 필요한 최소 권한만 부여받음
- 권한 상승 공격 방지: 역할 기반 검증으로 무단 접근 차단

**구현 위치:**
```1:21:backend/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 2.4 입력 데이터 검증 및 무결성 보장

**구현 내용:**
- **Global ValidationPipe**: 모든 요청에 대해 자동 입력 검증 수행
- **whitelist 옵션**: DTO에 정의되지 않은 속성 자동 제거
- **forbidNonWhitelisted 옵션**: 허용되지 않은 속성 포함 시 요청 거부
- **class-validator 데코레이터**: DTO 클래스에 `@IsEmail()`, `@IsString()`, `@IsEnum()` 등으로 타입 및 형식 검증
- **클라이언트 측 검증**: 프론트엔드에서 Zod 스키마를 사용한 이중 검증

**보안 요구사항 충족:**
- 입력 데이터 무결성 보장: 잘못된 형식의 데이터 요청 차단
- Mass Assignment 공격 방지: 허용되지 않은 필드 주입 차단
- SQL Injection 방지: TypeORM의 파라미터화된 쿼리 사용

**구현 위치:**
```19:25:backend/src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### 2.5 Rate Limiting을 통한 DoS 공격 방어

**구현 내용:**
- **ThrottlerModule 적용**: 전역적으로 Rate Limiting 적용
- **요청 제한 설정**: 1분당 100회 요청 제한
- **TTL 기반 제한**: 시간 기반 윈도우로 요청 수 제한

**보안 요구사항 충족:**
- DoS/DDoS 공격 완화: 과도한 요청으로 인한 서버 과부하 방지
- Brute Force 공격 방어: 반복적인 요청 제한

**구현 위치:**
```58:63:backend/src/app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
]),
```

### 2.6 CORS(Cross-Origin Resource Sharing) 보안 설정

**구현 내용:**
- **명시적 Origin 허용**: 허용된 도메인만 명시적으로 지정
- **Credentials 허용**: 쿠키 및 인증 정보 전송 허용
- **허용 메서드 제한**: GET, POST, PUT, DELETE, PATCH, OPTIONS만 허용
- **허용 헤더 제한**: Content-Type, Authorization, X-Requested-With만 허용

**보안 요구사항 충족:**
- CSRF 공격 완화: 신뢰할 수 있는 Origin만 허용
- 무단 도메인 접근 차단: 허용되지 않은 도메인에서의 API 호출 차단

**구현 위치:**
```28:42:backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001',
    // 프로덕션 도메인
    'https://nuvio.kr',
    'https://www.nuvio.kr',
    'http://nuvio.kr',
    'http://www.nuvio.kr'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
```

### 2.7 HTTPS/SSL/TLS 전송 계층 보안

**구현 내용:**
- **Nginx SSL/TLS 종료**: Nginx에서 SSL 인증서 관리 및 TLS 연결 처리
- **HTTP to HTTPS 리다이렉트**: 모든 HTTP 요청을 HTTPS로 자동 리다이렉트
- **TLS 프로토콜 제한**: TLSv1.2 및 TLSv1.3만 허용
- **강력한 암호화 알고리즘**: ECDHE-RSA-AES128-GCM-SHA256, ECDHE-RSA-AES256-GCM-SHA384 사용

**보안 요구사항 충족:**
- 전송 중 데이터 기밀성 보장: HTTPS를 통한 데이터 암호화
- 중간자 공격 방지: TLS 인증서 검증을 통한 서버 신원 확인

**구현 위치:**
```42:61:nginx/nginx.conf
# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name nuvio.kr www.nuvio.kr;

    # SSL 인증서 설정
    ssl_certificate /etc/letsencrypt/live/nuvio.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nuvio.kr/privkey.pem;

    # SSL 보안 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
```

### 2.8 감사 로그(Audit Log) 시스템

**구현 내용:**
- **AuditLog 엔티티**: 모든 중요 작업을 기록하는 감사 로그 테이블
- **AuditLogInterceptor**: 자동으로 API 요청을 감사 로그에 기록
- **작업 추적**: CREATE, UPDATE, DELETE, LOGIN, LOGOUT 등 모든 작업 기록
- **사용자 추적**: 작업 수행자(actor), IP 주소, User-Agent 정보 저장
- **변경 이력 관리**: 작업 전(before) 및 작업 후(after) 데이터 저장

**보안 요구사항 충족:**
- 보안 사고 추적: 침해 사고 발생 시 원인 분석 가능
- 부인 방지: 모든 작업에 대한 감사 추적 가능
- 규정 준수: 개인정보보호법 등에서 요구하는 접근 로그 기록

**구현 위치:**
```23:64:backend/src/database/entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actorId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  targetTable: string;

  @Column({ nullable: true })
  targetId: string;

  @Column('jsonb', { nullable: true })
  before: Record<string, any>;

  @Column('jsonb', { nullable: true })
  after: Record<string, any>;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 2.9 파일 업로드 보안

**구현 내용:**
- **파일 타입 검증**: 이미지 파일(jpg, jpeg, png, gif, webp)만 허용
- **파일 크기 제한**: 최대 5MB로 제한
- **UUID 기반 파일명**: 예측 불가능한 파일명 생성으로 파일 덮어쓰기 방지
- **권한 기반 접근 제어**: ADMIN, OPERATOR, STAFF만 파일 업로드 가능

**보안 요구사항 충족:**
- 악성 파일 업로드 방지: 허용된 파일 타입만 업로드 가능
- 파일 시스템 공격 방지: 예측 가능한 파일명을 통한 공격 차단

**구현 위치:**
```22:42:backend/src/upload/upload.controller.ts
@Post('image')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/images',
      filename: (req, file, cb) => {
        const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('이미지 파일만 업로드 가능합니다.'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }),
)
```

### 2.10 환경 변수 관리

**구현 내용:**
- **ConfigModule 사용**: 중앙화된 환경 변수 관리
- **환경별 설정 분리**: 개발/프로덕션 환경 변수 분리
- **민감 정보 분리**: 데이터베이스 비밀번호, JWT Secret 등을 코드에서 분리

**보안 요구사항 충족:**
- 비밀번호 하드코딩 방지: 코드에 민감 정보 포함 방지
- 환경별 보안 설정: 개발/프로덕션 환경에 따른 보안 수준 조정

**구현 위치:**
```31:34:backend/src/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
}),
```

### 2.11 클라이언트 측 비밀번호 정책 검증

**구현 내용:**
- **Zod 스키마 검증**: 프론트엔드에서 비밀번호 정책 검증
- **최소 길이 제한**: 8자 이상 필수
- **복잡도 요구사항**: 대문자, 특수문자 포함 필수
- **실시간 검증**: 사용자 입력 시 즉시 피드백 제공

**보안 요구사항 충족:**
- 약한 비밀번호 방지: 복잡한 비밀번호 정책 강제
- 사용자 경험 개선: 서버 요청 전 클라이언트에서 검증

**구현 위치:**
```17:22:frontend/src/components/auth/register-form.tsx
password: z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '비밀번호는 대문자를 포함해야 합니다')
  .regex(/[~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, '비밀번호는 특수문자를 포함해야 합니다'),
```

### 2.12 사용자 활성화 상태 관리

**구현 내용:**
- **isActive 플래그**: 사용자 계정 활성화/비활성화 상태 관리
- **JWT 검증 시 확인**: JWT Strategy에서 사용자 활성화 상태 확인
- **비활성화 사용자 차단**: 비활성화된 사용자의 모든 API 접근 차단

**보안 요구사항 충족:**
- 계정 탈취 대응: 계정 비활성화 시 즉시 접근 차단
- 임시 계정 관리: 일시적으로 계정 접근을 제한할 수 있는 메커니즘 제공

**구현 위치:**
```29:31:backend/src/auth/strategies/jwt.strategy.ts
if (!user || !user.isActive) {
  throw new UnauthorizedException();
}
```

---

## 3. 보안 취약점 분석

현재 시스템에서 발견된 주요 보안 취약점은 다음과 같습니다:

### 3.1 데이터 저장 시 기밀성 보장 부족

**문제점:**
- **민감한 개인정보 평문 저장**: 사용자의 전화번호(`phone`), 주소(`hometown`, `residence`), 생년월일(`birthYear`), 성별(`gender`) 등이 데이터베이스에 평문으로 저장됨
- **신청서 데이터 평문 저장**: 프로그램 신청서의 `payload` 필드에 개인정보가 JSON 형태로 평문 저장됨
- **데이터베이스 연결 암호화 부족**: 개발 환경에서 PostgreSQL 연결 시 SSL/TLS 미사용 (`DB_SSL=false`)

**위험성:**
- 데이터베이스가 유출되거나 내부 공격자가 접근할 경우 모든 개인정보가 노출됨
- 개인정보보호법 위반 및 심각한 법적 리스크 발생 가능

### 3.2 사용자 인증 시 검증 및 무결성 보장 부족

**문제점:**
- **JWT 토큰 만료 시간 과다**: 현재 JWT 토큰 만료 시간이 7일로 설정되어 있어 토큰 탈취 시 장기간 악용 가능
- **토큰 갱신(Refresh Token) 메커니즘 부재**: Access Token만 사용하여 토큰 만료 후 재로그인 필요
- **비밀번호 정책 미적용**: 비밀번호 복잡도 검증, 최소 길이 제한 등이 없음
- **로그인 시도 제한 부재**: Brute Force 공격에 취약함 (Throttler는 있으나 로그인 엔드포인트에 미적용)

**위험성:**
- JWT 토큰 탈취 시 장기간 무단 접근 가능
- 약한 비밀번호로 인한 계정 탈취 위험
- 무차별 대입 공격으로 인한 계정 해킹 가능

### 3.3 데이터 전송 시 무결성 보장 부족

**문제점:**
- **API 응답 데이터 무결성 검증 부재**: 클라이언트가 받은 데이터가 변조되지 않았음을 검증할 수 없음
- **파일 업로드 무결성 검증 부재**: 업로드된 파일의 해시값 검증 없음
- **중요 데이터 전송 시 서명 부재**: 신청서 제출, 예산 승인 등 중요 작업에 대한 전자 서명 없음

**위험성:**
- 중간자 공격(Man-in-the-Middle) 시 데이터 변조 가능
- 악성 파일 업로드 및 실행 가능

### 3.4 환경 변수 및 비밀키 관리 부족

**문제점:**
- **JWT_SECRET 하드코딩 위험**: 환경 변수로 관리되나 강도 검증 없음
- **데이터베이스 비밀번호 평문 저장**: `.env` 파일에 평문으로 저장되어 파일 유출 시 위험
- **AWS 자격증명 평문 저장**: S3 접근을 위한 Access Key가 환경 변수에 평문 저장

**위험성:**
- 환경 변수 파일 유출 시 전체 시스템 침해 가능
- 외부 서비스(예: AWS S3) 무단 접근 가능

---

## 4. 대칭키, 공개키, 해싱 등을 적용하여 보완할 부분 명시

본 섹션에서는 발견된 보안 취약점에 대해 어떤 암호 방식과 알고리즘을 사용하여 어떤 보안 요구사항을 만족시킬 것인지 명시합니다.

### 4.1 보안 취약점별 암호화 기술 적용 매핑

| 보안 취약점 | 암호 방식 | 알고리즘 | 적용 대상 | 보안 요구사항 충족 |
|------------|----------|---------|----------|------------------|
| **3.1 데이터 저장 시 기밀성 보장 부족** | | | | |
| 민감한 개인정보 평문 저장 | **대칭키 암호화** | AES-256-GCM | 사용자 전화번호, 주소, 생년월일, 성별, 신청서 payload | 기밀성 보장, 무결성 검증 |
| 데이터베이스 연결 암호화 부족 | **대칭키 암호화** (TLS) | TLS 1.2/1.3, ECDHE-RSA-AES256-GCM-SHA384 | PostgreSQL 연결 | 전송 중 데이터 기밀성 보장 |
| **3.2 사용자 인증 시 검증 및 무결성 보장 부족** | | | | |
| JWT 토큰 만료 시간 과다 | **공개키 암호화** | RSA-256 (RS256) | JWT Access Token 서명 | 토큰 무결성 보장, 변조 방지 |
| 토큰 갱신 메커니즘 부재 | **해싱** | SHA-256 | Refresh Token 저장 | 토큰 재사용 방지, 무결성 검증 |
| 비밀번호 정책 미적용 | **해싱** | bcrypt (salt rounds: 12) | 비밀번호 저장 및 검증 | 비밀번호 기밀성 보장, 무차별 대입 공격 방어 |
| 로그인 시도 제한 부재 | **해싱** | SHA-256 | 로그인 실패 횟수 해시 저장 | Brute Force 공격 방어 |
| **3.3 데이터 전송 시 무결성 보장 부족** | | | | |
| API 응답 데이터 무결성 검증 부재 | **해싱** | SHA-256 | API 응답 데이터 | 데이터 무결성 검증, 변조 탐지 |
| 파일 업로드 무결성 검증 부재 | **해싱** | SHA-256 | 업로드된 파일 | 파일 무결성 검증, 악성 파일 탐지 |
| 중요 작업 전자 서명 부재 | **공개키 암호화** | RSA-256 (RSA-SHA256) | 보고서 생성, 신청서 심사, 선정 처리 등 | 작업 무결성 보장, 부인 방지 |
| **3.4 환경 변수 및 비밀키 관리 부족** | | | | |
| JWT_SECRET 강도 검증 부재 | **해싱** | SHA-256 | JWT_SECRET 길이 및 복잡도 검증 | 약한 키로 인한 암호화 우회 방지 |
| ENCRYPTION_KEY 검증 부재 | **해싱** | - | ENCRYPTION_KEY 형식 검증 (64자 hex) | 암호화 키 강도 보장 |

### 4.2 암호 방식별 상세 적용 방안

#### 4.2.1 대칭키 암호화 적용

**적용 취약점:**
- 3.1.1: 민감한 개인정보 평문 저장
- 3.1.2: 데이터베이스 연결 암호화 부족

**사용 알고리즘:**
- **AES-256-GCM** (Advanced Encryption Standard 256-bit Galois/Counter Mode)
- **TLS 1.2/1.3** with **ECDHE-RSA-AES256-GCM-SHA384**

**적용 방법:**
1. **민감 정보 암호화 (AES-256-GCM)**:
   - 사용자 전화번호, 주소, 생년월일 등 개인정보를 AES-256-GCM으로 암호화
   - 32바이트 암호화 키(ENCRYPTION_KEY) 사용
   - GCM 모드로 인증 태그 생성하여 무결성 검증 동시 수행
   - IV(Initialization Vector)를 랜덤 생성하여 같은 평문도 다른 암호문 생성

2. **데이터베이스 연결 암호화 (TLS)**:
   - PostgreSQL 연결 시 SSL/TLS 활성화
   - 프로덕션 환경에서 `sslmode=require` 설정
   - 강력한 암호화 알고리즘 사용 (ECDHE-RSA-AES256-GCM-SHA384)

**보안 요구사항 충족:**
- ✅ **기밀성 (Confidentiality)**: 데이터베이스 유출 시에도 개인정보 보호
- ✅ **무결성 (Integrity)**: GCM 모드의 인증 태그로 데이터 변조 탐지
- ✅ **전송 중 보안**: TLS를 통한 데이터 전송 중 암호화

#### 4.2.2 공개키 암호화 적용

**적용 취약점:**
- 3.2.1: JWT 토큰 만료 시간 과다 및 변조 위험
- 3.3.3: 중요 작업 전자 서명 부재

**사용 알고리즘:**
- **RSA-256 (RS256)**: JWT 토큰 서명
- **RSA-SHA256**: 중요 작업 전자 서명

**적용 방법:**
1. **JWT 토큰 서명 (RSA-256)**:
   - 기존 HMAC 대칭키 방식에서 RSA 공개키/개인키 쌍 방식으로 변경
   - 서버의 개인키로 JWT 토큰 서명
   - 클라이언트는 공개키로 토큰 검증
   - Access Token 만료 시간을 15분으로 단축
   - Refresh Token은 해시값으로 저장하여 검증

2. **중요 작업 전자 서명 (RSA-SHA256)**:
   - 보고서 생성, 신청서 심사, 선정 처리 등 중요 작업에 전자 서명 적용
   - 사용자의 개인키로 작업 데이터에 서명
   - 서버의 공개키로 서명 검증
   - 서명 정보를 데이터베이스에 저장하여 부인 방지

**보안 요구사항 충족:**
- ✅ **무결성 (Integrity)**: RSA 서명을 통한 데이터 변조 방지
- ✅ **부인 방지 (Non-repudiation)**: 전자 서명으로 작업 수행자 확인
- ✅ **인증 (Authentication)**: 공개키 검증을 통한 신원 확인

#### 4.2.3 해싱 적용

**적용 취약점:**
- 3.2.2: 토큰 갱신 메커니즘 부재
- 3.2.3: 비밀번호 정책 미적용 (이미 bcrypt 사용 중이지만 추가 보완)
- 3.2.4: 로그인 시도 제한 부재
- 3.3.1: API 응답 데이터 무결성 검증 부재
- 3.3.2: 파일 업로드 무결성 검증 부재
- 3.4.1: JWT_SECRET 강도 검증 부재

**사용 알고리즘:**
- **SHA-256** (Secure Hash Algorithm 256-bit): 데이터 무결성 검증
- **bcrypt**: 비밀번호 해싱 (salt rounds: 12)

**적용 방법:**
1. **Refresh Token 해싱 (SHA-256)**:
   - Refresh Token을 평문으로 저장하지 않고 SHA-256 해시값으로 저장
   - 토큰 검증 시 입력된 토큰을 해시하여 저장된 해시값과 비교
   - 토큰 탈취 시에도 원본 토큰 복구 불가능

2. **비밀번호 해싱 (bcrypt)**:
   - 기존 bcrypt 사용 유지 (salt rounds: 12)
   - 추가로 비밀번호 정책 강화 (최소 8자, 대소문자/숫자/특수문자 조합)
   - 비밀번호 히스토리 관리 (최근 사용한 비밀번호 재사용 방지)

3. **로그인 시도 제한 (SHA-256)**:
   - 로그인 실패 횟수를 Redis에 해시값으로 저장
   - 5회 실패 시 계정 일시 잠금
   - IP 주소와 사용자 ID를 조합하여 해시 저장

4. **API 응답 무결성 검증 (SHA-256)**:
   - 중요 API 응답 데이터의 SHA-256 해시값을 계산
   - 해시값을 응답 헤더(`X-Response-Hash`)에 포함
   - 클라이언트에서 해시값 검증하여 데이터 변조 탐지

5. **파일 업로드 무결성 검증 (SHA-256)**:
   - 업로드된 파일의 SHA-256 해시값을 계산
   - 해시값을 데이터베이스에 저장
   - 파일 다운로드 시 해시값 검증하여 파일 변조 탐지

6. **비밀키 강도 검증 (SHA-256)**:
   - JWT_SECRET의 SHA-256 해시값을 계산하여 길이 검증
   - ENCRYPTION_KEY의 형식 검증 (64자 hex 문자열)
   - 애플리케이션 시작 시 검증 실패 시 오류 발생

**보안 요구사항 충족:**
- ✅ **무결성 (Integrity)**: 해시값을 통한 데이터 변조 탐지
- ✅ **기밀성 (Confidentiality)**: 해시는 단방향 함수이므로 원본 복구 불가능
- ✅ **인증 (Authentication)**: 해시값 비교를 통한 데이터 검증

### 4.3 암호화 기술 적용 우선순위

| 우선순위 | 취약점 | 암호 방식 | 알고리즘 | 보안 요구사항 | 구현 난이도 |
|---------|--------|----------|---------|-------------|------------|
| **1** | 민감한 개인정보 평문 저장 | 대칭키 | AES-256-GCM | 기밀성, 무결성 | 중 |
| **2** | 중요 작업 전자 서명 부재 | 공개키 | RSA-SHA256 | 무결성, 부인 방지 | 중 |
| **3** | JWT 토큰 보안 강화 | 공개키 | RSA-256 | 무결성, 인증 | 중 |
| **4** | API 응답 무결성 검증 | 해싱 | SHA-256 | 무결성 | 낮음 |
| **5** | 파일 업로드 무결성 검증 | 해싱 | SHA-256 | 무결성 | 낮음 |
| **6** | Refresh Token 보안 | 해싱 | SHA-256 | 기밀성, 무결성 | 낮음 |
| **7** | 로그인 시도 제한 | 해싱 | SHA-256 | 인증 | 낮음 |
| **8** | 데이터베이스 연결 암호화 | 대칭키 | TLS 1.2/1.3 | 기밀성 | 낮음 |

### 4.4 보안 요구사항 충족 요약

| 보안 요구사항 | 적용 암호 방식 | 충족 방법 |
|-------------|--------------|---------|
| **기밀성 (Confidentiality)** | 대칭키 암호화 (AES-256-GCM) | 민감 정보 암호화 저장, TLS 연결 |
| **무결성 (Integrity)** | 해싱 (SHA-256), 대칭키 (GCM), 공개키 (RSA) | 해시 검증, GCM 인증 태그, RSA 서명 |
| **인증 (Authentication)** | 공개키 (RSA-256), 해싱 (bcrypt) | JWT 서명 검증, 비밀번호 해시 검증 |
| **부인 방지 (Non-repudiation)** | 공개키 (RSA-SHA256) | 중요 작업 전자 서명 |
| **가용성 (Availability)** | 해싱 (SHA-256) | 로그인 시도 제한으로 Brute Force 방어 |

---

## 5. 보안 보완 방안 상세

### 5.1 데이터 저장 시 기밀성 보장 강화

#### 5.1.1 대칭키 암호화를 활용한 민감 정보 암호화

**적용 대상:**
- 사용자 전화번호, 주소, 생년월일 등 개인정보
- 신청서 payload 내 민감 데이터
- 사용자 메모(memo) 필드

**구현 방안:**
- **알고리즘**: AES-256-GCM (Galois/Counter Mode)
- **키 관리**: 환경 변수로 관리되는 `ENCRYPTION_KEY` (32바이트)를 사용하여 대칭키 암호화 수행
- **구현 위치**: TypeORM Entity의 `@BeforeInsert`, `@BeforeUpdate`, `@AfterLoad` 훅을 활용하여 자동 암호화/복호화

**보안 요구사항 충족:**
- 데이터베이스 유출 시에도 개인정보 보호 (기밀성)
- GCM 모드 사용으로 무결성 검증 동시 제공

**예시 구현:**
```typescript
// 암호화 서비스
@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private configService: ConfigService) {
    this.key = Buffer.from(configService.get('ENCRYPTION_KEY'), 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

#### 5.1.2 데이터베이스 연결 암호화 강화

**적용 대상:**
- PostgreSQL 연결

**구현 방안:**
- 프로덕션 환경에서 `DB_SSL=true` 설정
- SSL 인증서 검증 활성화 (`rejectUnauthorized: true`)
- 데이터베이스 연결 문자열에 `sslmode=require` 추가

**보안 요구사항 충족:**
- 전송 중 데이터 기밀성 보장

### 5.2 사용자 인증 시 검증 및 무결성 보장 강화

#### 5.2.1 해싱을 활용한 비밀번호 보안 강화

**현재 상태:**
- bcrypt 해싱 사용 (salt rounds: 12) ✅

**추가 보완 방안:**
- **비밀번호 정책 강화**: 최소 8자 이상, 대소문자/숫자/특수문자 조합 필수
- **비밀번호 히스토리 관리**: 최근 사용한 비밀번호 재사용 방지 (해시값 저장)
- **로그인 시도 제한**: 5회 실패 시 계정 일시 잠금 (Redis 활용)

**보안 요구사항 충족:**
- 약한 비밀번호로 인한 계정 탈취 방지
- 무차별 대입 공격 방어

#### 5.2.2 공개키 암호화를 활용한 JWT 토큰 보안 강화

**현재 상태:**
- 대칭키(HMAC) 기반 JWT 서명 사용

**보완 방안:**
- **RSA 공개키/개인키 쌍 사용**: JWT 서명을 RSA-256 알고리즘으로 변경
- **Access Token + Refresh Token 구조**: 
  - Access Token: 짧은 만료 시간 (15분), RSA 서명
  - Refresh Token: 긴 만료 시간 (7일), 해시값으로 저장하여 검증
- **토큰 무효화 메커니즘**: 로그아웃 시 Refresh Token을 블랙리스트에 추가 (Redis 활용)

**보안 요구사항 충족:**
- 토큰 탈취 시 피해 최소화 (짧은 Access Token 만료 시간)
- 토큰 변조 방지 (RSA 서명으로 무결성 보장)
- 토큰 재사용 방지 (Refresh Token 해시 저장)

**예시 구현:**
```typescript
// JWT 모듈 설정 변경
JwtModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    privateKey: configService.get('JWT_PRIVATE_KEY'),
    publicKey: configService.get('JWT_PUBLIC_KEY'),
    signOptions: {
      algorithm: 'RS256',
      expiresIn: '15m', // Access Token
    },
  }),
}),

// Refresh Token 생성 및 저장
async generateRefreshToken(userId: string): Promise<string> {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  // Redis에 저장 (7일 만료)
  await this.redis.set(
    `refresh_token:${hashedToken}`,
    userId,
    'EX',
    7 * 24 * 60 * 60
  );
  
  return refreshToken;
}
```

### 5.3 데이터 전송 시 무결성 보장 강화

#### 5.3.1 해싱을 활용한 데이터 무결성 검증

**적용 대상:**
- 중요 API 응답 데이터
- 파일 업로드

**구현 방안:**
- **API 응답 해시 검증**: 중요 데이터 응답 시 SHA-256 해시값을 헤더(`X-Response-Hash`)에 포함
- **파일 업로드 무결성 검증**: 업로드된 파일의 SHA-256 해시값을 계산하여 데이터베이스에 저장, 다운로드 시 검증

**보안 요구사항 충족:**
- 데이터 변조 탐지 (무결성)

**예시 구현:**
```typescript
// 응답 인터셉터에서 해시 추가
@Injectable()
export class ResponseHashInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();
        const hash = crypto
          .createHash('sha256')
          .update(JSON.stringify(data))
          .digest('hex');
        response.setHeader('X-Response-Hash', hash);
        return data;
      })
    );
  }
}
```

#### 5.3.2 공개키 암호화를 활용한 중요 작업 전자 서명

**적용 대상:**
다음과 같은 중요 작업에 대해 전자 서명을 적용하여 작업의 무결성과 부인 방지를 보장합니다:

1. **프로그램 신청서 제출**: 신청자가 프로그램 신청서를 제출할 때 신청 내용에 대한 전자 서명
   - 신청서 내용의 무결성 보장
   - 신청자가 제출 사실을 부인할 수 없도록 함
   - 신청 내용 변조 방지

2. **신청서 심사 결정**: 운영자가 신청서를 합격/불합격 처리할 때 심사 결정에 대한 전자 서명
   - 심사 결정의 무결성 보장
   - 심사자 부인 방지
   - 심사 결정 변조 방지

3. **선정 처리**: 신청자를 선정하거나 제외할 때 선정 결정에 대한 전자 서명
   - 선정 결정의 공정성 보장
   - 선정 과정의 투명성 확보
   - 선정 결과 변조 방지

4. **입금 상태 변경**: 입금 확인 또는 취소 시 입금 상태 변경에 대한 전자 서명
   - 재무 데이터의 무결성 보장
   - 입금 처리 기록의 부인 방지
   - 재무 데이터 변조 방지

5. **사용자 역할 변경**: 사용자의 역할을 변경할 때 역할 변경에 대한 전자 서명
   - 권한 변경의 무결성 보장
   - 권한 상승 공격 탐지
   - 역할 변경 기록의 부인 방지

6. **예산 승인/집행**: 예산을 승인하거나 집행할 때 예산 관련 작업에 대한 전자 서명
   - 예산 데이터의 무결성 보장
   - 예산 집행 기록의 부인 방지
   - 예산 변조 방지

7. **보고서 생성 및 제출**: 국가에 제출하는 보고서 생성 시 보고서 내용에 대한 전자 서명
   - 보고서 내용의 무결성 보장
   - 보고서 제출 사실의 부인 방지
   - 보고서 내용 변조 방지

**구현 방안:**
- **RSA 디지털 서명 알고리즘**: RSA-256 알고리즘을 사용하여 중요 작업 데이터에 서명
- **서명 데이터 구성**: 작업 타입, 작업 ID, 작업 내용, 타임스탬프, 사용자 ID를 포함한 서명 데이터 생성
- **개인키 관리**: 각 사용자에게 RSA 키 쌍을 발급하고, 개인키는 클라이언트 측에서 안전하게 보관 (또는 서버에서 암호화하여 저장)
- **서명 검증**: 서버에서 공개키를 사용하여 서명을 검증하고, 검증 성공 시에만 작업을 처리
- **서명 저장**: 모든 서명을 데이터베이스에 저장하여 나중에 검증 및 감사 가능하도록 함

**구현 예시:**
```typescript
// 전자 서명 서비스
@Injectable()
export class DigitalSignatureService {
  async sign(data: any, privateKey: string): Promise<string> {
    const sign = crypto.createSign('RSA-SHA256');
    const dataString = JSON.stringify({
      type: data.type,
      id: data.id,
      content: data.content,
      timestamp: new Date().toISOString(),
      userId: data.userId,
    });
    sign.update(dataString);
    return sign.sign(privateKey, 'hex');
  }

  async verify(data: any, signature: string, publicKey: string): Promise<boolean> {
    const verify = crypto.createVerify('RSA-SHA256');
    const dataString = JSON.stringify({
      type: data.type,
      id: data.id,
      content: data.content,
      timestamp: data.timestamp,
      userId: data.userId,
    });
    verify.update(dataString);
    return verify.verify(publicKey, signature, 'hex');
  }
}

// 신청서 심사 시 전자 서명 적용
async reviewApplication(id: string, decision: 'selected' | 'rejected', user: User) {
  const application = await this.findOne(id, user);
  
  // 심사 결정 데이터 생성
  const reviewData = {
    type: 'application_review',
    id: application.id,
    content: {
      decision,
      applicationId: id,
      applicantId: application.applicantId,
    },
    userId: user.id,
  };
  
  // 전자 서명 생성
  const signature = await this.digitalSignatureService.sign(
    reviewData,
    user.privateKey
  );
  
  // 서명과 함께 심사 처리
  application.status = decision === 'selected' 
    ? ApplicationStatus.SELECTED 
    : ApplicationStatus.REJECTED;
  
  // 서명 정보 저장
  await this.signatureRepository.save({
    actionType: 'application_review',
    targetId: id,
    userId: user.id,
    signature,
    signedData: reviewData,
  });
  
  return await this.applicationRepository.save(application);
}
```

**보안 요구사항 충족:**
- **작업 무결성 보장**: 전자 서명을 통해 작업 데이터가 변조되지 않았음을 검증
- **부인 방지 (Non-repudiation)**: 서명을 통해 작업 수행자가 자신의 작업을 부인할 수 없음
- **감사 추적**: 모든 서명이 저장되어 나중에 검증 및 감사 가능
- **법적 증거력**: 전자 서명은 법적 증거로 활용 가능

### 5.4 환경 변수 및 비밀키 관리 강화

#### 5.4.1 비밀키 강도 검증

**구현 방안:**
- **JWT_SECRET 최소 길이**: 32자 이상 강제
- **ENCRYPTION_KEY 형식 검증**: 64자 hex 문자열 (32바이트) 검증
- **애플리케이션 시작 시 검증**: 부족한 경우 오류 발생 및 시작 중단

**보안 요구사항 충족:**
- 약한 키로 인한 암호화 우회 방지

#### 5.4.2 환경 변수 암호화 저장 (선택사항)

**구현 방안:**
- **AWS Secrets Manager** 또는 **HashiCorp Vault** 활용
- 민감한 환경 변수(DB 비밀번호, AWS 키 등)를 암호화하여 저장
- 런타임에 동적으로 복호화하여 사용

**보안 요구사항 충족:**
- 환경 변수 파일 유출 시 피해 최소화

---

## 6. 구현 일정 및 우선순위

### Phase 1 (1주차): 데이터 암호화 구현
- [ ] EncryptionService 구현 (AES-256-GCM)
- [ ] User Entity 민감 필드 암호화 적용
- [ ] Application Entity payload 암호화 적용

### Phase 2 (2주차): 인증 보안 강화
- [ ] RSA 키 쌍 생성 및 JWT 설정 변경
- [ ] Refresh Token 메커니즘 구현
- [ ] 로그인 시도 제한 구현
- [ ] 비밀번호 정책 강화

### Phase 3 (3주차): 무결성 검증 구현
- [ ] API 응답 해시 인터셉터 구현
- [ ] 파일 업로드 해시 검증 구현
- [ ] 중요 작업 전자 서명 구현

### Phase 4 (4주차): 테스트 및 문서화
- [ ] 보안 테스트 수행
- [ ] 성능 테스트 (암호화 오버헤드 측정)
- [ ] 보안 가이드 문서 작성

---

## 7. 기대 효과

1. **개인정보 보호 강화**: 민감 정보 암호화로 데이터베이스 유출 시에도 개인정보 보호
2. **인증 보안 강화**: RSA 기반 JWT 및 Refresh Token으로 토큰 탈취 피해 최소화
3. **데이터 무결성 보장**: 해시 검증 및 전자 서명으로 데이터 변조 탐지 및 부인 방지
4. **법적 요구사항 준수**: 개인정보보호법, 정보통신망법 등 관련 법규 준수

---

## 참고 문헌

- OWASP Top 10 (2021)
- NIST Cryptographic Standards and Guidelines
- RFC 7519 (JSON Web Token)
- RFC 3447 (RSA Cryptography Specifications)


