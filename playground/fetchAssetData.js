import fs from 'fs';
import path from 'path';
import { MyPlant } from '../modules/MyPlant.mjs'; // Adjust the path if necessary

const main = async () => {
  try {
    // Initialize the MyPlant client
    const myPlantClient = new MyPlant();

    // Log in to MyPlant
    await myPlantClient.login();

    // Fetch asset data
    //const serialNumber = 1486144;
    //const assetData = await myPlantClient.assetData(serialNumber);
    console.log(await myPlantClient.GQLSchema())

    const assetId = 159396
    const assetData = await myPlantClient.assetGQLData(assetId)

    // Define the file path to save the JSON
    const outputDir = path.join(process.cwd(), 'output');
    // const outputFile = path.join(outputDir, `assetData_${serialNumber}.json`);
    const outputFile = path.join(outputDir, `assetData_${assetId}.json`);

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save the JSON data to the file
    fs.writeFileSync(outputFile, JSON.stringify(assetData, null, 2), 'utf-8');

    console.log(`Asset data saved to ${outputFile}`);
    
    // Exit the process explicitly
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error.message);

    // Exit the process with failure code
    process.exit(1);
  }
};

await main();
