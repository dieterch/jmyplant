import fs from 'fs';
import path from 'path';
import { MyPlant } from './modules/MyPlant.mjs'; // Adjust the path if necessary

const main = async () => {
  try {
    // Initialize the MyPlant client
    const myPlantClient = new MyPlant();

    // Log in to MyPlant
    await myPlantClient.login();

    const fleet = await myPlantClient.fetchInstalledBase()
  
    // Exit the process explicitly
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error.message);

    // Exit the process with failure code
    process.exit(1);
  }
};

await main();
