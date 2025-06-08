import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// 환경변수 로드
config({ path: '.env' });

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle/dev',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // 또는 로컬 PostgreSQL 사용시
    // url: process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/twiga_v2',
  },
  verbose: true, // 개발환경에서 상세 로그
  strict: false, // 개발환경에서 유연한 스키마 변경 허용
});
