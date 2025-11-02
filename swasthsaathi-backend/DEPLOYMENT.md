# 🚀 Deployment Guide - Swasth Saarthi Backend

## Prerequisites

Before deploying, you'll need:

1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at: https://cloud.mongodb.com
   
2. **Render Account** (or other cloud platform)
   - Sign up at: https://render.com

3. **Optional: PostgreSQL Database** (for advanced features)
   - Use Render PostgreSQL or other managed service

---

## Step 1: Set Up MongoDB Atlas

### Create a Free Cluster

1. Go to https://cloud.mongodb.com
2. Click **"Build a Database"**
3. Select **"FREE"** tier (M0 Sandbox)
4. Choose a cloud provider and region (closest to your users)
5. Name your cluster (e.g., `swasth-saarthi-cluster`)
6. Click **"Create"**

### Configure Database Access

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `swasth-admin`)
5. Generate a strong password (save it securely!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for cloud deployments)
   - This adds `0.0.0.0/0` which is required for Render
4. Click **"Confirm"**

### Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials
6. Add your database name before the `?` (e.g., `/swasthsaathi?retryWrites=true`)
   
   Final format:
   ```
   mongodb+srv://swasth-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/swasthsaathi?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy to Render

### Create Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `swasth-saarthi-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `swasthsaathi-backend` (if in subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (for testing) or Starter

### Set Environment Variables

In the Render dashboard, add these environment variables:

#### Required Variables:

```bash
# Node Environment
NODE_ENV=production
PORT=8083

# MongoDB Connection (FROM STEP 1)
MONGO_URI=mongodb+srv://swasth-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/swasthsaathi?retryWrites=true&w=majority

# JWT Secret (Generate a new one!)
JWT_SECRET=<generate-strong-secret>

# Encryption Key (Generate a new one!)
ENCRYPTION_KEY=<generate-base64-key>

# Frontend Origin (Your deployed frontend URL)
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

#### Generate Secrets:

Run these commands locally to generate secure keys:

```bash
# Generate JWT Secret (64 character hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Optional Variables:

```bash
# PostgreSQL (if using)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Twilio SMS (for real OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM=+1234567890
MOCK_OTP=false

# AI Service (if deployed separately)
AI_SERVICE_URL=https://your-ai-service.com
```

---

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your TypeScript code
   - Start the server
3. Monitor the logs for deployment status
4. Once deployed, you'll get a URL like: `https://swasth-saarthi-main.onrender.com`

---

## Step 4: Verify Deployment

### Check Health Endpoint

Visit your deployment URL with `/api/health`:
```
https://swasth-saarthi-main.onrender.com/api/health
```

You should see:
```json
{
  "ok": true,
  "service": "swasth-saathi-backend",
  "timestamp": "2024-11-02T...",
  "databases": {
    "mongodb": true,
    "postgresql": false
  }
}
```

### Check Logs

In Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Look for:
   - ✅ `MongoDB connected`
   - ✅ `Backend listening on http://localhost:8083`
   - No error messages

---

## Common Issues & Solutions

### ❌ MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Verify `MONGO_URI` is set correctly in Render environment variables
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Ensure username/password are correct (no special characters in URL)
4. Verify cluster is running in MongoDB Atlas dashboard

### ❌ Build Failed

**Error**: `npm run build` fails

**Solutions**:
1. Check `package.json` has correct build script
2. Ensure all dependencies are in `dependencies` (not just `devDependencies`)
3. Verify TypeScript compiles locally: `npm run build`

### ⚠️ App Starts but Features Don't Work

**Solutions**:
1. Check all required environment variables are set
2. Verify `FRONTEND_ORIGIN` matches your actual frontend URL
3. Check CORS settings if getting CORS errors
4. Review logs for specific error messages

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] MongoDB user created with read/write access
- [ ] Network access allows `0.0.0.0/0` (for Render)
- [ ] Connection string tested and saved
- [ ] Strong JWT_SECRET generated and set
- [ ] Strong ENCRYPTION_KEY generated and set
- [ ] FRONTEND_ORIGIN set to production frontend URL
- [ ] NODE_ENV=production set
- [ ] Build succeeds locally: `npm run build`
- [ ] Health endpoint returns 200 OK
- [ ] Logs show "MongoDB connected"
- [ ] Test OTP flow (with MOCK_OTP=true initially)
- [ ] API endpoints respond correctly

---

## Scaling & Performance

### Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month free (enough for one service)

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared CPU/RAM
- Good for development and small projects

### Upgrade When:
- You need 24/7 uptime (no cold starts)
- Database > 500 MB
- High traffic (>10k requests/day)
- Need better performance

### Recommendations:
1. Start with free tiers for testing
2. Monitor usage in dashboards
3. Upgrade MongoDB first (to M2/M5) when storage fills up
4. Upgrade Render to Starter when you need consistent performance

---

## Monitoring

### Render Dashboard
- View real-time logs
- Monitor CPU/Memory usage
- Check uptime and response times

### MongoDB Atlas Dashboard
- Monitor database operations
- Check storage usage
- View performance metrics
- Set up alerts for issues

---

## Support

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **GitHub Issues**: Report issues in your repository

---

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Update `FRONTEND_ORIGIN` with deployed frontend URL
3. Set up custom domain (optional)
4. Configure Twilio for real SMS (optional)
5. Set up monitoring and alerts
6. Plan for scaling as user base grows

---

**🎉 Your backend is now deployed and ready for production use!**
