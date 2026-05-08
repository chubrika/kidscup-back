import * as seasonService from '../services/seasonService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSeasons = asyncHandler(async (req, res) => {
  const seasons = await seasonService.getSeasons(req.query);
  res.json(seasons);
});

export const getSeasonById = asyncHandler(async (req, res) => {
  const season = await seasonService.getSeasonById(req.params.id);
  res.json(season);
});

export const createSeason = asyncHandler(async (req, res) => {
  const season = await seasonService.createSeason(req.body);
  res.status(201).json(season);
});

export const updateSeason = asyncHandler(async (req, res) => {
  const season = await seasonService.updateSeason(req.params.id, req.body);
  res.json(season);
});

export const deleteSeason = asyncHandler(async (req, res) => {
  await seasonService.deleteSeason(req.params.id);
  res.status(204).send();
});

export const addSeasonPhoto = asyncHandler(async (req, res) => {
  const { key } = req.body || {};
  const season = await seasonService.addSeasonPhoto(req.params.id, { key });
  res.json(season);
});

export const createSeasonAlbum = asyncHandler(async (req, res) => {
  const { title } = req.body || {};
  const season = await seasonService.createSeasonAlbum(req.params.id, { title });
  res.json(season);
});

export const addSeasonAlbumPhoto = asyncHandler(async (req, res) => {
  const { key } = req.body || {};
  const season = await seasonService.addSeasonAlbumPhoto(req.params.id, req.params.albumId, { key });
  res.json(season);
});
