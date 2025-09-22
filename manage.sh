#!/bin/bash

# 통합 ERP 시스템 관리 스크립트
# 사용법: ./manage.sh [명령어]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로고 출력
print_logo() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 ERP 시스템 관리자                        ║"
    echo "║                   통합 관리 스크립트 v1.0                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 도움말 출력
print_help() {
    echo -e "${YELLOW}사용법: ./manage.sh [명령어]${NC}"
    echo ""
    echo -e "${GREEN}📋 기본 명령어:${NC}"
    echo "  start       - ERP 시스템 시작 (로컬)"
    echo "  start-cloud - ERP 시스템 시작 (클라우드)"
    echo "  start-nuvio - ERP 시스템 시작 (nuvio.kr 도메인)"
    echo "  stop        - ERP 시스템 중지"
    echo "  restart     - ERP 시스템 재시작"
    echo "  status      - 서비스 상태 확인"
    echo ""
    echo -e "${GREEN}🔧 문제 해결:${NC}"
    echo "  fix-ports   - 포트 충돌 해결"
    echo "  fix-docker  - Docker 권한 문제 해결"
    echo "  fix-cors    - CORS 설정 수정"
    echo "  fix-api     - API URL 설정 수정"
    echo "  fix-db      - 데이터베이스 SSL 문제 해결"
    echo ""
    echo -e "${GREEN}🔍 진단:${NC}"
    echo "  check       - 종합 환경 확인"
    echo "  debug       - 백엔드 문제 진단"
    echo "  diagnose    - 연결 문제 진단"
    echo ""
    echo -e "${GREEN}🌐 도메인 설정:${NC}"
    echo "  setup-domain - nuvio.kr 도메인 설정"
    echo ""
    echo -e "${GREEN}📊 모니터링:${NC}"
    echo "  logs        - 실시간 로그 확인"
    echo "  logs-backend - 백엔드 로그 확인"
    echo "  logs-frontend - 프론트엔드 로그 확인"
    echo ""
    echo -e "${GREEN}🧹 정리:${NC}"
    echo "  clean       - Docker 정리"
    echo "  reset       - 완전 초기화"
}

# 환경 변수 설정
setup_env() {
    echo -e "${BLUE}📝 환경 변수 설정 중...${NC}"
    if [ ! -f .env ]; then
        if [ -f "env.cloud" ]; then
            cp env.cloud .env
            echo -e "${GREEN}✅ .env 파일이 생성되었습니다.${NC}"
        else
            echo -e "${YELLOW}⚠️  env.cloud 파일이 없습니다.${NC}"
        fi
    else
        echo -e "${GREEN}✅ .env 파일이 이미 존재합니다.${NC}"
    fi
}

# Docker 권한 확인
check_docker_permissions() {
    echo -e "${BLUE}🔍 Docker 권한 확인 중...${NC}"
    if ! docker ps >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker 권한 문제가 감지되었습니다.${NC}"
        echo -e "${YELLOW}🔧 Docker 권한 문제를 해결하겠습니다...${NC}"
        
        # Docker 권한 해결
        sudo usermod -aG docker $USER
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo chmod 666 /var/run/docker.sock
        
        echo -e "${YELLOW}⚠️  Docker 권한이 수정되었습니다.${NC}"
        echo -e "${YELLOW}   새 터미널 세션을 시작하거나 'newgrp docker' 명령어를 실행하세요.${NC}"
        echo -e "${YELLOW}   그 후 다시 ./manage.sh를 실행하세요.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker 권한 확인 완료${NC}"
}

# 포트 충돌 확인 및 해결
fix_port_conflicts() {
    echo -e "${BLUE}🔍 포트 충돌 확인 중...${NC}"
    local ports=(3000 3001 5432 6379)
    local conflicts=false
    
    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  포트 $port이 사용 중입니다.${NC}"
            conflicts=true
        fi
    done
    
    if [ "$conflicts" = true ]; then
        echo -e "${YELLOW}🔧 포트 충돌을 해결하겠습니다...${NC}"
        
        # 포트 사용 중인 프로세스 종료
        for port in "${ports[@]}"; do
            if lsof -i :$port >/dev/null 2>&1; then
                echo -e "${YELLOW}   포트 $port 프로세스 종료 중...${NC}"
                sudo kill -9 $(lsof -ti :$port) 2>/dev/null || true
            fi
        done
        
        echo -e "${GREEN}✅ 포트 충돌 해결 완료${NC}"
    else
        echo -e "${GREEN}✅ 포트 충돌 없음${NC}"
    fi
}

