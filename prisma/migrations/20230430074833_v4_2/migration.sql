/*
  Warnings:

  - You are about to drop the column `restaurantDishId` on the `CustomerPurchaseHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerPurchaseHistory" DROP CONSTRAINT "CustomerPurchaseHistory_restaurantDishId_fkey";

-- AlterTable
ALTER TABLE "CustomerPurchaseHistory" DROP COLUMN "restaurantDishId",
ALTER COLUMN "transactionDate" SET DEFAULT CURRENT_TIMESTAMP;
