import { randomUUID } from "node:crypto";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import { User } from "@/domain/entities/user";
import type { CreateMemberInput } from "@/application/dtos/group.dto";
import { type Result, ok, err } from "@/shared/result";
import { alreadyExists, type AppError } from "@/shared/errors";

export interface AddMemberResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Adds a member to a Group. If no account exists yet for the given email, one is created
 * with the supplied name/password (the admin-driven equivalent of an "invite"); if the
 * email already belongs to a user, that existing account is simply granted membership.
 */
export class AddMemberUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly memberships: MembershipRepository,
    private readonly authorization: AuthorizationService,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    input: CreateMemberInput
  ): Promise<Result<AddMemberResult, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    const email = input.email.trim().toLowerCase();
    let user = await this.users.findByEmail(email);

    if (user) {
      const existingMembership = await this.memberships.findByUserAndGroup(user.id, groupId);
      if (existingMembership) {
        return err(alreadyExists("Membership for this user in this group"));
      }
    } else {
      const passwordHash = await this.passwordHasher.hash(input.password);
      const userResult = User.create({
        id: randomUUID(),
        email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        isSuperAdmin: false,
        createdAt: new Date(),
      });
      if (!userResult.success) return err(userResult.error);
      user = await this.users.create(userResult.data);
    }

    await this.memberships.create({ userId: user.id, groupId, role: input.role });

    return ok({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: input.role,
    });
  }
}
