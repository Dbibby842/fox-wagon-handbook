/**
 * Fox Group – Wagon Fitters Handbook
 * Compliance Register – Apps Script Web App
 *
 * Receives signed submissions from the mobile handbook app and appends them
 * to the Google Sheet below. Nothing here is secret; all writes happen
 * under YOUR Google account because the Web App is deployed as "Execute as: Me".
 *
 * ---- How to deploy (one-time, ~2 minutes) ----
 *   1. Open https://script.google.com → New project
 *   2. Delete everything in the editor, paste THIS file's contents in
 *   3. File → Rename → "Wagon Fitters Compliance Register"
 *   4. Click Deploy → New deployment
 *      • Type (the gear icon): Web app
 *      • Description: Compliance Register v1
 *      • Execute as: Me (derick@foxgroup.co)
 *      • Who has access: Anyone
 *      • Click Deploy → Authorise access → paste the "Web app URL"
 *        back into the chat so I can wire it into the handbook app.
 */

const SPREADSHEET_ID = '1ZQY3iTmTgP8v-CuM7XH3AL_aJja5-bw1x2Og1jL1i04';
const SHEET_NAME     = 'Register';
const HANDBOOK_VER   = 'FG1.0 (January 2025)';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const name = (data.name || '').toString().trim();
    const empId = (data.employeeId || '').toString().trim();
    const ack = data.acknowledged === true || data.acknowledged === 'true';

    if (!name || !ack) {
      return json({ ok: false, error: 'Missing name or acknowledgement' });
    }

    const now = new Date();
    const ukTime = Utilities.formatDate(now, 'Europe/London', "yyyy-MM-dd HH:mm:ss 'UK'");
    const certId = 'FG-' + Utilities.getUuid().slice(0, 8).toUpperCase();

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      ukTime,
      name,
      empId,
      'I have read and understood the Wagon Fitters Handbook',
      data.handbookVersion || HANDBOOK_VER,
      data.userAgent || '',
      data.pageUrl || '',
      certId
    ]);

    return json({
      ok: true,
      certificateId: certId,
      timestampUk: ukTime
    });

  } catch (err) {
    return json({ ok: false, error: err.toString() });
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Fox Group compliance register endpoint. Use POST.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
