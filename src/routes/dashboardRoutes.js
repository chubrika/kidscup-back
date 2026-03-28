import { Router } from 'express';
import { protect } from '../middleware/index.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.use(protect);
router.get('/stats', dashboardController.getStats);
router.get('/charts', dashboardController.getCharts);
router.get('/activity', dashboardController.getActivity);

export default router;
