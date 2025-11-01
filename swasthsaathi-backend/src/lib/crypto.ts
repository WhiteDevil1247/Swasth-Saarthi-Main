import crypto from 'crypto';

function getKey(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) throw new Error('ENCRYPTION_KEY missing');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes base64');
  return key;
}

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, enc]).toString('base64');
  return out;
}

export function decryptString(b64: string): string {
  const raw = Buffer.from(b64, 'base64');
  const iv = raw.subarray(0, 16);
  const tag = raw.subarray(16, 32);
  const data = raw.subarray(32);
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

export function encryptJSON(obj: any): string {
  return encryptString(JSON.stringify(obj));
}

export function decryptJSON<T = any>(b64: string): T {
  return JSON.parse(decryptString(b64));
}
