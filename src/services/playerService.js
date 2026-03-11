import { Player } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getPlayers = async (query = {}) => {
  const { teamId } = query;
  const filter = {};
  if (teamId) filter.teamId = teamId;
  return Player.find(filter).populate('teamId').sort({ lastName: 1, firstName: 1 }).lean();
};

export const getPlayerById = async (id) => {
  const player = await Player.findById(id).populate('teamId');
  if (!player) throw new AppError('Player not found.', 404);
  return player;
};

export const createPlayer = async (data) => {
  return Player.create(data);
};

export const updatePlayer = async (id, data) => {
  const player = await Player.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('teamId');
  if (!player) throw new AppError('Player not found.', 404);
  return player;
};

export const deletePlayer = async (id) => {
  const player = await Player.findByIdAndDelete(id);
  if (!player) throw new AppError('Player not found.', 404);
  return player;
};
