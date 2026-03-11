import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').trim().toLowerCase(),
  body('password').notEmpty().withMessage('Password is required').trim(),
];
