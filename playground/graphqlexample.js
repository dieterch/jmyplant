import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { MyPlant } from '../modules/MyPlant.mjs'; // Adjust the path if necessary


const fetchSchema = async (token) => {
  const endpoint = 'https://api.myplant.io/graphql';
  const query = `
  query {
    __schema {
      types {
        name
        fields {
          name
        }
        kind
        description
      }
    }
  }
  `;
  
  try {
    const response = await axios.post(
      endpoint,
      { query }, // GraphQL query payload
      { headers: { 'Content-Type': 'application/json', 'x-seshat-token': token }}
    );
    // console.log('Viewer Data:', JSON.stringify(response.data,null,4));
    return response.data
  } catch (error) {
    console.error('Failed to fetch asset data:', error.response?.data || error.message);
  }
};

const fetchViewer = async (token, assetId) => {
    const endpoint = 'https://api.myplant.io/graphql';
    const properties = [
      "Engine Series",
      "Engine Type",
      "Engine Version",
      "Customer Engine Number",
      "Engine ID",
      "Design Number",
      "Gas Type",
      "Commissioning Date",
      "Contract.Service Contract Type",
    ];
  
    const dataItems = [
      "OperationalCondition",
      "Count_OpHour",
      "Count_Start",
      "Power_PowerNominal",
      "Para_Speed_Nominal",
      "rP_Ramp_Set",
      "RMD_ListBuffMAvgOilConsume_OilConsumption",
    ];

    const query = `
      query {
        asset(id: ${assetId}) {
          id
          serialNumber
          model
          site {
            id
            name
            country
          }
          customer {
            id
            name
          }
          status {
            lastContactDate
            lastDataFlowDate
          }
          properties(names: ${JSON.stringify(properties)}) {
            id
            name
            value
          }
          dataItems(query: ${JSON.stringify(dataItems)}) {
            id
            name
            value
            unit
            timestamp
          }
        }
      }
    `;
  
    try {
      const response = await axios.post(
        endpoint,
        { query }, // GraphQL query payload
        { headers: { 'Content-Type': 'application/json', 'x-seshat-token': token }}
      );
      // console.log('Viewer Data:', JSON.stringify(response.data,null,4));
      return response.data
    } catch (error) {
      console.error('Failed to fetch asset data:', error.response?.data || error.message);
    }
  };

// Usage Example
(async () => {

    // Initialize the MyPlant client
    const myPlantClient = new MyPlant();

    // Log in to MyPlant
    await myPlantClient.login();

    const token=myPlantClient.appToken
    // const token = await getToken()

    // Define the file path to save the JSON
    const outputDir = path.join(process.cwd(), 'output');
  
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    
    // try {
    //   const schema = await fetchSchema(token);
    //   //console.log('Schema:', JSON.stringify(schema, null, 4));
    //   const schema_outputFile = path.join(outputDir, `schema.json`);
    //     // Save the JSON data to the file
    //   fs.writeFileSync(schema_outputFile, JSON.stringify(schema, null, 4), 'utf-8');
    //   console.log(`Schema saved to ${schema_outputFile}`);
    // }
    // catch (error) {
    //   console.error('Failed to fetch schema:', error.message);
    // }
    
    const assetId = 159396;
    try {
      const data = await fetchViewer(token, assetId);
      //console.log('Data:', JSON.stringify(data, null, 4));
      const asset_outputFile = path.join(outputDir, `assetData_${assetId}.json`);
      // Save the JSON data to the file
      fs.writeFileSync(asset_outputFile, JSON.stringify(data, null, 4), 'utf-8');
      console.log(`Asset data saved to ${asset_outputFile}`);
    }
    catch (error) {
      console.error('Failed to fetch asset data:', error.message);
    }

})();
