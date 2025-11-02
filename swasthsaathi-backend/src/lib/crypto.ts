import crypto from 'crypto';

function getKey(): Buffer | null {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) return null;
  try {
    const key = Buffer.from(b64, 'base64');
    if (key.length !== 32) return null;
    return key;
  } catch {
    return null;
  }
}

export function encryptString(plain: string): string {
  const key = getKey();
  if (!key) return plain; // Return plaintext if no key
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, enc]).toString('base64');
  return out;
}

export function decryptString(b64: string): string {
  const key = getKey();
  if (!key) return b64; // Return as-is if no key
  try {
    const raw = Buffer.from(b64, 'base64');
    if (raw.length < 32) return b64; // Too short to be encrypted
    const iv = raw.subarray(0, 16);
    const tag = raw.subarray(16, 32);
    const data = raw.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return b64; // Return as-is if decryption fails
  }
}

export function encryptJSON(obj: any): string {
  return encryptString(JSON.stringify(obj));
}

export function decryptJSON<T = any>(b64: string): T {
  return JSON.parse(decryptString(b64));
}
