import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginValidation } from '../utils/validators.js';

const router = Router();

router.post('/login', loginValidation, validate, authController.login);

export default router;
