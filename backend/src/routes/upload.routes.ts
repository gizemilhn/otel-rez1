import { Router } from 'express';
import { upload, uploadImage } from '../controllers/upload.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Upload route - requires authentication
router.post('/', authenticateToken, upload.single('image'), uploadImage);

export default router; 