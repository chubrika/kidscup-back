import { Router } from 'express';
import { param } from 'express-validator';
import * as videoController from '../controllers/videoController.js';
import { validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid video ID');

router.get('/', videoController.getPublishedVideos);
router.get('/:id', idParam, validate, videoController.getPublishedVideoById);

export default router;
