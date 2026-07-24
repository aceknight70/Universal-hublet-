export interface WatermarkSettings {
  url: string;
  placement: 'bottom-right' | 'bottom-left' | 'center' | 'diagonal';
  opacity: number; // 0-100
  size: number; // 1-100 percentage of width
}

export async function applyWatermark(
  imageFile: File,
  settings: WatermarkSettings
): Promise<File> {
  if (!settings || !settings.url) return imageFile;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    img.crossOrigin = "anonymous";
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const watermarkImg = new Image();
      watermarkImg.crossOrigin = "anonymous";
      watermarkImg.src = settings.url;

      watermarkImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return resolve(imageFile);

        // Draw original image
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Calculate watermark size
        const targetWidth = img.width * (settings.size / 100);
        const scale = targetWidth / watermarkImg.width;
        const targetHeight = watermarkImg.height * scale;

        ctx.globalAlpha = settings.opacity / 100;

        if (settings.placement === 'diagonal') {
          // Draw repeated diagonally
          const spacingX = targetWidth * 1.5;
          const spacingY = targetHeight * 1.5;
          ctx.rotate((-45 * Math.PI) / 180);
          
          // Rough bounding box for rotated canvas
          const diag = Math.sqrt(img.width * img.width + img.height * img.height);
          for (let x = -diag; x < diag * 2; x += spacingX) {
            for (let y = -diag; y < diag * 2; y += spacingY) {
              ctx.drawImage(watermarkImg, x, y, targetWidth, targetHeight);
            }
          }
          ctx.rotate((45 * Math.PI) / 180);
        } else {
          let x = 0;
          let y = 0;
          const padding = img.width * 0.05; // 5% padding

          if (settings.placement === 'bottom-right') {
            x = img.width - targetWidth - padding;
            y = img.height - targetHeight - padding;
          } else if (settings.placement === 'bottom-left') {
            x = padding;
            y = img.height - targetHeight - padding;
          } else if (settings.placement === 'center') {
            x = (img.width - targetWidth) / 2;
            y = (img.height - targetHeight) / 2;
          }
          
          ctx.drawImage(watermarkImg, x, y, targetWidth, targetHeight);
        }

        ctx.globalAlpha = 1.0;

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(imageFile);
            const newFile = new File([blob], imageFile.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/jpeg',
          0.9
        );
      };

      watermarkImg.onerror = () => {
        resolve(imageFile); // Fallback to original if watermark fails to load
      };
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
}
