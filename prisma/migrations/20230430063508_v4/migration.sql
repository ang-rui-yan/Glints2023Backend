/*
  Warnings:

  - Added the required column `transactionAmount` to the `CustomerPurchaseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerPurchaseHistory" ADD COLUMN     "transactionAmount" BIGINT NOT NULL;
