/*
  Warnings:

  - You are about to drop the column `endTime` on the `RestaurantOpeningHour` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `RestaurantOpeningHour` table. All the data in the column will be lost.
  - Added the required column `endTimeHours` to the `RestaurantOpeningHour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTimeMinutes` to the `RestaurantOpeningHour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeHours` to the `RestaurantOpeningHour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeMinutes` to the `RestaurantOpeningHour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RestaurantOpeningHour" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endTimeHours" INTEGER NOT NULL,
ADD COLUMN     "endTimeMinutes" INTEGER NOT NULL,
ADD COLUMN     "startTimeHours" INTEGER NOT NULL,
ADD COLUMN     "startTimeMinutes" INTEGER NOT NULL;
