import { Router } from 'express';
import { body, param } from 'express-validator';
import * as teamController from '../controllers/teamController.js';
import { optionalAuth, protect, validate } from '../middleware/index.js';

const router = Router();

const idParam = param('id').isMongoId().withMessage('Invalid team ID');

const ageCategoryValidator = (value) => {
  const v = value != null && value !== '' ? String(value).trim() : '';
  if (v === '') return true;
  // Must be 24 hex characters (MongoDB ObjectId)
  if (/^[a-fA-F0-9]{24}$/.test(v)) return true;
  throw new Error('Invalid category ID');
};

const createValidation = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('logo').optional().trim(),
  body('logoKey').optional().trim(),
  body('city').optional().trim(),
  body('coachName').optional().trim(),
  body('assistantCoachName').optional().trim(),
  body('doctor').optional().trim(),
  body('ageCategory')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .custom(ageCategoryValidator),
  body('season').optional().isMongoId().withMessage('Invalid season ID'),
  body('group').optional().isMongoId().withMessage('Invalid group ID'),
];

const updateValidation = [
  idParam,
  body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
  body('logo').optional().trim(),
  body('logoKey').optional().trim(),
  body('city').optional().trim(),
  body('coachName').optional().trim(),
  body('assistantCoachName').optional().trim(),
  body('doctor').optional().trim(),
  body('ageCategory').optional().trim().custom(ageCategoryValidator),
  body('season').optional().isMongoId().withMessage('Invalid season ID'),
  body('group').optional().isMongoId().withMessage('Invalid group ID'),
];

// Public GET routes (no auth); optional JWT allows admins to load non-approved teams by id
router.get('/', teamController.getTeams);
router.get('/:id', optionalAuth, idParam, validate, teamController.getTeamById);
router.post('/', createValidation, validate, teamController.createTeam);

router.use(protect);
router.patch('/:id', updateValidation, validate, teamController.updateTeam);
router.put('/:id', updateValidation, validate, teamController.updateTeam);
router.delete('/:id', idParam, validate, teamController.deleteTeam);

export default router;
