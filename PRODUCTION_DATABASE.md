# 🚀 Production Database Setup

## Current Status
Your app currently uses: `postgresql://postgres:Bhanu%402005@localhost:5432/amd`

## Step 1: Choose a Production Database

### Option A: Neon (Recommended - Free & Easy)
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Click "Create a project"
4. Choose "PostgreSQL" and "Free" plan
5. Name your database: `amd-production`
6. Click "Create project"
7. Copy the connection string from the dashboard

### Option B: Supabase (Also Free)
1. Go to: https://supabase.com
2. Sign up → Create new project
3. Choose your region (closest to your users)
4. Set password and wait for setup (~2 minutes)
5. Go to Settings → Database → Connection string
6. Copy the "URI" (not pooled)

## Step 2: Update Environment Variables

### For Vercel (Production):
Go to: https://vercel.com/bhanuteja005/amd-two/settings/environment-variables

Add:
```
DATABASE_URL=postgresql://[your-connection-string-here]
```

### For Local Testing (Optional):
Update your `.env` file:
```
DATABASE_URL=postgresql://[your-connection-string-here]
```

## Step 3: Run Database Migrations

After setting the DATABASE_URL:

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Step 4: Test Connection

```bash
# Test the connection
npx prisma db push --preview-feature
```

## Example Connection Strings:

**Neon:**
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Supabase:**
```
postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

## Important Notes:

- ✅ **Always use SSL**: Include `?sslmode=require` in your connection string
- ✅ **Never commit secrets**: Keep database URLs in environment variables only
- ✅ **Test locally first**: Update your local `.env` and test before deploying
- ✅ **Backup regularly**: Set up automated backups in your database provider

## Troubleshooting:

**Connection refused?**
- Check if SSL mode is enabled
- Verify credentials are correct
- Ensure database allows connections from your IP (or 0.0.0.0/0 for cloud)

**Migration errors?**
- Run `npx prisma db push` to sync schema
- Check database permissions

**Vercel deployment fails?**
- Ensure DATABASE_URL is set in Vercel environment variables
- Check Vercel build logs for database connection errors