import * as teamService from '../services/teamService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTeams = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const teams = await teamService.listTeamsAdmin({ status });
  res.json(teams);
});

export const approveTeam = asyncHandler(async (req, res) => {
  const team = await teamService.setTeamStatus(req.params.id, 'approved');
  res.json(team);
});

export const rejectTeam = asyncHandler(async (req, res) => {
  const team = await teamService.setTeamStatus(req.params.id, 'rejected');
  res.json(team);
});
