import fs from 'fs';
import path from 'path';
import { MyPlant } from '../modules/myplant.mjs'; // Adjust the path if necessary
import { assetData } from '../modules/asset.mjs'

const main = async () => {
  try {
    // Initialize the MyPlant client
    const mp = await MyPlant.create();
    // Log in to MyPlant
    await mp.login();

    const serialNumber = 1486144
    const data = await assetData(mp, serialNumber)

    const outputDir = path.join(process.cwd(), 'output');
    const outputFile = path.join(outputDir, `assetData-${serialNumber}.json`);
    // Save the JSON data to the file
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 4), 'utf-8');

  
    // Exit the process explicitly
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error.message);

    // Exit the process with failure code
    process.exit(1);
  }
};

await main();
