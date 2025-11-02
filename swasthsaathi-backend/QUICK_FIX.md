# 🔥 QUICK FIX - MongoDB Connection Error on Render

## The Problem

Your app is trying to connect to `localhost:27017` (local MongoDB) in production, which doesn't exist on Render.

**Error Message:**
```
❌ Database init error: MongooseServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

---

## ✅ The Solution (3 Steps)

### Step 1: Create Free MongoDB Atlas Database (5 minutes)

1. Go to https://cloud.mongodb.com
2. Sign up for free account
3. Click **"Build a Database"** → Select **FREE** tier
4. Click **"Create"**
5. Create a database user:
   - Username: `swasth-admin`
   - Password: (generate strong password, save it!)
6. Add Network Access:
   - Click **"Network Access"**
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
7. Get connection string:
   - Click **"Database"** → **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<username>`, `<password>`, and add `/swasthsaathi` before `?`

**Example:**
```
mongodb+srv://swasth-admin:MyPassword123@cluster0.abc123.mongodb.net/swasthsaathi?retryWrites=true&w=majority
```

---

### Step 2: Add Environment Variable to Render (2 minutes)

1. Go to your Render Dashboard: https://dashboard.render.com
2. Select your **swasth-saarthi-backend** service
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key**: `MONGO_URI`
   - **Value**: (paste your MongoDB connection string from Step 1)
6. Click **"Save Changes"**

---

### Step 3: Redeploy (Automatic)

Render will automatically redeploy your service when you save the environment variable.

1. Go to **"Logs"** tab
2. Wait for deployment (~2-3 minutes)
3. Look for these success messages:
   ```
   ✅ MongoDB connected
   Backend listening on http://localhost:8083
   ```

---

## 🎯 Verify It's Fixed

Test your health endpoint:
```
https://swasth-saarthi-main.onrender.com/api/health
```

You should see:
```json
{
  "ok": true,
  "service": "swasth-saathi-backend",
  "databases": {
    "mongodb": true
  }
}
```

---

## 🔐 Additional Security (Recommended)

While you're in Render environment variables, add these for better security:

### Generate Keys

Run locally:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Add to Render

| Key | Value |
|-----|-------|
| `JWT_SECRET` | (paste generated hex string) |
| `ENCRYPTION_KEY` | (paste generated base64 string) |
| `FRONTEND_ORIGIN` | https://your-frontend-domain.com |

---

## 📚 Full Documentation

For complete deployment guide, see:
- **DEPLOYMENT.md** - Full step-by-step deployment instructions
- **RENDER_ENV_SETUP.md** - All environment variables explained

---

## 🚨 Still Having Issues?

### Check These:

1. **MongoDB Atlas Network Access**
   - Must allow `0.0.0.0/0` (required for Render)
   
2. **Connection String Format**
   - Should start with `mongodb+srv://`
   - Should include `/swasthsaathi` before `?`
   - Username and password should be correct
   
3. **Render Logs**
   - Check for specific error messages
   - Look for connection timeout vs authentication errors

### Common Issues:

| Error | Solution |
|-------|----------|
| Authentication failed | Check username/password in connection string |
| Network timeout | Verify `0.0.0.0/0` in MongoDB Network Access |
| Database not found | Ensure `/swasthsaathi` is in connection string |

---

**Need Help?** Check the logs and error messages for specific issues!
