/**
 * GOOGLE APPS SCRIPT FOR STUDY PORTAL
 * This script handles form submissions from your Study Portal
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Save and deploy as a web app
 * 5. Copy the deployment URL to your HTML
 */

// Main function to handle GET and POST requests
function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <h2>📚 Study Portal API</h2>
    <p>This Google Apps Script handles submissions from the Study Portal.</p>
    <p>Status: <span style="color: green;">✅ Active</span></p>
    <p>Last Updated: ${new Date().toLocaleString()}</p>
  `);
}

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the submission
    console.log('New submission received:', data);
    
    // Process the submission based on type
    const result = processSubmission(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Submission processed successfully',
        submissionId: result.submissionId,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing submission: ' + error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processSubmission(data) {
  // Get the appropriate spreadsheet based on submission type
  const spreadsheet = getOrCreateSpreadsheet(data.type);
  const sheet = spreadsheet.getActiveSheet();
  
  // Generate submission ID
  const submissionId = Utilities.getUuid();
  
  // Prepare the row data
  const rowData = [
    new Date().toLocaleString(), // Timestamp
    submissionId,               // Submission ID
    data.type,                  // Type (notes, assignments, etc.)
    data.tier || 'standard',    // Tier (free, premium, standard)
    data.title,                 // Title
    data.subject,               // Subject
    data.description,           // Description
    data.name,                  // Submitter name
    data.email,                 // Submitter email
    data.paymentReference || '', // Payment reference
    data.files ? data.files.length : 0, // File count
    'pending',                  // Status
    ''                          // Admin notes
  ];
  
  // Add the row to the spreadsheet
  sheet.appendRow(rowData);
  
  // Process files if any
  if (data.files && data.files.length > 0) {
    processFiles(data.files, submissionId, data.type);
  }
  
  // Send notification email
  sendNotificationEmail(data, submissionId);
  
  // Send confirmation email to submitter
  sendConfirmationEmail(data, submissionId);
  
  return {
    submissionId: submissionId,
    spreadsheetId: spreadsheet.getId()
  };
}

function getOrCreateSpreadsheet(type) {
  const spreadsheetName = `Study Portal - ${type.charAt(0).toUpperCase() + type.slice(1)} Submissions`;
  
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
      'Timestamp',
      'Submission ID',
      'Type',
      'Tier',
      'Title',
      'Subject',
      'Description',
      'Submitter Name',
      'Email',
      'Payment Reference',
      'File Count',
      'Status',
      'Admin Notes'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    
    return spreadsheet;
  }
}

function processFiles(files, submissionId, type) {
  try {
    // Create a folder for this submission
    const folderName = `${type}_${submissionId}`;
    const folder = DriveApp.createFolder(folderName);
    
    // Process each file
    files.forEach((file, index) => {
      try {
        // Decode base64 file data
        const blob = Utilities.newBlob(
          Utilities.base64Decode(file.data),
          file.type,
          file.name
        );
        
        // Create the file in Drive
        const driveFile = folder.createFile(blob);
        
        console.log(`File ${index + 1} processed: ${file.name}`);
        
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
      }
    });
    
    console.log(`All files processed for submission ${submissionId}`);
    
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

function sendNotificationEmail(data, submissionId) {
  try {
    // Configure admin email (change this to your email)
    const adminEmail = 'your-admin-email@gmail.com';
    
    const subject = `📚 New ${data.type} submission - ${data.title}`;
    
    const body = `
      New submission received for Study Portal!
      
      📋 Submission Details:
      • ID: ${submissionId}
      • Type: ${data.type}
      • Tier: ${data.tier || 'standard'}
      • Title: ${data.title}
      • Subject: ${data.subject}
      • Submitter: ${data.name} (${data.email})
      
      📝 Description:
      ${data.description}
      
      💳 Payment Reference: ${data.paymentReference || 'N/A'}
      📁 Files: ${data.files ? data.files.length : 0}
      
      🕒 Submitted: ${new Date().toLocaleString()}
      
      Please review and approve/reject this submission.
    `;
    
    MailApp.sendEmail(adminEmail, subject, body);
    
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

function sendConfirmationEmail(data, submissionId) {
  try {
    const subject = `✅ Submission Confirmed - ${data.title}`;
    
    const body = `
      Dear ${data.name},
      
      Thank you for your submission to Study Portal!
      
      📋 Your Submission:
      • ID: ${submissionId}
      • Type: ${data.type}
      • Title: ${data.title}
      • Subject: ${data.subject}
      
      🔍 What's Next:
      • Your submission is now under review
      • You'll receive an email when it's approved
      • Typical review time: 24-48 hours
      
      📞 Questions?
      Reply to this email if you have any questions.
      
      Thank you for contributing to Study Portal!
      
      Best regards,
      Study Portal Team
    `;
    
    MailApp.sendEmail(data.email, subject, body);
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Utility function to test the script
function testScript() {
  const testData = {
    type: 'notes',
    tier: 'free',
    title: 'Test Notes',
    subject: 'computer-science',
    description: 'This is a test submission',
    name: 'Test User',
    email: 'test@example.com',
    files: []
  };
  
  const result = processSubmission(testData);
  console.log('Test result:', result);
}

// Function to set up triggers (run once)
function setupTriggers() {
  // Clean up existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Add any recurring triggers if needed
  console.log('Triggers set up complete');
}

// Function to get submission statistics
function getSubmissionStats() {
  const types = ['notes', 'assignments', 'projects', 'research'];
  const stats = {};
  
  types.forEach(type => {
    try {
      const spreadsheet = getOrCreateSpreadsheet(type);
      const sheet = spreadsheet.getActiveSheet();
      const lastRow = sheet.getLastRow();
      
      stats[type] = {
        total: Math.max(0, lastRow - 1), // Subtract header row
        spreadsheetId: spreadsheet.getId()
      };
      
    } catch (error) {
      stats[type] = { total: 0, error: error.message };
    }
  });
  
  console.log('Submission Statistics:', stats);
  return stats;
}
