// Get Twilio phone number from account
require('dotenv').config({ path: './.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

console.log('\n📱 Fetching your Twilio phone numbers...\n');

client.incomingPhoneNumbers
  .list({ limit: 20 })
  .then(phoneNumbers => {
    if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers found in your account!\n');
      console.log('📌 You need to get a phone number:');
      console.log('   1. Go to: https://console.twilio.com/');
      console.log('   2. Click "Get a Trial Number" button');
      console.log('   3. Or buy a number with SMS capability');
      console.log('   4. Copy the number and update TWILIO_FROM in .env\n');
    } else {
      console.log('✅ Found phone numbers in your account:\n');
      phoneNumbers.forEach((number, index) => {
        console.log(`${index + 1}. ${number.phoneNumber}`);
        console.log(`   Friendly Name: ${number.friendlyName}`);
        console.log(`   SMS Enabled: ${number.capabilities.sms}`);
        console.log(`   Voice Enabled: ${number.capabilities.voice}`);
        console.log('');
      });
      
      const firstNumber = phoneNumbers[0].phoneNumber;
      console.log('📝 UPDATE YOUR .ENV FILE:');
      console.log(`   TWILIO_FROM=${firstNumber}\n`);
      console.log('✅ Copy the number above and update .env file!');
    }
  })
  .catch(error => {
    console.log('\n❌ Error fetching phone numbers:');
    console.log(error.message);
    console.log('\nManually get your number from: https://console.twilio.com/\n');
  });
