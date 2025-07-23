# 🚀 Google Apps Script Integration Setup Guide

## 📋 Overview
Your Study Portal now has complete Google Apps Script integration! This allows direct submission of files and data to Google Sheets and Google Drive, with automated email notifications.

## 🎯 What You Get

### ✅ **Complete Integration**
- **Direct API Integration**: No iframe embedding needed
- **File Upload**: Direct upload to Google Drive with automatic organization
- **Data Management**: Automatic Google Sheets creation and management
- **Email Notifications**: Automatic emails to admin and submitters
- **Professional UI**: Beautiful, responsive submission forms

### 📊 **Data Organization**
- Separate spreadsheets for each content type (Notes, Assignments, Projects, Research)
- Organized file storage in Google Drive folders
- Unique submission IDs for tracking
- Status tracking (pending, approved, rejected)

## 🔧 Setup Instructions

### Step 1: Deploy Google Apps Script

1. **Go to Google Apps Script**: [script.google.com](https://script.google.com)

2. **Create New Project**:
   - Click "New Project"
   - Delete the default code
   - Copy and paste the code from `google-apps-script.js`

3. **Configure Settings**:
   ```javascript
   // In the script, update this line with your admin email:
   const adminEmail = 'your-admin-email@gmail.com';
   ```

4. **Save and Deploy**:
   - Click "Save" (💾)
   - Click "Deploy" → "New deployment"
   - Set type: "Web app"
   - Description: "Study Portal API"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - **Copy the deployment URL** (this is your script URL)

### Step 2: Update Your Portal

1. **Update Script URL**: 
   - Open `js/google-script-api.js`
   - Replace the `scriptUrl` with your deployment URL:
   ```javascript
   this.scriptUrl = 'YOUR_DEPLOYMENT_URL_HERE';
   ```

2. **Test Integration**:
   - Open `google-script-integration.html` in your browser
   - Try submitting a test form
   - Check Google Sheets and Drive for the data

### Step 3: Integration Options

#### Option A: Replace Main Portal Forms
Update your main `index.html` to use the Google Apps Script:

```javascript
// In js/google-forms-manager.js, change:
this.integrationMode = 'script'; // Uses Google Apps Script
```

#### Option B: Keep Both Options
Keep both Google Forms and Apps Script available:

```javascript
// Users can choose between embedded forms or script integration
this.integrationMode = 'forms'; // Uses Google Forms iframes
```

## 📱 **Usage Workflow**

### For Users:
1. **Click Submit Button** → Opens professional submission form
2. **Fill Form** → Title, subject, description, contact info
3. **Upload Files** → Drag & drop or click to select (supports multiple files)
4. **Submit** → Instant confirmation message
5. **Email Confirmation** → Automatic confirmation email sent

### For Admin (You):
1. **Email Notification** → Instant notification of new submissions
2. **Review in Sheets** → All data organized in Google Sheets
3. **Access Files** → Files automatically saved to Google Drive
4. **Approve/Reject** → Update status in spreadsheet
5. **Publish** → Add approved content to portal

## 📊 **Google Sheets Structure**

Each content type gets its own spreadsheet with columns:
- **Timestamp**: When submitted
- **Submission ID**: Unique identifier
- **Type**: notes/assignments/projects/research
- **Tier**: free/premium/standard
- **Title**: Content title
- **Subject**: Subject category
- **Description**: Content description
- **Submitter Name**: User's name
- **Email**: User's email
- **Payment Reference**: For premium submissions
- **File Count**: Number of uploaded files
- **Status**: pending/approved/rejected
- **Admin Notes**: Your review notes

## 📁 **Google Drive Organization**

Files are automatically organized:
```
📁 Google Drive
  └── 📁 notes_SUBMISSION_ID
      ├── 📄 file1.pdf
      ├── 📄 file2.docx
      └── 📄 file3.png
  └── 📁 assignments_SUBMISSION_ID
      └── 📄 assignment.pdf
```

## 🔒 **Security Features**

- **File Size Limits**: Configurable per content type
- **File Type Validation**: Only allowed file types accepted
- **Email Validation**: Proper email format required
- **Input Sanitization**: All inputs validated and sanitized
- **Unique IDs**: Prevents duplicate submissions

## 🎨 **Customization Options**

### File Size Limits:
```javascript
// In google-script-api.js
this.formConfigs = {
    notes: {
        free: { maxSize: 10 * 1024 * 1024 },    // 10MB
        premium: { maxSize: 50 * 1024 * 1024 }  // 50MB
    },
    assignments: { maxSize: 25 * 1024 * 1024 }, // 25MB
    // ... customize as needed
};
```

### Email Templates:
Edit the email templates in `google-apps-script.js`:
- `sendNotificationEmail()` - Admin notification
- `sendConfirmationEmail()` - User confirmation

### Form Fields:
Add custom fields by modifying both:
- HTML forms in `google-script-integration.html`
- Data processing in `google-script-api.js`

## 📈 **Analytics & Monitoring**

### Built-in Analytics:
- Submission counts per type
- File upload statistics
- User engagement metrics
- Error tracking and logging

### Custom Reports:
Run this function in Google Apps Script:
```javascript
getSubmissionStats(); // Returns detailed statistics
```

## 🛠️ **Troubleshooting**

### Common Issues:

1. **Script Not Receiving Data**:
   - Check deployment URL is correct
   - Ensure script is deployed as "Anyone" can access
   - Check browser console for errors

2. **Files Not Uploading**:
   - Verify file size limits
   - Check file type restrictions
   - Ensure Google Drive has enough storage

3. **Emails Not Sending**:
   - Verify admin email address in script
   - Check Gmail quota limits
   - Confirm email permissions

### Debug Mode:
Add this to your script for debugging:
```javascript
function debugMode() {
    console.log('Debug: Script is running');
    // Test with sample data
}
```

## 🚀 **Going Live**

### Production Checklist:
- [ ] Google Apps Script deployed and tested
- [ ] Admin email configured correctly
- [ ] File size limits set appropriately
- [ ] All form validations working
- [ ] Email notifications functioning
- [ ] Drive folder permissions correct
- [ ] Mobile responsiveness verified
- [ ] Error handling tested

### Performance Optimization:
- [ ] Implement caching for large files
- [ ] Set up batch processing for multiple submissions
- [ ] Monitor Google Apps Script quotas
- [ ] Regular backup of spreadsheet data

## 📞 **Support & Maintenance**

### Regular Tasks:
- Monitor Google Sheets for new submissions
- Review and approve/reject content
- Back up important data
- Check Google Apps Script execution logs
- Update file size limits as needed

### Monthly Review:
- Check submission statistics
- Review user feedback
- Update form fields if needed
- Optimize script performance

---

## 🎉 **You're All Set!**

Your Study Portal now has enterprise-level content management with:
- ✅ Professional submission forms
- ✅ Automatic file organization
- ✅ Email notifications
- ✅ Data tracking and analytics
- ✅ Mobile-responsive design
- ✅ Scalable architecture

**Test the system with a few submissions and you'll see how professional and efficient it is!** 🚀
