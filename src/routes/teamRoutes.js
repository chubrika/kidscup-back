import { Router } from 'express';
import { body, param } from 'express-validator';
import * as teamController from '../controllers/teamController.js';
import { protect, validate } from '../middleware/index.js';

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
  body('city').optional().trim(),
  body('coachName').optional().trim(),
  body('ageCategory')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .custom(ageCategoryValidator),
];

const updateValidation = [
  idParam,
  body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
  body('logo').optional().trim(),
  body('city').optional().trim(),
  body('coachName').optional().trim(),
  body('ageCategory').optional().trim().custom(ageCategoryValidator),
];

// Public GET routes (no auth)
router.get('/', teamController.getTeams);
router.get('/:id', idParam, validate, teamController.getTeamById);

router.use(protect);
router.post('/', createValidation, validate, teamController.createTeam);
router.put('/:id', updateValidation, validate, teamController.updateTeam);
router.delete('/:id', idParam, validate, teamController.deleteTeam);

export default router;
