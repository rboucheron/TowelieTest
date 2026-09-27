export const GROUP_ROLES = ["USER", "QA", "MAINTAINER", "ADMIN"] as const;

export type GroupRole = (typeof GROUP_ROLES)[number];

const ROLE_RANK: Record<GroupRole, number> = {
  USER: 0,
  QA: 1,
  MAINTAINER: 2,
  ADMIN: 3,
};

export const roleAtLeast = (actual: GroupRole, required: GroupRole): boolean =>
  ROLE_RANK[actual] >= ROLE_RANK[required];

export const isGroupRole = (value: string): value is GroupRole =>
  (GROUP_ROLES as readonly string[]).includes(value);
