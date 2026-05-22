import { Router } from 'express';
import { body, param } from 'express-validator';
import * as roundController from '../controllers/roundController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid round ID');

const createValidation = [
  body('group').isMongoId().withMessage('Valid group ID is required'),
  body('name').trim().notEmpty().withMessage('Round name is required'),
  body('roundNumber').isInt({ min: 1 }).withMessage('Round number must be at least 1'),
  body('date').optional().isISO8601(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

const updateValidation = [
  idParam,
  body('group').optional().isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('roundNumber').optional().isInt({ min: 1 }),
  body('date').optional().isISO8601(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

router.get('/', roundController.getRounds);
router.get('/:id', idParam, validate, roundController.getRoundById);

router.use(protect);
router.post('/', createValidation, validate, roundController.createRound);
router.put('/:id', updateValidation, validate, roundController.updateRound);
router.patch('/:id', updateValidation, validate, roundController.updateRound);
router.delete('/:id', idParam, validate, roundController.deleteRound);

export default router;
