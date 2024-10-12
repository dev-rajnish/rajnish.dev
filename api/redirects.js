import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { shortcode } = req.query;

  if (!shortcode) {
    return res.status(400).json({ error: 'Shortcode is required' });
  }

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GSHEET_ID}/values/url!A:B?key=${process.env.GSHEET_API}`);

    const data = await response.json();
    const rows = data.values;
    const row = rows.find(r => r[0] === shortcode);

    if (row) {
      const originalUrl = row[1];
      res.writeHead(301, { Location: originalUrl });
      res.end();
    } else {
      res.status(404).json({ error: 'Shortcode not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from Google Sheets' });
  }
}
