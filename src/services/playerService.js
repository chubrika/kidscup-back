import { Player } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToPlayer } from './r2Service.js';

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
  const toCreate = { ...data };
  const player = await Player.create(toCreate);

  try {
    if (toCreate.photoKey?.startsWith('temp/')) {
      const moved = await moveTempObjectToPlayer({ key: String(toCreate.photoKey), playerId: String(player._id) });
      player.photoKey = moved.key;
      player.photo = moved.fileUrl;
      await player.save();
    }
  } catch (err) {
    await Player.findByIdAndDelete(player._id).catch(() => undefined);
    throw err;
  }

  return player;
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
