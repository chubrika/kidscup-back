import { Team } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToTeam } from './r2Service.js';

const TEAM_STATUSES = ['pending', 'approved', 'rejected'];

export const getTeams = async (query = {}) => {
  const { ageCategory, season } = query;
  const filter = { status: 'approved' };
  if (ageCategory) filter.ageCategory = ageCategory;
  if (season) filter.season = season;
  return Team.find(filter).populate('ageCategory').populate('season').sort({ createdAt: -1 }).lean();
};

export const getTeamById = async (id, { allowNonApproved = false } = {}) => {
  const team = await Team.findById(id).populate('ageCategory').populate('season');
  if (!team) throw new AppError('Team not found.', 404);
  if (!allowNonApproved && team.status !== 'approved') {
    throw new AppError('Team not found.', 404);
  }
  return team;
};

export const createTeam = async (data) => {
  const toCreate = { ...data };
  delete toCreate.status;
  if (toCreate.ageCategory === '' || toCreate.ageCategory == null) delete toCreate.ageCategory;
  if (toCreate.season === '' || toCreate.season == null) delete toCreate.season;
  toCreate.status = 'pending';
  const team = await Team.create(toCreate);

  try {
    // If a temp upload key was provided, move it to the team's folder and persist final URL/key.
    if (toCreate.logoKey?.startsWith('temp/')) {
      const moved = await moveTempObjectToTeam({ key: String(toCreate.logoKey), teamId: String(team._id) });
      team.logoKey = moved.key;
      team.logo = moved.fileUrl;
      await team.save();
    }
  } catch (err) {
    // Keep create+move effectively atomic: if the move fails, roll back the DB create.
    await Team.findByIdAndDelete(team._id).catch(() => undefined);
    throw err;
  }

  return team.populate(['ageCategory', 'season']);
};

export const updateTeam = async (id, data) => {
  const toUpdate = { ...data };
  delete toUpdate.status;
  if (toUpdate.ageCategory === '' || toUpdate.ageCategory == null) delete toUpdate.ageCategory;
  if (toUpdate.season === '' || toUpdate.season == null) delete toUpdate.season;
  const team = await Team.findByIdAndUpdate(id, toUpdate, {
    new: true,
    runValidators: true,
  }).populate('ageCategory').populate('season');
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};

export const deleteTeam = async (id) => {
  const team = await Team.findByIdAndDelete(id);
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};

/** Admin: list teams with optional status filter (omit status for all). */
export const listTeamsAdmin = async ({ status } = {}) => {
  const filter = {};
  if (status && TEAM_STATUSES.includes(String(status))) {
    filter.status = String(status);
  }
  return Team.find(filter).populate('ageCategory').populate('season').sort({ createdAt: -1 }).lean();
};

export const setTeamStatus = async (id, nextStatus) => {
  if (!TEAM_STATUSES.includes(nextStatus)) {
    throw new AppError('Invalid team status.', 400);
  }
  const team = await Team.findByIdAndUpdate(
    id,
    { status: nextStatus },
    { new: true, runValidators: true },
  ).populate('ageCategory').populate('season');
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};
