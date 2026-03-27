# Enrico's Restaurant - Deployment Guide

## Overview
This guide will walk you through deploying your Enrico's Restaurant loyalty app to Vercel with PostgreSQL database.

## Prerequisites
- GitHub account (to push your code)
- Vercel account (free at vercel.com)
- PostgreSQL database (we'll use Vercel Postgres or external service)

---

## Step 1: Prepare Your Local Code

### 1.1 Install Dependencies
```bash
cd c:\Users\enric\Desktop\enricos
npm install
```

### 1.2 Set Up Local PostgreSQL (Optional but Recommended)

#### Using Docker (Easiest):
```bash
docker run --name enricos-db \
  -e POSTGRES_DB=enricos_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:latest
```

#### Using Windows PostgreSQL Installer:
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password

### 1.3 Update .env.local
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enricos_db"
RESEND_API_KEY=your_actual_resend_key
```

### 1.4 Initialize Database
```bash
npm run db:push
```

### 1.5 Test Locally
```bash
npm run dev
```
Visit http://localhost:3000 to verify everything works.

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository
```bash
cd c:\Users\enric\Desktop\enricos
git init
git add .
git commit -m "Initial commit: migrate to PostgreSQL and Prisma"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com/new
2. Name it "enricos" (or your preferred name)
3. Click "Create repository"

### 2.3 Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/enricos.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Find and select your "enricos" repository
5. Click "Import"

### 3.2 Configure Environment Variables
In Vercel project settings, add:

```
DATABASE_URL=your_postgres_connection_string
RESEND_API_KEY=your_resend_api_key
```

**Important**: Don't use the test Resend key - you need a real one for production.

### 3.3 Deploy
1. Vercel will automatically build your project
2. Prisma will generate the client automatically
3. Database schema will be created on deploy

---

## Step 4: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended for Vercel users)

1. In Vercel dashboard, go to **Storage** → **Create Database** → **Postgres**
2. Create a database (select region closest to your users)
3. Copy the connection string
4. Add to Vercel environment variables as `DATABASE_URL`
5. Redeploy

### Option B: External PostgreSQL Service

Popular options:
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (https://supabase.com) - PostgreSQL + extras
- **Railway** (https://railway.app) - Simple deployment
- **PlanetScale** - MySQL alternative

Steps for any service:
1. Create a PostgreSQL database
2. Get connection string from admin panel
3. Add to Vercel environment variables as `DATABASE_URL`

---

## Step 5: Run Database Migrations

After database is set up, run migrations on your deployed app:

1. Go to Vercel dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Temporarily add `DATABASE_URL` for migration
5. In terminal, run:
```bash
npx prisma db push
```

Or use Vercel CLI:
```bash
vercel env pull
npx prisma db push
```

---

## Troubleshooting

### "DATABASE_URL is not set"
- Check Vercel environment variables are configured
- Redeploy after adding the variable

### "Connection refused"
- Verify PostgreSQL service is running
- Check DATABASE_URL is correct format: `postgresql://user:password@host:port/database`

### "P3021: Foreign key constraint failed"
- Delete all data and retry
- Or reset database from provider dashboard

### Build fails with Prisma errors
- Ensure `prisma` and `@prisma/client` are in dependencies (already done)
- Run `npm install` locally to verify

---

## Post-Deployment Checklist

- [ ] Site loads without errors (https://your-project.vercel.app)
- [ ] Can register new account
- [ ] Can login with created account
- [ ] Points can be added/redeemed
- [ ] Admin panel works
- [ ] Email sends on registration (check spam folder)
- [ ] Database changes persist after redeploy

---

## Ongoing Maintenance

### Update Database Schema
If you change `prisma/schema.prisma`:

Local:
```bash
npm run db:push
```

Production:
```bash
vercel env pull
npx prisma db push
```

### View Database with Prisma Studio
```bash
npm run db:studio
```
(Only works locally or with connection string)

### Update Environment Variables
1. Go to Vercel dashboard
2. Project → Settings → Environment Variables
3. Update and redeploy

---

## Important Security Notes

⚠️ **Never commit `.env.local` to GitHub**
⚠️ **Keep RESEND_API_KEY secret** - don't share it
⚠️ **Use strong passwords** for database accounts
⚠️ **Enable Vercel Analytics** to monitor app health
⚠️ **Backup your database regularly**

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs/
- Neon Docs: https://neon.tech/docs/
- Supabase Docs: https://supabase.com/docs

---

## What Changed in This Migration

### Before (SQLite):
- ❌ Data stored in local `data/` folder
- ❌ Lost data on redeploy
- ❌ No security for transactions
<br>

### After (PostgreSQL + Prisma):
- ✅ Data stored in cloud database
- ✅ Data persists permanently
- ✅ Secure transactions
- ✅ Easy scaling
- ✅ Automatic backups available
<br>

**Your app is now production-ready!** 🚀
