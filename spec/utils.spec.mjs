import { haveInternet, getToken, reshape } from '../modules/utils.mjs';
import nock from 'nock';


// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

describe('Utility Functions', () => {
  describe('haveInternet', () => {
    it('should resolve to true if the API is reachable', async () => {
      const apiUrl = process.env.MYPLANT_API_URL;
      nock(`http://${apiUrl}`).head('/').reply(200);

      const result = await haveInternet();
      expect(result).toBe(true);
    });

    it('should resolve to false if the API is not reachable', async () => {
      const apiUrl = process.env.MYPLANT_API_URL;
      nock(`http://${apiUrl}`).head('/').replyWithError('Network error');

      const result = await haveInternet();
      expect(result).toBe(false);
    });
  });


  describe('getToken', () => {
    it('should throw an error on failed authentication', async () => {
      const apiUrl = process.env.MYPLANT_API_URL;
  
      // Mock the endpoint to return a 401 Unauthorized error
      nock(`https://${apiUrl}`).post('/oauth/token').reply(401, { error: 'Unauthorized' });
  
      await expectAsync(getToken()).toBeRejectedWithError('Request failed with status code 401');
    });
  });
  
  describe('reshape', () => {
    it('should reshape an object with nested arrays correctly', () => {
      const input = {
        id: 1,
        details: [
          { name: 'field1', value: 'value1' },
          { name: 'field2', value: 'value2' },
        ],
      };

      const expectedOutput = {
        field1: 'value1',
        field2: 'value2',
        id: 1,
      };

      const result = reshape(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle null or undefined values in arrays', () => {
      const input = {
        details: [
          { name: 'field1', value: null },
          { name: 'field2' },
        ],
      };

      const expectedOutput = {
        field1: null,
        field2: null,
      };

      const result = reshape(input);
      expect(result).toEqual(expectedOutput);
    });
  });
});
