import * as matchService from '../services/matchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMatches = asyncHandler(async (req, res) => {
  const matches = await matchService.getMatches(req.query);
  res.json(matches);
});

export const getMatchById = asyncHandler(async (req, res) => {
  const match = await matchService.getMatchById(req.params.id);
  res.json(match);
});

export const createMatch = asyncHandler(async (req, res) => {
  const match = await matchService.createMatch(req.body);
  res.status(201).json(match);
});

export const updateMatch = asyncHandler(async (req, res) => {
  const match = await matchService.updateMatch(req.params.id, req.body);
  res.json(match);
});

export const deleteMatch = asyncHandler(async (req, res) => {
  await matchService.deleteMatch(req.params.id);
  res.status(204).send();
});
