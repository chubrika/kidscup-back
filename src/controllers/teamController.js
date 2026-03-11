import * as teamService from '../services/teamService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getTeams(req.query);
  res.json(teams);
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.id);
  res.json(team);
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body);
  res.status(201).json(team);
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.id, req.body);
  res.json(team);
});

export const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.deleteTeam(req.params.id);
  res.status(204).send();
});
