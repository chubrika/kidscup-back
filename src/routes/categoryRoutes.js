import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const createValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

router.use(protect);

router.get('/', categoryController.getCategories);
router.post('/', createValidation, validate, categoryController.createCategory);

export default router;
