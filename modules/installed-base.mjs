import fs from 'fs';
import path from 'path';

const _reshape = (rec) => {
  const ret = {};
  for (const [key, value] of Object.entries(rec)) {
    if (Array.isArray(value)) {
      value.forEach(lrec => {
        ret[lrec.name] = lrec.value ?? null;
      });
    } else {
      ret[key] = value;
    }
  }
  return ret;
};

const  _fetchInstalledBase = async (mp, fields, properties, dataItems, limit) => {
    let url = `/asset/` +
      `?fields=${fields.join(',')}` +
      `&properties=${properties.join(',')}` +
      `&dataItems=${dataItems.join(',')}` +
      `&assetTypes=J-Engine`;
    
    if (limit) {
      url += `&limit=${limit}`;
    }
  
    const res = await mp.fetchData(url);
    return res.data.map(a => _reshape(a));
  }
  
  const fetchInstalledBase = async (mp, limit = null) => {
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
  
    const fleet = await _fetchInstalledBase(mp, fields, properties, dataItems, limit);
    console.log(`${fleet.length} engines in Installed Base`)
    
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
  
  export { fetchInstalledBase, _reshape };