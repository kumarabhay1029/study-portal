/**
 * 🎓 STUDY PORTAL - GOOGLE APPS SCRIPT BACKEND
 * Handles student submissions, file storage, and admin approvals
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this entire code
 * 2. Go to script.google.com
 * 3. Create new project, paste this code
 * 4. Update the CONFIG section below
 * 5. Deploy as web app
 */

// ==========================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ==========================================================================
const CONFIG = {
  // Your actual IDs
  SPREADSHEET_ID: '10N9aWq41i2tqI_eHAEIYvQD0oFT1cS4I8ShYoO_T0rM',
  DRIVE_FOLDER_ID: '1Ai1Kq0GsYFy_gPEc0de4Bc7ZO914a8rf',
  ADMIN_EMAIL: 'studyportal1908@gmail.com',                  // ← Change to your actual email
  ADMIN_PASSWORD: 'admin123',                           // ← Change this password!
  
  // Folder structure in Google Drive
  FOLDERS: {
    PENDING: 'pending-submissions',
    APPROVED: 'approved-content',
    REJECTED: 'rejected-submissions'
  }
};

// ==========================================================================
// MAIN SUBMISSION HANDLER
// ==========================================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Log for debugging
    console.log('Received submission:', data);
    
    // Handle different actions
    if (data.action === 'submit') {
      return handleSubmission(data);
    } else if (data.action === 'approve') {
      return handleApproval(data);
    } else if (data.action === 'reject') {
      return handleRejection(data);
    }
    
    throw new Error('Invalid action');
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse({
      success: false, 
      error: error.toString()
    });
  }
}

// ==========================================================================
// HANDLE NEW SUBMISSIONS
// ==========================================================================
function handleSubmission(data) {
  try {
    // Generate unique submission ID
    const submissionId = 'SUB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    // Save to spreadsheet
    const rowNumber = saveToSpreadsheet(data, submissionId);
    
    // Save file to Google Drive
    let fileUrl = '';
    if (data.fileData && data.fileName) {
      fileUrl = saveFileToDrive(data, submissionId, 'pending');
    }
    
    // Send notification email to admin
    sendNotificationEmail(data, submissionId);
    
    return createResponse({
      success: true,
      submissionId: submissionId,
      message: 'Submission received successfully! Admin will review it soon.'
    });
    
  } catch (error) {
    console.error('Error in handleSubmission:', error);
    return createResponse({
      success: false,
      error: 'Failed to process submission: ' + error.toString()
    });
  }
}

// ==========================================================================
// SAVE TO GOOGLE SPREADSHEET
// ==========================================================================
function saveToSpreadsheet(data, submissionId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getActiveSheet();
    
    // Create headers if first submission
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Submission ID', 'Timestamp', 'Student Name', 'Student ID', 
        'Material Type', 'Subject', 'Title', 'Description', 
        'File Name', 'File Size', 'GitHub Link', 'Status', 
        'Admin Notes', 'Approved Date', 'File URL'
      ];
      sheet.appendRow(headers);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Add submission data
    const row = [
      submissionId,
      new Date(),
      data.studentName || '',
      data.studentId || '',
      data.materialType || '',
      data.subject || '',
      data.title || '',
      data.description || '',
      data.fileName || '',
      data.fileSize || '',
      data.githubLink || '',
      'pending',
      '', // Admin notes (empty initially)
      '', // Approved date (empty initially)
      '' // File URL (will be updated after file upload)
    ];
    
    sheet.appendRow(row);
    return sheet.getLastRow();
    
  } catch (error) {
    console.error('Error saving to spreadsheet:', error);
    throw new Error('Failed to save to spreadsheet');
  }
}

