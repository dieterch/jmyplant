import http from 'http';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config(); // Load environment variables from .env file

const haveInternet = async () => {
  return new Promise((resolve) => {
    const options = {
      hostname: process.env.MYPLANT_API_URL,
      method: 'HEAD',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
};

const getToken = async () => {
  // Use Company token as in colleguas code.
  const luser = process.env.MYPLANT_API_REL_USER;
  const lpassword = process.env.MYPLANT_API_REL_PW;
  const url = `https://${process.env.MYPLANT_API_URL}/oauth/token`;
  
  // Base64 encode the credentials for Basic Authentication
  const authHeader = `Basic ${Buffer.from(`${luser}:${lpassword}`).toString('base64')}`;

  const data = {
    grant_type: 'client_credentials',
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
  });

    // Extract and return the access token from the response
    return response.data.access_token;
  } catch (error) {
    // console.error('Token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export { haveInternet, getToken };