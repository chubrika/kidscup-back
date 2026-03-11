import { Match } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getMatches = async (query = {}) => {
  const { ageCategory, status, from, to } = query;
  const filter = {};
  if (ageCategory) filter.ageCategory = ageCategory;
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  return Match.find(filter)
    .populate('homeTeam awayTeam ageCategory')
    .sort({ date: 1, time: 1 })
    .lean();
};

export const getMatchById = async (id) => {
  const match = await Match.findById(id).populate('homeTeam awayTeam ageCategory');
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};

export const createMatch = async (data) => {
  return Match.create(data);
};

export const updateMatch = async (id, data) => {
  const match = await Match.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('homeTeam awayTeam ageCategory');
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};

export const deleteMatch = async (id) => {
  const match = await Match.findByIdAndDelete(id);
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};
