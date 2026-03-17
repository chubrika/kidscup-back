import * as newsService from '../services/newsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNews = asyncHandler(async (req, res) => {
  const news = await newsService.getNews();
  res.json(news);
});

export const getNewsById = asyncHandler(async (req, res) => {
  const news = await newsService.getNewsById(req.params.id);
  res.json(news);
});

export const createNews = asyncHandler(async (req, res) => {
  const news = await newsService.createNews(req.body);
  res.status(201).json(news);
});

export const updateNews = asyncHandler(async (req, res) => {
  const news = await newsService.updateNews(req.params.id, req.body);
  res.json(news);
});

export const deleteNews = asyncHandler(async (req, res) => {
  await newsService.deleteNews(req.params.id);
  res.status(204).send();
});
