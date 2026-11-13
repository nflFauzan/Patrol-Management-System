import { saveBase64Image, normalizePhotoUrl } from './file-upload.util';
import * as fs from 'fs';
import * as path from 'path';

describe('file-upload.util', () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  it('TC-FILE-01: should return null for empty or null base64 input', () => {
    expect(saveBase64Image(null)).toBeNull();
    expect(saveBase64Image(undefined)).toBeNull();
    expect(saveBase64Image('')).toBeNull();
    expect(saveBase64Image('   ')).toBeNull();
  });

  it('TC-FILE-02: should preserve existing URLs or paths', () => {
    expect(saveBase64Image('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    expect(saveBase64Image('/uploads/myphoto.jpg')).toBe('/uploads/myphoto.jpg');
    expect(saveBase64Image('foto-patroli/legacy.jpg')).toBe('foto-patroli/legacy.jpg');
  });

  it('TC-FILE-03: should decode valid base64 and save to uploads directory', () => {
    // 1x1 transparent PNG in base64
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const resultUrl = saveBase64Image(sampleBase64, 'test_selfie', 'usr-test-123');

    expect(resultUrl).toBeDefined();
    expect(resultUrl).toMatch(/^\/uploads\/test_selfie_usr-test-123_\d+_\d+\.jpg$/);

    const savedFilePath = path.join(process.cwd(), resultUrl!);
    expect(fs.existsSync(savedFilePath)).toBe(true);

    // Clean up test file
    fs.unlinkSync(savedFilePath);
  });

  it('TC-FILE-04: normalizePhotoUrl should format correctly', () => {
    expect(normalizePhotoUrl(null)).toBeNull();
    expect(normalizePhotoUrl('https://example.com/avatar.jpg')).toBe('https://example.com/avatar.jpg');
    expect(normalizePhotoUrl('/uploads/avatar.jpg')).toBe('/uploads/avatar.jpg');
    expect(normalizePhotoUrl('selfie_in_123.jpg')).toBe('/uploads/selfie_in_123.jpg');
  });
});
