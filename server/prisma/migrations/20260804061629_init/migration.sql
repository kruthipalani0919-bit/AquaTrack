-- CreateEnum
CREATE TYPE "CropStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'BANK', 'CARD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "farmName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "totalAcres" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tank" (
    "id" TEXT NOT NULL,
    "tankName" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "waterSource" TEXT NOT NULL,
    "gpsLocation" TEXT,
    "remarks" TEXT,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "seedVariety" TEXT NOT NULL,
    "plCount" INTEGER NOT NULL,
    "stockingDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3) NOT NULL,
    "cropDuration" INTEGER NOT NULL,
    "expectedProduction" DOUBLE PRECISION NOT NULL,
    "expectedSellingPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "status" "CropStatus" NOT NULL DEFAULT 'ACTIVE',
    "tankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "feedType" TEXT NOT NULL,
    "feedBrand" TEXT NOT NULL,
    "feedSize" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "costPerKg" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "cropId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "receipt" TEXT,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "cropId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterTest" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "salinity" DOUBLE PRECISION NOT NULL,
    "oxygen" DOUBLE PRECISION NOT NULL,
    "ammonia" DOUBLE PRECISION NOT NULL,
    "nitrite" DOUBLE PRECISION NOT NULL,
    "alkalinity" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "tankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "medicineName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "tankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "production" DOUBLE PRECISION NOT NULL,
    "averageWeight" DOUBLE PRECISION NOT NULL,
    "survivalRate" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "buyerName" TEXT NOT NULL,
    "transportationCost" DOUBLE PRECISION NOT NULL,
    "harvestExpense" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "cropId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tank" ADD CONSTRAINT "Tank_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedEntry" ADD CONSTRAINT "FeedEntry_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterTest" ADD CONSTRAINT "WaterTest_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
