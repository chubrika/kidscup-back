import { Season } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getSeasons = async (query = {}) => {
  const { ageCategory, isActive } = query;
  const filter = {};
  if (ageCategory) filter.ageCategory = ageCategory;
  if (typeof isActive === 'boolean' || isActive === 'true' || isActive === 'false') {
    filter.isActive = isActive === true || isActive === 'true';
  }
  return Season.find(filter)
    .populate('ageCategory')
    .sort({ startDate: -1 })
    .lean();
};

export const getSeasonById = async (id) => {
  const season = await Season.findById(id).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  return season;
};

export const createSeason = async (data) => {
  return Season.create(data);
};

export const updateSeason = async (id, data) => {
  const season = await Season.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  return season;
};

export const deleteSeason = async (id) => {
  const season = await Season.findByIdAndDelete(id);
  if (!season) throw new AppError('Season not found.', 404);
};
