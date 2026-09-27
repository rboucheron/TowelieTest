import { Controller, Get } from "@nestjs/common";

/** Excluded from the `/v1` global prefix (see server.ts). */
@Controller("health")
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: "ok" };
  }
}
