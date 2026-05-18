import * as playerService from '../services/playerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPlayers = asyncHandler(async (req, res) => {
  const includeNonApprovedTeams = Boolean(req.user);
  const players = await playerService.getPlayers(req.query, { includeNonApprovedTeams });
  res.json(players);
});

export const getPlayerById = asyncHandler(async (req, res) => {
  const includeNonApprovedTeams = Boolean(req.user);
  const player = await playerService.getPlayerById(req.params.id, { includeNonApprovedTeams });
  res.json(player);
});

export const createPlayer = asyncHandler(async (req, res) => {
  const player = await playerService.createPlayer(req.body);
  res.status(201).json(player);
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await playerService.updatePlayer(req.params.id, req.body);
  res.json(player);
});

export const deletePlayer = asyncHandler(async (req, res) => {
  await playerService.deletePlayer(req.params.id);
  res.status(204).send();
});

export const updatePlayerDuringRegistration = asyncHandler(async (req, res) => {
  const player = await playerService.updatePlayerDuringRegistration(req.params.id, req.body);
  res.json(player);
});

export const deletePlayerDuringRegistration = asyncHandler(async (req, res) => {
  await playerService.deletePlayerDuringRegistration(req.params.id);
  res.status(204).send();
});
