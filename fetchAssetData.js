import fs from 'fs';
import path from 'path';
import { MyPlant } from './modules/MyPlant.mjs'; // Adjust the path if necessary

const main = async () => {
  try {
    // Initialize the MyPlant client
    const myPlantClient = new MyPlant();

    // Log in to MyPlant
    await myPlantClient.login();

    const assetId = 159396
    const data = await myPlantClient.assetGQLData(assetId)

    const outputDir = path.join(process.cwd(), 'output');
    const outputFile = path.join(outputDir, `assetGQLData-${assetId}.json`);
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
