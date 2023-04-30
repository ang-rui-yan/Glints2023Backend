/*
  Warnings:

  - The primary key for the `CustomerPurchaseHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dishId` on the `CustomerPurchaseHistory` table. All the data in the column will be lost.
  - Added the required column `dishName` to the `CustomerPurchaseHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantName` to the `CustomerPurchaseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerPurchaseHistory" DROP CONSTRAINT "CustomerPurchaseHistory_dishId_fkey";

-- AlterTable
ALTER TABLE "CustomerPurchaseHistory" DROP CONSTRAINT "CustomerPurchaseHistory_pkey",
DROP COLUMN "dishId",
ADD COLUMN     "dishName" TEXT NOT NULL,
ADD COLUMN     "restaurantDishId" INTEGER,
ADD COLUMN     "restaurantName" TEXT NOT NULL,
ADD CONSTRAINT "CustomerPurchaseHistory_pkey" PRIMARY KEY ("transactionDate", "dishName", "customerId");

-- AddForeignKey
ALTER TABLE "CustomerPurchaseHistory" ADD CONSTRAINT "CustomerPurchaseHistory_restaurantDishId_fkey" FOREIGN KEY ("restaurantDishId") REFERENCES "RestaurantDish"("id") ON DELETE SET NULL ON UPDATE CASCADE;
