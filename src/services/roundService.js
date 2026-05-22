import { Match, Round } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getRounds = async (query = {}) => {
  const { groupId } = query;
  const filter = {};
  if (groupId) filter.group = groupId;
  return Round.find(filter)
    .populate('group')
    .sort({ sortOrder: 1, roundNumber: 1 })
    .lean();
};

export const getRoundById = async (id) => {
  const round = await Round.findById(id).populate('group');
  if (!round) throw new AppError('Round not found.', 404);
  return round;
};

export const createRound = async (data) => {
  return Round.create(data);
};

export const updateRound = async (id, data) => {
  if (data.group) {
    const existing = await Round.findById(id);
    if (existing && String(data.group) !== String(existing.group)) {
      throw new AppError('Round cannot be moved to another group.', 400);
    }
  }
  const round = await Round.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('group');
  if (!round) throw new AppError('Round not found.', 404);
  return round;
};

export const deleteRound = async (id) => {
  const matchesInRound = await Match.countDocuments({ round: id });
  if (matchesInRound > 0) {
    throw new AppError('Cannot delete round with existing matches.', 400);
  }
  const round = await Round.findByIdAndDelete(id);
  if (!round) throw new AppError('Round not found.', 404);
  return round;
};
