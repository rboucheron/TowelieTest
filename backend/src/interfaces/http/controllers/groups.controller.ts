import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateGroupSchema,
  UpdateGroupSchema,
  CreateMemberSchema,
  UpdateMemberRoleSchema,
  type CreateGroupInput,
  type UpdateGroupInput,
  type CreateMemberInput,
  type UpdateMemberRoleInput,
  type GroupDTO,
  type MemberDTO,
} from "@/application/dtos/group.dto";
import type { AddMemberResult } from "@/application/use-cases/members/add-member-use-case";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { Group } from "@/domain/entities/group";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const toGroupDTO = (group: Group, myRole: string | null): GroupDTO => ({
  id: group.id,
  name: group.name,
  logo: group.logo,
  createdAt: group.createdAt.toISOString(),
  myRole,
});

@Controller("groups")
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(@CurrentActor() actor: AuthorizedActor): Promise<GroupDTO[]> {
    const groups = await this.useCases.listGroups.execute(actor);
    return groups.map((g) => toGroupDTO(g.group, g.myRole));
  }

  @Post()
  async create(
    @CurrentActor() actor: AuthorizedActor,
    @Body(new ZodValidationPipe(CreateGroupSchema)) input: CreateGroupInput
  ): Promise<GroupDTO> {
    const group = unwrap(await this.useCases.createGroup.execute(actor, input));
    return toGroupDTO(group, "ADMIN");
  }

  @Get(":groupId")
  async get(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string
  ): Promise<GroupDTO> {
    const group = unwrap(await this.useCases.getGroup.execute(actor, groupId));
    return toGroupDTO(group, null);
  }

  @Patch(":groupId")
  async update(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Body(new ZodValidationPipe(UpdateGroupSchema)) input: UpdateGroupInput
  ): Promise<GroupDTO> {
    const group = unwrap(await this.useCases.updateGroup.execute(actor, groupId, input));
    return toGroupDTO(group, null);
  }

  @Get(":groupId/members")
  async listMembers(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string
  ): Promise<MemberDTO[]> {
    const members = unwrap(await this.useCases.listMembers.execute(actor, groupId));
    return members.map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      role: m.membership.role,
    }));
  }

  @Post(":groupId/members")
  async addMember(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Body(new ZodValidationPipe(CreateMemberSchema)) input: CreateMemberInput
  ): Promise<AddMemberResult> {
    return unwrap(await this.useCases.addMember.execute(actor, groupId, input));
  }

  @Patch(":groupId/members/:userId")
  async updateMemberRole(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Param("userId") userId: string,
    @Body(new ZodValidationPipe(UpdateMemberRoleSchema)) input: UpdateMemberRoleInput
  ): Promise<{ userId: string; groupId: string; role: string }> {
    const membership = unwrap(
      await this.useCases.updateMemberRole.execute(actor, groupId, userId, input.role)
    );
    return { userId: membership.userId, groupId: membership.groupId, role: membership.role };
  }

  @Delete(":groupId/members/:userId")
  @HttpCode(204)
  async removeMember(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Param("userId") userId: string
  ): Promise<void> {
    unwrap(await this.useCases.removeMember.execute(actor, groupId, userId));
  }
}