# 서비스 시작
start_services() {
    local mode=${1:-"local"}
    
    echo -e "${BLUE}🚀 ERP 시스템 시작 중... (모드: $mode)${NC}"
    
    # 환경 변수 설정
    setup_env
    
    # Docker 권한 확인
    check_docker_permissions
    
    # 포트 충돌 해결
    fix_port_conflicts
    
    # 기존 서비스 중지
    echo -e "${BLUE}🛑 기존 서비스 중지 중...${NC}"
    docker-compose down 2>/dev/null || true
    
    # Docker 이미지 빌드 및 실행
    echo -e "${BLUE}🔨 Docker 이미지 빌드 및 실행 중...${NC}"
    docker-compose up --build -d
    
    # 서비스 상태 확인
    echo -e "${BLUE}⏳ 서비스 시작 대기 중...${NC}"
    sleep 15
    
    # 서비스 상태 확인
    echo -e "${BLUE}📊 서비스 상태 확인 중...${NC}"
    docker-compose ps
    
    # 접속 정보 출력
    echo ""
    echo -e "${GREEN}🎉 ERP 시스템이 성공적으로 시작되었습니다!${NC}"
    echo ""
    
    if [ "$mode" = "nuvio" ]; then
        echo -e "${GREEN}📱 접속 정보:${NC}"
        echo "   🌐 웹사이트: https://nuvio.kr"
        echo "   🔗 API: https://nuvio.kr/api"
        echo "   🗄️  데이터베이스: localhost:5432"
        echo "   📦 Redis: localhost:6379"
    else
        echo -e "${GREEN}📱 접속 정보:${NC}"
        echo "   🌐 프론트엔드: http://localhost:3000"
        echo "   🔗 백엔드 API: http://localhost:3001"
        echo "   🗄️  데이터베이스: localhost:5432"
        echo "   📦 Redis: localhost:6379"
    fi
    
    echo ""
    echo -e "${GREEN}🔧 관리 명령어:${NC}"
    echo "   서비스 중지: ./manage.sh stop"
    echo "   로그 확인: ./manage.sh logs"
    echo "   서비스 재시작: ./manage.sh restart"
}

# 서비스 중지
stop_services() {
    echo -e "${BLUE}🛑 ERP 시스템 중지 중...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ ERP 시스템이 중지되었습니다.${NC}"
}

# 서비스 재시작
restart_services() {
    echo -e "${BLUE}🔄 ERP 시스템 재시작 중...${NC}"
    stop_services
    sleep 5
    start_services
}

# 서비스 상태 확인
check_status() {
    echo -e "${BLUE}📊 서비스 상태 확인 중...${NC}"
    echo ""
    
    echo -e "${GREEN}=== Docker 컨테이너 상태 ===${NC}"
    docker-compose ps
    echo ""
    
    echo -e "${GREEN}=== 포트 사용 상태 ===${NC}"
    netstat -tulpn | grep -E ':(3000|3001|80|443)\s' || echo "포트 사용 중인 프로세스 없음"
    echo ""
    
    echo -e "${GREEN}=== API 연결 테스트 ===${NC}"
    echo "로컬 백엔드 API:"
    curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
    echo ""
    
    echo "로컬 프론트엔드:"
    curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3000/ | head -c 100 || echo "연결 실패"
    echo "..."
}

