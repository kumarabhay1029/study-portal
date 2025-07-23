/**
 * GOOGLE APPS SCRIPT FOR STUDY PORTAL - NOTES UPLOAD
 * Handles note uploads with all user details and file management
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Save and deploy as a web app
 * 5. Set execution as "Me" and access to "Anyone"
 */

function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <h2>📚 Study Portal - Notes Upload API</h2>
      <p style="color: green;">✅ Service is Active and Ready</p>
      <p>Last Updated: ${new Date().toLocaleString()}</p>
      <p>Total Submissions Today: ${getTodaySubmissionCount()}</p>
    </div>
  `);
}

function doPost(e) {
  try {
    console.log('📨 New submission received');
    console.log('Parameters:', e.parameter);
    
    // Extract form data
    const data = {
      name: e.parameter.name || '',
      email: e.parameter.email || '',
      phone: e.parameter.phone || '',
      whatsapp: e.parameter.whatsapp || '',
      upi: e.parameter.upi || '',
      title: e.parameter.title || '',
      noteType: e.parameter.noteType || 'Free',
      price: e.parameter.price || '0',
      fileContent: e.parameter.fileContent || '',
      fileName: e.parameter.fileName || '',
      mimeType: e.parameter.mimeType || ''
    };
    
    // Validate required fields
    const validation = validateSubmission(data);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    // Process the submission
    const result = processNoteSubmission(data);
    
    // Return success response
    return ContentService
      .createTextOutput(`✅ Note uploaded successfully! 
      
📋 Submission ID: ${result.submissionId}
📧 Confirmation email sent to: ${data.email}
⏱️ Processing time: ~24 hours
🔍 Status: Under Review

Thank you for contributing to Study Portal! 🎉`)
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('❌ Error processing submission:', error);
    
    return ContentService
      .createTextOutput(`❌ Upload failed: ${error.message}

