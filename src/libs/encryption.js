
import crypto from 'crypto';

export function decryptId(encryptedId) {
    const secret = process.env.SECRET_KEY
    const secretKey = Buffer.from(secret, 'hex');
    const [ivHex, encryptedText] = encryptedId.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}