# 종합 환경 확인
comprehensive_check() {
    echo -e "${BLUE}🔍 종합 환경 확인 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 루트 환경변수 확인
    echo -e "${GREEN}1. 루트 .env 파일 확인:${NC}"
    if [ -f ".env" ]; then
        echo "=== .env 파일 내용 ==="
        cat .env
    else
        echo ".env 파일이 없습니다."
    fi
    echo ""
    
    # 2. 프론트엔드 환경변수 확인
    echo -e "${GREEN}2. 프론트엔드 환경변수 확인:${NC}"
    if [ -f "frontend/.env.local" ]; then
        echo "=== frontend/.env.local 내용 ==="
        cat frontend/.env.local
    elif [ -f "frontend/.env" ]; then
        echo "=== frontend/.env 내용 ==="
        cat frontend/.env
    else
        echo "프론트엔드 환경변수 파일이 없습니다."
    fi
    echo ""
    
    # 3. Docker Compose 환경변수 확인
    echo -e "${GREEN}3. Docker Compose 환경변수 확인:${NC}"
    echo "=== docker-compose.yml의 환경변수 설정 ==="
    grep -A 20 "environment:" docker-compose.yml
    echo ""
    
    # 4. 백엔드 CORS 설정 확인
    echo -e "${GREEN}4. 백엔드 CORS 설정 확인:${NC}"
    echo "=== backend/src/main.ts의 CORS 설정 ==="
    grep -A 15 "CORS 설정" backend/src/main.ts
    echo ""
    
    # 5. 프론트엔드 API URL 설정 확인
    echo -e "${GREEN}5. 프론트엔드 API URL 설정 확인:${NC}"
    echo "=== frontend/src/lib/api.ts의 API_BASE_URL ==="
    grep -A 2 "API_BASE_URL" frontend/src/lib/api.ts
    echo ""
    
    # 6. 현재 실행 중인 컨테이너 환경변수 확인
    echo -e "${GREEN}6. 실행 중인 컨테이너 환경변수 확인:${NC}"
    echo "=== 백엔드 컨테이너 환경변수 ==="
    docker exec intu_erp_backend env | grep -E "(CORS|API|URL|NODE_ENV)" | sort 2>/dev/null || echo "백엔드 컨테이너가 실행되지 않음"
    echo ""
    
    echo "=== 프론트엔드 컨테이너 환경변수 ==="
    docker exec intu_erp_frontend env | grep -E "(API|URL|NODE_ENV)" | sort 2>/dev/null || echo "프론트엔드 컨테이너가 실행되지 않음"
    echo ""
    
    # 7. 서비스 상태 확인
    echo -e "${GREEN}7. 서비스 상태 확인:${NC}"
    echo "=== Docker 컨테이너 상태 ==="
    docker-compose ps
    echo ""
    
    # 8. API 연결 테스트
    echo -e "${GREEN}8. API 연결 테스트:${NC}"
    echo "=== 로컬에서 백엔드 API 테스트 ==="
    curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
    echo ""
    
    echo "=== nuvio.kr에서 백엔드 API 테스트 ==="
    curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
    echo ""
    
    # 9. CORS 테스트
    echo -e "${GREEN}9. CORS 테스트:${NC}"
    echo "=== nuvio.kr에서 CORS preflight 테스트 ==="
    curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: Content-Type" \
      -X OPTIONS https://nuvio.kr/api/auth/login || echo "연결 실패"
    echo ""
    
    # 10. 프론트엔드 접근 테스트
    echo -e "${GREEN}10. 프론트엔드 접근 테스트:${NC}"
    echo "=== nuvio.kr 프론트엔드 접근 ==="
    curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/ || echo "연결 실패"
    echo ""
    
    echo -e "${GREEN}=== 종합 확인 완료 ===${NC}"
    echo ""
    echo -e "${YELLOW}📋 확인 사항 요약:${NC}"
    echo "1. 백엔드 CORS: https://nuvio.kr 허용되어야 함"
    echo "2. 프론트엔드 API URL: https://nuvio.kr/api 이어야 함"
    echo "3. Nginx 프록시: /api -> 백엔드, / -> 프론트엔드"
    echo "4. 모든 서비스: 정상 실행 상태여야 함"
}

