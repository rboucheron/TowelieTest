import type { UserRepository } from "@/domain/repositories/user-repository";
import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import type { GroupRepository } from "@/domain/repositories/group-repository";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";
import type { AuthenticatedUserDTO } from "@/application/dtos/auth.dto";

export interface MeMembershipDTO {
  groupId: string;
  groupName: string;
  role: string;
}

export interface MeDTO {
  user: AuthenticatedUserDTO;
  memberships: MeMembershipDTO[];
}

export class GetMeUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly memberships: MembershipRepository,
    private readonly groups: GroupRepository
  ) {}

  async execute(userId: string): Promise<Result<MeDTO, AppError>> {
    const user = await this.users.findById(userId);
    if (!user) return err(notFound("User"));

    const memberships = await this.memberships.findAllForUser(userId);
    const groupsById = new Map(
      (await Promise.all(memberships.map(async (m) => this.groups.findById(m.groupId))))
        .filter((g): g is NonNullable<typeof g> => g !== null)
        .map((g) => [g.id, g])
    );

    return ok({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
      },
      memberships: memberships.flatMap((m) => {
        const group = groupsById.get(m.groupId);
        return group ? [{ groupId: m.groupId, groupName: group.name, role: m.role }] : [];
      }),
    });
  }
}
