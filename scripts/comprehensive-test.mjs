/**
 * Comprehensive Test Suite for Swasth Saathi
 * Tests all major features and endpoints
 */

const base = 'http://localhost:8081';
const frontend = 'http://127.0.0.1:3000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (response.ok) {
      log('pass', `${name}: ${response.status}`);
      return { success: true, data };
    } else {
      log('fail', `${name}: ${response.status} - ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log('fail', `${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║     SWASTH SAATHI - COMPREHENSIVE TEST SUITE          ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  let passedTests = 0;
  let failedTests = 0;
  let token = '';

  // 1. Health Check
  section('1. BACKEND HEALTH CHECK');
  const health = await testEndpoint('Health Check', `${base}/api/health`);
  health.success ? passedTests++ : failedTests++;

  // 2. Authentication Flow
  section('2. AUTHENTICATION FLOW');
  
  // Request OTP
  const otpReq = await testEndpoint('Request OTP', `${base}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9999999999' })
  });
  otpReq.success ? passedTests++ : failedTests++;
  
  // Verify OTP
  const code = otpReq.data?.code || '123456';
  const verify = await testEndpoint('Verify OTP', `${base}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9999999999', code })
  });
  verify.success ? passedTests++ : failedTests++;
  token = verify.data?.token || '';

  if (!token) {
    log('fail', 'No token received, remaining tests will fail');
    return;
  }

  // 3. Profile Management
  section('3. PROFILE MANAGEMENT');
  
  const profileUpdate = await testEndpoint('Update Profile', `${base}/api/profile`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Test User',
      email: 'test@swasthsaathi.com',
      phone: '9999999999',
      blood_group: 'O+',
      emergency_contact: '8888888888'
    })
  });
  profileUpdate.success ? passedTests++ : failedTests++;

  const profileGet = await testEndpoint('Get Profile', `${base}/api/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  profileGet.success ? passedTests++ : failedTests++;

  // 4. Hospital Navigator
  section('4. HOSPITAL NAVIGATOR');
  
  const hospitals = await testEndpoint('List Hospitals', `${base}/api/hospitals?limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  hospitals.success ? passedTests++ : failedTests++;
  
  if (hospitals.success && hospitals.data.length > 0) {
    log('pass', `Found ${hospitals.data.length} hospitals`);
  }

  // 5. NGO Hub
  section('5. NGO HUB');
  
  const ngos = await testEndpoint('List NGOs', `${base}/api/ngos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  ngos.success ? passedTests++ : failedTests++;

  // 6. Appointments
  section('6. APPOINTMENTS');
  
  const appointmentCreate = await testEndpoint('Create Appointment', `${base}/api/appointments`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'Dr. Smith',
      reason: 'Regular checkup',
      start_time: new Date(Date.now() + 86400000).toISOString()
    })
  });
  appointmentCreate.success ? passedTests++ : failedTests++;

  const appointments = await testEndpoint('List Appointments', `${base}/api/appointments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  appointments.success ? passedTests++ : failedTests++;

  // 7. AI Features
  section('7. AI HEALTH ASSISTANT');
  
  const aiInfer = await testEndpoint('AI Inference', `${base}/api/ai/infer`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: 'I have a fever' })
  });
  aiInfer.success ? passedTests++ : failedTests++;

  const aiTimeline = await testEndpoint('AI Timeline', `${base}/api/ai/timeline`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  aiTimeline.success ? passedTests++ : failedTests++;

  // 8. Emergency Features
  section('8. EMERGENCY FEATURES');
  
  const qr = await testEndpoint('Emergency QR', `${base}/api/qr/emergency`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  qr.success ? passedTests++ : failedTests++;

  const sos = await testEndpoint('SOS Alert', `${base}/api/sos`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location: { lat: 26.8467, lng: 80.9462 },
      message: 'Test emergency alert'
    })
  });
  sos.success ? passedTests++ : failedTests++;

  // 9. Health Metrics
  section('9. HEALTH METRICS');
  
  const metricsPost = await testEndpoint('Record Metric', `${base}/api/metrics`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'blood_pressure', value: '120/80' })
  });
  metricsPost.success ? passedTests++ : failedTests++;

  const metrics = await testEndpoint('List Metrics', `${base}/api/metrics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  metrics.success ? passedTests++ : failedTests++;

  // 10. Chat/Assistant
  section('10. CHAT ASSISTANT');
  
  const chat = await testEndpoint('Send Message', `${base}/api/chat`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'user', content: 'Hello' })
  });
  chat.success ? passedTests++ : failedTests++;

  const chatList = await testEndpoint('List Messages', `${base}/api/chat?limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  chatList.success ? passedTests++ : failedTests++;

  // 11. File Upload
  section('11. FILE UPLOAD/DOWNLOAD');
  
  const formData = new FormData();
  const blob = new Blob(['test file content'], { type: 'text/plain' });
  formData.append('file', blob, 'test.txt');
  
  const upload = await testEndpoint('Upload File', `${base}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  upload.success ? passedTests++ : failedTests++;

  const records = await testEndpoint('List Records', `${base}/api/records`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  records.success ? passedTests++ : failedTests++;

  // 12. Frontend Check
  section('12. FRONTEND ACCESSIBILITY');
  
  try {
    const frontendRes = await fetch(frontend);
    if (frontendRes.ok) {
      log('pass', `Frontend accessible at ${frontend}`);
      passedTests++;
    } else {
      log('fail', `Frontend returned ${frontendRes.status}`);
      failedTests++;
    }
  } catch (error) {
    log('fail', `Frontend not accessible: ${error.message}`);
    failedTests++;
  }

  // Final Summary
  section('TEST SUMMARY');
  const total = passedTests + failedTests;
  const percentage = ((passedTests / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${percentage}%\n`);

  if (percentage >= 90) {
    console.log(`${colors.green}🎉 EXCELLENT! System is production-ready!${colors.reset}\n`);
  } else if (percentage >= 70) {
    console.log(`${colors.yellow}⚠️  GOOD! Some features need attention.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ NEEDS WORK! Multiple features failing.${colors.reset}\n`);
  }
}

runTests().catch(console.error);
