import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32-bytes';

// Asegurar que la key tenga 32 bytes
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('auth-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback en caso de error
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // No está encriptado
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('auth-data'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback
  }
}

export function hashSensitiveData(data: any): any {
  // Crear hash de datos sensibles para logs
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return {
    hash: hash.digest('hex'),
    timestamp: new Date().toISOString(),
  };
}

export function sanitizeForLog(data: any): any {
  // Remover información sensible de logs
  const sanitized = { ...data };
  
  if (sanitized.password) sanitized.password = '[HIDDEN]';
  if (sanitized.token) sanitized.token = '[HIDDEN]';
  if (sanitized.balance) sanitized.balance = '[HIDDEN]';
  if (sanitized.email) sanitized.email = sanitized.email.replace(/(.{2}).*@/, '$1***@');
  
  return sanitized;
}
