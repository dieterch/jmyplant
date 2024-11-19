
const assetData = async (mp, serialNumber) => {
    return await mp.fetchData(`/asset?assetType=J-Engine&serialNumber=${serialNumber}`);
}

const assetGQLData = async (mp, assetId) => {
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
      return await mp.fetchGQLData(query)
    } catch (error) {
      // console.error('GQL data:', error.message);
      throw Error(`Failed to fetch GQL data from asset ${assetId}`)
    }
  }

const GQLSchema = async (mp) => {
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
      return await mp.fetchGQLData(query)
    } catch (error) {
      // console.error('GQL schema:', error.message);
      throw Error(`Failed to fetch GQL schema`)
    }
}

const fetchAvailableDataItems = async (mp) => {
    return await mp.fetchData('/model/J-Engine')
}

export { assetData, assetGQLData, GQLSchema, fetchAvailableDataItems};