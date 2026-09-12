import type { AuthorizedActor } from "@/domain/services/authorization-service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required to augment Express's own Request type
  namespace Express {
    interface Request {
      actor?: AuthorizedActor;
    }
  }
}

export {};
