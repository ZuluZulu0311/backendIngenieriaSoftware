//import { uploadDirect } from '@uploadcare/upload-client';

const uploadFile = async (fileBuffer, originalName) => {
  try {
    const fileUrl = await uploadDirect(fileBuffer, {
      publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
      store: 'auto',
      filename: originalName, // Incluye el nombre original 
    });
    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default { uploadFile };
