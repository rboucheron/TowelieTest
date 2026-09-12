import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import {
  CreateGroupSchema,
  UpdateGroupSchema,
  CreateMemberSchema,
  UpdateMemberRoleSchema,
  type GroupDTO,
} from "@/application/dtos/group.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { requireParam } from "@/interfaces/http/middlewares/params";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import type { Group } from "@/domain/entities/group";

const toGroupDTO = (group: Group, myRole: string | null): GroupDTO => ({
  id: group.id,
  name: group.name,
  logo: group.logo,
  createdAt: group.createdAt.toISOString(),
  myRole,
});

export function createGroupsRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const groups = await useCases.listGroups.execute(requireActor(req));
      res.status(200).json(groups.map((g) => toGroupDTO(g.group, g.myRole)));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateGroupSchema.parse(req.body);
      const result = await useCases.createGroup.execute(requireActor(req), input);
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(toGroupDTO(result.data, "ADMIN"));
    })
  );

  router.get(
    "/:groupId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.getGroup.execute(requireActor(req), requireParam(req, "groupId"));
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toGroupDTO(result.data, null));
    })
  );

  router.patch(
    "/:groupId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateGroupSchema.parse(req.body);
      const result = await useCases.updateGroup.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toGroupDTO(result.data, null));
    })
  );

  router.get(
    "/:groupId/members",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.listMembers.execute(requireActor(req), requireParam(req, "groupId"));
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(
        result.data.map((m) => ({
          userId: m.user.id,
          email: m.user.email,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          role: m.membership.role,
        }))
      );
    })
  );

  router.post(
    "/:groupId/members",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateMemberSchema.parse(req.body);
      const result = await useCases.addMember.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(result.data);
    })
  );

  router.patch(
    "/:groupId/members/:userId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateMemberRoleSchema.parse(req.body);
      const result = await useCases.updateMemberRole.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        requireParam(req, "userId"),
        input.role
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res
        .status(200)
        .json({ userId: result.data.userId, groupId: result.data.groupId, role: result.data.role });
    })
  );

  router.delete(
    "/:groupId/members/:userId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.removeMember.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        requireParam(req, "userId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(204).send();
    })
  );

  return router;
}
