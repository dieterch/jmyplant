import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TOTP } from 'totp-generator';
import { haveInternet, reshape } from './utils.mjs'
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

class MyPlant {
  static _session = null;

  constructor() {
    this._dataBasedir = path.join(process.cwd(), 'data');
    this._cred = {
      name: process.env.MYPLANT_USERNAME,
      password: process.env.MYPLANT_PASSWORD,
      totp_secret: process.env.MYPLANT_TOTP_SECRET
    };
    this._apiurl = process.env.MYPLANT_API_URL
    this._retries = process.env.MYPLANT_API_RETRIES

    if (!this._cred.name || !this._cred.password || !this._cred.totp_secret) {
      throw new Error('Error: Missing MyPlant credentials in .env file');
    }

    (async () => {
      if (!(await haveInternet())) {
        throw new Error('Error, Check Internet Connection!');
      } 
      this._appuserToken = null;
      this._token = null;
    })();
  }

  gdi(ds, subKey, dataItemName) {
    if (subKey === 'nokey') {
      return ds[dataItemName] || null;
    }

    const local = ds[subKey]
      .filter((item) => item.name === dataItemName)
      .map((item) => item.value);
    return local.length > 0 ? local.pop() : null;
  }

  async login() {
    if (!MyPlant._session) {
      MyPlant._session = axios.create();
      const headers = { 'Content-Type': 'application/json' };
      const body = {
        username: this._cred.name,
        password: this._cred.password
      };
      const totpSecret = this._cred.totp_secret;
      for (let i = 0; i < this._retries; i++) {
          try {
            const response = await MyPlant._session.post(
              `https://${this._apiurl}/auth`,
              body,
              { headers }
            ); }
          catch ( answer ) {
            if (answer.status == 499) {
              const { otp } = TOTP.generate(totpSecret);
              const totpCode = otp;
    
              const bodyMfa = {
                username: body.username,
                challenge: answer.response.data.challenge,
                otp: totpCode
              };
    
              const mfaResponse = await MyPlant._session.post(
                `https://${this._apiurl}/auth/mfa/totp/confirmation`,
                bodyMfa,
                { headers }
              );
              if (mfaResponse.status === 200) {
                this._token = mfaResponse.data.token;
                this._appuserToken = this._token;
                return;
              }
            } else {
              throw new Error('Axios 2 FA failed.');
            }
          } 
        } 
    }
  }

  get appToken() {
    return this._appuserToken;
  }

  logout() {
    if (MyPlant._session) {
      MyPlant._session = null;
    }
  }

  async fetchData(url, numRetries = this._retries) {
    let retries = 0;

    while (retries <= numRetries) {
      try {
        const headers = { 'x-seshat-token': this.appToken };
        const response = await MyPlant._session.get(`https://${this._apiurl}${url}`, {
          headers,
          timeout: 30000
        });
        return response.data;
      } catch (err) {
        console.error(`Request failed: ${err}`);
        retries++;
        if (retries <= numRetries) {
          await new Promise((res) => setTimeout(res, 5000));
        } else {
          throw new Error(`Failed to fetch data from ${url} after ${numRetries} attempts`);
        }
      }
    }
  }

  async assetData(serialNumber) {
    return await this.fetchData(`/asset?assetType=J-Engine&serialNumber=${serialNumber}`);
  }

  async fetchGQLData(query) {
    try {
      const response = await MyPlant._session.post(
        `https://${this._apiurl}/graphql`,
        { query }, // GraphQL query payload
        { headers: { 'Content-Type': 'application/json', 'x-seshat-token': this.appToken}}
      );
      // console.log('Viewer Data:', JSON.stringify(response.data,null,4));
      // return response.data
      return response.data.map(a => reshape(a));
    } catch (error) {
      console.error('Failed to fetch asset data:', error.response?.data || error.message);
    }
  };

  async assetGQLData(assetId) {
    const properties = [ 
      "Engine Series","Engine Type", "Engine Version", "Customer Engine Number", "Engine ID",
      "Design Number","Gas Type","Commissioning Date", "Contract.Service Contract Type"];
  
    const dataItems = [
      "OperationalCondition","Count_OpHour","Count_Start", "Power_PowerNominal","Para_Speed_Nominal",
      "rP_Ramp_Set", "RMD_ListBuffMAvgOilConsume_OilConsumption"];

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
      return await this.fetchGQLData(query)
    } catch (error) {
      console.error('Failed to fetch asset GQL data:', error.message);
      throw Error(`Failed to fetch GQL data from asset ${assetId}`)
    }
  }

  async GQLSchema() {
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
      return await this.fetchGQLData(query)
    } catch (error) {
      console.error('Failed to fetch asset GQL schema:', error.message);
      throw Error(`Failed to fetch GQL schema`)
    }
  }

  async fetchAvailableData() {
    return await this.fetchData('/model/J-Engine')    
  }

  async _fetchInstalledBase (fields, properties, dataItems, limit = null) {
    let url = `/asset/` +
      `?fields=${fields.join(',')}` +
      `&properties=${properties.join(',')}` +
      `&dataItems=${dataItems.join(',')}` +
      `&assetTypes=J-Engine`;
    
    if (limit) {
      url += `&limit=${limit}`;
    }
  
    const res = await this.fetchData(url);
    return res.data.map(a => reshape(a));
  }
  
  async fetchInstalledBase() {
    const fields = ['serialNumber'];
    const properties = [
      'Design Number', 'Engine Type', 'Engine Version', 'Engine Series', 'Engine ID',
      'Control System Type', 'Country', 'IB Site Name', 'Commissioning Date',
      'IB Unit Commissioning Date', 'Contract.Warranty Start Date', 'Contract.Warranty End Date',
      'IB Status', 'IB NOX', 'IB Frequency', 'IB Item Description Engine', 'Product Program'
    ];
  
    const dataItems = [
      'OperationalCondition', 'Module_Vers_HalIO', 'starts_oph_ratio',
      'startup_counter', 'shutdown_counter', 'Count_OpHour',
      'Power_PowerNominal', 'Para_Speed_Nominal'
    ];
  
    const fleet = await this._fetchInstalledBase(fields, properties, dataItems);
    
    // Define the file path to save the JSON
    const outputDir = path.join(process.cwd(), 'output');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save fleet to a file in JSON format
    const filePath = path.join(outputDir, `installed-base.json`);
    fs.writeFileSync(filePath, JSON.stringify(fleet, null, 2));
    console.log(`Fleet data saved to ${filePath}`);
    
    return fleet;
  }
  

}

export { MyPlant };
