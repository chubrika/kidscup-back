import { Router } from 'express';
import * as standingsController from '../controllers/standingsController.js';
import { protect } from '../middleware/index.js';

const router = Router();

router.use(protect);
router.get('/', standingsController.getStandings);

export default router;
