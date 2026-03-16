import { Router } from 'express';
import { body, param } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const createValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];
const updateValidation = [
  param('id').trim().notEmpty().withMessage('Category ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Category name is required'),
  body('minAge').optional().isInt({ min: 0, max: 100 }).withMessage('Min age must be between 0 and 100'),
  body('maxAge').optional().isInt({ min: 0, max: 100 }).withMessage('Max age must be between 0 and 100'),
  body('description').optional().trim().notEmpty().withMessage('Description is required'),
];
// Public: list categories (for frontend nav)
router.get('/', categoryController.getCategories);

router.use(protect);
router.post('/', createValidation, validate, categoryController.createCategory);
router.put('/:id', updateValidation, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
