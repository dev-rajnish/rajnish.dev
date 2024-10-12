import { google } from 'googleapis';

// Use dynamic import for node-fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch'));
})();

const sheets = google.sheets('v4');

// Your Google Sheets API credentials
const YOUR_SPREADSHEET_ID = '1dWUL3W7p5Wff_cvXQwd-hD3-kP4A2Y4glcK72XoIkfo';

// Create a GoogleAuth instance using your API key
const auth = new google.auth.GoogleAuth({
  apiKey: 'AIzaSyCXmMCqNqYHkE7ttfsktdAUdKAgWnNVo6E', // Use your actual API Key here
});

export default async function handler(req, res) {
  const { shortcode } = req.query; // Get the shortcode from the query parameters

  try {
    // Obtain the auth client
    const client = await auth.getClient();

    // Fetch values from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: YOUR_SPREADSHEET_ID,
      range: 'url!A:B', // Use the correct range
    });

    const rows = response.data.values;

    // Check if any row matches the shortcode
    const foundRow = rows?.find(row => row[0] === shortcode); // Assuming shortcode is in the first column

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
