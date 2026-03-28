import { Router } from 'express';
import { param } from 'express-validator';
import * as adminTeamController from '../controllers/adminTeamController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

router.use(protect);

const idParam = param('id').isMongoId().withMessage('Invalid team ID');

router.get('/', adminTeamController.listTeams);
router.patch('/:id/approve', idParam, validate, adminTeamController.approveTeam);
router.patch('/:id/reject', idParam, validate, adminTeamController.rejectTeam);

export default router;