# 백엔드 문제 진단
debug_backend() {
    echo -e "${BLUE}🔍 백엔드 문제 진단 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 백엔드 컨테이너 로그 확인
    echo -e "${GREEN}1. 백엔드 컨테이너 로그 확인:${NC}"
    docker logs intu_erp_backend --tail=50
    echo ""
    
    # 2. 백엔드 컨테이너 상태 확인
    echo -e "${GREEN}2. 백엔드 컨테이너 상태 확인:${NC}"
    docker inspect intu_erp_backend | grep -A 10 -B 5 "ExitCode"
    echo ""
    
    # 3. 백엔드 컨테이너 재시작 시도
    echo -e "${GREEN}3. 백엔드 컨테이너 재시작 시도:${NC}"
    docker-compose restart backend
    echo ""
    
    # 4. 재시작 후 상태 확인
    echo -e "${GREEN}4. 재시작 후 상태 확인 (10초 대기):${NC}"
    sleep 10
    
    echo "백엔드 컨테이너 상태:"
    docker-compose ps backend
    echo ""
    
    # 5. 백엔드 로그 다시 확인
    echo -e "${GREEN}5. 재시작 후 백엔드 로그:${NC}"
    docker logs intu_erp_backend --tail=30
    echo ""
    
    # 6. 백엔드 컨테이너 내부 확인
    echo -e "${GREEN}6. 백엔드 컨테이너 내부 확인:${NC}"
    if docker ps | grep -q intu_erp_backend; then
        echo "실행 중인 프로세스:"
        docker exec intu_erp_backend ps aux
        echo ""
        echo "포트 리스닝 상태:"
        docker exec intu_erp_backend netstat -tulpn
        echo ""
        echo "환경변수 확인:"
        docker exec intu_erp_backend env | grep -E "(CORS|NODE_ENV|PORT)"
    else
        echo "백엔드 컨테이너가 실행되지 않음"
    fi
    echo ""
    
    # 7. API 테스트
    echo -e "${GREEN}7. API 테스트:${NC}"
    curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
    echo ""
    
    echo -e "${GREEN}=== 백엔드 문제 진단 완료 ===${NC}"
}

# 연결 문제 진단
diagnose_connection() {
    echo -e "${BLUE}🔍 연결 문제 진단 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 현재 실행 중인 프로세스 확인
    echo -e "${GREEN}1. 현재 실행 중인 Node.js 프로세스:${NC}"
    ps aux | grep node | grep -v grep
    echo ""
    
    # 2. 포트 사용 상태 확인
    echo -e "${GREEN}2. 포트 3000, 3001, 80, 443 사용 상태:${NC}"
    netstat -tulpn | grep -E ':(3000|3001|80|443)\s'
    echo ""
    
    # 3. Docker 컨테이너 상태 확인
    echo -e "${GREEN}3. Docker 컨테이너 상태:${NC}"
    docker ps -a
    echo ""
    
    # 4. Docker Compose 서비스 상태 확인
    echo -e "${GREEN}4. Docker Compose 서비스 상태:${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose ps
    else
        echo "docker-compose.yml 파일을 찾을 수 없습니다."
    fi
    echo ""
    
    # 5. Nginx 상태 확인
    echo -e "${GREEN}5. Nginx 상태:${NC}"
    systemctl status nginx 2>/dev/null || service nginx status 2>/dev/null || echo "Nginx 서비스 상태를 확인할 수 없습니다."
    echo ""
    
    # 6. 네트워크 연결 테스트
    echo -e "${GREEN}6. 로컬 포트 연결 테스트:${NC}"
    echo "포트 3000 (프론트엔드):"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "연결 실패"
    echo ""
    
    echo "포트 3001 (백엔드):"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "연결 실패"
    echo ""
    
    # 7. 환경 변수 확인
    echo -e "${GREEN}7. 환경 변수 확인:${NC}"
    if [ -f ".env" ]; then
        echo "=== .env 파일 내용 ==="
        cat .env
    elif [ -f "env.cloud" ]; then
        echo "=== env.cloud 파일 내용 ==="
        cat env.cloud
    else
        echo "환경 변수 파일을 찾을 수 없습니다."
    fi
    echo ""
    
    # 8. 로그 확인
    echo -e "${GREEN}8. 최근 로그 확인:${NC}"
    echo "Docker 로그 (최근 20줄):"
    docker-compose logs --tail=20 2>/dev/null || echo "Docker Compose 로그를 확인할 수 없습니다."
    echo ""
    
    echo -e "${GREEN}=== 진단 완료 ===${NC}"
}

