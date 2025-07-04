import { config } from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// 환경변수 로드 (가장 먼저)
// 프로덕션 환경에서는 .env.production 사용
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: envFile });

// 프로덕션 환경 로깅
if (process.env.NODE_ENV === 'production') {
  log(`🎆 Running in PRODUCTION mode`);
  log(`📄 Using env file: ${envFile}`);
}

const app = express();

// CORS 설정 - Vercel 프론트엔드에서 접근 허용
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://twiga-v2.vercel.app',
    'https://twiga-v2-frontend.vercel.app',
    'http://localhost:5173', // 로컬 개발용
    'http://localhost:3000'  // 로컬 개발용
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 환경변수로 포트 설정 가능하도록 수정
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, () => {
    log(`🚀 Server running on ${host}:${port}`);
    log(`📝 Environment: ${app.get("env")}`);
  });
})();
