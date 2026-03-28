import { Router } from 'express';
import { protect } from '../middleware/index.js';
import * as matchController from '../controllers/matchController.js';

const router = Router();

router.use(protect);
router.get('/today', matchController.getTodayMatchesAdmin);

export default router;
