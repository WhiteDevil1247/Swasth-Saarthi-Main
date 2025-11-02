# 🚀 Swasth Saarthi - Deployment Guide

## 📋 Deployment Options

### 1. **Vercel (Frontend) + Render (Backend)** ⭐ RECOMMENDED
### 2. **Netlify (Frontend) + Railway (Backend)**
### 3. **AWS (Full Stack)**
### 4. **Heroku (Full Stack)**
### 5. **DigitalOcean Droplet (Full Stack)**

---

## ⭐ Option 1: Vercel + Render (FREE TIER)

### 🎯 Architecture:
```
Frontend (Vercel) → Backend (Render) → Database (Neon/MongoDB Atlas)
```

### A. Deploy Frontend to Vercel

#### Step 1: Prepare Frontend
```bash
cd swasthsaathi-frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login
```

#### Step 2: Configure Build
Create `vercel.json` in `swasthsaathi-frontend/`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.onrender.com/api/:path*"
    }
  ]
}
```

#### Step 3: Deploy
```bash
# From swasthsaathi-frontend folder
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: swasth-saarthi
# - Directory: ./
# - Override settings? No

# Production deployment
vercel --prod
```

**Result**: `https://swasth-saarthi.vercel.app`

---

### B. Deploy Backend to Render

#### Step 1: Create `render.yaml`
Create in root folder:
```yaml
services:
  - type: web
    name: swasth-saarthi-backend
    env: node
    region: singapore
    buildCommand: cd swasthsaathi-backend && npm install && npm run build
    startCommand: cd swasthsaathi-backend && npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: PORT
        value: 8083
      - key: DATABASE_URL
        sync: false
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: TWILIO_ACCOUNT_SID
        sync: false
      - key: TWILIO_AUTH_TOKEN
        sync: false
      - key: TWILIO_FROM
        sync: false
      - key: MOCK_OTP
        value: true
```

#### Step 2: Push to GitHub
```bash
git add render.yaml
git commit -m "Add Render config"
git push origin main
```

#### Step 3: Deploy on Render
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Render auto-detects `render.yaml`
6. Click "Create Web Service"
7. Add environment variables in Render dashboard

**Result**: `https://swasth-saarthi-backend.onrender.com`

---

### C. Setup Database

#### PostgreSQL (Neon - Free):
1. Go to https://neon.tech
2. Create account
3. Create new project
4. Copy connection string
5. Add to Render env: `DATABASE_URL`

#### MongoDB (Atlas - Free):
1. Go to https://mongodb.com/atlas
2. Create account
3. Create free cluster
4. Create database user
5. Get connection string
6. Add to Render env: `MONGO_URI`

---

## 📋 Option 2: Netlify + Railway

### A. Deploy Frontend to Netlify

#### Step 1: Create `netlify.toml`
In `swasthsaathi-frontend/`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[[redirects]]
  from = "/api/*"
  to = "https://your-backend.up.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd swasthsaathi-frontend
netlify deploy --prod
```

**Result**: `https://swasth-saarthi.netlify.app`

---

### B. Deploy Backend to Railway

#### Step 1: Create `railway.json`
In root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd swasthsaathi-backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd swasthsaathi-backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Step 2: Deploy
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add environment variables
6. Deploy!

**Result**: `https://swasth-saarthi.up.railway.app`

---

## 📋 Option 3: Full Stack on DigitalOcean Droplet

### Step 1: Create Droplet
```bash
# Choose:
- Ubuntu 22.04 LTS
- Basic Plan ($6/month)
- Choose datacenter region
- Add SSH key
```

### Step 2: Initial Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install MongoDB
apt install -y mongodb

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

### Step 3: Clone & Setup
```bash
# Clone repo
cd /var/www
git clone https://github.com/yourusername/Swasth-Saarthi-Main.git
cd Swasth-Saarthi-Main

# Setup backend
cd swasthsaathi-backend
npm install
npm run build

# Setup frontend
cd ../swasthsaathi-frontend
npm install
npm run build
```

### Step 4: Configure Nginx
```nginx
# /etc/nginx/sites-available/swasth-saarthi
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/Swasth-Saarthi-Main/swasthsaathi-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/swasth-saarthi /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5: Start Services
```bash
# Start backend with PM2
cd /var/www/Swasth-Saarthi-Main/swasthsaathi-backend
pm2 start dist/index.js --name swasth-backend
pm2 save
pm2 startup
```

---

## 🔐 Environment Variables Setup

### Required Variables:

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MONGO_URI=mongodb://user:pass@host:27017/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
ENCRYPTION_KEY=base64-encoded-32-byte-key
PORT=8083
FRONTEND_ORIGIN=https://your-frontend-url.com

# Optional (Twilio)
MOCK_OTP=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM=+1234567890

# Optional (Google Calendar)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-url.com/api/calendar/oauth-callback
```

---

## 📊 Deployment Checklist

### Pre-Deployment:
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build scripts working
- [ ] No console errors
- [ ] .env in .gitignore
- [ ] Production API URLs configured

### During Deployment:
- [ ] Deploy database first
- [ ] Deploy backend
- [ ] Test backend endpoints
- [ ] Deploy frontend
- [ ] Update frontend API URLs
- [ ] Test full flow

### Post-Deployment:
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Monitoring setup
- [ ] Backup strategy configured
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)

---

## 🎯 Quick Deploy Commands

### Vercel (Frontend):
```bash
cd swasthsaathi-frontend
vercel --prod
```

### Render (Backend):
```bash
# Just push to GitHub, Render auto-deploys
git push origin main
```

### Update After Changes:
```bash
# Frontend
cd swasthsaathi-frontend
vercel --prod

# Backend
git push origin main  # Render auto-deploys
```

---

## 🔧 Troubleshooting

### Build Fails:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node -v  # Should be 18+
```

### API Connection Issues:
- Check CORS settings in backend
- Verify FRONTEND_ORIGIN in .env
- Check API proxy configuration
- Verify backend is running

### Database Connection:
- Check connection string format
- Verify database is accessible
- Check firewall rules
- Verify credentials

---

## 📞 Support Services

### Recommended:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database**: Neon PostgreSQL (Free tier)
- **MongoDB**: MongoDB Atlas (Free tier)
- **Domain**: Namecheap ($10/year)
- **SSL**: Let's Encrypt (Free)
- **Monitoring**: UptimeRobot (Free)

---

## 🎉 Your App Will Be Live At:

```
Frontend: https://swasth-saarthi.vercel.app
Backend: https://swasth-saarthi-backend.onrender.com
Custom Domain: https://www.swasth-saarthi.com
```

**Total Monthly Cost**: $0 (using free tiers!) 🎉
