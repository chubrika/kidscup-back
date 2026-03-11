import * as standingsService from '../services/standingsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStandings = asyncHandler(async (req, res) => {
  const { ageCategory } = req.query;
  const standings = await standingsService.getStandings(ageCategory || null);
  res.json(standings);
});
