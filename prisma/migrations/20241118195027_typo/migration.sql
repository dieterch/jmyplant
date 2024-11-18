/*
  Warnings:

  - You are about to drop the column `assetIdd` on the `Engine` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Engine` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" INTEGER NOT NULL,
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
INSERT INTO "new_Engine" ("commissioningDate", "controlSystemType", "countOpHour", "country", "designNumber", "engineId", "engineSeries", "engineType", "engineVersion", "ibFrequency", "ibItemDescriptionEngine", "ibNox", "ibSiteName", "ibStatus", "ibUnitCommissioningDate", "id", "operationalCondition", "paraSpeedNominal", "powerNominal", "serialNumber", "shutdownCounter", "startsOphRatio", "startupCounter") SELECT "commissioningDate", "controlSystemType", "countOpHour", "country", "designNumber", "engineId", "engineSeries", "engineType", "engineVersion", "ibFrequency", "ibItemDescriptionEngine", "ibNox", "ibSiteName", "ibStatus", "ibUnitCommissioningDate", "id", "operationalCondition", "paraSpeedNominal", "powerNominal", "serialNumber", "shutdownCounter", "startsOphRatio", "startupCounter" FROM "Engine";
DROP TABLE "Engine";
ALTER TABLE "new_Engine" RENAME TO "Engine";
CREATE UNIQUE INDEX "Engine_assetId_key" ON "Engine"("assetId");
CREATE UNIQUE INDEX "Engine_serialNumber_key" ON "Engine"("serialNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