// ==========================================================================
// SAVE FILE TO GOOGLE DRIVE
// ==========================================================================
function saveFileToDrive(data, submissionId, status) {
  try {
    // Get main folder
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Create or get status folder (pending/approved/rejected)
    const statusFolder = getOrCreateFolder(mainFolder, CONFIG.FOLDERS[status.toUpperCase()] || status);
    
    // Create or get material type folder
    const typeFolder = getOrCreateFolder(statusFolder, data.materialType || 'misc');
    
    // Decode base64 file data
    const fileBlob = Utilities.newBlob(
      Utilities.base64Decode(data.fileData),
      data.mimeType || 'application/octet-stream',
      `${submissionId}_${data.fileName}`
    );
    
    // Create file in Drive
    const file = typeFolder.createFile(fileBlob);
    
    // Make file accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Update spreadsheet with file URL
    updateFileUrl(submissionId, file.getUrl());
    
    return file.getUrl();
    
  } catch (error) {
    console.error('Error saving file to Drive:', error);
    throw new Error('Failed to save file to Google Drive');
  }
}

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

function updateFileUrl(submissionId, fileUrl) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === submissionId) {
        sheet.getRange(i + 1, 15).setValue(fileUrl); // File URL column
        break;
      }
    }
  } catch (error) {
    console.error('Error updating file URL:', error);
  }
}

// ==========================================================================
// EMAIL NOTIFICATIONS
// ==========================================================================
function sendNotificationEmail(data, submissionId) {
  try {
    const subject = `📚 New ${data.materialType} Submission - ${data.title}`;
    const body = `
🎓 NEW SUBMISSION RECEIVED

📋 Details:
• Submission ID: ${submissionId}
• Student: ${data.studentName} (${data.studentId || 'N/A'})
• Type: ${data.materialType}
• Subject: ${data.subject}
• Title: ${data.title}
• Description: ${data.description}
• File: ${data.fileName}
• Submitted: ${new Date().toLocaleString()}

🔗 Review and approve at:
${ScriptApp.getService().getUrl()}?action=admin

---
Study Portal Admin System
    `;
    
    MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - email failure shouldn't break submission
  }
}

// ==========================================================================
// GET REQUESTS (For fetching data)
// ==========================================================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getPendingSubmissions') {
      return getPendingSubmissions();
    } else if (action === 'getApprovedContent') {
      return getApprovedContent(e.parameter);
    } else if (action === 'downloadFile') {
      return downloadFile(e.parameter.submissionId);
    } else if (action === 'admin') {
      return getAdminPanel();
    }
    
    return createResponse({success: false, error: 'Invalid action'});
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse({success: false, error: error.toString()});
  }
}

// ==========================================================================
// ADMIN FUNCTIONS
// ==========================================================================
function getPendingSubmissions() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const pendingSubmissions = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === 'pending') { // Status column
        pendingSubmissions.push({
          submissionId: data[i][0],
          timestamp: data[i][1],
          studentName: data[i][2],
          studentId: data[i][3],
          materialType: data[i][4],
          subject: data[i][5],
          title: data[i][6],
          description: data[i][7],
          fileName: data[i][8],
          fileSize: data[i][9],
          githubLink: data[i][10],
          fileUrl: data[i][14]
        });
      }
    }
    
    return createResponse({success: true, data: pendingSubmissions});
    
  } catch (error) {
    console.error('Error getting pending submissions:', error);
    return createResponse({success: false, error: error.toString()});
  }
}

function getApprovedContent(params) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const approvedContent = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === 'approved') { // Status column
        const content = {
          submissionId: data[i][0],
          timestamp: data[i][1],
          studentName: data[i][2],
          materialType: data[i][4],
          subject: data[i][5],
          title: data[i][6],
          description: data[i][7],
          fileName: data[i][8],
          githubLink: data[i][10],
          approvedDate: data[i][13],
          fileUrl: data[i][14]
        };
        
        // Filter by type if specified
        if (!params.type || params.type === content.materialType) {
          approvedContent.push(content);
        }
      }
    }
    
    return createResponse({success: true, data: approvedContent});
    
  } catch (error) {
    console.error('Error getting approved content:', error);
    return createResponse({success: false, error: error.toString()});
  }
}

