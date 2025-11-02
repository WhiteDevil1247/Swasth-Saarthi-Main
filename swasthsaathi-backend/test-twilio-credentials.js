// Quick test to verify Twilio credentials work
require('dotenv').config({ path: './.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('\n🔍 Testing Twilio Credentials...\n');
console.log('Account SID:', accountSid);
console.log('Auth Token:', authToken ? authToken.substring(0, 8) + '...' : 'NOT SET');

if (!accountSid || !authToken) {
  console.log('\n❌ ERROR: Twilio credentials not found in .env\n');
  process.exit(1);
}

const client = require('twilio')(accountSid, authToken);

// Test by fetching account info
client.api.v2010.accounts(accountSid)
  .fetch()
  .then(account => {
    console.log('\n✅ SUCCESS! Twilio credentials are valid!\n');
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    console.log('Date Created:', account.dateCreated);
    console.log('\n📱 Now you need to:');
    console.log('1. Get a Twilio phone number from console.twilio.com');
    console.log('2. Update TWILIO_FROM in .env file');
    console.log('3. Verify your test phone number (trial accounts)');
    console.log('\n📖 Read: GET_TWILIO_PHONE_NUMBER.md for detailed steps\n');
  })
  .catch(error => {
    console.log('\n❌ ERROR: Invalid Twilio credentials!\n');
    console.log('Error:', error.message);
    console.log('\nPlease verify:');
    console.log('1. TWILIO_ACCOUNT_SID is correct (starts with AC)');
    console.log('2. TWILIO_AUTH_TOKEN is correct (32 characters)');
    console.log('3. Credentials are from https://console.twilio.com/\n');
    process.exit(1);
  });
