import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const engineData = [
  {
    countOpHour: 0,
    assetId: 5,
    operationalCondition: "Decommissioned",
    shutdownCounter: 746,
    startupCounter: 745,
    startsOphRatio: 0.089,
    engineVersion: "E01",
    engineType: "612",
    engineSeries: "6",
    country: "NL",
    commissioningDate: new Date("2004-08-13"),
    designNumber: "B627",
    serialNumber: "4054171",
  },
  {
    assetId: 7,
    countOpHour: 74800,
    powerNominal: 3045,
    paraSpeedNominal: 0,
    operationalCondition: "Decommissioned",
    shutdownCounter: 3129,
    startupCounter: 3128,
    startsOphRatio: 0.122,
    engineVersion: "E166",
    engineType: "620",
    engineSeries: "6",
    country: "NL",
    controlSystemType: "XT1",
    commissioningDate: new Date("2005-12-16"),
    designNumber: "C105",
    engineId: "M01",
    ibUnitCommissioningDate: new Date("2005-12-16"),
    ibNox: "500",
    ibFrequency: "50",
    ibItemDescriptionEngine: "ENG JMS 620 E166",
    ibSiteName: "Groenewegen, J.A.",
    ibStatus: "Temporarily Inactive",
    serialNumber: "4332781",
  },
  // Add other engine objects here...
];

async function insertEngineData() {
  try {
    await prisma.engine.createMany({
      data: engineData,
    });
    console.log('Data inserted successfully!');
  } catch (error) {
    console.error('Error inserting data: ', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertEngineData();
