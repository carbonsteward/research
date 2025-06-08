import { config } from "dotenv";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// 환경변수 로드 (가장 먼저)
// 프로덕션 환경에서는 .env.production 사용
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: envFile });

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
