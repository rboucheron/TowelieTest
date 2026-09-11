export const queryKeys = {
  me: ['me'] as const,
  groups: ['groups'] as const,
  group: (groupId: string) => ['groups', groupId] as const,
  members: (groupId: string) => ['groups', groupId, 'members'] as const,
  products: (groupId: string) => ['groups', groupId, 'products'] as const,
  recipeBooks: (groupId: string) =>
    ['groups', groupId, 'recipe-books'] as const,
  recipeBook: (recipeBookId: string) => ['recipe-books', recipeBookId] as const,
  testCases: (recipeBookId: string) =>
    ['recipe-books', recipeBookId, 'test-cases'] as const,
  bugs: (recipeBookId: string) =>
    ['recipe-books', recipeBookId, 'bugs'] as const,
}