# CORS 설정 수정
fix_cors() {
    echo -e "${BLUE}🔧 CORS 설정 수정 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 백엔드 컨테이너 중지
    echo -e "${GREEN}1. 백엔드 컨테이너 중지 중...${NC}"
    docker-compose stop backend
    echo ""
    
    # 2. 백엔드 이미지 재빌드
    echo -e "${GREEN}2. 백엔드 이미지 재빌드 중...${NC}"
    docker-compose build backend
    echo ""
    
    # 3. 백엔드 컨테이너 시작
    echo -e "${GREEN}3. 백엔드 컨테이너 시작 중...${NC}"
    docker-compose up -d backend
    echo ""
    
    # 4. 서비스 상태 확인
    echo -e "${GREEN}4. 서비스 상태 확인 (10초 대기)...${NC}"
    sleep 10
    
    echo "백엔드 컨테이너 상태:"
    docker-compose ps backend
    echo ""
    
    # 5. CORS 테스트
    echo -e "${GREEN}5. CORS 설정 테스트:${NC}"
    echo "로컬에서 테스트:"
    curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: http://localhost:3000" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: Content-Type" \
      -X OPTIONS http://localhost:3001/api/auth/login
    echo ""
    
    echo "nuvio.kr에서 테스트:"
    curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: Content-Type" \
      -X OPTIONS http://localhost:3001/api/auth/login
    echo ""
    
    # 6. 실제 로그인 API 테스트
    echo -e "${GREEN}6. 실제 로그인 API 테스트:${NC}"
    curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
      -H "Content-Type: application/json" \
      -X POST http://localhost:3001/api/auth/login \
      -d '{"email":"test@test.com","password":"test"}'
    echo ""
    
    echo -e "${GREEN}=== CORS 설정 수정 완료 ===${NC}"
    echo "이제 https://nuvio.kr에서 API 호출이 가능합니다."
}

# API URL 설정 수정
fix_api() {
    echo -e "${BLUE}🔧 API URL 설정 수정 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 프론트엔드 환경변수 파일 확인
    echo -e "${GREEN}1. 현재 프론트엔드 환경변수 확인:${NC}"
    if [ -f "frontend/.env.local" ]; then
        echo "=== frontend/.env.local 내용 ==="
        cat frontend/.env.local
    elif [ -f "frontend/.env" ]; then
        echo "=== frontend/.env 내용 ==="
        cat frontend/.env
    else
        echo "프론트엔드 환경변수 파일이 없습니다."
    fi
    echo ""
    
    # 2. 프론트엔드 환경변수 파일 생성/수정
    echo -e "${GREEN}2. 프론트엔드 환경변수 설정:${NC}"
    cat > frontend/.env.local << EOF
# API URL 설정
NEXT_PUBLIC_API_URL=https://nuvio.kr/api

# 기타 설정
NODE_ENV=production
EOF
    
    echo "프론트엔드 환경변수 파일이 생성되었습니다:"
    cat frontend/.env.local
    echo ""
    
    # 3. 프론트엔드 컨테이너 중지
    echo -e "${GREEN}3. 프론트엔드 컨테이너 중지 중...${NC}"
    docker-compose stop frontend
    echo ""
    
    # 4. 프론트엔드 이미지 재빌드
    echo -e "${GREEN}4. 프론트엔드 이미지 재빌드 중...${NC}"
    docker-compose build frontend
    echo ""
    
    # 5. 프론트엔드 컨테이너 시작
    echo -e "${GREEN}5. 프론트엔드 컨테이너 시작 중...${NC}"
    docker-compose up -d frontend
    echo ""
    
    # 6. 서비스 상태 확인
    echo -e "${GREEN}6. 서비스 상태 확인 (15초 대기)...${NC}"
    sleep 15
    
    echo "프론트엔드 컨테이너 상태:"
    docker-compose ps frontend
    echo ""
    
    # 7. API URL 테스트
    echo -e "${GREEN}7. API URL 테스트:${NC}"
    echo "프론트엔드에서 백엔드 API 접근 테스트:"
    curl -s -w "HTTP Status: %{http_code}\n" https://nuvio.kr/api/dashboard/health || echo "연결 실패"
    echo ""
    
    echo -e "${GREEN}=== API URL 설정 수정 완료 ===${NC}"
    echo "이제 https://nuvio.kr에서 정상적으로 API 호출이 가능합니다."
}

