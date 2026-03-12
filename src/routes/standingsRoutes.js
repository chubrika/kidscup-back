import { Router } from 'express';
import * as standingsController from '../controllers/standingsController.js';
import { protect } from '../middleware/index.js';

const router = Router();

router.get('/', standingsController.getStandings);

router.use(protect);
// future protected standings routes (e.g. recalculate) here

export default router;
