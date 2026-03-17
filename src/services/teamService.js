import { Team } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToTeam } from './r2Service.js';

export const getTeams = async (query = {}) => {
  const { ageCategory } = query;
  const filter = {};
  if (ageCategory) filter.ageCategory = ageCategory;
  return Team.find(filter).populate('ageCategory').sort({ createdAt: -1 }).lean();
};

export const getTeamById = async (id) => {
  const team = await Team.findById(id).populate('ageCategory');
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};

export const createTeam = async (data) => {
  const toCreate = { ...data };
  if (toCreate.ageCategory === '' || toCreate.ageCategory == null) delete toCreate.ageCategory;
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

  return team.populate('ageCategory');
};

export const updateTeam = async (id, data) => {
  const toUpdate = { ...data };
  if (toUpdate.ageCategory === '' || toUpdate.ageCategory == null) delete toUpdate.ageCategory;
  const team = await Team.findByIdAndUpdate(id, toUpdate, {
    new: true,
    runValidators: true,
  }).populate('ageCategory');
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};

export const deleteTeam = async (id) => {
  const team = await Team.findByIdAndDelete(id);
  if (!team) throw new AppError('Team not found.', 404);
  return team;
};