# 데이터베이스 SSL 문제 해결
fix_database_ssl() {
    echo -e "${BLUE}🔧 데이터베이스 SSL 문제 해결 중...${NC}"
    echo "실행 시간: $(date)"
    echo ""
    
    # 1. 현재 백엔드 환경변수 확인
    echo -e "${GREEN}1. 현재 백엔드 환경변수 확인:${NC}"
    docker exec intu_erp_backend env | grep -E "(NODE_ENV|SSL)" || echo "백엔드 컨테이너가 실행되지 않음"
    echo ""
    
    # 2. Docker Compose에서 NODE_ENV를 development로 변경
    echo -e "${GREEN}2. Docker Compose에서 NODE_ENV를 development로 변경:${NC}"
    sed -i 's/NODE_ENV: production/NODE_ENV: development/' docker-compose.yml
    echo "변경 완료"
    echo ""
    
    # 3. 변경된 설정 확인
    echo -e "${GREEN}3. 변경된 설정 확인:${NC}"
    grep -A 5 -B 5 "NODE_ENV" docker-compose.yml
    echo ""
    
    # 4. 모든 서비스 중지
    echo -e "${GREEN}4. 모든 서비스 중지:${NC}"
    docker-compose down
    echo ""
    
    # 5. 백엔드만 재빌드 및 시작
    echo -e "${GREEN}5. 백엔드 재빌드 및 시작:${NC}"
    docker-compose up -d backend
    echo ""
    
    # 6. 백엔드 상태 확인
    echo -e "${GREEN}6. 백엔드 상태 확인 (15초 대기):${NC}"
    sleep 15
    
    echo "백엔드 컨테이너 상태:"
    docker-compose ps backend
    echo ""
    
    # 7. 백엔드 로그 확인
    echo -e "${GREEN}7. 백엔드 로그 확인:${NC}"
    docker logs intu_erp_backend --tail=20
    echo ""
    
    # 8. API 테스트
    echo -e "${GREEN}8. API 테스트:${NC}"
    curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3001/api/dashboard/health || echo "연결 실패"
    echo ""
    
    # 9. CORS 테스트
    echo -e "${GREEN}9. CORS 테스트:${NC}"
    curl -s -w "HTTP Status: %{http_code}\n" -H "Origin: https://nuvio.kr" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: Content-Type" \
      -X OPTIONS http://localhost:3001/api/auth/login || echo "연결 실패"
    echo ""
    
    echo -e "${GREEN}=== 데이터베이스 SSL 문제 해결 완료 ===${NC}"
    echo "백엔드가 정상적으로 실행되어야 합니다."
}

# Docker 권한 문제 해결
fix_docker_permissions() {
    echo -e "${BLUE}🔧 Docker 권한 문제 해결 중...${NC}"
    
    # 1. 현재 사용자를 docker 그룹에 추가
    echo -e "${GREEN}👤 사용자를 docker 그룹에 추가 중...${NC}"
    sudo usermod -aG docker $USER
    
    # 2. Docker 서비스 상태 확인 및 시작
    echo -e "${GREEN}🐳 Docker 서비스 상태 확인 중...${NC}"
    sudo systemctl status docker
    
    # 3. Docker 서비스 시작 (중지된 경우)
    echo -e "${GREEN}🚀 Docker 서비스 시작 중...${NC}"
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 4. Docker 소켓 권한 확인
    echo -e "${GREEN}🔐 Docker 소켓 권한 확인 중...${NC}"
    ls -la /var/run/docker.sock
    
    # 5. Docker 소켓 권한 수정
    echo -e "${GREEN}🔧 Docker 소켓 권한 수정 중...${NC}"
    sudo chmod 666 /var/run/docker.sock
    
    # 6. Docker 테스트
    echo -e "${GREEN}✅ Docker 테스트 중...${NC}"
    docker --version
    docker ps
    
    echo ""
    echo -e "${GREEN}🎉 Docker 권한 문제 해결 완료!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  중요: 다음 중 하나를 선택하세요:${NC}"
    echo "   1. 새 터미널 세션을 시작하세요 (권장)"
    echo "   2. 또는 다음 명령어를 실행하세요:"
    echo "      newgrp docker"
    echo ""
    echo "그 후 다시 ./manage.sh를 실행하세요."
}

