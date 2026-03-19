import { Router } from 'express';
import { param } from 'express-validator';
import * as matchEventController from '../controllers/matchEventController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

router.use(protect);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid event ID'), validate, matchEventController.deleteEvent);

export default router;

