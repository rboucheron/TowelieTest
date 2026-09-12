import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

import { env } from "@/infrastructure/persistence/env";
import { logger } from "@/infrastructure/services/logger";
import { container } from "@/infrastructure/container";
import { errorHandler } from "@/interfaces/http/middlewares/error-handler";
import { apiRateLimiter } from "@/interfaces/http/middlewares/rate-limiters";

import { createAuthRouter } from "@/interfaces/http/controllers/auth.controller";
import { createMeRouter } from "@/interfaces/http/controllers/me.controller";
import { createGroupsRouter } from "@/interfaces/http/controllers/groups.controller";
import {
  createGroupProductsRouter,
  createProductRouter,
} from "@/interfaces/http/controllers/products.controller";
import {
  createGroupRecipeBooksRouter,
  createRecipeBookRouter,
} from "@/interfaces/http/controllers/recipe-books.controller";
import {
  createRecipeBookTestCasesRouter,
  createTestCaseRouter,
} from "@/interfaces/http/controllers/test-cases.controller";
import {
  createRecipeBookBugsRouter,
  createBugRouter,
} from "@/interfaces/http/controllers/bugs.controller";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        const allowedOrigins = new Set([
          env.CORS_ALLOW_ORIGIN,
          "http://localhost:3001",
          "http://127.0.0.1:3001",
        ]);
        

        callback(null, !requestOrigin || allowedOrigins.has(requestOrigin));
      },
      credentials: true,
    })
  );
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/v1", apiRateLimiter);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/v1/auth", createAuthRouter(container));
  app.use("/v1/me", createMeRouter(container));
  app.use("/v1/groups", createGroupsRouter(container));
  app.use("/v1/groups/:groupId/products", createGroupProductsRouter(container));
  app.use("/v1/products", createProductRouter(container));
  app.use("/v1/groups/:groupId/recipe-books", createGroupRecipeBooksRouter(container));
  app.use("/v1/recipe-books", createRecipeBookRouter(container));
  app.use("/v1/recipe-books/:recipeBookId/test-cases", createRecipeBookTestCasesRouter(container));
  app.use("/v1/test-cases", createTestCaseRouter(container));
  app.use("/v1/recipe-books/:recipeBookId/bugs", createRecipeBookBugsRouter(container));
  app.use("/v1/bugs", createBugRouter(container));

  app.use(errorHandler);

  return app;
}

if (import.meta.main) {
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Backend listening on port ${String(env.PORT)}`);
  });
}
