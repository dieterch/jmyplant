-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" INTEGER NOT NULL,
    "countOpHour" INTEGER,
    "powerPowerNominal" INTEGER,
    "paraSpeedNominal" INTEGER,
    "operationalCondition" TEXT,
    "shutdowncounter" INTEGER,
    "startupcounter" INTEGER,
    "startsophratio" REAL,
    "engineVersion" TEXT,
    "engineType" TEXT,
    "engineSeries" TEXT,
    "country" TEXT,
    "commissioningDate" DATETIME,
    "designNumber" TEXT,
    "serialNumber" TEXT NOT NULL,
    "controlSystemType" TEXT,
    "engineID" TEXT,
    "iBUnitCommissioningDate" DATETIME,
    "iBNOX" TEXT,
    "iBFrequency" TEXT,
    "iBItemDescriptionEngine" TEXT,
    "iBSiteName" TEXT,
    "iBStatus" TEXT,
    "moduleVersHalIO" TEXT,
    "contractWarrantyStartDate" DATETIME,
    "contractWarrantyEndDate" DATETIME,
    "productProgram" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Engine_assetId_key" ON "Engine"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_serialNumber_key" ON "Engine"("serialNumber");
