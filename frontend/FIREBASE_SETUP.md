# Firebase Setup Guide for Kids Money App

## Current Status
- **Firebase Authentication**: ✅ Working (signup/login work correctly)
- **Firestore Database**: ❌ Not Working (requests timing out)

## Issue
All Firestore operations (adding kids, creating tasks, etc.) are failing with timeout errors. This typically happens when:
1. Firestore database hasn't been created in the Firebase Console
2. Firestore security rules are too restrictive

## Steps to Fix

### Step 1: Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **child-fund-a531b**
3. In the left sidebar, click **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (we'll add proper rules later)
6. Select a location closest to your users (e.g., `us-central`, `europe-west1`)
7. Click **Done**

### Step 2: Apply Security Rules
Once Firestore is created:
1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace the existing rules with the contents of `/app/frontend/firestore.rules`
3. Click **Publish**

### Step 3: Verify Email/Password Auth
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Ensure **Email/Password** is enabled

## Security Rules Explanation
The rules in `firestore.rules` ensure:
- Only authenticated users can access data
- Parents can only access kids they created
- All collections require authentication

## For Production
Before deploying to production, you should:
1. Add stricter rules that verify parent ownership for each collection
2. Consider using Firebase Cloud Functions for sensitive operations (like PIN hashing)
3. Enable Firestore persistence for offline support

## Testing After Setup
1. Go to the app: https://finlit-firebase-app.preview.emergentagent.com
2. Create a new account (signup)
3. Try adding a child - this time it should persist
4. Navigate to Tasks and create a task
5. Test kid login with the child's PIN
