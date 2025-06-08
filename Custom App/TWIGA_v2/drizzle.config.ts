import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// 환경변수 로드
// 프로덕션 환경에서는 .env.production 사용
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
