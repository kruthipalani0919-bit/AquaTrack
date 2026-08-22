-- AlterEnum
ALTER TYPE "StockCategory" ADD VALUE 'SEED';

-- AlterTable
ALTER TABLE "Stocking" ADD COLUMN     "costPerKg" DOUBLE PRECISION;
