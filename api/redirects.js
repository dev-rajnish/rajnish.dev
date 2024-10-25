
const YOUR_SPREADSHEET_ID = process.env.GSHEET_ID;
const YOUR_API_KEY = process.env.GSHEET_API;

export default async function handler(req, res) {
  const { shortcode } = req.query; // Get the shortcode from the query parameters

  try {
    // Fetch values from Google Sheets using the API URI method
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${YOUR_SPREADSHEET_ID}/values/url!A:B?key=${YOUR_API_KEY}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const rows = data.values;

    // Check if any row matches the shortcode
    const foundRow = rows?.find(row => row[0] === shortcode); // Assuming shortcode is in the first column

    if (foundRow) {
      const originalUrl = foundRow[1]; // Assuming original URL is in the second column
      return res.redirect(originalUrl); // Redirect to the original URL
    } else {
      return res.redirect(`https://http.cat/${res.status}`);
    }
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return res.redirect(`https://http.cat/${res.status}`);
  }
}
