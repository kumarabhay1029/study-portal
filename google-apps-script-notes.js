/**
 * 🎓 STUDY PORTAL - NOTES UPLOAD SYSTEM
 * Google Apps Script for handling notes uploads with approval workflow
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create new project, paste this code
 * 3. Update the CONFIG section below with your actual IDs
 * 4. Deploy as web app with execute permissions for "Anyone"
 * 5. Use the web app URL in your notes.html form
 */

// ==========================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ==========================================================================
const CONFIG = {
  // Google Sheets ID for tracking submissions
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  
  // Google Drive folder ID for storing notes
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',
  
  // Admin email for notifications
  ADMIN_EMAIL: 'studyportal1908@gmail.com',
  
  // Folder structure in Google Drive
  FOLDERS: {
    PENDING: 'pending-notes',
    APPROVED: 'approved-notes',
    REJECTED: 'rejected-notes'
  }
};

// ==========================================================================
// MAIN UPLOAD HANDLER
// ==========================================================================
function doPost(e) {
  try {
    console.log('Notes upload request received');
    
    // Set CORS headers for web requests
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    
    // Handle preflight requests
    if (e.parameter === undefined || Object.keys(e.parameter).length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'No data received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Extract form data
    const formData = {
      studentName: e.parameter.studentName || '',
      studentEmail: e.parameter.studentEmail || '',
      semester: e.parameter.semester || '',
      subject: e.parameter.subject || '',
      notesTitle: e.parameter.notesTitle || '',
      description: e.parameter.description || '',
      privacyConsent: e.parameter.privacyConsent || '',
      termsConsent: e.parameter.termsConsent || '',
      submissionDate: e.parameter.submissionDate || new Date().toISOString()
    };
    
    // Validate required fields
    const requiredFields = ['studentName', 'studentEmail', 'semester', 'subject', 'notesTitle'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate consent
    if (formData.privacyConsent !== 'yes' || formData.termsConsent !== 'yes') {
      throw new Error('Privacy policy and terms of use consent required');
    }
    
    // Process file upload
    let fileId = null;
    let fileName = null;
    
    if (e.parameter.notesFile) {
      const fileBlob = e.parameter.notesFile;
      if (fileBlob && typeof fileBlob.getBytes === 'function') {
        const result = saveFileToGoogleDrive(fileBlob, formData);
        fileId = result.fileId;
        fileName = result.fileName;
      }
    }
    
    // Save to spreadsheet
    const submissionId = saveSubmissionToSheet(formData, fileId, fileName);
    
    // Send email notification to admin
    sendAdminNotification(formData, submissionId, fileName);
    
    // Send confirmation email to student
    sendStudentConfirmation(formData, submissionId);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Notes uploaded successfully! You will receive an email notification once approved.',
        submissionId: submissionId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Upload error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================================================
// FILE HANDLING FUNCTIONS
// ==========================================================================
function saveFileToGoogleDrive(fileBlob, formData) {
  try {
    // Get or create main folder
    const mainFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_ID, 'Study Portal Notes');
    
    // Get or create pending folder
    const pendingFolder = getOrCreateFolder(mainFolder.getId(), CONFIG.FOLDERS.PENDING);
    
    // Create filename with timestamp and student info
    const timestamp = new Date().toISOString().slice(0, 10);
    const cleanTitle = formData.notesTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const fileName = `${timestamp}_${formData.semester}sem_${cleanTitle}_${formData.studentName.replace(/\s+/g, '_')}`;
    
    // Save file to pending folder
    const file = pendingFolder.createFile(fileBlob.setName(fileName));
    
    // Set file description with metadata
    file.setDescription(`
      Student: ${formData.studentName}
      Email: ${formData.studentEmail}
      Semester: ${formData.semester}
      Subject: ${formData.subject}
      Title: ${formData.notesTitle}
      Description: ${formData.description}
      Uploaded: ${formData.submissionDate}
      Status: Pending Approval
    `);
    
    return {
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl()
    };
    
  } catch (error) {
    console.error('File save error:', error);
    throw new Error('Failed to save file to Google Drive: ' + error.toString());
  }
}

function getOrCreateFolder(parentId, folderName) {
  const parent = DriveApp.getFolderById(parentId);
  const existingFolders = parent.getFoldersByName(folderName);
  
  if (existingFolders.hasNext()) {
    return existingFolders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

// ==========================================================================
// SPREADSHEET FUNCTIONS
// ==========================================================================
function saveSubmissionToSheet(formData, fileId, fileName) {
  try {
    const sheet = getOrCreateSheet();
    const submissionId = 'NS' + Date.now(); // Notes Submission ID
    
    const rowData = [
      submissionId,
      new Date(formData.submissionDate),
      formData.studentName,
      formData.studentEmail,
      formData.semester,
      formData.subject,
      formData.notesTitle,
      formData.description,
      fileName || 'No file',
      fileId || 'No file',
      'Pending', // Status
      '', // Admin Comments
      '', // Approval Date
      'NO', // Approved (YES/NO)
      formData.privacyConsent,
      formData.termsConsent
    ];
    
    sheet.appendRow(rowData);
    
    return submissionId;
    
  } catch (error) {
    console.error('Spreadsheet save error:', error);
    throw new Error('Failed to save submission record: ' + error.toString());
  }
}

function getOrCreateSheet() {
  let spreadsheet;
  
  try {
    spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (error) {
    // Create new spreadsheet if ID is invalid
    spreadsheet = SpreadsheetApp.create('Study Portal - Notes Submissions');
    console.log('Created new spreadsheet:', spreadsheet.getId());
  }
  
  let sheet = spreadsheet.getSheetByName('Notes Submissions');
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Notes Submissions');
    
    // Add headers
    const headers = [
      'Submission ID',
      'Submission Date',
      'Student Name',
      'Student Email',
      'Semester',
      'Subject',
      'Notes Title',
      'Description',
      'File Name',
      'File ID',
      'Status',
      'Admin Comments',
      'Approval Date',
      'Approved',
      'Privacy Consent',
      'Terms Consent'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4fc3f7');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidth(1, 120); // Submission ID
    sheet.setColumnWidth(3, 150); // Student Name
    sheet.setColumnWidth(4, 200); // Student Email
    sheet.setColumnWidth(7, 250); // Notes Title
    sheet.setColumnWidth(8, 300); // Description
  }
  
  return sheet;
}

// ==========================================================================
// EMAIL NOTIFICATION FUNCTIONS
// ==========================================================================
function sendAdminNotification(formData, submissionId, fileName) {
  try {
    const subject = `📚 New Notes Submission - ${formData.notesTitle}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4fc3f7, #29b6f6); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">📚 New Notes Submission</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
          <h3 style="color: #333; margin-top: 0;">Submission Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Submission ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Student Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.studentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.studentEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Semester:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.semester}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Notes Title:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.notesTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Description:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.description || 'No description provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">File:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${fileName || 'No file uploaded'}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Next Steps:</h4>
            <ol style="margin: 0; color: #666;">
              <li>Review the uploaded notes file in Google Drive</li>
              <li>Open the Google Sheets to approve or reject</li>
              <li>Change the "Approved" column to "YES" or "NO"</li>
              <li>Student will be automatically notified</li>
            </ol>
          </div>
          
          <div style="margin-top: 20px;">
            <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}" 
               style="background: #4fc3f7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               📊 Open Spreadsheet
            </a>
          </div>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      subject,
      '', // Plain text version
      {
        htmlBody: htmlBody,
        name: 'Study Portal System'
      }
    );
    
    console.log('Admin notification sent successfully');
    
  } catch (error) {
    console.error('Admin email error:', error);
    // Don't throw error - upload should still succeed even if email fails
  }
}

function sendStudentConfirmation(formData, submissionId) {
  try {
    const subject = `✅ Notes Submission Received - ${formData.notesTitle}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">✅ Submission Received</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
          <p>Dear ${formData.studentName},</p>
          
          <p>Thank you for submitting your study notes! Your submission has been received and is now under review.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Submission Details:</h4>
            <ul style="margin: 0; color: #666;">
              <li><strong>Submission ID:</strong> ${submissionId}</li>
              <li><strong>Notes Title:</strong> ${formData.notesTitle}</li>
              <li><strong>Subject:</strong> ${formData.subject}</li>
              <li><strong>Semester:</strong> ${formData.semester}</li>
            </ul>
          </div>
          
          <h4 style="color: #333;">What happens next?</h4>
          <ol style="color: #666;">
            <li>Our team will review your notes for quality and relevance</li>
            <li>You'll receive an email notification with the approval status</li>
            <li>If approved, your notes will be published on the portal</li>
            <li>If rejected, you'll receive feedback for improvement</li>
          </ol>
          
          <p>Review typically takes 1-3 business days. Thank you for contributing to our study community!</p>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 5px;">
            <p style="margin: 0; color: #27ae60; font-weight: bold;">
              📚 Keep sharing knowledge and help your fellow students succeed!
            </p>
          </div>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(
      formData.studentEmail,
      subject,
      '', // Plain text version
      {
        htmlBody: htmlBody,
        name: 'Study Portal System'
      }
    );
    
    console.log('Student confirmation sent successfully');
    
  } catch (error) {
    console.error('Student email error:', error);
    // Don't throw error - upload should still succeed even if email fails
  }
}

// ==========================================================================
// APPROVAL WORKFLOW FUNCTIONS
// ==========================================================================
function checkForApprovals() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName('Notes Submissions');
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const approved = row[13]; // Approved column
      const status = row[10]; // Status column
      
      if ((approved === 'YES' || approved === 'NO') && status === 'Pending') {
        processApproval(sheet, i + 1, row, approved === 'YES');
      }
    }
    
  } catch (error) {
    console.error('Approval check error:', error);
  }
}

function processApproval(sheet, rowIndex, rowData, isApproved) {
  try {
    const submissionId = rowData[0];
    const studentEmail = rowData[3];
    const notesTitle = rowData[6];
    const fileId = rowData[9];
    
    // Update status
    const newStatus = isApproved ? 'Approved' : 'Rejected';
    sheet.getRange(rowIndex, 11).setValue(newStatus); // Status column
    sheet.getRange(rowIndex, 13).setValue(new Date()); // Approval date
    
    // Move file if exists
    if (fileId && fileId !== 'No file') {
      moveFile(fileId, isApproved);
    }
    
    // Send notification email
    sendApprovalNotification(studentEmail, submissionId, notesTitle, isApproved);
    
    console.log(`Processed approval for ${submissionId}: ${newStatus}`);
    
  } catch (error) {
    console.error('Process approval error:', error);
  }
}

function moveFile(fileId, isApproved) {
  try {
    const file = DriveApp.getFileById(fileId);
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    const targetFolderName = isApproved ? CONFIG.FOLDERS.APPROVED : CONFIG.FOLDERS.REJECTED;
    const targetFolder = getOrCreateFolder(mainFolder.getId(), targetFolderName);
    
    // Move file to target folder
    targetFolder.addFile(file);
    
    // Remove from pending folder
    const pendingFolder = getOrCreateFolder(mainFolder.getId(), CONFIG.FOLDERS.PENDING);
    pendingFolder.removeFile(file);
    
    console.log(`File moved to ${targetFolderName}`);
    
  } catch (error) {
    console.error('File move error:', error);
  }
}

function sendApprovalNotification(studentEmail, submissionId, notesTitle, isApproved) {
  try {
    const status = isApproved ? 'Approved' : 'Rejected';
    const emoji = isApproved ? '✅' : '❌';
    const color = isApproved ? '#27ae60' : '#e74c3c';
    
    const subject = `${emoji} Notes Submission ${status} - ${notesTitle}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">${emoji} Submission ${status}</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
          <p>Your notes submission has been <strong>${status.toLowerCase()}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <ul style="margin: 0; color: #666;">
              <li><strong>Submission ID:</strong> ${submissionId}</li>
              <li><strong>Notes Title:</strong> ${notesTitle}</li>
              <li><strong>Status:</strong> ${status}</li>
            </ul>
          </div>
          
          ${isApproved ? 
            '<p style="color: #27ae60;">🎉 Congratulations! Your notes are now available on the Study Portal for all students to access.</p>' :
            '<p style="color: #e74c3c;">Your submission did not meet our quality standards. Please review and resubmit with improvements.</p>'
          }
          
          <p>Thank you for contributing to our study community!</p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(
      studentEmail,
      subject,
      '', // Plain text version
      {
        htmlBody: htmlBody,
        name: 'Study Portal System'
      }
    );
    
    console.log(`Approval notification sent to ${studentEmail}`);
    
  } catch (error) {
    console.error('Approval notification error:', error);
  }
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function setupTriggers() {
  // Create trigger to check for approvals every 5 minutes
  ScriptApp.newTrigger('checkForApprovals')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('Approval trigger created');
}

function testUpload() {
  // Test function for debugging
  const testData = {
    studentName: 'Test Student',
    studentEmail: 'test@example.com',
    semester: '1',
    subject: 'Programming in C',
    notesTitle: 'Test Notes',
    description: 'Test description',
    privacyConsent: 'yes',
    termsConsent: 'yes',
    submissionDate: new Date().toISOString()
  };
  
  const submissionId = saveSubmissionToSheet(testData, null, null);
  console.log('Test submission created:', submissionId);
}
