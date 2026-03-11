import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const STATIC_ADMIN_ID = 'static-admin';

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.id === STATIC_ADMIN_ID) {
      req.user = { _id: STATIC_ADMIN_ID, email: 'admin@kidscup.ge', name: 'Admin' };
      return next();
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token.', 401));
    }
    next(err);
  }
};
