# 📱 REAL TWILIO SMS OTP SETUP GUIDE

## ✅ **SYSTEM CONFIGURED FOR REAL SMS**

**Status**: Ready to use real Twilio SMS OTP  
**Date**: November 2, 2025  
**Mode**: Production SMS enabled

---

## 🎯 **WHAT CHANGED**

### **Backend Configuration:**
```env
# File: swasthsaathi-backend/.env
MOCK_OTP=false  ← Changed from true
```

### **Frontend Behavior:**
- ✅ No longer shows OTP code in toast
- ✅ Displays "Check your phone for SMS" message
- ✅ User must enter OTP received via SMS

### **Backend Behavior:**
- ✅ Generates random 6-digit OTP
- ✅ Sends SMS via Twilio
- ✅ Does not return OTP in API response (security)
- ✅ Stores OTP in memory for verification

---

## 🔑 **GET REAL TWILIO CREDENTIALS**

### **Step 1: Create Twilio Account**

1. **Go to**: https://www.twilio.com/try-twilio
2. **Sign up** with your email
3. **Verify** your email and phone number
4. **Get** $15 free trial credit

### **Step 2: Get Your Credentials**

1. **Login to**: https://console.twilio.com/
2. **Go to**: Dashboard
3. **Find**:
   - **Account SID**: `AC...` (34 characters)
   - **Auth Token**: Click "Show" to reveal

### **Step 3: Get a Twilio Phone Number**

1. **In Console**: Click "Get a Trial Number"
2. **Or Go to**: Phone Numbers → Manage → Buy a number
3. **Select**: A number with SMS capability
4. **Save**: Your Twilio phone number (e.g., +1234567890)

### **Step 4: Verify Destination Numbers (Trial Account)**

⚠️ **Important for Trial Accounts**:
- Trial accounts can only send to verified phone numbers
- To send to ANY number, you need to upgrade (paid)

**To Verify a Number:**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click: "Add a new number"
3. Enter: The phone number you want to test with
4. **Verify**: Via SMS or voice call

---

## 🔧 **UPDATE YOUR .ENV FILE**

### **Current Placeholder Values:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← Replace with your SID
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   ← Replace with your token
TWILIO_FROM=+1234567890                              ← Replace with your number
```

### **Update with Your Real Credentials:**

```env
# File: swasthsaathi-backend/.env

MOCK_OTP=false
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← Your real SID from Twilio
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    ← Your real token from Twilio
TWILIO_FROM=+1234567890                                ← Your Twilio phone number
```

---

## 🧪 **TEST REAL SMS OTP**

### **Step 1: Restart Backend**

```bash
# Kill existing backend
taskkill /F /IM node.exe

# Start fresh
cd c:\Users\Lenovo\OneDrive\Desktop\Swasth-Saarthi-Main
npm run dev
```

### **Step 2: Test Login**

1. **Open**: http://127.0.0.1:3000
2. **Enter**: Your verified phone number (with country code)
   - Example: `+919876543210` (India)
   - Example: `+14155551234` (USA)
3. **Click**: "Continue with Phone"
4. **Wait**: 5-30 seconds for SMS
5. **Check**: Your phone for SMS from Twilio
6. **Enter**: The 6-digit OTP from SMS
7. **Click**: "Verify & Continue"

### **Expected Backend Logs:**

```
📱 OTP Request for: +919876543210
✅ Real OTP sent to +919876543210
POST /api/auth/request-otp 200 - 1842ms

🔐 OTP Verification attempt for +919876543210
   Received code: "123456"
   Stored OTP: "123456"
   Code match: true
