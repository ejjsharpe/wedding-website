import type { APIRoute } from 'astro';
import { google } from 'googleapis';
import { RSVPFormSchema, type RSVPForm, type SheetRow } from '../../types/rsvp';

export const prerender = false;

// Google Sheets configuration
const SPREADSHEET_ID = import.meta.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function appendToSheet(rows: SheetRow[]) {
  try {
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const values = rows.map(row => [
      row.timestamp,
      row.contactEmail,
      row.guestName,
      row.attending,
      row.dietaryRequirements,
      row.message
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    throw new Error('Failed to save RSVP data');
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the form data
    const validationResult = RSVPFormSchema(body);
    
    if (validationResult.problems) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid form data: ' + validationResult.problems.map(p => p.message).join(', ')
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = validationResult.data as RSVPForm;
    const timestamp = new Date().toISOString();

    // Convert form data to sheet rows (one row per guest)
    const sheetRows: SheetRow[] = formData.guests.map(guest => ({
      timestamp,
      contactEmail: formData.contactEmail,
      guestName: guest.name,
      attending: guest.attending ? 'Yes' : 'No',
      dietaryRequirements: guest.attending ? (guest.dietaryRequirements || 'None') : 'N/A',
      message: formData.message || ''
    }));

    // Save to Google Sheets
    await appendToSheet(sheetRows);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'RSVP submitted successfully!'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('RSVP API Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to submit RSVP. Please try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};