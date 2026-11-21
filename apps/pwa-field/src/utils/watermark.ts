/**
 * Watermark utility to stamp permanent inspection metadata on photos
 */
export async function stampWatermarkOnPhoto(
  base64Image: string,
  metadata: {
    officerName: string;
    siteName: string;
    checkpointName: string;
    coordinates?: { lat: number; lng: number };
    timestamp?: string;
  },
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(base64Image);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark footer background
      const barHeight = Math.max(60, Math.floor(img.height * 0.1));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'; // slate-900 / 75%
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

      // Accent border
      ctx.fillStyle = '#3b82f6'; // blue-500
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, 3);

      // Text styling
      const fontSize = Math.max(12, Math.floor(barHeight * 0.28));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#ffffff';

      const line1 = `${metadata.officerName} • ${metadata.siteName}`;
      const timeStr = metadata.timestamp || new Date().toLocaleString('id-ID');
      const coordStr = metadata.coordinates
        ? `GPS: ${metadata.coordinates.lat.toFixed(5)}, ${metadata.coordinates.lng.toFixed(5)}`
        : 'GPS: Bogor PostGIS';
      const line2 = `${metadata.checkpointName} | ${timeStr} | ${coordStr}`;

      ctx.fillText(line1, 16, canvas.height - barHeight + fontSize + 8);
      ctx.font = `${Math.max(10, fontSize - 2)}px monospace`;
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.fillText(line2, 16, canvas.height - 12);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = () => resolve(base64Image);
    img.src = base64Image;
  });
}
