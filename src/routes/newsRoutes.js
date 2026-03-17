import { Router } from 'express';
import { body, param } from 'express-validator';
import * as newsController from '../controllers/newsController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid news ID');

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('photoUrl').optional().trim().isString(),
  body('photoKey').optional().trim().isString(),
];

const updateValidation = [
  idParam,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString(),
  body('photoUrl').optional().trim().isString(),
  body('photoKey').optional().trim().isString(),
];

router.get('/', newsController.getNews);
router.get('/:id', idParam, validate, newsController.getNewsById);
router.use(protect);
router.post('/', createValidation, validate, newsController.createNews);
router.patch('/:id', updateValidation, validate, newsController.updateNews);
router.delete('/:id', idParam, validate, newsController.deleteNews);

export default router;
