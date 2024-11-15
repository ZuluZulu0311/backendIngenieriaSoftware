import express from 'express';
import uploadFilesMiddleware from '../middlewares/uploadFilesMiddleware.js'; // Ajusta la ruta si es necesario
import * as uploadFileController from '../controllers/uploadCareController.js';

const router = express.Router();

// Usa el middleware de carga de archivos
router.post('/upload', uploadFilesMiddleware, uploadFileController.uploadFile);

export default router;