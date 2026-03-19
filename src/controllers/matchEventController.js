import * as matchEventService from '../services/matchEventService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../realtime/socket.js';

export const addEvent = asyncHandler(async (req, res) => {
  const event = await matchEventService.createMatchEvent(req.params.matchId, req.body);
  const stats = await matchEventService.getMatchStats(req.params.matchId);

  getIO().to(`match:${req.params.matchId}`).emit('match:update', { matchId: req.params.matchId, stats });

  res.status(201).json({ event, stats });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await matchEventService.getMatchStats(req.params.matchId);
  res.json(stats);
});

export const getTimeline = asyncHandler(async (req, res) => {
  const events = await matchEventService.listMatchEvents(req.params.matchId, { limit: req.query.limit });
  res.json(events);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const deleted = await matchEventService.deleteMatchEventById(req.params.id);
  const stats = await matchEventService.getMatchStats(String(deleted.matchId));

  getIO().to(`match:${String(deleted.matchId)}`).emit('match:update', { matchId: String(deleted.matchId), stats });

  res.json({ deleted, stats });
});