✅ OTP verified successfully for +919876543210
POST /api/auth/verify 200 - 28ms
```

### **Expected Frontend Behavior:**

1. **After requesting OTP**:
   - Toast: "OTP Sent! 📱"
   - Message: "A 6-digit verification code has been sent..."
   - **NO code shown** in toast

2. **Check your phone**:
   - SMS from your Twilio number
   - Message: "Your Swasth Saathi OTP is: 123456. Valid for 5 minutes."

3. **After entering OTP**:
   - If correct: "Verified! ✅"
   - If wrong: "Verification Failed - Invalid OTP code"

---

## 💰 **TWILIO PRICING**

### **Trial Account:**
- ✅ **$15 free credit**
- ✅ SMS to verified numbers only
- ⚠️ "Sent from your Twilio trial account" in messages

### **Paid Account:**
- ✅ SMS to ANY number (no verification needed)
- ✅ Clean messages (no trial notice)
- 💰 **~$0.0075 per SMS** (USA)
- 💰 **~$0.0075 per SMS** (India)
- 💰 **$1/month** for phone number

### **Upgrade to Production:**

1. **Add Payment**: https://console.twilio.com/billing
2. **Add Credit**: $20-50 recommended
3. **No code changes needed** - works automatically

---

## 🔐 **SECURITY BEST PRACTICES**

### **1. Environment Variables:**
```env
# ✅ GOOD: In .env file (not committed to git)
TWILIO_AUTH_TOKEN=your_secret_token

# ❌ BAD: Hardcoded in source code
const token = "your_secret_token"
```

### **2. OTP Storage:**
```typescript
// Current: In-memory Map (OK for development)
const otpStore = new Map();

// Production: Use Redis with TTL
redis.setex(`otp:${phone}`, 300, otp); // 5 min expiry
```

### **3. Rate Limiting:**
```typescript
// Already implemented: 100 requests per 15 minutes
app.use('/api', rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));
```

### **4. Additional Security (Recommended):**

```typescript
// Add per-phone rate limit for OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 OTP requests per phone per hour
  keyGenerator: (req) => req.body.phone,
  message: "Too many OTP requests. Please try again later."
});

app.post('/api/auth/request-otp', otpRateLimiter, async (req, res) => {
  // ... existing code
});
```

---

## 🐛 **TROUBLESHOOTING**

### **Problem: "SMS not received"**

**Check:**
1. ✅ Phone number includes country code (e.g., +91 for India)
2. ✅ Number is verified (if using trial account)
3. ✅ Twilio has credit (check console)
4. ✅ Number has SMS capability
5. ✅ Check spam/blocked messages folder

**Solution:**
```bash
# Check Twilio console logs
https://console.twilio.com/us1/monitor/logs/sms
```

### **Problem: "Twilio error in backend logs"**

**Check:**
1. ✅ TWILIO_ACCOUNT_SID is correct (starts with AC)
2. ✅ TWILIO_AUTH_TOKEN is correct (32 characters)
3. ✅ TWILIO_FROM is your Twilio number
4. ✅ Account is active (not suspended)

**Test Credentials:**
```bash
# Test via Twilio API
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  --data-urlencode "To=+919876543210" \
  --data-urlencode "From=$TWILIO_FROM" \
  --data-urlencode "Body=Test message" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

### **Problem: "Invalid phone number format"**

**Ensure:**
- ✅ Format: `+[country_code][number]`
- ✅ Example: `+919876543210` (India)
- ✅ Example: `+14155551234` (USA)
- ❌ Wrong: `9876543210` (missing +91)
- ❌ Wrong: `+91 98765 43210` (has spaces)

### **Problem: "OTP expired"**

**Info:**
- OTP valid for **5 minutes**
- After expiry, request new OTP
- Backend automatically cleans up expired OTPs

---

## 🔄 **SWITCHING BETWEEN MOCK AND REAL SMS**

### **For Development (Mock OTP):**

```env
# .env
MOCK_OTP=true
```

**Behavior:**
- Always uses OTP: `123456`
- No SMS sent
- Shows code in toast
- Instant (no delay)

### **For Production (Real SMS):**

```env
# .env
MOCK_OTP=false
```

**Behavior:**
- Random 6-digit OTP
- Real SMS via Twilio
- Code NOT shown in toast
- 5-30 second delay for SMS

---

## 📊 **MONITORING TWILIO USAGE**

