
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

export default async function handler(req, res) {
    try {
        const {
            query: { type }
        } = req;
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
        });
        // Getting Docs
        await doc.getInfo()
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        if (type === 'UPDATE') {
            rows.map(async (_, index) => {
                rows[index]['Selected'] = 0;
                rows[index]['Appeared'] = 0;
                await rows[index].save();
            })
            return res.status(200).json({ message: 'A ok!' });
        }
        return res.status(500).json({ message: 'Something went wrong' });
    } catch (error) {
        console.log(error)
    }

}   