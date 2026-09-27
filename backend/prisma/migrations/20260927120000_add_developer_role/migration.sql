-- AlterEnum
ALTER TYPE "GroupRole" ADD VALUE 'DEVELOPER';

-- CreateTable
CREATE TABLE "membership_products" (
    "membershipId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "membership_products_pkey" PRIMARY KEY ("membershipId","productId")
);

-- CreateIndex
CREATE INDEX "membership_products_productId_idx" ON "membership_products"("productId");

-- AddForeignKey
ALTER TABLE "membership_products" ADD CONSTRAINT "membership_products_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_products" ADD CONSTRAINT "membership_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
