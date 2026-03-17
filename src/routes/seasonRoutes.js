import { Router } from 'express';
import { body, param } from 'express-validator';
import * as seasonController from '../controllers/seasonController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid season ID');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Season name is required'),
  body('ageCategory').isMongoId().withMessage('Valid age category ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateValidation = [
  idParam,
  body('name').optional().trim().notEmpty().withMessage('Season name cannot be empty'),
  body('ageCategory').optional().isMongoId().withMessage('Invalid age category ID'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

router.get('/', seasonController.getSeasons);
router.get('/:id', idParam, validate, seasonController.getSeasonById);
router.use(protect);
router.post('/', createValidation, validate, seasonController.createSeason);
router.patch('/:id', updateValidation, validate, seasonController.updateSeason);
router.delete('/:id', idParam, validate, seasonController.deleteSeason);

export default router;
