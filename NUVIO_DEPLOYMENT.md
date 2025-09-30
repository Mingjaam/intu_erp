# 🚀 nuvio.kr 배포 가이드

## 📋 **nuvio.kr 도메인 설정**

### **1. DNS 설정**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A  
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

### **2. 서버 요구사항**
- **OS**: Ubuntu 20.04+ (권장)
- **RAM**: 최소 2GB (권장 4GB+)
- **Storage**: 최소 20GB
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

## 🔧 **배포 단계**

### **1단계: 서버 초기 설정**

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

### **2단계: 프로젝트 설정**

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
# Database (강력한 비밀번호로 변경)
DB_PASSWORD=your_secure_database_password_here

# JWT Secret (강력한 비밀키 생성)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# URLs (nuvio.kr 도메인)
FRONTEND_URL=https://nuvio.kr
API_URL=https://nuvio.kr/api
```

### **4단계: SSL 인증서 설정**

```bash
# SSL 자동 설정
./setup-ssl.sh
```

### **5단계: 배포 실행**

```bash
# 배포 실행
./deploy.sh
```

## 🔒 **SSL 자동 설정**

### **Let's Encrypt 자동 설정**
- ✅ **자동 인증서 발급**: `nuvio.kr`, `www.nuvio.kr`
- ✅ **자동 갱신**: 매일 자정 갱신 확인
- ✅ **HTTP → HTTPS 리다이렉트**: 자동 설정
- ✅ **HSTS 헤더**: 보안 강화

### **SSL 설정 확인**
```bash
# SSL 인증서 확인
sudo certbot certificates

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 📊 **배포 후 확인**

### **접속 URL**
- **메인 사이트**: https://nuvio.kr
- **API 문서**: https://nuvio.kr/api/docs
- **헬스 체크**: https://nuvio.kr/health

### **서비스 상태 확인**
```bash
# 컨테이너 상태
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# SSL 상태 확인
curl -I https://nuvio.kr
```

## 🛠️ **문제 해결**

### **SSL 인증서 문제**
```bash
# 인증서 재발급
sudo certbot renew --force-renewal

# Nginx 재시작
docker-compose -f docker-compose.prod.yml restart nginx
```

### **도메인 연결 문제**
```bash
# DNS 확인
nslookup nuvio.kr
dig nuvio.kr

# 포트 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### **서비스 재시작**
```bash
# 전체 재시작
docker-compose -f docker-compose.prod.yml restart

# 특정 서비스 재시작
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

## 🔄 **업데이트 배포**

```bash
# 코드 업데이트
git pull origin main

# 재배포
./deploy.sh
```

## 📈 **모니터링**

### **로그 모니터링**
```bash
# 실시간 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### **성능 모니터링**
```bash
# 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

## 🔐 **보안 설정**

### **방화벽 설정**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **SSH 보안**
```bash
# SSH 키 인증 설정
ssh-keygen -t rsa -b 4096
ssh-copy-id user@nuvio.kr

# Password 인증 비활성화 (SSH 키 설정 후)
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
sudo systemctl restart ssh
```

## 📞 **지원**

### **문제 발생 시 확인사항**
1. **DNS 설정**: `nslookup nuvio.kr`
2. **서비스 상태**: `docker-compose -f docker-compose.prod.yml ps`
3. **SSL 인증서**: `sudo certbot certificates`
4. **로그 확인**: `docker-compose -f docker-compose.prod.yml logs`

### **자주 발생하는 문제**
- **DNS 전파 지연**: 24-48시간 소요
- **SSL 인증서 발급 실패**: DNS 설정 확인
- **포트 충돌**: 기존 서비스 확인

---

**🎉 배포 완료 후 접속:**
- **웹사이트**: https://nuvio.kr
- **API 문서**: https://nuvio.kr/api/docs
- **이미지 업로드**: https://nuvio.kr/uploads/images/
