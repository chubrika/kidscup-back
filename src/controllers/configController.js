import * as configService from '../services/configService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const getPublicConfig = asyncHandler(async (req, res) => {
  const payload = await configService.getPublicConfigObject();
  res.json(payload);
});

export const patchAdminConfig = asyncHandler(async (req, res) => {
  const { key, value } = req.body ?? {};

  if (typeof key !== 'string' || !key.trim()) {
    throw new AppError('key is required and must be a non-empty string', 400);
  }
  if (value === undefined) {
    throw new AppError('value is required', 400);
  }
  if (typeof value !== 'boolean' && typeof value !== 'string') {
    throw new AppError('value must be a boolean or string', 400);
  }

  await configService.upsertConfig(key.trim(), value);
  const payload = await configService.getPublicConfigObject();
  res.json(payload);
});
