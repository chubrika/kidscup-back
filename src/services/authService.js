import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const STATIC_ADMIN_EMAIL = 'admin@kidscup.ge';
const STATIC_ADMIN_PASSWORD = 'AdminKidsCup';
const STATIC_ADMIN_ID = 'static-admin';

export const login = async (email, password) => {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const normalizedPassword = String(password ?? '').trim();

  if (normalizedEmail === STATIC_ADMIN_EMAIL && normalizedPassword === STATIC_ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: STATIC_ADMIN_ID },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return {
      token,
      user: {
        id: STATIC_ADMIN_ID,
        email: STATIC_ADMIN_EMAIL,
        name: 'Admin',
      },
    };
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }
  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401);
  }
  const token = jwt.sign(
    { id: user._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  };
};
