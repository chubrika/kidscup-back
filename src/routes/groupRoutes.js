import { Router } from 'express';
import { body, param } from 'express-validator';
import * as groupController from '../controllers/groupController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid group ID');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('season').isMongoId().withMessage('Valid season ID is required'),
  body('ageCategory').optional().isMongoId().withMessage('Invalid category ID'),
  body('sortOrder').optional().isInt({ min: 0 }),
];

const updateValidation = [
  idParam,
  body('name').optional().trim().notEmpty(),
  body('season').optional().isMongoId(),
  body('ageCategory').optional().isMongoId(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

router.get('/', groupController.getGroups);
router.get('/:id', idParam, validate, groupController.getGroupById);

router.use(protect);
router.post('/', createValidation, validate, groupController.createGroup);
router.put('/:id', updateValidation, validate, groupController.updateGroup);
router.patch('/:id', updateValidation, validate, groupController.updateGroup);
router.delete('/:id', idParam, validate, groupController.deleteGroup);

export default router;