Please check your information and try again. If the problem persists, contact support.`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function validateSubmission(data) {
  // Check required fields
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    return { valid: false, message: 'Please provide a valid email address' };
  }
  
  if (!data.phone || data.phone.trim().length < 10) {
    return { valid: false, message: 'Please provide a valid phone number' };
  }
  
  if (!data.whatsapp || data.whatsapp.trim().length < 10) {
    return { valid: false, message: 'Please provide a valid WhatsApp number' };
  }
  
  if (!data.upi || data.upi.trim().length < 5) {
    return { valid: false, message: 'Please provide a valid UPI ID' };
  }
  
  if (!data.title || data.title.trim().length < 5) {
    return { valid: false, message: 'Note title must be at least 5 characters long' };
  }
  
  if (!data.fileContent || !data.fileName) {
    return { valid: false, message: 'Please select a file to upload' };
  }
  
  // Validate paid notes have price
  if (data.noteType === 'Paid' && (!data.price || parseFloat(data.price) <= 0)) {
    return { valid: false, message: 'Please enter a valid price for paid notes' };
  }
  
  return { valid: true };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function processNoteSubmission(data) {
  // Generate unique submission ID
  const submissionId = Utilities.getUuid();
  const timestamp = new Date();
  
  // Get or create spreadsheet
  const spreadsheet = getOrCreateNotesSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  
  // Save file to Drive
  const fileUrl = saveFileToDrive(data, submissionId);
  
  // Prepare row data for spreadsheet
  const rowData = [
    timestamp.toLocaleString(),           // A: Timestamp
    submissionId,                        // B: Submission ID
    data.name,                           // C: Name
    data.email,                          // D: Email
    data.phone,                          // E: Phone
    data.whatsapp,                       // F: WhatsApp
    data.upi,                            // G: UPI ID
    data.title,                          // H: Note Title
    data.noteType,                       // I: Note Type (Free/Paid)
    data.price,                          // J: Price
    data.fileName,                       // K: File Name
    fileUrl,                             // L: File URL
    'Pending',                           // M: Status
    '',                                  // N: Admin Notes
    '',                                  // O: Approval Date
    ''                                   // P: Published URL
  ];
  
  // Add row to spreadsheet
  sheet.appendRow(rowData);
  
  // Send notifications
  sendAdminNotification(data, submissionId, fileUrl);
  sendUserConfirmation(data, submissionId);
  
  // Update statistics
  updateSubmissionStats(data.noteType);
  
  return {
    submissionId: submissionId,
    fileUrl: fileUrl,
    spreadsheetId: spreadsheet.getId()
  };
}

function getOrCreateNotesSpreadsheet() {
  const spreadsheetName = 'Study Portal - Notes Submissions';
  
  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  } else {
    // Create new spreadsheet
    const spreadsheet = SpreadsheetApp.create(spreadsheetName);
    const sheet = spreadsheet.getActiveSheet();
    
    // Set up headers
    const headers = [
      'Timestamp',      // A
      'Submission ID',  // B
      'Name',          // C
      'Email',         // D
      'Phone',         // E
      'WhatsApp',      // F
      'UPI ID',        // G
      'Note Title',    // H
      'Note Type',     // I
      'Price (₹)',     // J
      'File Name',     // K
      'File URL',      // L
      'Status',        // M
      'Admin Notes',   // N
      'Approval Date', // O
      'Published URL'  // P
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    
    // Set column widths
    sheet.setColumnWidth(1, 120); // Timestamp
    sheet.setColumnWidth(2, 120); // Submission ID
    sheet.setColumnWidth(3, 150); // Name
    sheet.setColumnWidth(4, 200); // Email
    sheet.setColumnWidth(8, 250); // Note Title
    sheet.setColumnWidth(11, 200); // File Name
    sheet.setColumnWidth(12, 250); // File URL
    
    return spreadsheet;
  }
}

function saveFileToDrive(data, submissionId) {
  try {
    // Create main folder if it doesn't exist
    const mainFolderName = 'Study Portal - Notes Uploads';
    let mainFolder;
    
    const folders = DriveApp.getFoldersByName(mainFolderName);
    if (folders.hasNext()) {
      mainFolder = folders.next();
    } else {
      mainFolder = DriveApp.createFolder(mainFolderName);
    }
    
    // Create subfolder for this submission
    const subFolderName = `${data.noteType}_${submissionId.substr(0, 8)}`;
    const subFolder = mainFolder.createFolder(subFolderName);
    
    // Decode base64 file
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.fileContent),
      data.mimeType,
      data.fileName
    );
    
    // Create file in Drive
    const file = subFolder.createFile(blob);
    
    // Set file description with metadata
    file.setDescription(`
      📚 Study Portal Note Upload
      👤 Submitted by: ${data.name}
      📧 Email: ${data.email}
      📱 Phone: ${data.phone}
      💬 WhatsApp: ${data.whatsapp}
      💳 UPI: ${data.upi}
      📝 Title: ${data.title}
      💰 Type: ${data.noteType}
      💵 Price: ₹${data.price}
      🆔 Submission ID: ${submissionId}
      📅 Uploaded: ${new Date().toLocaleString()}
    `);
    
    console.log(`📁 File saved: ${data.fileName}`);
    return file.getUrl();
    
  } catch (error) {
    console.error('❌ Error saving file:', error);
    throw new Error('Failed to save file to Drive');
  }
}

function sendAdminNotification(data, submissionId, fileUrl) {
  try {
    // Configure admin email (CHANGE THIS TO YOUR EMAIL)
    const adminEmail = 'your-admin-email@gmail.com';
    
    const subject = `📚 New Note Upload - ${data.title}`;
    
    const body = `
🎉 New note submission received!

📋 SUBMISSION DETAILS:
• ID: ${submissionId}
• Title: ${data.title}
• Type: ${data.noteType}
• Price: ₹${data.price}

👤 SUBMITTER INFORMATION:
• Name: ${data.name}
• Email: ${data.email}
• Phone: ${data.phone}
• WhatsApp: ${data.whatsapp}
• UPI ID: ${data.upi}

📁 FILE INFORMATION:
• File Name: ${data.fileName}
• File URL: ${fileUrl}

⏰ Submitted: ${new Date().toLocaleString()}

🔗 ACTION REQUIRED:
1. Review the submitted note
2. Update status in the spreadsheet
3. Approve or reject the submission

Click here to access the file: ${fileUrl}

---
Study Portal Admin System
    `;
    
    MailApp.sendEmail(adminEmail, subject, body);
    console.log('📧 Admin notification sent');
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}

function sendUserConfirmation(data, submissionId) {
  try {
    const subject = `✅ Note Upload Confirmation - ${data.title}`;
    
    const body = `
Dear ${data.name},

Thank you for submitting your note to Study Portal! 🎉

📋 YOUR SUBMISSION:
• Submission ID: ${submissionId}
• Title: ${data.title}
• Type: ${data.noteType}
• Price: ₹${data.price}
• File: ${data.fileName}

