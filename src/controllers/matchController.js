import * as matchService from '../services/matchService.js';
import { getIO } from '../realtime/socket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function emitLiveStatusChanged(match) {
  try {
    const io = getIO();
    io.emit('matches:live-changed', {
      matchId: String(match._id),
      status: match.status,
    });
  } catch {
    // Socket server may be unavailable in some environments; API response should still succeed.
  }
}

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
  if (match.status === 'live') {
    emitLiveStatusChanged(match);
  }
  res.status(201).json(match);
});

export const updateMatch = asyncHandler(async (req, res) => {
  const previous = await matchService.getMatchById(req.params.id);
  const match = await matchService.updateMatch(req.params.id, req.body);
  if (previous.status !== 'live' && match.status === 'live') {
    emitLiveStatusChanged(match);
  }
  res.json(match);
});

export const deleteMatch = asyncHandler(async (req, res) => {
  await matchService.deleteMatch(req.params.id);
  res.status(204).send();
});
