-- CreateEnum
CREATE TYPE "StockCategory" AS ENUM ('FEED', 'MEDICINE');

-- CreateTable
CREATE TABLE "Stocking" (
    "id" TEXT NOT NULL,
    "category" "StockCategory" NOT NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stocking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteStockAllocation" (
    "id" TEXT NOT NULL,
    "allocatedQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "stockingId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStockAllocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stocking" ADD CONSTRAINT "Stocking_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteStockAllocation" ADD CONSTRAINT "SiteStockAllocation_stockingId_fkey" FOREIGN KEY ("stockingId") REFERENCES "Stocking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteStockAllocation" ADD CONSTRAINT "SiteStockAllocation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
