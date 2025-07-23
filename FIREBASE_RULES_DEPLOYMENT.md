# Firebase Security Rules Deployment Guide

This directory contains Firebase security rules for the Study Portal application.

## Files

- `firestore.rules` - Firestore database security rules
- `storage.rules` - Firebase Storage security rules

## Deployment Instructions

### 1. Firestore Rules

Deploy the Firestore rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Or copy the content of `firestore.rules` and paste it in the Firebase Console:
1. Go to Firebase Console → Firestore Database → Rules
2. Replace the existing rules with the content from `firestore.rules`
3. Click "Publish"

### 2. Storage Rules

Deploy the Storage rules using the Firebase CLI:

```bash
firebase deploy --only storage
```

Or copy the content of `storage.rules` and paste it in the Firebase Console:
1. Go to Firebase Console → Storage → Rules
2. Replace the existing rules with the content from `storage.rules`
3. Click "Publish"

## Rule Features

### Firestore Rules
- **Public Read**: Only approved notes are readable by everyone
- **Authenticated Upload**: Only signed-in users can upload notes
- **Admin Operations**: Only admins can approve/reject notes
- **Data Validation**: Strict validation for all note fields
- **File Size Limits**: 10MB maximum file size

### Storage Rules
- **Public Read**: Approved note files are publicly accessible
- **Authenticated Upload**: Only signed-in users can upload files
- **File Type Restriction**: Only PDF files are allowed
- **Size Limit**: 10MB maximum file size

## Admin Setup

To create admin users, use the Firebase Admin SDK or add documents manually to the `admins` collection in Firestore with the user's UID as the document ID.

Example admin document:
```json
{
  "role": "admin",
  "createdAt": "2025-01-01T00:00:00Z",
  "permissions": ["notes.approve", "notes.reject", "notes.delete"]
}
```
