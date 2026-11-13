import * as fs from 'fs';
import * as path from 'path';

/**
 * Saves a base64 encoded image string to the uploads directory on disk
 * and returns the web-accessible URL path (/uploads/<filename>).
 */
export function saveBase64Image(
  base64Data?: string | null,
  prefix = 'photo',
  userId = 'usr',
): string | null {
  if (!base64Data || typeof base64Data !== 'string' || base64Data.trim() === '') {
    return null;
  }

  try {
    // If it's already an absolute URL or path, keep it
    if (
      base64Data.startsWith('http://') ||
      base64Data.startsWith('https://') ||
      base64Data.startsWith('/uploads/') ||
      base64Data.startsWith('foto/') ||
      base64Data.startsWith('foto-patroli/')
    ) {
      return base64Data;
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Strip data URI prefix if present (e.g. data:image/jpeg;base64,)
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const filename = `${prefix}_${userId}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err: any) {
    console.error('Failed to save base64 image to disk:', err.message);
    return null;
  }
}

/**
 * Normalizes a stored photo key into a web-accessible URL
 */
export function normalizePhotoUrl(photoKey?: string | null): string | null {
  if (!photoKey || typeof photoKey !== 'string') return null;
  if (photoKey.startsWith('http://') || photoKey.startsWith('https://') || photoKey.startsWith('/')) {
    return photoKey;
  }
  return `/uploads/${photoKey}`;
}
