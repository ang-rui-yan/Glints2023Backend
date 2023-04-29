/*
  Warnings:

  - Changed the type of `startTime` on the `RestaurantOpeningHour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `RestaurantOpeningHour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RestaurantOpeningHour" DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIME NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIME NOT NULL;
