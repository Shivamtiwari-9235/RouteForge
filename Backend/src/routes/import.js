import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { csvUploadMiddleware, handleCsvImport } from '../controllers/importController.js';

const router = express.Router();
router.post('/csv', authMiddleware, csvUploadMiddleware, handleCsvImport);
export default router;
