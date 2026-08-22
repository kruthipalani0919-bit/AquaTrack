/*
  Warnings:

  - You are about to drop the column `farmId` on the `Tank` table. All the data in the column will be lost.
  - You are about to drop the `WaterTest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `siteId` to the `Tank` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Tank" DROP CONSTRAINT "Tank_farmId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WaterTest" DROP CONSTRAINT "WaterTest_tankId_fkey";

-- AlterTable
ALTER TABLE "Tank" DROP COLUMN "farmId",
ADD COLUMN     "siteId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."WaterTest";

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "gpsLocation" TEXT,
    "remarks" TEXT,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tank" ADD CONSTRAINT "Tank_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
