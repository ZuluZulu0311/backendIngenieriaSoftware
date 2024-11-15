import uploadcareService from '../services/uploadCareService.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const { buffer, originalname } = req.file;
    const fileUrl = await uploadcareService.uploadFile(buffer, originalname);
    
    res.json({ fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

