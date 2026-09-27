import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

import { env } from "@/infrastructure/persistence/env";
import { logger } from "@/infrastructure/services/logger";
import { AppModule } from "@/interfaces/http/app.module";
import { AppExceptionFilter } from "@/interfaces/http/filters/app-exception.filter";
import { apiRateLimiter } from "@/interfaces/http/middlewares/rate-limiters";
import { NestPinoLogger } from "@/interfaces/http/nest-logger";

const ALLOWED_ORIGINS = new Set([
  env.CORS_ALLOW_ORIGIN,
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]);

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: new NestPinoLogger(),
  });

  app.disable("x-powered-by");
  app.use(helmet());
  app.enableCors({
    origin: (requestOrigin, callback) => {
      callback(null, !requestOrigin || ALLOWED_ORIGINS.has(requestOrigin));
    },
    credentials: true,
  });
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/v1", apiRateLimiter);

  app.setGlobalPrefix("v1", { exclude: ["health"] });
  app.useGlobalFilters(new AppExceptionFilter());

  return app;
}

if (import.meta.main) {
  const app = await createApp();
  await app.listen(env.PORT);
  logger.info(`Backend listening on port ${String(env.PORT)}`);
}
