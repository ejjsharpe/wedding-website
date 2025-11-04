import type { APIRoute } from "astro";
import { google } from "googleapis";
import { type } from "arktype";
import { RSVPFormSchema, type SheetRow } from "../../types/rsvp";

export const prerender = false;

interface EnvSchema {
  GOOGLE_SPREADSHEET_ID: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
}

async function appendToSheet(rows: SheetRow[], env: EnvSchema) {
  const {
    GOOGLE_SPREADSHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY,
  } = env;
  try {
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const values = rows.map((row) => [
      row.timestamp,
      row.firstName,
      row.lastName,
      row.rsvp,
      row.ceremony,
      row.reception,
      row.dietaryRequirements,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: "A:G",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error writing to Google Sheets:", error);
    throw new Error("Failed to save RSVP data");
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate the form data
    const validationResult = RSVPFormSchema(body);

    if (validationResult instanceof type.errors) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid form data: " + validationResult.summary,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const formData = validationResult;
    const timestamp = new Date().toISOString();

    // Convert form data to sheet rows (one row per guest)
    const sheetRows: SheetRow[] = formData.guests.map((guest) => ({
      timestamp,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvp: guest.rsvp ? "accept" : "decline",
      ceremony:
        guest.rsvp === true && guest.eventsAttending.includes("ceremony")
          ? 1
          : 0,
      reception:
        guest.rsvp === true && guest.eventsAttending.includes("reception")
          ? 1
          : 0,
      dietaryRequirements:
        guest.rsvp === true ? guest.dietaryRequirements || "None" : "N/A",
    }));

    // Save to Google Sheets
    // @ts-expect-error untyped env
    await appendToSheet(sheetRows, locals.runtime.env);

    return new Response(
      JSON.stringify({
        success: true,
        message: "RSVP submitted successfully!",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("RSVP API Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
