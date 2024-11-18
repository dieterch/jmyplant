-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetIdd" INTEGER NOT NULL,
    "countOpHour" INTEGER NOT NULL,
    "powerNominal" INTEGER,
    "paraSpeedNominal" INTEGER,
    "operationalCondition" TEXT NOT NULL,
    "shutdownCounter" INTEGER NOT NULL,
    "startupCounter" INTEGER NOT NULL,
    "startsOphRatio" REAL NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "engineSeries" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "commissioningDate" DATETIME NOT NULL,
    "designNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "controlSystemType" TEXT,
    "engineId" TEXT,
    "ibUnitCommissioningDate" DATETIME,
    "ibNox" TEXT,
    "ibFrequency" TEXT,
    "ibItemDescriptionEngine" TEXT,
    "ibSiteName" TEXT,
    "ibStatus" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Engine_assetIdd_key" ON "Engine"("assetIdd");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_serialNumber_key" ON "Engine"("serialNumber");
