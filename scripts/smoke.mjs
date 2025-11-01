const base = 'http://localhost:8081';

async function main() {
  const j = async (res) => {
    const t = await res.text();
    try { return JSON.parse(t); } catch { return t; }
  };

  const post = (path, body, token) => fetch(base+path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token? { Authorization: 'Bearer '+token } : {}) },
    body: JSON.stringify(body||{})
  });
  const put = (path, body, token) => fetch(base+path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token? { Authorization: 'Bearer '+token } : {}) },
    body: JSON.stringify(body||{})
  });
  const get = (path, token) => fetch(base+path, { headers: token? { Authorization: 'Bearer '+token } : {} });
  const del = (path, token) => fetch(base+path, { method:'DELETE', headers: token? { Authorization: 'Bearer '+token } : {} });
  const patch = (path, body, token) => fetch(base+path, { method:'PATCH', headers: { 'Content-Type': 'application/json', ...(token? { Authorization: 'Bearer '+token } : {}) }, body: JSON.stringify(body||{}) });

  const health = await j(await get('/api/health'));
  console.log('health', health);

  const otp = await j(await post('/api/auth/request-otp', { phone: '9999999999' }));
  console.log('request-otp', otp);
  const verify = await j(await post('/api/auth/verify', { phone: '9999999999', code: '123456' }));
  console.log('verify', verify);
  const token = verify.token;

  const hospitals = await j(await get('/api/hospitals?limit=3', token));
  console.log('hospitals', Array.isArray(hospitals)?hospitals.slice(0,3):hospitals);

  const ngos = await j(await get('/api/ngos', token));
  console.log('ngos', Array.isArray(ngos)?ngos.slice(0,3):ngos);

  const putProf = await j(await put('/api/profile', { full_name: 'John Doe', email: 'john@example.com', phone: '9999999999', blood_group: 'O+', emergency_contact: '8888888888' }, token));
  console.log('profile_put', putProf && putProf.userId ? 'ok' : putProf);
  const getProf = await j(await get('/api/profile', token));
  console.log('profile_get', getProf);

  const qr = await j(await get('/api/qr/emergency', token));
  console.log('qr_has_dataurl', typeof qr.qrDataUrl === 'string');

  const apCreate = await j(await post('/api/appointments', { provider: 'Dr A', reason: 'Checkup' }, token));
  console.log('appointment_create_id', apCreate && apCreate.id);
  const apList = await j(await get('/api/appointments', token));
  console.log('appointments_len', Array.isArray(apList) ? apList.length : apList);

  const aiInfer = await j(await post('/api/ai/infer', { input: 'Headache' }, token));
  console.log('ai_infer', aiInfer);
  const aiTimeline = await j(await get('/api/ai/timeline', token));
  console.log('ai_timeline_summary', aiTimeline && aiTimeline.summary);

  const chatPost = await j(await post('/api/chat', { role: 'user', content: 'Hello' }, token));
  console.log('chat_post_id', chatPost && (chatPost._id || chatPost.id));
  const chatList = await j(await get('/api/chat', token));
  console.log('chat_list_len', Array.isArray(chatList) ? chatList.length : chatList);

  // Upload a small text file using FormData
  const fd = new FormData();
  const blob = new Blob(["sample report"], { type: 'text/plain' });
  fd.append('file', blob, 'sample.txt');
  const upRes = await fetch(base + '/api/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
  const up = await j(upRes);
  console.log('upload', up);
  const recs = await j(await get('/api/records', token));
  console.log('records_len', Array.isArray(recs) ? recs.length : recs);
}

main().catch((e) => { console.error('smoke_failed', e); process.exit(1); });
