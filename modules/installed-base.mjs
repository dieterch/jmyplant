import fs from 'fs';
import path from 'path';

const _reshape = (rec) => {
  const ret = {};

  Object.entries(rec).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Use a `for` loop for faster iteration on arrays
      for (let i = 0; i < value.length; i++) {
        const lrec = value[i];
        ret[lrec.name] = lrec.value ?? null; // Use nullish coalescing for efficiency
      }
    } else {
      ret[key] = value;
    }
  });

  return ret;
};

// Set of keys to skip if the value is an empty string
const keysToSkipIfEmpty = new Set([
  'Power_PowerNominal',
  'Count_OpHour',
  'Para_Speed_Nominal',
]);

// Transform each object to meet database requirements
const _prepare = (obj) => {
  const modifiedObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Check if the key is a date field and convert to a Date object
    if (key.toLowerCase().includes('date')) {
      const date = new Date(value);
      value = isNaN(date.getTime()) ? null : date; // Set to null if invalid
    }

    // Skip fields if the key is in the skip set and the value is an empty string
    if (value === "" && keysToSkipIfEmpty.has(key)) return;

    // Ensure `Module_Vers_HalIO` is a String or null
    if (key === 'Module_Vers_HalIO') {
      value = value?.toString() ?? null; // Convert to String or set to null if undefined/null
    }

    // Transform the key
    const newKey = key === 'id'
      ? 'assetId'
      : key.replace(/[_ .]/g, '').replace(/^\w/, c => c.toLowerCase());

    // Add the transformed key-value pair to the object
    modifiedObj[newKey] = value;
  });

  return modifiedObj;
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
    return { 'fleet': res.data.map(a => {
                      const lrec = _reshape(a);
                      return _prepare(lrec)
                    }), 
              // 'fleetraw': res.data
            } ;
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
  
    const ret = await _fetchInstalledBase(mp, fields, properties, dataItems, limit);
    console.log(`${ret['fleet'].length} engines in Installed Base`)
    
    // Define the file path to save the JSON
    const outputDir = path.join(process.cwd(), 'output');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save fleet to a file in JSON format
    let filePath = path.join(outputDir, `installed-base.json`);
    fs.writeFileSync(filePath, JSON.stringify(ret['fleet'], null, 2));
    console.log(`Fleet data saved to ${filePath}`);

    // // Save fleet to a file in JSON format
    // filePath = path.join(outputDir, `installed-base-raw.json`);
    // fs.writeFileSync(filePath, JSON.stringify(ret['fleetraw'], null, 2));
    // console.log(`Fleet Raw data saved to ${filePath}`);
    
    return ret['fleet'];
  }
  
  export { fetchInstalledBase, _reshape };