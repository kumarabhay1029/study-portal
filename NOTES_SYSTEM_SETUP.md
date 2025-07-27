# 📋 Notes Upload System - Complete Setup Guide

## 🎯 System Overview

Your notes upload system includes:
- **Student Upload Form** (`notes.html`) - Students upload notes with privacy consent
- **Google Apps Script Backend** (`google-apps-script.js`) - Handles file storage and emails  
- **Admin Panel** (`notes-admin.html`) - Review and approve submissions
- **Google Drive Storage** - Organized file storage
- **Email Notifications** - Admin gets notified of new submissions

## 🔧 Step-by-Step Setup

### Step 1: Deploy Google Apps Script

1. **Copy the Google Apps Script Code**
   - Open `google-apps-script.js` from your project
   - Copy the entire code content

2. **Create New Google Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Delete the default code
   - Paste your copied code

3. **Configure the Settings**
   - Update the CONFIG section in the script:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
     DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE', 
     ADMIN_EMAIL: 'youremail@gmail.com',
     ADMIN_PASSWORD: 'your_secure_password',
     
     FOLDERS: {
       PENDING: 'pending-submissions',
       APPROVED: 'approved-content', 
       REJECTED: 'rejected-submissions'
     }
   };
   ```

### Step 2: Create Google Drive Folder

1. **Create Main Folder**
   - Go to [drive.google.com](https://drive.google.com)
   - Create a new folder named "Study Portal Notes"
   - Copy the folder ID from the URL

2. **Get Folder ID**
   - Open the folder
   - Copy the ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Use this ID in your script CONFIG

### Step 3: Create Google Spreadsheet

1. **Create New Spreadsheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "Notes Submissions Tracker"
   - Copy the spreadsheet ID from URL

2. **Get Spreadsheet ID**
   - From URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Use this ID in your script CONFIG

### Step 4: Deploy the Script

1. **Deploy as Web App**
   - In your Apps Script project, click "Deploy" → "New deployment"
   - Choose type: "Web app"
   - Description: "Notes Upload System"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"

2. **Copy Web App URL**
   - Copy the provided web app URL
   - It will look like: `https://script.google.com/macros/s/SCRIPT_ID/exec`

### Step 5: Update Your HTML Files

1. **Update notes.html**
   - Open `notes.html`
   - Find line: `const GOOGLE_APPS_SCRIPT_URL = 'YOUR_DEPLOYED_SCRIPT_URL_HERE';`
   - Replace with your actual web app URL

2. **Update notes-admin.html**
   - Open `notes-admin.html`
   - Find line: `const GOOGLE_APPS_SCRIPT_URL = 'YOUR_DEPLOYED_SCRIPT_URL_HERE';`
   - Replace with your actual web app URL

### Step 6: Test the System

1. **Test Student Upload**
   - Open `notes.html` in browser
   - Fill out the form with test data
   - Upload a test file
   - Check privacy policy and submit

2. **Check Email Notification**
   - Check your admin email for notification
   - Should receive email with submission details

3. **Check Google Drive**
   - Go to your Google Drive folder
   - Should see new "pending-submissions" folder
   - Should contain your uploaded file

4. **Check Spreadsheet**
   - Open your Google Spreadsheet
   - Should see new row with submission data

5. **Test Admin Panel**
   - Open `notes-admin.html`
   - Enter your admin password (from CONFIG)
   - Should see pending submission
   - Test approve/reject functionality

## 📧 Email Configuration

The system automatically sends emails to your admin email when:
- New submission is received
- Includes student details and file information
- No additional setup required (uses your Google account)

## 🔐 Security Features

- **Admin Password Protection** - Only authorized users can approve
- **File Type Validation** - Only PDF, DOC, DOCX, TXT allowed
- **File Size Limits** - Maximum 10MB per file
- **Privacy Policy Consent** - Required before upload
- **Secure File Storage** - Files stored in your private Google Drive

## 📁 File Organization

Your Google Drive will be organized as:
```
Study Portal Notes/
├── pending-submissions/
│   ├── notes/
│   ├── summary/ 
│   └── tutorial/
├── approved-content/
│   ├── notes/
│   ├── summary/
│   └── tutorial/
└── rejected-submissions/
    ├── notes/
    └── (rejected files)
```

## 🔄 Workflow Process

1. **Student Submits** → File goes to `pending-submissions`
2. **Admin Gets Email** → Notification with details
3. **Admin Reviews** → Via admin panel
4. **Admin Approves** → File moves to `approved-content` 
5. **Notes Appear** → Available on website for all students

## 🛠️ Troubleshooting

### Common Issues:

1. **"Script URL not configured" message**
   - Update the GOOGLE_APPS_SCRIPT_URL in both HTML files

2. **Permission errors**
   - Make sure script is deployed with "Anyone" access
   - Check Google Drive and Sheets permissions

3. **Files not uploading**
   - Check file size (max 10MB)
   - Verify file type (PDF, DOC, DOCX, TXT only)
   - Check browser console for errors

4. **No email notifications**
   - Verify admin email in CONFIG
   - Check spam folder
   - Ensure script has Gmail permissions

5. **Admin panel not working**
   - Verify admin password in CONFIG
   - Check browser console for errors
   - Test script URL directly

## 📞 Testing Checklist

- [ ] Google Apps Script deployed successfully
- [ ] Google Drive folder created and ID updated
- [ ] Google Spreadsheet created and ID updated  
- [ ] Script URL updated in both HTML files
- [ ] Test file upload works
- [ ] Email notification received
- [ ] File appears in Google Drive
- [ ] Data appears in spreadsheet
- [ ] Admin panel login works
- [ ] Approve/reject functions work
- [ ] Approved notes appear on website

## 🎉 Success!

Once all steps are complete, your notes upload system will be fully functional:

- Students can upload notes with privacy consent
- You'll receive email notifications
- Files are securely stored in Google Drive
- You can review and approve via admin panel
- Approved notes automatically appear on your website

Your study portal now has a complete content management system! 🚀
