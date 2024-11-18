import { MyPlant } from '../modules/myplant.mjs';
import axios from 'axios';

describe('MyPlant Class', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = {
      post: jasmine.createSpy('post'),
      get: jasmine.createSpy('get'),
    };

    spyOn(axios, 'create').and.returnValue(axiosMock);
    MyPlant._session = axios.create();

    process.env.MYPLANT_USERNAME = 'mockUsername';
    process.env.MYPLANT_PASSWORD = 'mockPassword';
    process.env.MYPLANT_TOTP_SECRET = 'mockSecret';
    process.env.MYPLANT_API_URL = 'api.mockplant.io';
    process.env.MYPLANT_API_RETRIES = '3';
  });

  it('should initialize properly if credentials are provided', () => {
    const myPlant = new MyPlant();
    expect(myPlant._cred.name).toBe('mockUsername');
    expect(myPlant._cred.password).toBe('mockPassword');
    expect(myPlant._cred.totp_secret).toBe('mockSecret');
  });

  it('should throw an error for missing credentials', () => {
    delete process.env.MYPLANT_USERNAME;

    expect(() => new MyPlant()).toThrowError('Error: Missing MyPlant credentials in .env file');
  });

  it('should successfully log in and set token', async () => {
    axiosMock.post.and.callFake((url) => {
      if (url.endsWith('/auth')) {
        return Promise.resolve({ data: { token: 'mockedToken' } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const myPlant = new MyPlant();

    await myPlant.login();

    expect(myPlant.appToken).toBe('mockedToken');
    expect(axiosMock.post).toHaveBeenCalledWith(
      `https://api.mockplant.io/auth`,
      jasmine.any(Object),
      jasmine.any(Object)
    );
  });

  it('should throw an error for invalid credentials', async () => {
    axiosMock.post.and.callFake((url) => {
      if (url.endsWith('/auth')) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: 'Unauthorized' },
          },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    const myPlant = new MyPlant();
  
    await expectAsync(myPlant.login()).toBeRejectedWithError(/Unauthorized/);
  
    expect(axiosMock.post).toHaveBeenCalledWith(
      `https://api.mockplant.io/auth`,
      jasmine.any(Object),
      jasmine.any(Object)
    );
  });
  
  it('should handle 2FA challenge during login', async () => {
    axiosMock.post.and.callFake((url) => {
      if (url.endsWith('/auth')) {
        return Promise.reject({
          response: {
            status: 499,
            data: { challenge: 'mockChallenge' },
          },
        });
      }
      if (url.endsWith('/auth/mfa/totp/confirmation')) {
        return Promise.resolve({ data: { token: 'mocked2FAToken' } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    const myPlant = new MyPlant();
  
    await myPlant.login();
  
    expect(myPlant.appToken).toBe('mocked2FAToken');
    expect(axiosMock.post).toHaveBeenCalledWith(
      `https://api.mockplant.io/auth/mfa/totp/confirmation`,
      jasmine.any(Object),
      jasmine.any(Object)
    );
  });
  
  it('should fetch data successfully', async () => {
    axiosMock.get.and.returnValue(Promise.resolve({ data: { key: 'value' } }));

    const myPlant = new MyPlant();
    const data = await myPlant.fetchData('/some-endpoint');

    expect(data).toEqual({ key: 'value' });
    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://api.mockplant.io/some-endpoint`,
      jasmine.any(Object)
    );
  });

  it('should retry and fail after max attempts', async () => {
    axiosMock.get.and.returnValue(Promise.reject(new Error('Request failed')));

    const myPlant = new MyPlant();

    await expectAsync(myPlant.fetchData('/some-endpoint', 2)).toBeRejectedWithError(
      'Failed to fetch data from /some-endpoint after 2 attempts'
    );

    expect(axiosMock.get).toHaveBeenCalledTimes(3); // 1 initial call + 2 retries
  });

  it('should send a GraphQL query and return data', async () => {
    axiosMock.post.and.returnValue(Promise.resolve({ data: { key: 'value' } }));

    const myPlant = new MyPlant();
    const query = `{ testQuery }`;
    const data = await myPlant.fetchGQLData(query);

    expect(data).toEqual({ key: 'value' });
    expect(axiosMock.post).toHaveBeenCalledWith(
      `https://api.mockplant.io/graphql`,
      { query },
      jasmine.any(Object)
    );
  });

  it('should log an error if GraphQL request fails', async () => {
    axiosMock.post.and.returnValue(Promise.reject({ response: { data: 'Error occurred' } }));
    spyOn(console, 'error');

    const myPlant = new MyPlant();
    const query = `{ testQuery }`;
    const data = await myPlant.fetchGQLData(query);

    expect(data).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('Failed to fetch asset data:', 'Error occurred');
  });
});
