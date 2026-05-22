import * as roundService from '../services/roundService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRounds = asyncHandler(async (req, res) => {
  const rounds = await roundService.getRounds(req.query);
  res.json(rounds);
});

export const getRoundById = asyncHandler(async (req, res) => {
  const round = await roundService.getRoundById(req.params.id);
  res.json(round);
});

export const createRound = asyncHandler(async (req, res) => {
  const round = await roundService.createRound(req.body);
  res.status(201).json(round);
});

export const updateRound = asyncHandler(async (req, res) => {
  const round = await roundService.updateRound(req.params.id, req.body);
  res.json(round);
});

export const deleteRound = asyncHandler(async (req, res) => {
  await roundService.deleteRound(req.params.id);
  res.status(204).send();
});
