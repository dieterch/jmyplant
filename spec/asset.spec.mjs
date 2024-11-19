import * as Module from '../modules/asset.mjs'; // Adjust the path as necessary
import { MyPlant } from '../modules/myplant.mjs'; // Mocked MyPlant class

describe('Module Functions', () => {
  let mockMyPlant;

  beforeEach(() => {
    mockMyPlant = jasmine.createSpyObj('MyPlant', ['fetchData', 'fetchGQLData']);
  });

  describe('assetData', () => {
    it('should fetch asset data for a given serial number', async () => {
      const serialNumber = '123456';
      const mockResponse = { assetType: 'J-Engine', serialNumber };

      mockMyPlant.fetchData.and.returnValue(Promise.resolve(mockResponse));

      const result = await Module.assetData(mockMyPlant, serialNumber);

      expect(mockMyPlant.fetchData).toHaveBeenCalledWith(`/asset?assetType=J-Engine&serialNumber=${serialNumber}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('assetGQLData', () => {
    it('should fetch asset GraphQL data for a given asset ID', async () => {
      const assetId = 'asset123';
      const mockResponse = { id: assetId, properties: [], dataItems: [] };

      mockMyPlant.fetchGQLData.and.returnValue(Promise.resolve(mockResponse));

      const result = await Module.assetGQLData(mockMyPlant, assetId);

      expect(mockMyPlant.fetchGQLData).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if GraphQL query fails', async () => {
      const assetId = 'asset123';
      const errorMessage = 'GQL data';

      mockMyPlant.fetchGQLData.and.throwError(errorMessage);

      await expectAsync(Module.assetGQLData(mockMyPlant, assetId)).toBeRejectedWithError(`Failed to fetch GQL data from asset ${assetId}`);
      expect(mockMyPlant.fetchGQLData).toHaveBeenCalled();
    });
  });

  describe('GQLSchema', () => {
    it('should fetch the GraphQL schema', async () => {
      const mockResponse = { __schema: { types: [] } };

      mockMyPlant.fetchGQLData.and.returnValue(Promise.resolve(mockResponse));

      const result = await Module.GQLSchema(mockMyPlant);

      expect(mockMyPlant.fetchGQLData).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if schema fetching fails', async () => {
      const errorMessage = 'GQL schema';

      mockMyPlant.fetchGQLData.and.throwError(errorMessage);

      await expectAsync(Module.GQLSchema(mockMyPlant)).toBeRejectedWithError('Failed to fetch GQL schema');
      expect(mockMyPlant.fetchGQLData).toHaveBeenCalled();
    });
  });

  describe('fetchAvailableDataItems', () => {
    it('should fetch available data items for J-Engine', async () => {
      const mockResponse = { dataItems: [] };

      mockMyPlant.fetchData.and.returnValue(Promise.resolve(mockResponse));

      const result = await Module.fetchAvailableDataItems(mockMyPlant);

      expect(mockMyPlant.fetchData).toHaveBeenCalledWith('/model/J-Engine');
      expect(result).toEqual(mockResponse);
    });
  });
});