// ==========================================================================
// APPROVAL/REJECTION HANDLERS
// ==========================================================================
function handleApproval(data) {
  try {
    // Verify admin password
    if (data.adminPassword !== CONFIG.ADMIN_PASSWORD) {
      return createResponse({success: false, error: 'Invalid admin password'});
    }
    
    const submissionId = data.submissionId;
    const adminNotes = data.adminNotes || '';
    
    // Update spreadsheet
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === submissionId) {
        sheet.getRange(i + 1, 12).setValue('approved'); // Status
        sheet.getRange(i + 1, 13).setValue(adminNotes); // Admin notes
        sheet.getRange(i + 1, 14).setValue(new Date()); // Approved date
        
        // Move file from pending to approved folder
        moveFile(submissionId, 'pending', 'approved');
        
        break;
      }
    }
    
    return createResponse({
      success: true,
      message: 'Submission approved successfully!'
    });
    
  } catch (error) {
    console.error('Error in approval:', error);
    return createResponse({success: false, error: error.toString()});
  }
}

function handleRejection(data) {
  try {
    // Verify admin password
    if (data.adminPassword !== CONFIG.ADMIN_PASSWORD) {
      return createResponse({success: false, error: 'Invalid admin password'});
    }
    
    const submissionId = data.submissionId;
    const adminNotes = data.adminNotes || '';
    
    // Update spreadsheet
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === submissionId) {
        sheet.getRange(i + 1, 12).setValue('rejected'); // Status
        sheet.getRange(i + 1, 13).setValue(adminNotes); // Admin notes
        
        // Move file from pending to rejected folder
        moveFile(submissionId, 'pending', 'rejected');
        
        break;
      }
    }
    
    return createResponse({
      success: true,
      message: 'Submission rejected successfully!'
    });
    
  } catch (error) {
    console.error('Error in rejection:', error);
    return createResponse({success: false, error: error.toString()});
  }
}

// ==========================================================================
// FILE MANAGEMENT
// ==========================================================================
function moveFile(submissionId, fromStatus, toStatus) {
  try {
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const fromFolder = mainFolder.getFoldersByName(CONFIG.FOLDERS[fromStatus.toUpperCase()]).next();
    const toFolder = getOrCreateFolder(mainFolder, CONFIG.FOLDERS[toStatus.toUpperCase()]);
    
    // Search all subfolders in the from folder
    const subfolders = fromFolder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      const files = subfolder.getFiles();
      
      while (files.hasNext()) {
        const file = files.next();
        if (file.getName().startsWith(submissionId)) {
          // Create corresponding subfolder in destination
          const typeFolder = getOrCreateFolder(toFolder, subfolder.getName());
          file.moveTo(typeFolder);
          return;
        }
      }
    }
  } catch (error) {
    console.error('Error moving file:', error);
  }
}

// ==========================================================================
// SIMPLE ADMIN PANEL (HTML)
// ==========================================================================
function getAdminPanel() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Study Portal Admin</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .pending-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .approve-btn { background: #28a745; color: white; padding: 8px 16px; border: none; margin-right: 10px; }
        .reject-btn { background: #dc3545; color: white; padding: 8px 16px; border: none; }
        textarea { width: 100%; height: 60px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>📚 Study Portal Admin Panel</h1>
    <div id="submissions"></div>
    
    <script>
        // Admin panel functionality will be here
        // This is a basic version - you can enhance it later
    </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================================================
// TEST FUNCTIONS (For debugging)
// ==========================================================================
function testSubmission() {
  const testData = {
    action: 'submit',
    studentName: 'Test Student',
    studentId: 'TEST123',
    materialType: 'notes',
    subject: 'programming',
    title: 'Test Notes',
    description: 'Test description',
    fileName: 'test.pdf',
    fileSize: 1024,
    fileData: 'dGVzdCBkYXRh', // Base64 for "test data"
    mimeType: 'application/pdf'
  };
  
  const result = handleSubmission(testData);
  console.log('Test result:', result);
}
