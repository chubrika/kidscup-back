import { Router } from 'express';
import { body, param } from 'express-validator';
import * as matchController from '../controllers/matchController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid match ID');

const createValidation = [
  body('homeTeam').isMongoId().withMessage('Valid home team ID is required'),
  body('awayTeam').isMongoId().withMessage('Valid away team ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').optional().trim(),
  body('location').optional().trim(),
  body('ageCategory').optional().isMongoId().withMessage('Invalid category ID'),
  body('season').optional().isMongoId().withMessage('Invalid season ID'),
  body('status').optional().isIn(['scheduled', 'live', 'finished', 'postponed', 'cancelled']).withMessage('Invalid status'),
  body('scoreHome').optional().isInt({ min: 0 }),
  body('scoreAway').optional().isInt({ min: 0 }),
];

const updateValidation = [
  idParam,
  body('homeTeam').optional().isMongoId(),
  body('awayTeam').optional().isMongoId(),
  body('date').optional().isISO8601(),
  body('time').optional().trim(),
  body('location').optional().trim(),
  body('ageCategory').optional().isMongoId(),
  body('season').optional().isMongoId(),
  body('status').optional().isIn(['scheduled', 'live', 'finished', 'postponed', 'cancelled']),
  body('scoreHome').optional().isInt({ min: 0 }),
  body('scoreAway').optional().isInt({ min: 0 }),
];


router.get('/', matchController.getMatches);
router.get('/:id', idParam, validate, matchController.getMatchById);
router.use(protect);
router.post('/', createValidation, validate, matchController.createMatch);
router.put('/:id', updateValidation, validate, matchController.updateMatch);
router.delete('/:id', idParam, validate, matchController.deleteMatch);

export default router;
