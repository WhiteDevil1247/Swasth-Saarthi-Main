# 🔧 Render Environment Variables - Quick Setup Guide

Copy these environment variables to your Render dashboard.

## How to Add Environment Variables in Render

1. Go to your service in Render Dashboard
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable below (Key = Value)
5. Click **"Save Changes"**

---

## Required Environment Variables

### Basic Configuration

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `8083` | Port number (Render auto-assigns) |

### Database Configuration

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster.mongodb.net/swasthsaathi?retryWrites=true&w=majority` | ⚠️ **REQUIRED** - Get from MongoDB Atlas |

### Security Keys

| Key | Value | Notes |
|-----|-------|-------|
| `JWT_SECRET` | *Generate using command below* | ⚠️ **REQUIRED** - Must be unique |
| `ENCRYPTION_KEY` | *Generate using command below* | ⚠️ **REQUIRED** - Must be unique |

### Frontend Configuration

| Key | Value | Notes |
|-----|-------|-------|
| `FRONTEND_ORIGIN` | `https://your-frontend.vercel.app` | Your deployed frontend URL |

---

## Optional Environment Variables

### PostgreSQL (Advanced Features)

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Optional - Only if using PostgreSQL |

### Twilio SMS (Real OTP)

| Key | Value | Notes |
|-----|-------|-------|
| `MOCK_OTP` | `true` or `false` | Set to `false` to enable real SMS |
| `TWILIO_ACCOUNT_SID` | `ACxxxxx...` | Get from Twilio Console |
| `TWILIO_AUTH_TOKEN` | `xxxxx...` | Get from Twilio Console |
| `TWILIO_FROM` | `+1234567890` | Your Twilio phone number |

### AI Service

| Key | Value | Notes |
|-----|-------|-------|
| `AI_SERVICE_URL` | `https://your-ai-service.com` | Optional - Only if deploying AI service separately |

---

## 🔐 Generate Security Keys

Run these commands in your terminal to generate secure keys:

### Generate JWT Secret (64 character hex string)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example Output**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

### Generate Encryption Key (32 bytes base64 encoded)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example Output**: `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=`

---

## 📋 MongoDB Atlas Setup

### Get Your MongoDB Connection String

1. Go to https://cloud.mongodb.com
2. Click **"Database"** → **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Add your database name: `/swasthsaathi` before the `?`

### Final Format:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/swasthsaathi?retryWrites=true&w=majority
```

### Security Checklist:

- [ ] Database user created with password
- [ ] Network access allows `0.0.0.0/0` (required for Render)
- [ ] Connection string tested locally (optional)
- [ ] No spaces or special characters in password (use URL encoding if needed)

---

## ⚡ Quick Copy-Paste Template

Copy this template and fill in your values:

```bash
# Required
NODE_ENV=production
PORT=8083
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/swasthsaathi?retryWrites=true&w=majority
JWT_SECRET=<PASTE_GENERATED_HEX_HERE>
ENCRYPTION_KEY=<PASTE_GENERATED_BASE64_HERE>
FRONTEND_ORIGIN=https://your-frontend-domain.com

# Optional - PostgreSQL
# DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Optional - Twilio
MOCK_OTP=true
# TWILIO_ACCOUNT_SID=ACxxxxx
# TWILIO_AUTH_TOKEN=xxxxx
# TWILIO_FROM=+1234567890
```

---

## 🔍 Verification Steps

After adding environment variables:

1. **Save Changes** in Render dashboard
2. Render will automatically **redeploy** your service
3. Wait for deployment to complete (~2-5 minutes)
4. Check the **Logs** tab for:
   - ✅ `MongoDB connected`
   - ✅ `Backend listening on http://localhost:8083`
5. Test the health endpoint:
   ```
   https://your-app.onrender.com/api/health
   ```

---

## 🚨 Common Mistakes

### ❌ Wrong MongoDB URI Format

**Wrong**: `mongodb://localhost:27017/swasthsaathi`
**Correct**: `mongodb+srv://user:pass@cluster.mongodb.net/swasthsaathi?retryWrites=true&w=majority`

### ❌ Missing Database Name

**Wrong**: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true`
**Correct**: `mongodb+srv://user:pass@cluster.mongodb.net/swasthsaathi?retryWrites=true`

### ❌ Password Contains Special Characters

If your MongoDB password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`

### ❌ Using Development Keys in Production

Always generate NEW keys for production! Never use example keys from `.env.example`.

---

## 📞 Need Help?

1. Check Render Logs for error messages
2. Verify all required variables are set
3. Test MongoDB connection string locally first
4. Review the full DEPLOYMENT.md guide

---

**✅ Once all variables are set correctly, your app should deploy successfully!**
