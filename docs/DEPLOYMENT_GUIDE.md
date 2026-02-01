# Buildable Deployment Guide

Complete guide for deploying Buildable (Frontend + Backend) to Railway with GitHub.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RAILWAY HOSTING                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────┐         ┌─────────────────────────────┐  │
│   │  FRONTEND SERVICE   │         │     BACKEND SERVICE         │  │
│   │  (Static Site)      │◄───────►│     (Node/Bun Server)       │  │
│   │                     │   API   │                             │  │
│   │  buildable.app      │         │  api.buildable.app          │  │
│   └─────────────────────┘         └─────────────────────────────┘  │
│            │                                   │                    │
│            │                                   │                    │
│            └───────────────┬───────────────────┘                    │
│                            │                                        │
│                            ▼                                        │
│              ┌─────────────────────────────┐                        │
│              │    SUPABASE (Database)      │                        │
│              │    (Existing Cloud Setup)   │                        │
│              └─────────────────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- [GitHub Account](https://github.com)
- [Railway Account](https://railway.app) (linked to GitHub)
- [Bun](https://bun.sh) or Node.js installed locally
- Git installed locally
- Your Supabase credentials (from Lovable Cloud)

---

## Part 1: Backend Repository Setup

### Step 1: Create GitHub Repository

```bash
# Create a new directory for the backend
mkdir buildable-backend
cd buildable-backend

# Initialize git
git init

# Create the repository on GitHub (using GitHub CLI)
gh repo create buildable-backend --private --source=. --remote=origin

# Or manually create on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/buildable-backend.git
```

### Step 2: Copy Backend Files

Copy all files from `docs/backend-repo/` in your Lovable project to your new repository:

```
buildable-backend/
├── src/
│   ├── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── api/
│   │   ├── workspace.ts
│   │   ├── generate.ts
│   │   └── preview.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── pipeline.ts
│   │   │   ├── architect.ts
│   │   │   ├── coder.ts
│   │   │   └── validator.ts
│   │   └── preview/
│   │       └── manager.ts
│   ├── db/
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── queue/
│   │   └── worker.ts
│   ├── utils/
│   │   └── logger.ts
│   └── types/
│       └── database.ts
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
└── README.md
```

### Step 3: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Step 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values (DO NOT commit this file)
```

Required environment variables:
```bash
# Server
NODE_ENV=production
PORT=3000

# Supabase (get from Lovable Cloud settings)
SUPABASE_URL=https://jbhoyxnnyprjebdbeuxi.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # Get from Lovable Cloud

# AI Provider (at least one required)
OPENAI_API_KEY=sk-your-openai-key

# CORS - Your frontend URL
CORS_ORIGINS=https://your-frontend.up.railway.app,https://buildable.app
```

### Step 5: Test Locally

```bash
# Run development server
bun run dev

# Test health endpoint
curl http://localhost:3000/health
```

### Step 6: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial backend setup"

# Push to GitHub
git push -u origin main
```

---

## Part 2: Frontend Repository Setup

### Option A: Use Existing Lovable GitHub Sync

If your Lovable project is already connected to GitHub:

1. Go to **Project Settings → GitHub**
2. Your code is already synced
3. Note the repository URL

### Option B: Create Separate Frontend Repo

```bash
# Clone from Lovable's GitHub sync
git clone https://github.com/YOUR_USERNAME/your-lovable-project.git buildable-frontend
cd buildable-frontend

# Or create new repo and copy files
mkdir buildable-frontend
cd buildable-frontend
git init
# Copy all files from Lovable project
```

### Update Frontend to Use External Backend

Update `src/hooks/useWorkspace.ts` to point to your Railway backend:

```typescript
// Replace this:
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workspace-api`;

// With this:
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend.up.railway.app/api';
```

---

## Part 3: Deploy to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Empty Project"**
4. Name it `buildable`

### Step 2: Deploy Backend Service

```bash
# In Railway dashboard:
1. Click "New Service"
2. Select "GitHub Repo"
3. Choose "buildable-backend"
4. Railway auto-detects Dockerfile
```

**Configure Backend Environment Variables in Railway:**

Click on the backend service → Variables → Add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `SUPABASE_URL` | `https://jbhoyxnnyprjebdbeuxi.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `(your service role key)` |
| `OPENAI_API_KEY` | `sk-...` |
| `CORS_ORIGINS` | `https://your-frontend.up.railway.app` |

**Generate Domain:**
1. Click on backend service → Settings → Networking
2. Click "Generate Domain"
3. Note the URL: `https://buildable-backend-xxx.up.railway.app`

### Step 3: Deploy Frontend Service

```bash
# In Railway dashboard:
1. Click "New Service" in same project
2. Select "GitHub Repo"  
3. Choose your frontend repo
```

**Configure Frontend Build Settings:**

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Start Command | `npx serve dist -s` |
| Watch Paths | `/src/**` |

**Configure Frontend Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_BACKEND_URL` | `https://buildable-backend-xxx.up.railway.app/api` |
| `VITE_SUPABASE_URL` | `https://jbhoyxnnyprjebdbeuxi.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Generate Domain:**
1. Click on frontend service → Settings → Networking
2. Click "Generate Domain"
3. Or add custom domain

### Step 4: Update CORS

After getting your frontend URL, update backend CORS:

```bash
# In Railway backend service → Variables
CORS_ORIGINS=https://buildable-frontend-xxx.up.railway.app,https://yourdomain.com
```

---

## Part 4: Custom Domains (Optional)

### Backend Custom Domain

1. In Railway backend service → Settings → Networking
2. Click "Custom Domain"
3. Enter: `api.buildable.app`
4. Add CNAME record in your DNS:
   ```
   CNAME api.buildable.app → buildable-backend-xxx.up.railway.app
   ```

### Frontend Custom Domain

1. In Railway frontend service → Settings → Networking
2. Click "Custom Domain"
3. Enter: `buildable.app`
4. Add CNAME record in your DNS:
   ```
   CNAME buildable.app → buildable-frontend-xxx.up.railway.app
   ```

---

## Part 5: Verify Deployment

### Test Backend

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

### Test Frontend

1. Open `https://your-frontend.up.railway.app`
2. Login with your credentials
3. Create a project
4. Send a prompt
5. Verify generation works

### Check Logs

```bash
# Railway CLI
railway logs --service buildable-backend

# Or in Railway dashboard: Click service → View Logs
```

---

## Part 6: CI/CD Pipeline

Railway automatically deploys on push to main. For more control:

### GitHub Actions (Backend)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up --service buildable-backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Get Railway Token

1. Railway Dashboard → Account Settings → Tokens
2. Create new token
3. Add to GitHub: Repo → Settings → Secrets → `RAILWAY_TOKEN`

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
railway logs --service buildable-backend

# Common issues:
# - Missing environment variables
# - Port mismatch (Railway assigns PORT automatically)
# - Supabase connection failed
```

### CORS errors

```bash
# Ensure CORS_ORIGINS includes your frontend URL
# Check no trailing slashes
# Restart backend after changing
```

### Database connection issues

```bash
# Verify Supabase URL and service key
# Check if IP is allowlisted in Supabase (if using connection pooling)
```

### Frontend can't reach backend

```bash
# Check VITE_BACKEND_URL is correct
# Ensure backend is running (check health endpoint)
# Check browser console for errors
```

---

## Cost Estimation

### Railway Pricing (as of 2024)

| Resource | Free Tier | Pro ($5/month) |
|----------|-----------|----------------|
| Execution Hours | 500 hrs/month | Unlimited |
| Memory | 512 MB | 8 GB |
| Bandwidth | 100 GB | Unlimited |
| Deployments | Unlimited | Unlimited |

**Estimated Monthly Cost:**
- Frontend (static): ~$0-5
- Backend (Node): ~$5-20 (depends on usage)
- **Total: ~$5-25/month**

---

## Next Steps

1. ✅ Backend deployed to Railway
2. ✅ Frontend deployed to Railway
3. ✅ Custom domains configured
4. ⬜ Set up monitoring (Sentry, LogRocket)
5. ⬜ Configure Redis for job queue (optional)
6. ⬜ Set up preview server infrastructure (E2B/Modal)

---

## Quick Reference

| Service | URL |
|---------|-----|
| Frontend | `https://buildable.app` |
| Backend API | `https://api.buildable.app` |
| Supabase | `https://jbhoyxnnyprjebdbeuxi.supabase.co` |
| Railway Dashboard | `https://railway.app/project/xxx` |

| Command | Description |
|---------|-------------|
| `railway up` | Deploy current directory |
| `railway logs` | View service logs |
| `railway status` | Check deployment status |
| `railway open` | Open project in browser |
