import * as standingsService from '../services/standingsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStandings = asyncHandler(async (req, res) => {
  const { ageCategory, seasonId, groupId, scope } = req.query;
  const standings = await standingsService.getStandings(ageCategory || null, seasonId || null, {
    groupId: groupId || null,
    scope: scope || null,
  });
  res.json(standings);
});
