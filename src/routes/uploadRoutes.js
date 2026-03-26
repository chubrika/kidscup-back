import { Router } from 'express';
import { protect } from '../middleware/index.js';
import * as uploadController from '../controllers/uploadController.js';

const router = Router();

router.get('/upload-url', uploadController.getUploadUrl);

// Keep destructive upload actions protected.
router.use(protect);
router.delete('/upload', uploadController.deleteUpload);
router.post('/upload/move', uploadController.moveUpload);

export default router;

