import { Router } from 'express';
import { body, param } from 'express-validator';
import * as playerController from '../controllers/playerController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid player ID');

const createValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('number').isInt({ min: 0, max: 99 }).withMessage('Number must be 0-99'),
  body('position').optional().trim().isIn(['PG', 'SG', 'SF', 'PF', 'C', '']).withMessage('Invalid position'),
  body('birthDate').optional().isISO8601().withMessage('Invalid birth date'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be positive'),
  body('photo').optional().trim(),
  body('photoKey').optional().trim(),
  body('teamId').isMongoId().withMessage('Valid team ID is required'),
];

const updateValidation = [
  idParam,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('number').optional().isInt({ min: 0, max: 99 }),
  body('position').optional().trim().isIn(['PG', 'SG', 'SF', 'PF', 'C', '']),
  body('birthDate').optional().isISO8601(),
  body('height').optional().isFloat({ min: 0 }),
  body('photo').optional().trim(),
  body('photoKey').optional().trim(),
  body('teamId').optional().isMongoId(),
];

// Public GET routes (no auth)
router.get('/', playerController.getPlayers);
router.get('/:id', idParam, validate, playerController.getPlayerById);

router.use(protect);
router.post('/', createValidation, validate, playerController.createPlayer);
router.put('/:id', updateValidation, validate, playerController.updatePlayer);
router.delete('/:id', idParam, validate, playerController.deletePlayer);

export default router;
