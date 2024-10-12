import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Your Google Sheets API credentials
const YOUR_GOOGLE_SHEET_AUTH = 'AIzaSyCXmMCqNqYHkE7ttfsktdAUdKAgWnNVo6E'; // Use API Key method here
const YOUR_SPREADSHEET_ID = '1dWUL3W7p5Wff_cvXQwd-hD3-kP4A2Y4glcK72XoIkfo';

export default async function handler(req, res) {
  const { shortcode } = req.query; // Get the shortcode from the query parameters

  try {
    const response = await sheets.spreadsheets.values.get({
      auth: YOUR_GOOGLE_SHEET_AUTH,
      spreadsheetId: YOUR_SPREADSHEET_ID,
      range: 'url!A:B', // Use the correct range
    });

    const rows = response.data.values;
    const foundRow = rows.find(row => row[0] === shortcode); // Assuming shortcode is in the first column

    if (foundRow) {
      const originalUrl = foundRow[1]; // Assuming original URL is in the second column
      return res.redirect(originalUrl); // Redirect to the original URL
    } else {
      return res.status(404).json({ error: 'Shortcode not found' });
    }
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
