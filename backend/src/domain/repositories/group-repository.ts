import type { Group } from "@/domain/entities/group";

export interface GroupRepository {
  findById(id: string): Promise<Group | null>;
  findAllForUser(userId: string): Promise<Group[]>;
  findAll(): Promise<Group[]>;
  create(group: Group): Promise<Group>;
  update(group: Group): Promise<Group>;
}
