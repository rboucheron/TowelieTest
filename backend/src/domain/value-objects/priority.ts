export const TEST_CASE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type TestCasePriority = (typeof TEST_CASE_PRIORITIES)[number];

export const BUG_PRIORITIES = ["MINOR", "MAJOR", "BLOCKING"] as const;
export type BugPriority = (typeof BUG_PRIORITIES)[number];
