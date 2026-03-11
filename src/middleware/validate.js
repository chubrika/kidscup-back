import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors.array().map((e) => e.msg).join('. ');
  next(new AppError(message, 400));
};
