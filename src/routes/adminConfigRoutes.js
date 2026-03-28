import { Router } from 'express';
import { protect } from '../middleware/index.js';
import * as configController from '../controllers/configController.js';

const router = Router();

router.use(protect);
router.patch('/', configController.patchAdminConfig);

export default router;
