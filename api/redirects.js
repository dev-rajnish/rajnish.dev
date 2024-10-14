// const fetch = (await import('node-fetch')).default;
const YOUR_SPREADSHEET_ID = '1dWUL3W7p5Wff_cvXQwd-hD3-kP4A2Y4glcK72XoIkfo';
// const YOUR_API_KEY = 'AIzaSyCXmMCqNqYHkE7ttfsktdAUdKAgWnNVo6E'; // Use your actual API Key here
const YOUR_API_KEY = process.env.GSHEET_API;

export default async function handler(req, res) {
  const { shortcode } = req.query; // Extract shortcode from the query parameters
  const requestedPath = req.url; // The path user is trying to access

  try {
    // 1. Try to access the requested path dynamically
    const pathResponse = await fetch(`https://${req.headers.host}${requestedPath}`);

    if (pathResponse.ok) {
      return res.redirect(requestedPath); // If the path exists, redirect to it
    }
  } catch (err) {
    // Ignore the error and proceed to Google Sheets lookup if the path doesn't exist
  }

  try {
    // 2. Fetch values from Google Sheets if the path does not exist
    const sheetResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${YOUR_SPREADSHEET_ID}/values/url!A:B?key=${YOUR_API_KEY}`);

    if (!sheetResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await sheetResponse.json();
    const rows = data.values;

    // 3. Check if any row matches the shortcode
    const foundRow = rows?.find(row => row[0] === shortcode); // Assuming shortcode is in the first column

    if (foundRow) {
      const originalUrl = foundRow[1]; // Assuming original URL is in the second column
      return res.redirect(originalUrl); // Redirect to the original URL if found in Google Sheets
    } else {
      // 4. If not found in Google Sheets, display 404
      return res.status(404).redirect('https://http.cat/404'); // Serve 404 from http.cat
    }
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
