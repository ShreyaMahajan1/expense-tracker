# Firebase Domain Authorization Setup

## Problem
Getting `Firebase: Error (auth/unauthorized-domain)` when trying to authenticate on deployed app.

## Solution
Add your Vercel deployment domains to Firebase Authentication authorized domains.

## Steps:

### 1. Get Your Vercel Deployment URLs
Check your Vercel dashboard for:
- Production URL: `https://your-app-name.vercel.app`
- Preview URLs: `https://your-app-name-git-branch.vercel.app`

### 2. Add Domains to Firebase Console

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select project: `moneyflow-expense-tracker`

2. **Navigate to Authentication:**
   - Click "Authentication" → "Settings" → "Authorized domains"

3. **Add These Domains:**
   ```
   localhost (already added for development)
   your-app-name.vercel.app
   your-app-name-git-main-username.vercel.app
   ```

### 3. Common Vercel Domain Patterns to Add:
- `expense-tracker-client-shreya.vercel.app` (main production)
- `expense-tracker-client-shreya-git-main-username.vercel.app` (main branch)
- Any custom domains you've configured

### 4. Wildcard Support (if available):
If Firebase supports wildcards in your plan:
- `*.vercel.app` (covers all Vercel deployments)

### 5. Verification:
After adding domains:
1. Wait 5-10 minutes for changes to propagate
2. Try authentication on your deployed app
3. Check browser console for any remaining errors

## Environment Variables to Verify:
Ensure these are set in Vercel dashboard:
```
VITE_FIREBASE_API_KEY=AIzaSyBuFjEZCZ7alP2oz1wgjNWkZmqWle1SULU
VITE_FIREBASE_AUTH_DOMAIN=moneyflow-expense-tracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=moneyflow-expense-tracker
VITE_FIREBASE_STORAGE_BUCKET=moneyflow-expense-tracker.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=329034076762
VITE_FIREBASE_APP_ID=1:329034076762:web:81e9b2307395f1aeda7e63
```

## Troubleshooting:
- **Still getting errors?** Check the exact domain in browser URL bar
- **Preview deployments failing?** Add the specific preview URL
- **Custom domain?** Add both Vercel URL and custom domain
- **HTTPS required:** Only add `https://` domains, not `http://`