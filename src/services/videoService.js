import { Video } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getVideos = async () => {
  return Video.find().sort({ createdAt: -1 }).lean();
};

export const getPublishedVideos = async () => {
  return Video.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
};

export const getVideoById = async (id) => {
  const video = await Video.findById(id);
  if (!video) throw new AppError('Video not found.', 404);
  return video;
};

export const getPublishedVideoById = async (id) => {
  const video = await Video.findOne({ _id: id, status: 'published' });
  if (!video) throw new AppError('Video not found.', 404);
  return video;
};

export const createVideo = async (data) => {
  return Video.create(data);
};

export const updateVideo = async (id, data) => {
  const video = await Video.findById(id);
  if (!video) throw new AppError('Video not found.', 404);

  Object.entries(data || {}).forEach(([key, value]) => {
    if (typeof value === 'undefined') return;
    video.set(key, value);
  });

  await video.save();
  return video;
};

export const deleteVideo = async (id) => {
  const video = await Video.findByIdAndDelete(id);
  if (!video) throw new AppError('Video not found.', 404);
};
