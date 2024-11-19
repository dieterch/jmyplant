import path from 'path';
import axios from 'axios';
import { TOTP } from 'totp-generator';
import { haveInternet } from './utils.mjs'
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
    this._appuserToken = null;
    this._token = null;

    if (!this._cred.name || !this._cred.password || !this._cred.totp_secret) {
      throw new Error('Error: Missing MyPlant credentials in .env file');
    }
  }

  // Static async factory method
  static async create() {
    const instance = new MyPlant();
    if (!(await haveInternet())) {
      throw new Error('Error, Check Internet Connection!');
    }
    return instance;
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
    }
  
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      username: this._cred.name,
      password: this._cred.password,
    };
    const totpSecret = this._cred.totp_secret;
  
    // console.log('Attempting login request...');
  
    for (let i = 0; i < this._retries; i++) {
      try {
        const response = await MyPlant._session.post(
          `https://${this._apiurl}/auth`,
          body,
          { headers }
        );
        this._token = response.data.token;
        this._appuserToken = this._token;
        // console.log('Login successful:', response.data);
        return;
      } 
      catch (answer) {
        if (answer.response?.status === 401) {
          // cnsole.error('Invalid credentials:', answer.response.data.error);
          throw new Error('Unauthorized');
        }
        if (answer.response?.status === 499) {
          const { otp } = TOTP.generate(totpSecret);
          const totpCode = otp;
      
          const bodyMfa = {
            username: body.username,
            challenge: answer.response.data.challenge,
            otp: totpCode,
          };
      
          const mfaResponse = await MyPlant._session.post(
            `https://${this._apiurl}/auth/mfa/totp/confirmation`,
            bodyMfa,
            { headers }
          );
      
          if (mfaResponse?.data?.token) {
            this._token = mfaResponse.data.token;
            this._appuserToken = this._token;
            // console.log('2FA successful:', mfaResponse.data);
            return;
          }
        }
        // cnsole.error('Login failed:', answer.response || answer.message);
        throw new Error('Axios 2FA failed.');
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
        // console.error(`${err}`);
        retries++;
        if (retries <= numRetries) {
          await new Promise((res) => setTimeout(res, 500));
        } else {
          throw new Error(`Failed to fetch data from ${url} after ${numRetries} attempts`);
        }
      }
    }
  }

  async fetchGQLData(query) {
    try {
      const response = await MyPlant._session.post(
        `https://${this._apiurl}/graphql`,
        { query }, // GraphQL query payload
        { headers: { 'Content-Type': 'application/json', 'x-seshat-token': this.appToken}}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asset data:', error.response?.data || error.message);
    }
  };
}

export { MyPlant };
