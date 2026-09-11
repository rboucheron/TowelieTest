export const GROUP_ROLES = ["USER", "QA", "MAINTAINER", "ADMIN"] as const;

export type GroupRole = (typeof GROUP_ROLES)[number];

const ROLE_RANK: Record<GroupRole, number> = {
  USER: 0,
  QA: 1,
  MAINTAINER: 2,
  ADMIN: 3,
};

/** Roles are cumulative: each role inherits every permission of the roles below it. */
export const roleAtLeast = (actual: GroupRole, required: GroupRole): boolean =>
  // eslint-disable-next-line security/detect-object-injection -- both indices are typed as the closed GroupRole union, never untrusted input
  ROLE_RANK[actual] >= ROLE_RANK[required];

export const isGroupRole = (value: string): value is GroupRole =>
  (GROUP_ROLES as readonly string[]).includes(value);
