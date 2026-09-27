import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { ContainerModule } from "@/interfaces/http/container.module";
import { authRateLimiter, registerRateLimiter } from "@/interfaces/http/middlewares/rate-limiters";
import { HealthController } from "@/interfaces/http/controllers/health.controller";
import { AuthController } from "@/interfaces/http/controllers/auth.controller";
import { MeController } from "@/interfaces/http/controllers/me.controller";
import { GroupsController } from "@/interfaces/http/controllers/groups.controller";
import {
  GroupProductsController,
  ProductsController,
} from "@/interfaces/http/controllers/products.controller";
import {
  GroupRecipeBooksController,
  RecipeBooksController,
} from "@/interfaces/http/controllers/recipe-books.controller";
import {
  RecipeBookTestCasesController,
  TestCasesController,
} from "@/interfaces/http/controllers/test-cases.controller";
import {
  GroupBugsController,
  RecipeBookBugsController,
  BugsController,
} from "@/interfaces/http/controllers/bugs.controller";

@Module({
  imports: [ContainerModule],
  controllers: [
    HealthController,
    AuthController,
    MeController,
    GroupsController,
    GroupProductsController,
    ProductsController,
    GroupRecipeBooksController,
    RecipeBooksController,
    RecipeBookTestCasesController,
    TestCasesController,
    GroupBugsController,
    RecipeBookBugsController,
    BugsController,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(authRateLimiter)
      .forRoutes(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/refresh", method: RequestMethod.POST }
      );
    consumer
      .apply(registerRateLimiter)
      .forRoutes({ path: "auth/register", method: RequestMethod.POST });
  }
}
