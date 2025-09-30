# 🚀 Intu ERP 서버 배포 가이드

## 📋 **배포 전 준비사항**

### **1. 서버 요구사항**
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Amazon Linux 2
- **RAM**: 최소 2GB (권장 4GB+)
- **Storage**: 최소 20GB (권장 50GB+)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### **2. 도메인 설정**
- 도메인을 구매하고 DNS A 레코드를 서버 IP로 설정
- SSL 인증서 준비 (Let's Encrypt 권장)

## 🔧 **배포 단계**

### **1단계: 서버 설정**

```bash
# 서버 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 재로그인
exit
```

### **2단계: 프로젝트 클론**

```bash
# 프로젝트 클론
git clone https://github.com/your-username/intu_erp.git
cd intu_erp

# 환경 변수 설정
cp env.production.example .env.production
nano .env.production
```

### **3단계: 환경 변수 설정**

`.env.production` 파일을 다음과 같이 수정:

```bash
# Database
DB_PASSWORD=your_secure_database_password_here

# JWT Secret (강력한 비밀키 생성)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# URLs (실제 도메인으로 변경)
FRONTEND_URL=https://your-domain.com
API_URL=https://your-domain.com/api
```

### **4단계: 배포 실행**

```bash
# 배포 스크립트 실행
./deploy.sh
```

## 🔒 **SSL 인증서 설정 (Let's Encrypt)**

### **1. Certbot 설치**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### **2. SSL 인증서 발급**

```bash
sudo certbot --nginx -d your-domain.com
```

### **3. 자동 갱신 설정**

```bash
sudo crontab -e
# 다음 줄 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **모니터링 및 관리**

### **서비스 상태 확인**

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
```

### **백업 설정**

```bash
# 데이터베이스 백업
docker exec intu_erp_postgres_prod pg_dump -U intu_erp_user intu_erp > backup_$(date +%Y%m%d_%H%M%S).sql

# 업로드 파일 백업
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### **업데이트 배포**

```bash
# 코드 업데이트
git pull origin main

# 재배포
./deploy.sh
```

## 🛠️ **문제 해결**

### **포트 충돌**
```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### **권한 문제**
```bash
# Docker 권한 확인
sudo usermod -aG docker $USER
newgrp docker
```

### **디스크 공간 부족**
```bash
# Docker 정리
docker system prune -a
docker volume prune
```

## 📈 **성능 최적화**

### **1. Nginx 캐싱 설정**
- 정적 파일 캐싱 (1년)
- API 응답 캐싱 (선택적)

### **2. 데이터베이스 최적화**
- 인덱스 설정
- 쿼리 최적화

### **3. 모니터링 도구**
- Prometheus + Grafana
- ELK Stack (로그 분석)

## 🔐 **보안 설정**

### **1. 방화벽 설정**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **2. SSH 보안**
```bash
# SSH 키 인증 설정
# Password 인증 비활성화
# 기본 포트 변경 (선택적)
```

### **3. 데이터베이스 보안**
- 강력한 비밀번호 설정
- 외부 접근 제한
- 정기적인 백업

## 📞 **지원**

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: `docker-compose -f docker-compose.prod.yml logs`
2. **서비스 상태**: `docker-compose -f docker-compose.prod.yml ps`
3. **디스크 공간**: `df -h`
4. **메모리 사용량**: `free -h`

---

**🎉 배포 완료 후 접속 URL:**
- **웹사이트**: https://your-domain.com
- **API 문서**: https://your-domain.com/api/docs
- **헬스 체크**: https://your-domain.com/health
