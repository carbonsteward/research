# TWIGA v2 로컬 개발 가이드

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
```
그 다음 `.env` 파일을 편집하여 실제 값들을 입력하세요.

### 3. 데이터베이스 스키마 적용
```bash
npm run db:push
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## 📋 사용 가능한 명령어

### 개발
- `npm run dev` - 개발 서버 시작
- `npm run check` - TypeScript 타입 체크

### 빌드
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행

### 데이터베이스
- `npm run db:push` - 스키마 직접 적용 (개발용)
- `npm run db:generate` - 마이그레이션 파일 생성
- `npm run db:migrate` - 마이그레이션 실행
- `npm run db:studio` - Drizzle Studio 실행

## 🔧 환경 설정

### 포트 변경
```bash
# .env 파일에 추가
PORT=3000          # 백엔드 서버 포트
VITE_PORT=3001     # 프론트엔드 개발서버 포트
```

### 로컬 PostgreSQL 사용
```bash
# Docker로 PostgreSQL 실행
docker run --name twiga-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=twiga_v2 \
  -d -p 5432:5432 postgres:15

# .env 파일에 로컬 DB URL 설정
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/twiga_v2
```

## 🐛 문제 해결

### 포트 충돌
다른 포트 사용:
```bash
PORT=3000 VITE_PORT=3001 npm run dev
```

### 캐시 문제
```bash
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

### 의존성 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔗 접속 주소

- **백엔드**: http://localhost:5000
- **프론트엔드** (개발): http://localhost:5173
- **Drizzle Studio**: http://localhost:4983

## 📚 추가 정보

- [Vite 문서](https://vitejs.dev/)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Express.js 가이드](https://expressjs.com/)
