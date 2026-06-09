import * as videoService from '../services/videoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getVideos = asyncHandler(async (req, res) => {
  const videos = await videoService.getVideos();
  res.json(videos);
});

export const getPublishedVideos = asyncHandler(async (req, res) => {
  const videos = await videoService.getPublishedVideos();
  res.json(videos);
});

export const getVideoById = asyncHandler(async (req, res) => {
  const video = await videoService.getVideoById(req.params.id);
  res.json(video);
});

export const getPublishedVideoById = asyncHandler(async (req, res) => {
  const video = await videoService.getPublishedVideoById(req.params.id);
  res.json(video);
});

export const createVideo = asyncHandler(async (req, res) => {
  const video = await videoService.createVideo(req.body);
  res.status(201).json(video);
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await videoService.updateVideo(req.params.id, req.body);
  res.json(video);
});

export const deleteVideo = asyncHandler(async (req, res) => {
  await videoService.deleteVideo(req.params.id);
  res.status(204).send();
});
