/**
 * Final Debug Test Suite - Complete System Verification
 * Tests all critical endpoints and generates final status report
 */

const base = 'http://localhost:8081';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(status, message, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'warn' ? '⚠️' : 'ℹ️';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : status === 'warn' ? colors.yellow : colors.cyan;
  console.log(`${color}${icon} ${message}${colors.reset}${details ? ` ${colors.cyan}${details}${colors.reset}` : ''}`);
}

function section(title) {
  console.log(`\n${colors.blue}${colors.bold}${'═'.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}  ${title}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}${'═'.repeat(70)}${colors.reset}\n`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok) {
        log('pass', name, `${response.status}`);
        return { success: true, data, status: response.status };
      } else {
        log('fail', name, `${response.status} - ${data.error || 'Unknown error'}`);
        return { success: false, error: data.error, status: response.status };
      }
    } else {
      if (response.ok) {
        log('pass', name, `${response.status}`);
        return { success: true, status: response.status };
      } else {
        log('fail', name, `${response.status}`);
        return { success: false, status: response.status };
      }
    }
  } catch (error) {
    log('fail', name, `Connection error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runCompleteTest() {
  console.log(`\n${colors.cyan}${colors.bold}╔════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}║          SWASTH SAATHI - FINAL DEBUG TEST SUITE                    ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}║                 Production Release Verification                     ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}╚════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    critical: [],
    optional: []
  };

  let token = '';

  // 1. CRITICAL SERVICES
  section('1. CRITICAL SERVICES');
  
  const health = await testEndpoint('Backend Health Check', `${base}/api/health`);
  results.total++;
  if (health.success) {
    results.passed++;
    if (health.data?.databases) {
      log('info', 'Database Status:', `MongoDB: ${health.data.databases.mongodb ? '✓' : '✗'}, PostgreSQL: ${health.data.databases.postgresql ? '✓' : '✗'}`);
    }
  } else {
    results.failed++;
    results.critical.push('Backend not responding');
  }

  // Check AI Service
  try {
    const aiHealth = await fetch('http://localhost:5001/health');
    if (aiHealth.ok) {
      log('pass', 'AI Service Health', '5001');
      results.passed++;
    } else {
      log('warn', 'AI Service', 'Not responding - Start with: cd ai-service && python app.py');
      results.warnings++;
      results.optional.push('AI Service not running');
    }
  } catch (error) {
    log('warn', 'AI Service', 'Not running - Start with: cd ai-service && python app.py');
    results.warnings++;
    results.optional.push('AI Service not running');
  }
  results.total++;

  // 2. AUTHENTICATION
  section('2. AUTHENTICATION SYSTEM');
  
  const otpReq = await testEndpoint('Request OTP', `${base}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919999999999' })
  });
  results.total++;
  otpReq.success ? results.passed++ : results.failed++;
  
  if (otpReq.success && otpReq.data?.code) {
    log('info', 'Mock OTP Code:', otpReq.data.code);
  }
  
  const code = otpReq.data?.code || '123456';
  const verify = await testEndpoint('Verify OTP', `${base}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919999999999', code })
  });
  results.total++;
  verify.success ? results.passed++ : results.failed++;
  
  if (verify.success) {
    token = verify.data?.token || '';
    log('info', 'JWT Token:', token ? 'Generated ✓' : 'Missing ✗');
  } else {
    results.critical.push('Authentication failed');
  }

  if (!token) {
    log('fail', 'Cannot proceed without authentication token');
    return printResults(results);
  }

  // 3. USER PROFILE
  section('3. USER PROFILE MANAGEMENT');
  
  const profileUpdate = await testEndpoint('Update Profile', `${base}/api/profile`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Test User',
      email: 'test@swasthsaathi.com',
      phone: '+919999999999',
      blood_group: 'O+',
      emergency_contact: '+918888888888'
    })
  });
  results.total++;
  profileUpdate.success ? results.passed++ : results.failed++;

  const profileGet = await testEndpoint('Get Profile', `${base}/api/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  profileGet.success ? results.passed++ : results.failed++;

  // 4. HOSPITAL NAVIGATOR
  section('4. HOSPITAL NAVIGATOR');
  
  const hospitals = await testEndpoint('List Hospitals', `${base}/api/hospitals?limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  hospitals.success ? results.passed++ : results.failed++;
  
  if (hospitals.success && Array.isArray(hospitals.data)) {
    log('info', 'Hospitals Found:', hospitals.data.length);
  }

  // 5. NGO HUB
  section('5. NGO HUB');
  
  const ngos = await testEndpoint('List NGOs', `${base}/api/ngos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  ngos.success ? results.passed++ : results.failed++;

  // 6. APPOINTMENTS
  section('6. APPOINTMENTS');
  
  const appointmentCreate = await testEndpoint('Create Appointment', `${base}/api/appointments`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'Dr. Test',
      reason: 'System verification',
      start_time: new Date(Date.now() + 86400000).toISOString()
    })
  });
  results.total++;
  appointmentCreate.success ? results.passed++ : results.failed++;

  const appointments = await testEndpoint('List Appointments', `${base}/api/appointments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  appointments.success ? results.passed++ : results.failed++;

  // 7. AI FEATURES
  section('7. AI HEALTH ASSISTANT');
  
  const aiReport = await testEndpoint('AI Report Analysis', `${base}/api/ai/report`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bp: 120, cholesterol: 200, glucose: 100 })
  });
  results.total++;
  if (aiReport.success) {
    results.passed++;
    if (aiReport.data?.status) {
      log('info', 'AI Prediction:', aiReport.data.status);
    }
  } else {
    results.failed++;
    if (aiReport.error?.includes('unavailable')) {
      results.optional.push('AI service not running');
    }
  }

  const aiChat = await testEndpoint('AI Health Chat', `${base}/api/ai/chat`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'How to manage high blood pressure?' })
  });
  results.total++;
  aiChat.success ? results.passed++ : results.failed++;

  const aiTimeline = await testEndpoint('AI Timeline', `${base}/api/ai/timeline`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  aiTimeline.success ? results.passed++ : results.failed++;

  // 8. EMERGENCY FEATURES
  section('8. EMERGENCY FEATURES');
  
  const qr = await testEndpoint('Emergency QR Generation', `${base}/api/qr/emergency`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  qr.success ? results.passed++ : results.failed++;

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
  results.total++;
  sos.success ? results.passed++ : results.failed++;

  // 9. HEALTH METRICS
  section('9. HEALTH METRICS');
  
  const metricsPost = await testEndpoint('Record Metric', `${base}/api/metrics`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'blood_pressure', value: 120 })
  });
  results.total++;
  metricsPost.success ? results.passed++ : results.failed++;

  const metrics = await testEndpoint('List Metrics', `${base}/api/metrics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  metrics.success ? results.passed++ : results.failed++;

  // 10. FILE OPERATIONS
  section('10. FILE UPLOAD/DOWNLOAD');
  
  const formData = new FormData();
  const blob = new Blob(['test verification file'], { type: 'text/plain' });
  formData.append('file', blob, 'debug-test.txt');
  
  const upload = await testEndpoint('Upload File', `${base}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  results.total++;
  upload.success ? results.passed++ : results.failed++;

  const records = await testEndpoint('List Health Records', `${base}/api/records`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  results.total++;
  records.success ? results.passed++ : results.failed++;

  // FINAL RESULTS
  printResults(results);
}

function printResults(results) {
  section('📊 FINAL TEST RESULTS');
  
  const percentage = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  
  console.log(`${colors.bold}Total Tests:${colors.reset} ${results.total}`);
  console.log(`${colors.green}${colors.bold}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}${colors.bold}Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.yellow}${colors.bold}Warnings:${colors.reset} ${results.warnings}`);
  console.log(`${colors.bold}Success Rate:${colors.reset} ${percentage}%\n`);

  if (results.critical.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ CRITICAL ISSUES:${colors.reset}`);
    results.critical.forEach(issue => console.log(`  • ${issue}`));
    console.log('');
  }

  if (results.optional.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  OPTIONAL SERVICES:${colors.reset}`);
    results.optional.forEach(issue => console.log(`  • ${issue}`));
    console.log('');
  }

  // Final Verdict
  if (percentage >= 95 && results.critical.length === 0) {
    console.log(`${colors.green}${colors.bold}🎉 EXCELLENT! System is fully production-ready!${colors.reset}\n`);
  } else if (percentage >= 85 && results.critical.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ GREAT! Core features working. Check optional services.${colors.reset}\n`);
  } else if (percentage >= 70) {
    console.log(`${colors.yellow}${colors.bold}⚠️  GOOD! Some features need attention.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ NEEDS WORK! Multiple critical features failing.${colors.reset}\n`);
  }

  // Action Items
  if (results.optional.includes('AI Service not running')) {
    console.log(`${colors.cyan}💡 To enable AI features:${colors.reset}`);
    console.log(`   cd swasthsaathi-backend/ai-service`);
    console.log(`   pip install -r requirements.txt`);
    console.log(`   python app.py\n`);
  }
}

// Run tests
runCompleteTest().catch(console.error);
