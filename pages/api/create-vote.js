const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

export default async function handler(req, res) {
  const {
    query: { id, type, iteration }
  } = req;

  try {
    if (!id) {
      throw new Error('Missing id');
    }
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
    });

    await doc.getInfo()
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    let smallestValue = rows[0].Appeared;
    let smallValueRowItems = ''
    if (type === 'ONCLICK') {
      rows[iteration].Appeared = 1;
      await rows[iteration].save();
      if (iteration == 0) {
        rows[iteration].Selected = 1;
        await rows[iteration].save();
      } else {
        rows[iteration].Selected = 1;
        await rows[iteration].save();
      }
    }
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].Appeared <= smallestValue) {
          smallestValue = rows[i].Appeared;
          smallValueRowItems = rows[i]
          if (smallestValue == 0)
            break;
        }
      }
    }
    if (type === 'ONLOAD') {
      if (!iteration) {
        rows[smallValueRowItems._sheet._rawProperties.index].Appeared = 1;
        await rows[smallValueRowItems._sheet._rawProperties.index].save();
      } else {
        rows[iteration].Appeared = 1;
        await rows[iteration].save();
      }
    }
    // Creating data for client
    const sheetData = {
      headerValues: smallValueRowItems._sheet.headerValues,
      rawData: smallValueRowItems._rawData,
      rowNumber: smallValueRowItems._rowNumber,
    }

    const lastCount = rows.length === Number(iteration) + 1
    return res.status(200).json({ message: 'A ok!', data: sheetData, options: [sheetData.rawData[3], sheetData.rawData[4]], iteration, lastCount });
  } catch (error) {
    console.log("error", error)
    res.status(500).json(error);
  }
}
