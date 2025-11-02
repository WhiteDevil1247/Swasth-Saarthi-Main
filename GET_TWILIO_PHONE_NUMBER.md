# 📱 GET YOUR TWILIO PHONE NUMBER - QUICK GUIDE

## ⚠️ CRITICAL: You need a Twilio phone number to send SMS!

**Current Status:**
- ⚠️ TWILIO_ACCOUNT_SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Add your SID from Twilio)
- ⚠️ TWILIO_AUTH_TOKEN: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Add your token from Twilio)
- ❌ TWILIO_FROM: +1234567890 (Add your Twilio phone number)

---

## 🚀 **GET YOUR PHONE NUMBER (2 MINUTES)**

### **Option 1: Get Free Trial Number**

1. **Login to Twilio Console**
   ```
   https://console.twilio.com/
   ```

2. **Click "Get a Trial Number"**
   - Big red button on the dashboard
   - Twilio will assign you a random number

3. **Accept the Number**
   - Example: +15551234567
   - Click "Choose this Number"

4. **Copy Your Number**
   - Save it - you'll need it in .env

---

### **Option 2: Buy a Specific Number** (If trial number not available)

1. **Go to Phone Numbers**
   ```
   https://console.twilio.com/us1/develop/phone-numbers/manage/search
   ```

2. **Search for a Number**
   - Select country (USA, India, etc.)
   - Check "SMS" capability
   - Click "Search"

3. **Buy a Number**
   - Cost: ~$1-2/month
   - Select a number you like
   - Click "Buy"

4. **Copy Your Number**
   - Format: +[country_code][number]
   - Example: +15551234567

---

## 🔧 **UPDATE YOUR .ENV FILE**

### **1. Open .env**
```bash
# Location: swasthsaathi-backend/.env
```

### **2. Update Line 23**
```env
# OLD:
TWILIO_FROM=+12345678900

# NEW (use YOUR actual Twilio number):
TWILIO_FROM=+15551234567  ← Replace with your number
```

### **Example Complete Configuration:**
```env
MOCK_OTP=false
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← YOUR ACCOUNT SID
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← YOUR AUTH TOKEN
TWILIO_FROM=+15551234567  ← YOUR REAL TWILIO NUMBER
```

---

## 📱 **VERIFY YOUR TEST PHONE NUMBER (TRIAL ACCOUNTS)**

### **⚠️ IMPORTANT: Trial accounts can only send to verified numbers!**

1. **Go to Verified Numbers**
   ```
   https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   ```

2. **Click "Add a new number"**

3. **Enter YOUR phone number**
   - Example: +919876543210 (India)
   - Example: +14155551234 (USA)
   - Must include country code!

4. **Verify via SMS**
   - Twilio sends you a code
   - Enter the code
   - Number is now verified ✅

5. **Now you can test OTP to this number!**

---

## 🧪 **TEST YOUR SETUP**

### **Step 1: Restart Backend**

```bash
# Stop current backend
taskkill /F /IM node.exe

# Start fresh
cd c:\Users\Lenovo\OneDrive\Desktop\Swasth-Saarthi-Main
npm run dev
```

### **Step 2: Check Logs**

Look for:
```
✅ MongoDB connected
✅ PostgreSQL (Prisma) connected
Server running on http://localhost:8083
```

### **Step 3: Test OTP**

1. **Open**: http://127.0.0.1:3000
2. **Enter**: Your verified phone number
   - Example: +919876543210
3. **Click**: "Continue with Phone"
4. **Check**: Backend logs
   ```
   📱 OTP Request for: +919876543210
   ✅ Real OTP sent to +919876543210
   ```
5. **Check**: Your phone for SMS
6. **Enter**: The 6-digit OTP from SMS
7. **Success!** ✅

---

## 🐛 **TROUBLESHOOTING**

### **Problem: "Error sending SMS"**

**Check:**
```bash
# 1. Verify your credentials in Twilio Console
https://console.twilio.com/

# 2. Check if number is SMS-capable
https://console.twilio.com/us1/develop/phone-numbers/manage/active

# 3. View error logs
https://console.twilio.com/us1/monitor/logs/sms
```

### **Problem: "Unverified number" (Trial Account)**

**Solution:**
- Trial accounts need verified numbers
- Add your phone at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Or upgrade to paid account ($15 credit)

### **Problem: SMS not received**

**Check:**
1. ✅ Phone number has country code (+91, +1, etc.)
2. ✅ Number is verified (trial)
3. ✅ Twilio has credit
4. ✅ Check spam folder
5. ✅ Wait up to 30 seconds

---

## 💰 **COST BREAKDOWN**

### **Trial Account (Current):**
- ✅ FREE phone number
- ✅ $15 free credit (~2000 SMS)
- ⚠️ Only verified numbers
- ⚠️ "Sent from trial" in SMS

### **Upgrade to Paid:**
- 💰 Phone: $1-2/month
- 💰 SMS: $0.0075 each (USA)
- 💰 SMS: ₹0.60 each (India)
- ✅ Send to ANY number
- ✅ Clean SMS (no trial message)

### **Example Monthly Cost (1000 users):**
```
1000 users × 2 SMS each = 2000 SMS
2000 × $0.0075 = $15
+ $1 phone rental
= $16/month total
```

---

## 📋 **QUICK CHECKLIST**

- [ ] Login to Twilio Console
- [ ] Get/Buy a phone number
- [ ] Copy the number (format: +15551234567)
- [ ] Update TWILIO_FROM in .env
- [ ] Verify your test phone number (trial)
- [ ] Restart backend
- [ ] Test OTP flow
- [ ] Check SMS received ✅

---

## 🎯 **WHAT YOU HAVE vs WHAT YOU NEED**

### **✅ You Need To Get:**
- Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (from console.twilio.com)
- Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (from console.twilio.com)
- Google Client ID: (optional - for calendar integration)
- Google Secret: (optional - for calendar integration)

### **❌ You Still Need:**
- **Twilio Phone Number** ← GET THIS NOW!
- Update TWILIO_FROM in .env
- Verify your test phone number

---

## 🚀 **NEXT STEPS (5 MINUTES)**

1. **Get Phone Number**: https://console.twilio.com/
2. **Update .env**: Change TWILIO_FROM
3. **Verify Test Number**: Add your phone
4. **Restart Backend**: `npm run dev`
5. **Test OTP**: Login to your app
6. **Success!** 🎉

---

## 📞 **QUICK LINKS**

- **Twilio Console**: https://console.twilio.com/
- **Get Trial Number**: https://console.twilio.com/ (big red button)
- **Buy Number**: https://console.twilio.com/us1/develop/phone-numbers/manage/search
- **Verify Numbers**: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- **SMS Logs**: https://console.twilio.com/us1/monitor/logs/sms
- **Billing**: https://console.twilio.com/us1/billing

---

## 💡 **TIPS**

### **Phone Number Format:**
```
✅ CORRECT: +15551234567
✅ CORRECT: +919876543210
❌ WRONG: 5551234567 (missing + and country code)
❌ WRONG: +1 555 123 4567 (has spaces)
```

### **Verify Your Own Number First:**
- Makes testing easier
- Required for trial accounts
- Takes 1 minute

### **Check Twilio Dashboard:**
- See all SMS sent
- Monitor costs
- Debug errors

---

**🎉 YOU'RE 99% DONE!**

Just get your Twilio phone number and you're ready to send real SMS!

**Last Step**: Get number → Update .env → Test! 🚀
