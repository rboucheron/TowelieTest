import { prisma } from "@/infrastructure/persistence/prisma-client";
import { env } from "@/infrastructure/persistence/env";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { PrismaRefreshTokenRepository } from "@/infrastructure/repositories/prisma-refresh-token-repository";
import { PrismaGroupRepository } from "@/infrastructure/repositories/prisma-group-repository";
import { PrismaMembershipRepository } from "@/infrastructure/repositories/prisma-membership-repository";
import { PrismaProductRepository } from "@/infrastructure/repositories/prisma-product-repository";
import { PrismaRecipeBookRepository } from "@/infrastructure/repositories/prisma-recipe-book-repository";
import { PrismaTestCaseRepository } from "@/infrastructure/repositories/prisma-test-case-repository";
import { PrismaBugRepository } from "@/infrastructure/repositories/prisma-bug-repository";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher";
import { JwtTokenService } from "@/infrastructure/services/jwt-token-service";

import { AuthorizationService } from "@/domain/services/authorization-service";

import { LoginUseCase } from "@/application/use-cases/auth/login-use-case";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refresh-token-use-case";
import { LogoutUseCase } from "@/application/use-cases/auth/logout-use-case";
import { GetMeUseCase } from "@/application/use-cases/me/get-me-use-case";

import { CreateGroupUseCase } from "@/application/use-cases/groups/create-group-use-case";
import { ListGroupsUseCase } from "@/application/use-cases/groups/list-groups-use-case";
import { GetGroupUseCase } from "@/application/use-cases/groups/get-group-use-case";
import { UpdateGroupUseCase } from "@/application/use-cases/groups/update-group-use-case";

import { AddMemberUseCase } from "@/application/use-cases/members/add-member-use-case";
import { ListMembersUseCase } from "@/application/use-cases/members/list-members-use-case";
import { UpdateMemberRoleUseCase } from "@/application/use-cases/members/update-member-role-use-case";
import { RemoveMemberUseCase } from "@/application/use-cases/members/remove-member-use-case";

import { CreateProductUseCase } from "@/application/use-cases/products/create-product-use-case";
import { ListProductsUseCase } from "@/application/use-cases/products/list-products-use-case";
import { UpdateProductUseCase } from "@/application/use-cases/products/update-product-use-case";
import { RemoveProductUseCase } from "@/application/use-cases/products/remove-product-use-case";

import { CreateRecipeBookUseCase } from "@/application/use-cases/recipe-books/create-recipe-book-use-case";
import { ListRecipeBooksUseCase } from "@/application/use-cases/recipe-books/list-recipe-books-use-case";
import { GetRecipeBookUseCase } from "@/application/use-cases/recipe-books/get-recipe-book-use-case";
import { UpdateRecipeBookUseCase } from "@/application/use-cases/recipe-books/update-recipe-book-use-case";
import { RemoveRecipeBookUseCase } from "@/application/use-cases/recipe-books/remove-recipe-book-use-case";

import { CreateTestCaseUseCase } from "@/application/use-cases/test-cases/create-test-case-use-case";
import { ListTestCasesUseCase } from "@/application/use-cases/test-cases/list-test-cases-use-case";
import { UpdateTestCaseUseCase } from "@/application/use-cases/test-cases/update-test-case-use-case";
import { RemoveTestCaseUseCase } from "@/application/use-cases/test-cases/remove-test-case-use-case";

import { CreateBugUseCase } from "@/application/use-cases/bugs/create-bug-use-case";
import { ListBugsUseCase } from "@/application/use-cases/bugs/list-bugs-use-case";
import { UpdateBugUseCase } from "@/application/use-cases/bugs/update-bug-use-case";
import { RemoveBugUseCase } from "@/application/use-cases/bugs/remove-bug-use-case";

const userRepository = new PrismaUserRepository(prisma);
const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma);
const groupRepository = new PrismaGroupRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);
const recipeBookRepository = new PrismaRecipeBookRepository(prisma);
const testCaseRepository = new PrismaTestCaseRepository(prisma);
const bugRepository = new PrismaBugRepository(prisma);

const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(env.JWT_ACCESS_SECRET);
const authorizationService = new AuthorizationService(membershipRepository);

export const container = {
  repositories: {
    user: userRepository,
    refreshToken: refreshTokenRepository,
    group: groupRepository,
    membership: membershipRepository,
    product: productRepository,
    recipeBook: recipeBookRepository,
    testCase: testCaseRepository,
    bug: bugRepository,
  },
  services: {
    passwordHasher,
    tokenService,
    authorizationService,
  },
  useCases: {
    login: new LoginUseCase(userRepository, refreshTokenRepository, passwordHasher, tokenService),
    refreshToken: new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService),
    logout: new LogoutUseCase(refreshTokenRepository, tokenService),
    getMe: new GetMeUseCase(userRepository, membershipRepository, groupRepository),

    createGroup: new CreateGroupUseCase(groupRepository),
    listGroups: new ListGroupsUseCase(groupRepository, membershipRepository),
    getGroup: new GetGroupUseCase(groupRepository, authorizationService),
    updateGroup: new UpdateGroupUseCase(groupRepository, authorizationService),

    addMember: new AddMemberUseCase(
      userRepository,
      membershipRepository,
      authorizationService,
      passwordHasher
    ),
    listMembers: new ListMembersUseCase(membershipRepository, authorizationService),
    updateMemberRole: new UpdateMemberRoleUseCase(membershipRepository, authorizationService),
    removeMember: new RemoveMemberUseCase(membershipRepository, authorizationService),

    createProduct: new CreateProductUseCase(productRepository, authorizationService),
    listProducts: new ListProductsUseCase(productRepository, authorizationService),
    updateProduct: new UpdateProductUseCase(productRepository, authorizationService),
    removeProduct: new RemoveProductUseCase(productRepository, authorizationService),

    createRecipeBook: new CreateRecipeBookUseCase(
      recipeBookRepository,
      productRepository,
      authorizationService
    ),
    listRecipeBooks: new ListRecipeBooksUseCase(recipeBookRepository, authorizationService),
    getRecipeBook: new GetRecipeBookUseCase(recipeBookRepository, authorizationService),
    updateRecipeBook: new UpdateRecipeBookUseCase(
      recipeBookRepository,
      productRepository,
      authorizationService
    ),
    removeRecipeBook: new RemoveRecipeBookUseCase(recipeBookRepository, authorizationService),

    createTestCase: new CreateTestCaseUseCase(
      testCaseRepository,
      recipeBookRepository,
      authorizationService
    ),
    listTestCases: new ListTestCasesUseCase(
      testCaseRepository,
      recipeBookRepository,
      authorizationService
    ),
    updateTestCase: new UpdateTestCaseUseCase(
      testCaseRepository,
      recipeBookRepository,
      authorizationService
    ),
    removeTestCase: new RemoveTestCaseUseCase(
      testCaseRepository,
      recipeBookRepository,
      authorizationService
    ),

    createBug: new CreateBugUseCase(
      bugRepository,
      recipeBookRepository,
      productRepository,
      authorizationService
    ),
    listBugs: new ListBugsUseCase(bugRepository, recipeBookRepository, authorizationService),
    updateBug: new UpdateBugUseCase(
      bugRepository,
      recipeBookRepository,
      productRepository,
      authorizationService
    ),
    removeBug: new RemoveBugUseCase(bugRepository, recipeBookRepository, authorizationService),
  },
};

export type Container = typeof container;
