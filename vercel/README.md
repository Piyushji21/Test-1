# Mobile Info Finder Pro - Vercel Deployment Guide

This folder contains everything you need to deploy Mobile Info Finder Pro to Vercel with a free PostgreSQL database.

## 📁 Folder Structure

```
vercel/
├── api/
│   ├── index.js       # Search API endpoint (serverless function)
│   └── protect.js     # Protect number API endpoint (serverless function)
├── public/
│   ├── index.html     # Main search page
│   └── protect.html   # Protect number page
├── package.json       # Dependencies
├── vercel.json        # Vercel configuration
└── README.md          # This file
```

## 🚀 Deployment Steps

### Step 1: Create a Free Neon PostgreSQL Database

1. Go to [Neon](https://neon.tech) and sign up for a free account
2. Create a new project (choose a name like "mobile-info-finder")
3. Copy your database connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
   ```
4. Keep this connection string handy - you'll need it in Step 3

### Step 2: Create the Database Table

1. In your Neon dashboard, open the SQL Editor
2. Run this SQL command to create the required table:

```sql
CREATE TABLE protected_numbers (
  id SERIAL PRIMARY KEY,
  number VARCHAR(10) NOT NULL UNIQUE,
  protected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'protected'
);
```

3. Click "Run" to execute the query

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Navigate to this vercel folder:
   ```bash
   cd vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. When prompted, configure the project:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Select your account
   - **Link to existing project?** → No
   - **Project name?** → mobile-info-finder (or any name you like)
   - **Directory?** → ./  (current directory)
   
6. Add your database connection string as an environment variable:
   ```bash
   vercel env add DATABASE_URL
   ```
   - Paste your Neon database connection string
   - Select: Production, Preview, and Development

7. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via Vercel Website

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository (or upload the vercel folder)
4. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** Select the `vercel` folder if prompted
   - **Build Command:** Leave empty (no build needed)
   - **Output Directory:** Leave empty

5. Add environment variable:
   - Click "Environment Variables"
   - Add:
     - **Name:** `DATABASE_URL`
     - **Value:** Your Neon connection string
   - Click "Add"

6. Click "Deploy"

### Step 4: Verify Deployment

1. Once deployed, Vercel will give you a URL like: `https://mobile-info-finder.vercel.app`
2. Visit your URL and test:
   - Try searching for a mobile number
   - Try protecting a number at `/protect.html`

## 🔧 Configuration Details

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | `postgresql://user:pass@host.neon.tech/db` |

### API Endpoints

- **GET `/api`** - Search for mobile number information
  - Query param: `number` (10-digit mobile number)
  - Example: `/api?number=1234567890`

- **POST `/api/protect`** - Protect a mobile number
  - Body: `{"number": "1234567890"}`
  - Returns: Success/error message

### Database Schema

The `protected_numbers` table structure:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-incrementing primary key |
| number | VARCHAR(10) | 10-digit mobile number (unique) |
| protected_at | TIMESTAMP | When the number was protected |
| status | VARCHAR(50) | Protection status (default: 'protected') |

## 🎨 Customization

### Updating the Design

1. Edit files in the `public/` folder:
   - `public/index.html` - Main search page
   - `public/protect.html` - Protect number page

2. Redeploy:
   ```bash
   vercel --prod
   ```

### Updating API Logic

1. Edit files in the `api/` folder:
   - `api/index.js` - Search endpoint
   - `api/protect.js` - Protect endpoint

2. Redeploy:
   ```bash
   vercel --prod
   ```

## 🆓 Free Tier Limits

### Neon PostgreSQL
- **Storage:** 0.5 GB
- **Compute:** Shared CPU, auto-suspends after 5 minutes of inactivity
- **Connections:** Sufficient for most use cases
- **Cost:** 100% FREE

### Vercel
- **Bandwidth:** 100 GB/month
- **Serverless Function Execution:** 100 GB-hours/month
- **Deployments:** Unlimited
- **Cost:** 100% FREE for personal projects

## 🐛 Troubleshooting

### "Database connection failed"
- Check that `DATABASE_URL` environment variable is set correctly in Vercel
- Verify your Neon database is active (it auto-suspends after 5 minutes of inactivity)
- Make sure the connection string includes `?sslmode=require`

### "Table does not exist"
- Make sure you ran the CREATE TABLE SQL command in Step 2
- Check the table name is `protected_numbers` (all lowercase)

### API not responding
- Check Vercel function logs in your dashboard
- Verify the API routes are deployed correctly
- Make sure the `vercel.json` configuration is present

## 📝 Notes

- The app uses serverless functions, so there may be a slight delay on the first request (cold start)
- The database auto-suspends after 5 minutes of inactivity on the free tier
- All HTML/CSS/JS files are served as static files for optimal performance
- CORS is enabled by default for API endpoints

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL pg Library](https://node-postgres.com/)

## ✅ Success!

Your Mobile Info Finder Pro should now be live and accessible from anywhere! 🎉

Visit your Vercel URL to start using it!