# 포트 충돌 해결
fix_ports() {
    echo -e "${BLUE}🔧 포트 충돌 해결 중...${NC}"
    
    # 1. 기존 컨테이너 중지
    echo -e "${GREEN}🛑 기존 컨테이너 중지 중...${NC}"
    docker-compose down 2>/dev/null || true
    
    # 2. 포트 3000, 3001, 5432, 6379 사용 중인 프로세스 확인
    echo -e "${GREEN}🔍 포트 사용 중인 프로세스 확인 중...${NC}"
    
    local ports=(3000 3001 5432 6379)
    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  포트 $port이 사용 중입니다.${NC}"
            echo "   사용 중인 프로세스:"
            lsof -i :$port
            echo "   프로세스 종료 중..."
            sudo kill -9 $(lsof -ti :$port) 2>/dev/null || true
        fi
    done
    
    # 3. Docker 컨테이너 정리
    echo -e "${GREEN}🧹 Docker 컨테이너 정리 중...${NC}"
    docker container prune -f
    
    # 4. 포트 재확인
    echo -e "${GREEN}✅ 포트 상태 재확인 중...${NC}"
    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo "   포트 $port: 사용 중"
        else
            echo "   포트 $port: 사용 가능"
        fi
    done
    
    echo ""
    echo -e "${GREEN}🎉 포트 충돌 문제 해결 완료!${NC}"
    echo "   이제 ./manage.sh start를 다시 실행하세요."
    echo ""
}

# 로그 확인
show_logs() {
    local service=${1:-"all"}
    
    echo -e "${BLUE}📋 로그 확인 중... (서비스: $service)${NC}"
    
    if [ "$service" = "all" ]; then
        docker-compose logs -f
    elif [ "$service" = "backend" ]; then
        docker-compose logs -f backend
    elif [ "$service" = "frontend" ]; then
        docker-compose logs -f frontend
    else
        echo -e "${RED}❌ 잘못된 서비스명입니다. (all, backend, frontend)${NC}"
        exit 1
    fi
}

# Docker 정리
clean_docker() {
    echo -e "${BLUE}🧹 Docker 정리 중...${NC}"
    
    # 1. 모든 서비스 중지
    echo -e "${GREEN}🛑 모든 서비스 중지 중...${NC}"
    docker-compose down 2>/dev/null || true
    
    # 2. Docker 정리
    echo -e "${GREEN}🧹 Docker 정리 중...${NC}"
    docker system prune -f
    docker container prune -f
    docker network prune -f
    docker volume prune -f
    
    echo -e "${GREEN}✅ Docker 정리 완료${NC}"
}

# 완전 초기화
reset_all() {
    echo -e "${BLUE}🔄 완전 초기화 중...${NC}"
    
    # 1. 모든 서비스 중지
    echo -e "${GREEN}🛑 모든 서비스 중지 중...${NC}"
    docker-compose down 2>/dev/null || true
    
    # 2. Docker 완전 정리
    echo -e "${GREEN}🧹 Docker 완전 정리 중...${NC}"
    docker system prune -af
    docker container prune -f
    docker network prune -f
    docker volume prune -f
    
    # 3. 포트 정리
    echo -e "${GREEN}🔧 포트 정리 중...${NC}"
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sudo fuser -k 3001/tcp 2>/dev/null || true
    sudo fuser -k 5432/tcp 2>/dev/null || true
    sudo fuser -k 6379/tcp 2>/dev/null || true
    
    # 4. 환경 변수 파일 정리
    echo -e "${GREEN}📝 환경 변수 파일 정리 중...${NC}"
    rm -f .env
    rm -f frontend/.env.local
    rm -f frontend/.env
    
    echo -e "${GREEN}✅ 완전 초기화 완료${NC}"
    echo "이제 ./manage.sh start를 실행하여 새로 시작하세요."
}

