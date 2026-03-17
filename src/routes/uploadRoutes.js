import { Router } from 'express';
import { protect } from '../middleware/index.js';
import * as uploadController from '../controllers/uploadController.js';

const router = Router();

// Require auth to prevent public signed-url abuse
router.use(protect);

router.get('/upload-url', uploadController.getUploadUrl);
router.delete('/upload', uploadController.deleteUpload);
router.post('/upload/move', uploadController.moveUpload);

export default router;

