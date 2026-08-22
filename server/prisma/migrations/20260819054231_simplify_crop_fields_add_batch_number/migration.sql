-- AlterTable
ALTER TABLE "Crop" ADD COLUMN     "batchNumber" TEXT,
ALTER COLUMN "cropName" DROP NOT NULL,
ALTER COLUMN "plCount" DROP NOT NULL,
ALTER COLUMN "expectedHarvestDate" DROP NOT NULL,
ALTER COLUMN "cropDuration" DROP NOT NULL,
ALTER COLUMN "expectedProduction" DROP NOT NULL,
ALTER COLUMN "expectedSellingPrice" DROP NOT NULL;
