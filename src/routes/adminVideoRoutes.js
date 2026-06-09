import { Router } from 'express';
import { body, param } from 'express-validator';
import * as videoController from '../controllers/videoController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

router.use(protect);

const idParam = param('id').isMongoId().withMessage('Invalid video ID');

const youtubeIdRule = body('youtubeId')
  .trim()
  .matches(/^[a-zA-Z0-9_-]{11}$/)
  .withMessage('Invalid YouTube video ID');

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  youtubeIdRule,
  body('category').isIn(['Full Match', 'Highlights', 'Interview']).withMessage('Invalid category'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
];

const updateValidation = [
  idParam,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString(),
  body('youtubeId')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]{11}$/)
    .withMessage('Invalid YouTube video ID'),
  body('category').optional().isIn(['Full Match', 'Highlights', 'Interview']).withMessage('Invalid category'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
];

router.get('/', videoController.getVideos);
router.get('/:id', idParam, validate, videoController.getVideoById);
router.post('/', createValidation, validate, videoController.createVideo);
router.patch('/:id', updateValidation, validate, videoController.updateVideo);
router.delete('/:id', idParam, validate, videoController.deleteVideo);

export default router;