### **Check SMS Logs:**
1. **Go to**: https://console.twilio.com/us1/monitor/logs/sms
2. **See**: All sent messages
3. **Check**: Status (delivered, failed, etc.)
4. **Debug**: Error messages if any

### **Check Usage & Billing:**
1. **Go to**: https://console.twilio.com/us1/billing/usage
2. **See**: SMS count and cost
3. **Monitor**: Credit balance
4. **Set**: Billing alerts

---

## 🎯 **PRODUCTION DEPLOYMENT CHECKLIST**

- [ ] Get real Twilio account
- [ ] Upgrade to paid (remove trial restrictions)
- [ ] Update `.env` with real credentials
- [ ] Set `MOCK_OTP=false`
- [ ] Test SMS to multiple numbers
- [ ] Verify international numbers work
- [ ] Add rate limiting for OTP requests
- [ ] Use Redis for OTP storage
- [ ] Set up monitoring/alerts
- [ ] Add SMS delivery webhook
- [ ] Configure fallback number
- [ ] Test SMS in different countries

---

## 📱 **SMS MESSAGE CUSTOMIZATION**

### **Current Message:**
```
Your Swasth Saathi OTP is: 123456. Valid for 5 minutes.
```

### **To Customize:**

**Edit**: `swasthsaathi-backend/src/index.ts` line ~114

```typescript
await client.messages.create({
  body: `Your Swasth Saathi verification code is ${otp}. Don't share this with anyone. Expires in 5 minutes.`,
  from: process.env.TWILIO_FROM,
  to: phone
});
```

### **Best Practices:**
- ✅ Include OTP clearly
- ✅ Mention expiry time
- ✅ Add security warning
- ✅ Keep under 160 characters (single SMS)
- ✅ Include brand name

---

## 🌍 **INTERNATIONAL SUPPORT**

### **Supported Countries:**
Twilio supports SMS in 180+ countries. Check:
https://www.twilio.com/en-us/guidelines/sms

### **Country-Specific Notes:**

**India:**
- ✅ Full support
- ⚠️ DLT registration required for marketing SMS
- ✅ OTP/transactional SMS: No registration needed
- 💰 ~₹0.60 per SMS

**USA:**
- ✅ Full support
- ✅ No restrictions for OTP
- 💰 ~$0.0075 per SMS

**UK:**
- ✅ Full support
- 💰 ~£0.006 per SMS

---

## ✅ **CURRENT STATUS**

| Item | Status |
|------|--------|
| **Backend Config** | ✅ Updated (`MOCK_OTP=false`) |
| **Frontend Code** | ✅ Updated (handles real SMS) |
| **Twilio Integration** | ✅ Implemented |
| **Error Handling** | ✅ Complete |
| **Logging** | ✅ Detailed logs added |
| **Security** | ✅ OTP not exposed |
| **Rate Limiting** | ✅ Active |

---

## 🚀 **QUICK START**

### **1. Get Credentials:**
- Sign up: https://www.twilio.com/try-twilio
- Get SID, Token, Phone Number

### **2. Update .env:**
```bash
cd swasthsaathi-backend
# Edit .env file with your credentials
```

### **3. Restart:**
```bash
cd ..
npm run dev
```

### **4. Test:**
- Open http://127.0.0.1:3000
- Enter your verified phone
- Check SMS
- Enter OTP
- Success!

---

## 📞 **SUPPORT**

### **Twilio Support:**
- Console: https://console.twilio.com/
- Docs: https://www.twilio.com/docs/sms
- Support: https://support.twilio.com/

### **Project Support:**
- Check backend logs for detailed error messages
- Review `OTP_FIX_GUIDE.md` for common issues
- Test with mock mode first (`MOCK_OTP=true`)

---

**🎉 REAL SMS OTP CONFIGURED AND READY!**

*Update your Twilio credentials in .env and restart the backend*  
*SMS will be sent to verified phone numbers*  
*OTP expires in 5 minutes*

**Last Updated**: November 2, 2025 at 7:15 AM IST
