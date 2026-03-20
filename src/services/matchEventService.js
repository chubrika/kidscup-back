import mongoose from 'mongoose';
import { Match, MatchEvent, MATCH_EVENT_TYPES } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const { Types } = mongoose;

const pointsValueForType = (type) => {
  switch (type) {
    case MATCH_EVENT_TYPES.POINT_1:
      return 1;
    case MATCH_EVENT_TYPES.POINT_2:
      return 2;
    case MATCH_EVENT_TYPES.POINT_3:
      return 3;
    default:
      return 0;
  }
};

export const createMatchEvent = async (matchId, { playerId, teamId, type }) => {
  const match = await Match.findById(matchId).select('_id');
  if (!match) throw new AppError('Match not found.', 404);

  const value = pointsValueForType(type);

  return MatchEvent.create({
    matchId,
    playerId,
    teamId,
    type,
    value,
  });
};

export const deleteMatchEventById = async (eventId) => {
  const deleted = await MatchEvent.findByIdAndDelete(eventId);
  if (!deleted) throw new AppError('Event not found.', 404);
  return deleted;
};

export const listMatchEvents = async (matchId, { limit = 50 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500));
  return MatchEvent.find({ matchId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
};

export const getMatchStats = async (matchId) => {
  const matchObjectId = Types.ObjectId.isValid(matchId) ? new Types.ObjectId(matchId) : null;
  if (!matchObjectId) throw new AppError('Invalid match ID.', 400);

  const [teamScores, playerStats] = await Promise.all([
    MatchEvent.aggregate([
      { $match: { matchId: matchObjectId } },
      { $group: { _id: '$teamId', points: { $sum: '$value' } } },
      { $project: { _id: 0, teamId: '$_id', points: 1 } },
    ]),
    MatchEvent.aggregate([
      { $match: { matchId: matchObjectId } },
      {
        $group: {
          _id: { playerId: '$playerId', teamId: '$teamId' },
          points: { $sum: '$value' },
          assists: { $sum: { $cond: [{ $eq: ['$type', MATCH_EVENT_TYPES.ASSIST] }, 1, 0] } },
          rebounds: { $sum: { $cond: [{ $eq: ['$type', MATCH_EVENT_TYPES.REBOUND] }, 1, 0] } },
          steals: { $sum: { $cond: [{ $eq: ['$type', MATCH_EVENT_TYPES.STEAL] }, 1, 0] } },
          blocks: { $sum: { $cond: [{ $eq: ['$type', MATCH_EVENT_TYPES.BLOCK] }, 1, 0] } },
          fouls: { $sum: { $cond: [{ $eq: ['$type', MATCH_EVENT_TYPES.FOUL] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          playerId: '$_id.playerId',
          teamId: '$_id.teamId',
          points: 1,
          assists: 1,
          rebounds: 1,
          steals: 1,
          blocks: 1,
          fouls: 1,
        },
      },
    ]),
  ]);

  return { teamScores, playerStats };
};

export const getMatchTeamScores = async (matchId) => {
  const matchObjectId = Types.ObjectId.isValid(matchId) ? new Types.ObjectId(matchId) : null;
  if (!matchObjectId) throw new AppError('Invalid match ID.', 400);

  const teamScores = await MatchEvent.aggregate([
    { $match: { matchId: matchObjectId } },
    { $group: { _id: '$teamId', points: { $sum: '$value' } } },
    { $project: { _id: 0, teamId: '$_id', points: 1 } },
  ]);

  return { teamScores };
};

