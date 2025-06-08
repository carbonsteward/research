# 🚀 TWIGA v2 프로덕션 배포 가이드

## 📋 프로덕션 빌드 단계

### 1. 환경변수 설정
```bash
# .env.production 파일을 편집하여 실제 프로덕션 값 설정
# 특히 다음 항목들을 반드시 변경하세요:
# - JWT_SECRET: 강력한 32자 이상의 비밀키
# - SESSION_SECRET: 강력한 32자 이상의 비밀키
# - STRIPE_SECRET_KEY: 실제 Stripe 라이브 키
# - VITE_STRIPE_PUBLIC_KEY: 실제 Stripe 퍼블릭 키
```

### 2. 프로덕션 빌드
```bash
# TypeScript 체크 + 최적화된 빌드
npm run build:prod
```

### 3. 프로덕션 서버 실행
```bash
# 프로덕션 환경변수로 서버 시작
npm run start:prod
```

## 🔒 보안 체크리스트

### 필수 변경사항
- [ ] JWT_SECRET을 강력한 키로 변경
- [ ] SESSION_SECRET을 강력한 키로 변경
- [ ] Stripe 키를 라이브 키로 변경
- [ ] .env.production을 .gitignore에 추가 확인

### 프로덕션 최적화
- [ ] 데이터베이스 연결 풀 설정
- [ ] HTTPS 설정 (리버스 프록시 사용)
- [ ] 로그 레벨 설정
- [ ] 에러 처리 강화

## 🌐 배포 옵션

### 옵션 1: 직접 서버 배포
```bash
# 서버에서
git clone [your-repo]
cd TWIGA_v2
npm install
npm run build:prod
npm run start:prod
```

### 옵션 2: Docker 배포
```dockerfile
# Dockerfile 예시 (생성 필요)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### 옵션 3: Vercel/Netlify 배포
- Build Command: `npm run build:prod`
- Output Directory: `dist`
- Install Command: `npm install`

## 📊 성능 모니터링

### 권장 도구
- **로그**: Winston, Pino
- **모니터링**: PM2, New Relic
- **에러 추적**: Sentry
- **업타임**: UptimeRobot

## 🔧 문제 해결

### 일반적인 이슈
1. **환경변수 로드 실패**
   ```bash
   # NODE_ENV 설정 확인
   echo $NODE_ENV
   ```

2. **포트 충돌**
   ```bash
   # 다른 포트 사용
   PORT=8080 npm run start:prod
   ```

3. **데이터베이스 연결 오류**
   ```bash
   # 연결 테스트
   NODE_ENV=production npm run db:push
   ```

## 📈 성능 최적화

### 서버 설정
- 리버스 프록시 (Nginx, Caddy)
- SSL/TLS 인증서
- 정적 파일 캐싱
- Gzip 압축

### 데이터베이스
- 연결 풀링
- 쿼리 최적화
- 인덱스 설정
- 백업 전략

---

**🎯 프로덕션 준비 완료!**
이제 안전하고 최적화된 프로덕션 환경에서 TWIGA v2를 실행할 수 있습니다.
