import imageCompression from 'browser-image-compression';

export default async function compressImage(file) {
  if (!file) return null;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    return file; // Return original file if compression fails
  }
}