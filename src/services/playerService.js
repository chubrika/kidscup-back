import { Player } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToPlayer, moveTempObjectToPlayerIdDocument } from './r2Service.js';

const populateTeamApprovedOnly = {
  path: 'teamId',
  match: { status: 'approved' },
};

const populateTeamAll = {
  path: 'teamId',
};

export const getPlayers = async (query = {}, { includeNonApprovedTeams = false } = {}) => {
  const { teamId } = query;
  const filter = {};
  if (teamId) filter.teamId = teamId;

  const populate = includeNonApprovedTeams ? populateTeamAll : populateTeamApprovedOnly;

  const players = await Player.find(filter)
    .populate(populate)
    .sort({ lastName: 1, firstName: 1 })
    .lean();

  if (includeNonApprovedTeams) {
    return players;
  }
  return players.filter((p) => p.teamId != null);
};

export const getPlayerById = async (id, { includeNonApprovedTeams = false } = {}) => {
  const populate = includeNonApprovedTeams ? populateTeamAll : populateTeamApprovedOnly;
  const player = await Player.findById(id).populate(populate);
  if (!player) throw new AppError('Player not found.', 404);
  if (!includeNonApprovedTeams && !player.teamId) {
    throw new AppError('Player not found.', 404);
  }
  return player;
};

export const createPlayer = async (data) => {
  const toCreate = { ...data };
  const player = await Player.create(toCreate);

  try {
    let needsSave = false;

    if (toCreate.photoKey?.startsWith('temp/')) {
      const moved = await moveTempObjectToPlayer({ key: String(toCreate.photoKey), playerId: String(player._id) });
      player.photoKey = moved.key;
      player.photo = moved.fileUrl;
      needsSave = true;
    }

    if (toCreate.idDocumentKey?.startsWith('temp/')) {
      const moved = await moveTempObjectToPlayerIdDocument({
        key: String(toCreate.idDocumentKey),
        playerId: String(player._id),
      });
      player.idDocumentKey = moved.key;
      player.idDocument = moved.fileUrl;
      needsSave = true;
    }

    if (needsSave) {
      await player.save();
    }
  } catch (err) {
    await Player.findByIdAndDelete(player._id).catch(() => undefined);
    throw err;
  }

  return player;
};

export const updatePlayer = async (id, data) => {
  const toUpdate = { ...data };

  if (toUpdate.photoKey?.startsWith('temp/')) {
    const moved = await moveTempObjectToPlayer({ key: String(toUpdate.photoKey), playerId: String(id) });
    toUpdate.photoKey = moved.key;
    toUpdate.photo = moved.fileUrl;
  }

  if (toUpdate.idDocumentKey?.startsWith('temp/')) {
    const moved = await moveTempObjectToPlayerIdDocument({
      key: String(toUpdate.idDocumentKey),
      playerId: String(id),
    });
    toUpdate.idDocumentKey = moved.key;
    toUpdate.idDocument = moved.fileUrl;
  }

  const player = await Player.findByIdAndUpdate(id, toUpdate, {
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

async function assertPlayerOnPendingTeam(id) {
  const player = await Player.findById(id).populate('teamId');
  if (!player) throw new AppError('Player not found.', 404);
  if (!player.teamId || player.teamId.status !== 'pending') {
    throw new AppError('Player can only be changed while team registration is pending.', 403);
  }
  return player;
}

export const updatePlayerDuringRegistration = async (id, data) => {
  await assertPlayerOnPendingTeam(id);
  return updatePlayer(id, data);
};

export const deletePlayerDuringRegistration = async (id) => {
  await assertPlayerOnPendingTeam(id);
  return deletePlayer(id);
};
