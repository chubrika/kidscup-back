import { Router } from 'express';
import { body, param } from 'express-validator';
import * as matchController from '../controllers/matchController.js';
import * as matchEventController from '../controllers/matchEventController.js';
import { protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid match ID');
const matchIdParam = param('matchId').isMongoId().withMessage('Invalid match ID');

const eventValidation = [
  matchIdParam,
  body('playerId').isMongoId().withMessage('Valid playerId is required'),
  body('teamId').isMongoId().withMessage('Valid teamId is required'),
  body('type')
    .isIn(['POINT_1', 'POINT_2', 'POINT_3', 'ASSIST', 'REBOUND', 'STEAL', 'BLOCK', 'FOUL'])
    .withMessage('Invalid event type'),
];

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
router.get('/:matchId/stats', matchIdParam, validate, matchEventController.getStats);
router.get('/:matchId/events', matchIdParam, validate, matchEventController.getTimeline);
router.get('/:id', idParam, validate, matchController.getMatchById);
router.use(protect);
router.post('/', createValidation, validate, matchController.createMatch);
router.post('/:matchId/events', eventValidation, validate, matchEventController.addEvent);
router.put('/:id', updateValidation, validate, matchController.updateMatch);
// Admin UI uses PATCH for updates; support it alongside PUT.
router.patch('/:id', updateValidation, validate, matchController.updateMatch);
router.delete('/:id', idParam, validate, matchController.deleteMatch);

export default router;
