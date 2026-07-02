/**
 * Mean Green Window Clean — Google Sheets lead capture backend.
 *
 * Setup: see SETUP.md in this project for step-by-step instructions.
 * This script receives POSTs from the website's quote tool and contact
 * form, and appends each one as a row in a sheet called "Leads".
 */

function doPost(e) {
  var sheet = getLeadsSheet_();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.source || '',
    data.name || '',
    data.email || '',
    data.phone || '',
    data.address || '',
    data.property_type || '',
    data.num_windows || '',
    data.stories || '',
    data.service_type || '',
    data.frequency || '',
    (data.extras || []).join(', '),
    data.estimated_low || '',
    data.estimated_high || '',
    data.message || '',
    data.status || 'New'
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Mean Green Window Clean leads endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Source', 'Name', 'Email', 'Phone', 'Address',
      'Property Type', 'Windows', 'Stories', 'Service Type', 'Frequency',
      'Extras', 'Estimated Low', 'Estimated High', 'Message', 'Status'
    ]);
  }
  return sheet;
}
