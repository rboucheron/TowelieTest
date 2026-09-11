-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('USER', 'QA', 'MAINTAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TestCasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BugPriority" AS ENUM ('MINOR', 'MAJOR', 'BLOCKING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_books" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_book_products" (
    "recipeBookId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "recipe_book_products_pkey" PRIMARY KEY ("recipeBookId","productId")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "recipeBookId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "priority" "TestCasePriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bugs" (
    "id" TEXT NOT NULL,
    "recipeBookId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "observedBehavior" TEXT NOT NULL,
    "stepsToReproduce" TEXT NOT NULL,
    "evidenceAndContext" TEXT NOT NULL,
    "priority" "BugPriority" NOT NULL DEFAULT 'MINOR',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_affected_products" (
    "bugId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "bug_affected_products_pkey" PRIMARY KEY ("bugId","productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "memberships_groupId_idx" ON "memberships"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_groupId_key" ON "memberships"("userId", "groupId");

-- CreateIndex
CREATE INDEX "products_groupId_idx" ON "products"("groupId");

-- CreateIndex
CREATE INDEX "recipe_books_groupId_idx" ON "recipe_books"("groupId");

-- CreateIndex
CREATE INDEX "test_cases_recipeBookId_idx" ON "test_cases"("recipeBookId");

-- CreateIndex
CREATE INDEX "bugs_recipeBookId_idx" ON "bugs"("recipeBookId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_books" ADD CONSTRAINT "recipe_books_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_book_products" ADD CONSTRAINT "recipe_book_products_recipeBookId_fkey" FOREIGN KEY ("recipeBookId") REFERENCES "recipe_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_book_products" ADD CONSTRAINT "recipe_book_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_recipeBookId_fkey" FOREIGN KEY ("recipeBookId") REFERENCES "recipe_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_recipeBookId_fkey" FOREIGN KEY ("recipeBookId") REFERENCES "recipe_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_affected_products" ADD CONSTRAINT "bug_affected_products_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_affected_products" ADD CONSTRAINT "bug_affected_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

