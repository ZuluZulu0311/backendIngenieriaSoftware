import multer from 'multer';

// Configura multer para usar memoria
const storage = multer.memoryStorage();
const uploadFilesMiddleware = multer({ storage }).single('file'); // 'file' debe coincidir con el nombre en Postman

export default uploadFilesMiddleware; 