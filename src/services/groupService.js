import { Group, Team } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getGroups = async (query = {}) => {
  const { seasonId, ageCategory } = query;
  const filter = {};
  if (seasonId) filter.season = seasonId;
  if (ageCategory) filter.ageCategory = ageCategory;
  return Group.find(filter)
    .populate('season ageCategory')
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

export const getGroupById = async (id) => {
  const group = await Group.findById(id).populate('season ageCategory');
  if (!group) throw new AppError('Group not found.', 404);
  return group;
};

export const createGroup = async (data) => {
  return Group.create(data);
};

export const updateGroup = async (id, data) => {
  const group = await Group.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('season ageCategory');
  if (!group) throw new AppError('Group not found.', 404);
  return group;
};

export const deleteGroup = async (id) => {
  const teamsInGroup = await Team.countDocuments({ group: id });
  if (teamsInGroup > 0) {
    throw new AppError('Cannot delete group with assigned teams.', 400);
  }
  const group = await Group.findByIdAndDelete(id);
  if (!group) throw new AppError('Group not found.', 404);
  return group;
};
