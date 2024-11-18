import * as InstalledBase from '../modules/installed-base.mjs';
import { reshape } from '../modules/utils.mjs';
import path from 'path';
import fs from 'fs';

describe('Installed Base Module', () => {
  let mockMyPlant;

  beforeEach(() => {
    mockMyPlant = jasmine.createSpyObj('MyPlant', ['fetchData']);
    spyOn(fs, 'existsSync').and.callFake(() => true);
    spyOn(fs, 'mkdirSync');
    spyOn(fs, 'writeFileSync');
    spyOn(console, 'log');
    spyOn(reshape, 'apply').and.callFake((obj) => obj); // Mock reshape function to return the input
  });

  describe('fetchInstalledBase', () => {
    it('should fetch installed base data and save it to a file', async () => {
        const mockResponse = {
          data: [
            { serialNumber: '12345', engineType: 'TypeA' },
            { serialNumber: '67890', engineType: 'TypeB' },
          ],
        };
      
        mockMyPlant.fetchData.and.returnValue(Promise.resolve(mockResponse));
      
        const result = await InstalledBase.fetchInstalledBase(mockMyPlant);
      
        // Verify fetchData is called with correct URL
        expect(mockMyPlant.fetchData).toHaveBeenCalledWith(
          '/asset/?fields=serialNumber&properties=Design Number,Engine Type,Engine Version,Engine Series,Engine ID,Control System Type,Country,IB Site Name,Commissioning Date,IB Unit Commissioning Date,Contract.Warranty Start Date,Contract.Warranty End Date,IB Status,IB NOX,IB Frequency,IB Item Description Engine,Product Program&dataItems=OperationalCondition,Module_Vers_HalIO,starts_oph_ratio,startup_counter,shutdown_counter,Count_OpHour,Power_PowerNominal,Para_Speed_Nominal&assetTypes=J-Engine'
        );
      
        // Verify output file operations
        const expectedFilePath = path.join(process.cwd(), 'output', 'installed-base.json');
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), 'output'));
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expectedFilePath, // File path
          JSON.stringify(mockResponse.data, null, 2) // File contents as a string
        );
      
        // Verify console logs
        expect(console.log).toHaveBeenCalledWith('2 engines in Installed Base');
        expect(console.log).toHaveBeenCalledWith(`Fleet data saved to ${expectedFilePath}`);
      
        // Verify returned result
        expect(result).toEqual(mockResponse.data);
      });
      

    it('should create the output directory if it does not exist', async () => {
      fs.existsSync.and.returnValue(false);

      const mockResponse = { data: [] };
      mockMyPlant.fetchData.and.returnValue(Promise.resolve(mockResponse));

      await InstalledBase.fetchInstalledBase(mockMyPlant);

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(process.cwd(), 'output'));
    });

    it('should include the limit in the fetchData URL if provided', async () => {
      const mockResponse = { data: [] };
      mockMyPlant.fetchData.and.returnValue(Promise.resolve(mockResponse));

      await InstalledBase.fetchInstalledBase(mockMyPlant, 10);

      expect(mockMyPlant.fetchData).toHaveBeenCalledWith(
        '/asset/?fields=serialNumber&properties=Design Number,Engine Type,Engine Version,Engine Series,Engine ID,Control System Type,Country,IB Site Name,Commissioning Date,IB Unit Commissioning Date,Contract.Warranty Start Date,Contract.Warranty End Date,IB Status,IB NOX,IB Frequency,IB Item Description Engine,Product Program&dataItems=OperationalCondition,Module_Vers_HalIO,starts_oph_ratio,startup_counter,shutdown_counter,Count_OpHour,Power_PowerNominal,Para_Speed_Nominal&assetTypes=J-Engine&limit=10'
      );
    });

    it('should throw an error if fetchData fails', async () => {
      mockMyPlant.fetchData.and.returnValue(Promise.reject(new Error('Network Error')));

      await expectAsync(InstalledBase.fetchInstalledBase(mockMyPlant)).toBeRejectedWithError('Network Error');
    });
  });
});
