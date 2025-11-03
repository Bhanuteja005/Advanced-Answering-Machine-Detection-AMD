# 🚀 Quick Vercel OAuth Fix

## Problem
Your production app (`https://amd-two.vercel.app`) is trying to connect to `localhost:3000` instead of your production URL.

## Solution (3 Steps)

### Step 1: Add Environment Variables to Vercel
Go to: **https://vercel.com/bhanuteja005/amd-two/settings/environment-variables**

Add these variables:
```
NEXT_PUBLIC_BETTER_AUTH_URL=https://amd-two.vercel.app
BETTER_AUTH_URL=https://amd-two.vercel.app
BETTER_AUTH_SECRET=generate-a-new-random-secret-here
```

### Step 2: Update Google OAuth
Go to: https://console.cloud.google.com/apis/credentials
- Click on your OAuth 2.0 Client ID
- Add to **Authorized redirect URIs**:
  ```
  https://amd-two.vercel.app/api/auth/callback/google
  ```

### Step 3: Set Up Production Database
You need a production database (not localhost). Choose:

**Neon (Free & Easy)**:
1. Sign up: https://neon.tech
2. Create project → Copy connection string
3. Add to Vercel as `DATABASE_URL`

**Supabase**:
1. Sign up: https://supabase.com
2. New project → Copy connection string
3. Add to Vercel as `DATABASE_URL`

### Step 4: Test
After adding all variables and pushing a new commit:
- Open https://amd-two.vercel.app/login
- Click "Continue with Google"
- Should work without localhost errors!

## Need Help?
If you still see errors, check Vercel build logs for missing environment variables.