🔍 WHAT'S NEXT:
✓ Your note is now under review
✓ You'll receive an email when it's approved
✓ Typical review time: 24-48 hours
✓ Approved notes will be published on the portal

💰 PAYMENT INFO (for paid notes):
If your note is approved and it's a paid submission, buyers will contact you directly using:
• WhatsApp: ${data.whatsapp}
• UPI ID: ${data.upi}

📞 QUESTIONS?
Reply to this email if you have any questions about your submission.

Thank you for contributing to Study Portal! 📚

Best regards,
Study Portal Team

---
Submission Details:
ID: ${submissionId}
Submitted: ${new Date().toLocaleString()}
    `;
    
    MailApp.sendEmail(data.email, subject, body);
    console.log('📧 User confirmation sent');
    
  } catch (error) {
    console.error('❌ Error sending user confirmation:', error);
  }
}

function updateSubmissionStats(noteType) {
  try {
    const today = new Date().toDateString();
    
    // Get or create stats spreadsheet
    const statsSpreadsheetName = 'Study Portal - Statistics';
    let statsSpreadsheet;
    
    const files = DriveApp.getFilesByName(statsSpreadsheetName);
    if (files.hasNext()) {
      statsSpreadsheet = SpreadsheetApp.openById(files.next().getId());
    } else {
      statsSpreadsheet = SpreadsheetApp.create(statsSpreadsheetName);
      const sheet = statsSpreadsheet.getActiveSheet();
      sheet.getRange(1, 1, 1, 4).setValues([['Date', 'Free Notes', 'Paid Notes', 'Total']]);
    }
    
    const sheet = statsSpreadsheet.getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    // Check if today's row exists
    let todayRow = -1;
    if (lastRow > 1) {
      const dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < dates.length; i++) {
        if (dates[i][0].toString() === today) {
          todayRow = i + 2;
          break;
        }
      }
    }
    
    if (todayRow === -1) {
      // Create new row for today
      sheet.appendRow([today, 0, 0, 0]);
      todayRow = sheet.getLastRow();
    }
    
    // Update counts
    const currentData = sheet.getRange(todayRow, 1, 1, 4).getValues()[0];
    let freeCount = currentData[1] || 0;
    let paidCount = currentData[2] || 0;
    
    if (noteType === 'Free') {
      freeCount++;
    } else {
      paidCount++;
    }
    
    const total = freeCount + paidCount;
    sheet.getRange(todayRow, 1, 1, 4).setValues([[today, freeCount, paidCount, total]]);
    
  } catch (error) {
    console.error('❌ Error updating stats:', error);
  }
}

function getTodaySubmissionCount() {
  try {
    const today = new Date().toDateString();
    const statsSpreadsheetName = 'Study Portal - Statistics';
    
    const files = DriveApp.getFilesByName(statsSpreadsheetName);
    if (!files.hasNext()) return 0;
    
    const statsSpreadsheet = SpreadsheetApp.openById(files.next().getId());
    const sheet = statsSpreadsheet.getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) return 0;
    
    const dates = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    for (let i = 0; i < dates.length; i++) {
      if (dates[i][0].toString() === today) {
        return dates[i][3] || 0; // Return total count
      }
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error getting today\'s count:', error);
    return 0;
  }
}

// Test function - run this to test the script
function testNoteUpload() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    whatsapp: '9876543210',
    upi: 'test@okaxis',
    title: 'Test Note Upload',
    noteType: 'Free',
    price: '0',
    fileContent: '',
    fileName: 'test-note.pdf',
    mimeType: 'application/pdf'
  };
  
  const result = processNoteSubmission(testData);
  console.log('Test result:', result);
}

// Get submission statistics
function getSubmissionStatistics() {
  try {
    const spreadsheet = getOrCreateNotesSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { total: 0, free: 0, paid: 0, pending: 0, approved: 0 };
    }
    
    const data = sheet.getRange(2, 9, lastRow - 1, 5).getValues(); // Note Type and Status columns
    
    let stats = { total: 0, free: 0, paid: 0, pending: 0, approved: 0 };
    
    data.forEach(row => {
      stats.total++;
      
      if (row[0] === 'Free') stats.free++;
      if (row[0] === 'Paid') stats.paid++;
      if (row[4] === 'Pending') stats.pending++;
      if (row[4] === 'Approved') stats.approved++;
    });
    
    console.log('📊 Submission Statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    return { error: error.message };
  }
}
