# 🚀 DEPLOY NOW - Quick Start (5 Minutes)

## ⭐ EASIEST METHOD: Vercel + Render (100% FREE)

---

## 📱 STEP 1: Deploy Frontend (Vercel) - 2 Minutes

### A. Install Vercel CLI
```bash
npm install -g vercel
```

### B. Login to Vercel
```bash
vercel login
# Opens browser - login with GitHub
```

### C. Deploy Frontend
```bash
# Navigate to frontend folder
cd swasthsaathi-frontend

# Deploy to Vercel
vercel

# Answer prompts:
? Set up and deploy "swasthsaathi-frontend"? Yes
? Which scope do you want to deploy to? (Your account)
? Link to existing project? No
? What's your project's name? swasth-saarthi
? In which directory is your code located? ./
? Want to override the settings? No

# Deploy to production
vercel --prod
```

**✅ Result**: You'll get a URL like `https://swasth-saarthi-abc123.vercel.app`

---

## 🖥️ STEP 2: Deploy Backend (Render) - 3 Minutes

### A. Go to Render.com
1. Visit: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub

### B. Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Click "Connect GitHub"
4. Select your repo: `Swasth-Saarthi-Main`
5. Click "Connect"

### C. Configure Service
```
Name: swasth-saarthi-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: (leave empty)
Runtime: Node
Build Command: cd swasthsaathi-backend && npm install && npm run build
Start Command: cd swasthsaathi-backend && npm start
Instance Type: Free
```

### D. Add Environment Variables
Click "Advanced" → "Add Environment Variable":

```
PORT = 8083
NODE_VERSION = 18
MOCK_OTP = true
JWT_SECRET = your-super-secret-key-here-min-32-chars
ENCRYPTION_KEY = ZmFrZV9kZXYtMzJieXRlLWFlc19rZXlfZm9yX3N3YXN0aHNhYXRoaQ==
FRONTEND_ORIGIN = https://swasth-saarthi-abc123.vercel.app
```

**Note**: Replace `swasth-saarthi-abc123.vercel.app` with YOUR Vercel URL from Step 1!

### E. Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deploy
3. ✅ You'll get: `https://swasth-saarthi-backend.onrender.com`

---

## 🔗 STEP 3: Connect Frontend to Backend

### A. Update Frontend Environment
In Vercel dashboard:
1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add:
   ```
   VITE_API_URL = https://swasth-saarthi-backend.onrender.com
   ```
4. Click "Save"

### B. Redeploy Frontend
```bash
cd swasthsaathi-frontend
vercel --prod
```

---

## ✅ STEP 4: Test Your Deployment!

### Open Your App:
```
https://swasth-saarthi-abc123.vercel.app
```

### Test Features:
1. ✅ Login with OTP: `123456`
2. ✅ Go to Hospital Navigator
3. ✅ See map with 12 hospitals
4. ✅ Click markers for details
5. ✅ Test navigation

---

## 🎉 DONE! Your App is LIVE!

```
Frontend:  https://swasth-saarthi.vercel.app
Backend:   https://swasth-saarthi-backend.onrender.com
Cost:      $0/month (Free tier!)
```

---

## 📊 Free Tier Limits:

### Vercel (Frontend):
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Auto SSL
- ✅ Custom domain

### Render (Backend):
- ✅ 750 hours/month (always on!)
- ✅ 512 MB RAM
- ✅ Auto SSL
- ✅ Auto deploy from GitHub

**Perfect for**: Testing, demos, portfolio projects

---

## 🔄 How to Update Your App:

### Frontend Changes:
```bash
cd swasthsaathi-frontend
# Make your changes
vercel --prod
```

### Backend Changes:
```bash
# Just push to GitHub!
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys! ✨
```

---

## 🎯 Next Steps (Optional):

### 1. Add Custom Domain:
- Buy domain from Namecheap ($10/year)
- Add to Vercel: Settings → Domains
- Update DNS records

### 2. Add Database (Free):
- PostgreSQL: https://neon.tech (Free)
- MongoDB: https://mongodb.com/atlas (Free)

### 3. Add Real SMS:
- Get Twilio account
- Add credentials to Render env vars
- Set `MOCK_OTP=false`

### 4. Monitor Your App:
- UptimeRobot: https://uptimerobot.com (Free)
- Google Analytics: https://analytics.google.com

---

## 🐛 Common Issues:

### Backend not connecting?
- Check Render logs: Dashboard → Logs
- Verify environment variables
- Check `FRONTEND_ORIGIN` matches Vercel URL

### Frontend showing errors?
- Check browser console (F12)
- Verify `VITE_API_URL` in Vercel
- Hard refresh: Ctrl + Shift + R

### Build failing?
- Check Render logs
- Verify Node version (should be 18)
- Check build command is correct

---

## 📞 Quick Help:

### Vercel Docs:
https://vercel.com/docs

### Render Docs:
https://render.com/docs

### Your Dashboard URLs:
```
Vercel:  https://vercel.com/dashboard
Render:  https://dashboard.render.com
```

---

## ✅ Deployment Checklist:

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables added
- [ ] Frontend connected to backend
- [ ] App tested and working
- [ ] URLs saved somewhere safe
- [ ] Share with friends! 🎉

---

**🎉 CONGRATULATIONS! Your app is now live on the internet!**

Share your link:
```
https://swasth-saarthi-abc123.vercel.app
```

**Time taken**: ~5 minutes
**Cost**: $0
**Effort**: Minimal
**Result**: Professional deployment! 🚀
