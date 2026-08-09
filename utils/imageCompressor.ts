/**
 * Utility to compress base64 images before saving to state/storage.
 * Prevents QuotaExceededError in localStorage and ensures ultra-fast app loading.
 */
export const compressImage = (
  base64OrDataUrl: string,
  maxWidth = 800,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64OrDataUrl || !base64OrDataUrl.startsWith('data:image')) {
      resolve(base64OrDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64OrDataUrl;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64OrDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(base64OrDataUrl);
    };
  });
};
