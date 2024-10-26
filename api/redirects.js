const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GSHEET_ID;

const GOOGLE_SHEETS_API_KEY = process.env.GSHEET_API;

const GOOGLE_SHEET_URL = `
https://sheets.googleapis.com/v4/spreadsheets/\
${GOOGLE_SHEETS_SPREADSHEET_ID}/values/url!A:B?\
key=${GOOGLE_SHEETS_API_KEY}
`
/**
 * Fetches data from Google Sheets using the API URI method
 * @param {string} shortcode - The shortcode to search for
 * @returns {Promise<object[]>} - The rows of data from Google Sheets
 */

async function fetchGoogleSheetsData(customSlug) {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    throw error;
  }
}

/**
 * Redirects to the original URL if a matching shortcode is found
 * @param {object} req - The request object
 * @param {object} res - The response object
 */

async function handleCustomSlugRedirect(req, res) {
  const customSlug = req.query.customSlug;
  const data = await fetchGoogleSheetsData(customSlug);
  const rows = data.values;

  if (!rows) {
    throw new Error('No data found');
  }

  const foundRow = rows.find(row => row[0] === customSlug);
  if (foundRow) {
    const originalUrl = foundRow[1];
    return res.status(302).redirect(originalUrl);
  } else {
    return res.status(404).redirect(`https://http.cat/404`);
  }
}

/**
 * Handles errors and redirects to a generic error page
 * @param {object} err - The error object
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
function handleError(err, req, res) {
  console.error('Error:', err);
  return res.status(500).redirect(`https://http.cat/500`);
}

export default async function handler(req, res) {
  try {
    await handleCustomSlugRedirect(req, res);
  } catch (err) {
    handleError(err, req, res);
  }
}
