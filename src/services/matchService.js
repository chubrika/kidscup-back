import { Match } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { validateMatchTeams } from './matchValidation.js';

const matchPopulate = ['homeTeam', 'awayTeam', 'season', 'ageCategory', 'group', 'round'];

export const getMatchesForToday = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Match.find({ date: { $gte: start, $lte: end } })
    .populate(matchPopulate)
    .sort({ time: 1, date: 1 })
    .lean();
};

export const getMatches = async (query = {}) => {
  const { ageCategory, status, seasonId, from, to, groupId, roundId, teamId } = query;
  const filter = {};
  if (ageCategory) filter.ageCategory = ageCategory;
  if (status) filter.status = status;
  if (seasonId) filter.season = seasonId;
  if (groupId) filter.group = groupId;
  if (roundId) filter.round = roundId;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  let q = Match.find(filter).populate(matchPopulate).sort({ date: 1, time: 1 });
  if (teamId) {
    q = Match.find({
      ...filter,
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
    })
      .populate(matchPopulate)
      .sort({ date: 1, time: 1 });
  }
  return q.lean();
};

export const getMatchById = async (id) => {
  const match = await Match.findById(id).populate(matchPopulate);
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};

export const createMatch = async (data) => {
  await validateMatchTeams(data);
  return Match.create(data);
};

export const updateMatch = async (id, data) => {
  const existing = await Match.findById(id).lean();
  if (!existing) throw new AppError('Match not found.', 404);
  const merged = {
    homeTeam: data.homeTeam ?? existing.homeTeam,
    awayTeam: data.awayTeam ?? existing.awayTeam,
    group: data.group !== undefined ? data.group : existing.group,
    round: data.round !== undefined ? data.round : existing.round,
  };
  await validateMatchTeams(merged);
  const match = await Match.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(matchPopulate);
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};

export const deleteMatch = async (id) => {
  const match = await Match.findByIdAndDelete(id);
  if (!match) throw new AppError('Match not found.', 404);
  return match;
};
