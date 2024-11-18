import { MyPlant } from '../modules/myplant.mjs';
import { haveInternet } from '../modules/utils.mjs';
import axios from 'axios';
import { TOTP } from 'totp-generator';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

describe('MyPlant Class', () => {
  let myPlant;
  let axiosMock;

  beforeEach(() => {
    // Mock axios.create
    axiosMock = {
      post: jasmine.createSpy('post'),
      get: jasmine.createSpy('get'),
    };
    spyOn(axios, 'create').and.returnValue(axiosMock);

    // Mock TOTP.generate
    spyOn(TOTP, 'generate').and.returnValue({ otp: 'mockedTOTP' });

    // Mock haveInternet
    spyOn(haveInternet, 'apply').and.returnValue(Promise.resolve(true));

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    // Create a new instance
    myPlant = new MyPlant();
  });

  describe('Constructor', () => {
    it('should throw an error if no internet connection', async () => {
      haveInternet.apply.and.returnValue(Promise.resolve(false));

      await expectAsync((async () => new MyPlant())()).toBeRejectedWithError('Error, Check Internet Connection!');
    });
  });

  describe('login', () => {
    it('should successfully log in and set token', async () => {
      console.log(axios.create); // Check if the mock exists
      axiosMock.post.and.callFake((url) => {
        if (url.endsWith('/auth')) {
          return Promise.resolve({ data: { token: 'mockedToken' } });
        }
      });

      await myPlant.login();

      expect(myPlant.appToken).toBe('mockedToken');
      expect(axiosMock.post).toHaveBeenCalledWith(
        `https://${myPlant._apiurl}/auth`,
        jasmine.any(Object),
        jasmine.any(Object)
      );
    });

    it('should handle 2FA challenge and set token', async () => {
      axiosMock.post.and.callFake((url) => {
        if (url.endsWith('/auth')) {
          return Promise.reject({ response: { status: 499, data: { challenge: 'mockChallenge' } } });
        }
        if (url.endsWith('/auth/mfa/totp/confirmation')) {
          return Promise.resolve({ data: { token: 'mocked2FAToken' } });
        }
      });

      await myPlant.login();

      expect(myPlant.appToken).toBe('mocked2FAToken');
      expect(axiosMock.post).toHaveBeenCalledWith(
        `https://${myPlant._apiurl}/auth/mfa/totp/confirmation`,
        jasmine.any(Object),
        jasmine.any(Object)
      );
    });
  });

  describe('fetchData', () => {
    it('should fetch data successfully', async () => {
      axiosMock.get.and.returnValue(Promise.resolve({ data: { key: 'value' } }));

      const data = await myPlant.fetchData('/some-endpoint');

      expect(data).toEqual({ key: 'value' });
      expect(axiosMock.get).toHaveBeenCalledWith(
        `https://${myPlant._apiurl}/some-endpoint`,
        jasmine.any(Object)
      );
    });

    it('should retry and fail after max attempts', async () => {
      axiosMock.get.and.returnValue(Promise.reject(new Error('Request failed')));

      await expectAsync(myPlant.fetchData('/some-endpoint', 2)).toBeRejectedWithError(
        'Failed to fetch data from /some-endpoint after 2 attempts'
      );
      expect(axiosMock.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetchGQLData', () => {
    it('should send a GraphQL query and return data', async () => {
      axiosMock.post.and.returnValue(Promise.resolve({ data: { key: 'value' } }));

      const query = `{ testQuery }`;
      const data = await myPlant.fetchGQLData(query);

      expect(data).toEqual({ key: 'value' });
      expect(axiosMock.post).toHaveBeenCalledWith(
        `https://${myPlant._apiurl}/graphql`,
        { query },
        jasmine.any(Object)
      );
    });

    it('should log an error if the request fails', async () => {
      axiosMock.post.and.returnValue(Promise.reject({ response: { data: 'Error occurred' } }));
      spyOn(console, 'error');

      const query = `{ testQuery }`;
      const data = await myPlant.fetchGQLData(query);

      expect(data).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch asset data:', 'Error occurred');
    });
  });
});
