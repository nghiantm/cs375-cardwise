# Firebase Client Setup Guide

This guide will help you set up Firebase Authentication for Google sign-in in the CardWise client.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase Authentication enabled in your project
3. Google sign-in provider enabled

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to the **"Your apps"** section
6. If you don't have a web app, click **"</>" (Add app)** and select **Web**
7. Copy the configuration values from the `firebaseConfig` object

## Step 2: Enable Google Sign-In Provider

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google**
3. Toggle **Enable** to ON
4. Enter your project support email
5. Click **Save**

## Step 3: Configure Environment Variables

Create a `.env` file in the `client/` directory with the following:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration.

## Step 4: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your development domain (e.g., `localhost`)
3. For production, add your deployed domain (e.g., `drexel-cardwise.vercel.app`)

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Login or Signup page
3. Click "Sign in with Google" or "Sign Up with Google"
4. You should see a Google sign-in popup
5. After signing in, you should be redirected to the dashboard

## Troubleshooting

### "Firebase is not configured" error
- Make sure all `VITE_FIREBASE_*` environment variables are set in your `.env` file
- Restart your development server after adding environment variables
- Check that the variable names start with `VITE_` (required for Vite)

### Popup blocked
- Allow popups for your localhost domain
- Check browser settings for popup blockers

### "Firebase authentication failed" error
- Verify your Firebase project ID matches in both client and server
- Check that Google sign-in provider is enabled in Firebase Console
- Ensure your domain is in the authorized domains list

### Backend errors
- Make sure `FIREBASE_SERVICE_ACCOUNT` is configured in your server `.env`
- Verify the Firebase Admin SDK is properly initialized on the server

## Production Deployment

When deploying to production:

1. Add your production domain to Firebase Authorized domains
2. Update `VITE_API_URL` in your production environment
3. Set all `VITE_FIREBASE_*` variables in your hosting platform's environment settings
4. Rebuild your app: `npm run build`

## Security Notes

- Never commit your `.env` file to version control (it's already in `.gitignore`)
- Keep your Firebase API keys secure
- Use Firebase App Check in production for additional security
- Regularly rotate your Firebase service account keys

