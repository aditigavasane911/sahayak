/**
 * Utility to strip EXIF/location metadata from images.
 * Drawing an image on an HTML5 canvas and extracting its pixels
 * naturally strips all EXIF metadata headers (like camera info, GPS coordinates, etc.)
 * since canvas operations only preserve the visual pixel grid.
 */
export const stripMetadata = (file) => {
  return new Promise((resolve, reject) => {
    // Return early if not an image
    if (!file.type.startsWith("image/")) {
      reject(new Error("Uploaded file is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Keep reasonable dimensions (max 1024 width/height to make vision API calls fast)
          const MAX_DIM = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image (this process completely excludes EXIF data)
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas content back to a Blob
          canvas.toBlob((blob) => {
            if (blob) {
              const strippedFile = new File([blob], file.name, {
                type: "image/jpeg", // standard compress format
                lastModified: Date.now(),
              });
              
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              resolve({
                file: strippedFile,
                dataUrl: dataUrl,
                originalSize: file.size,
                strippedSize: strippedFile.size
              });
            } else {
              reject(new Error("Canvas conversion to Blob failed"));
            }
          }, "image/jpeg", 0.85);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(new Error("Failed to load image file"));
      img.src = event.target.result;
    };
    reader.onerror = (e) => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