# nuvio.kr 도메인 설정
setup_domain() {
    echo -e "${BLUE}🌐 nuvio.kr 도메인 설정 중...${NC}"
    
    # 1. Nginx 설치 확인
    if ! command -v nginx &> /dev/null; then
        echo -e "${GREEN}📦 Nginx 설치 중...${NC}"
        sudo apt update
        sudo apt install -y nginx
    fi
    
    # 2. Nginx 설정 파일 복사
    echo -e "${GREEN}📝 Nginx 설정 파일 복사 중...${NC}"
    sudo cp nginx-nuvio.conf /etc/nginx/sites-available/nuvio.kr
    
    # 3. 사이트 활성화
    echo -e "${GREEN}🔗 사이트 활성화 중...${NC}"
    sudo ln -sf /etc/nginx/sites-available/nuvio.kr /etc/nginx/sites-enabled/
    
    # 4. 기본 사이트 비활성화 (충돌 방지)
    echo -e "${GREEN}🚫 기본 사이트 비활성화 중...${NC}"
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 5. Nginx 설정 테스트
    echo -e "${GREEN}🧪 Nginx 설정 테스트 중...${NC}"
    if sudo nginx -t; then
        echo -e "${GREEN}✅ Nginx 설정이 올바릅니다.${NC}"
    else
        echo -e "${RED}❌ Nginx 설정에 오류가 있습니다.${NC}"
        exit 1
    fi
    
    # 6. Nginx 재시작
    echo -e "${GREEN}🔄 Nginx 재시작 중...${NC}"
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    # 7. 방화벽 설정
    echo -e "${GREEN}🔥 방화벽 설정 중...${NC}"
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 80
    sudo ufw allow 443
    
    # 8. SSL 인증서 설치 안내
    echo ""
    echo -e "${YELLOW}🔒 SSL 인증서 설치가 필요합니다:${NC}"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d nuvio.kr -d www.nuvio.kr"
    echo ""
    
    # 9. DNS 설정 안내
    echo -e "${YELLOW}🌍 DNS 설정 확인:${NC}"
    echo "   A 레코드: nuvio.kr → 서버 IP"
    echo "   CNAME 레코드: www.nuvio.kr → nuvio.kr"
    echo ""
    
    # 10. 환경 변수 업데이트 안내
    echo -e "${YELLOW}⚙️  환경 변수 업데이트:${NC}"
    echo "   cp env.cloud .env"
    echo "   # .env 파일에서 CORS_ORIGIN과 FRONTEND_URL이 https://nuvio.kr로 설정되었는지 확인"
    echo ""
    
    echo -e "${GREEN}🎉 nuvio.kr 도메인 설정 완료!${NC}"
    echo ""
    echo -e "${YELLOW}📋 다음 단계:${NC}"
    echo "   1. DNS 설정 (A 레코드, CNAME 레코드)"
    echo "   2. SSL 인증서 설치"
    echo "   3. 환경 변수 업데이트"
    echo "   4. ERP 시스템 실행"
    echo ""
}

# 메인 함수
main() {
    # 로고 출력
    print_logo
    
    # 명령어가 없으면 도움말 출력
    if [ $# -eq 0 ]; then
        print_help
        exit 0
    fi
    
    # 명령어 처리
    case "$1" in
        "start")
            start_services "local"
            ;;
        "start-cloud")
            start_services "cloud"
            ;;
        "start-nuvio")
            start_services "nuvio"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            check_status
            ;;
        "check")
            comprehensive_check
            ;;
        "debug")
            debug_backend
            ;;
        "diagnose")
            diagnose_connection
            ;;
        "fix-ports")
            fix_ports
            ;;
        "fix-docker")
            fix_docker_permissions
            ;;
        "fix-cors")
            fix_cors
            ;;
        "fix-api")
            fix_api
            ;;
        "fix-db")
            fix_database_ssl
            ;;
        "logs")
            show_logs "all"
            ;;
        "logs-backend")
            show_logs "backend"
            ;;
        "logs-frontend")
            show_logs "frontend"
            ;;
        "clean")
            clean_docker
            ;;
        "reset")
            reset_all
            ;;
        "setup-domain")
            setup_domain
            ;;
        "help"|"-h"|"--help")
            print_help
            ;;
        *)
            echo -e "${RED}❌ 잘못된 명령어입니다: $1${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
