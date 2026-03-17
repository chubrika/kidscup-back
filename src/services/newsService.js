import { News } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToNews } from './r2Service.js';

export const getNews = async () => {
  return News.find().sort({ createdAt: -1 }).lean();
};

export const getNewsById = async (id) => {
  const news = await News.findById(id);
  if (!news) throw new AppError('News not found.', 404);
  return news;
};

export const createNews = async (data) => {
  const toCreate = { ...data };
  const news = await News.create(toCreate);

  try {
    if (toCreate.photoKey?.startsWith('temp/')) {
      const moved = await moveTempObjectToNews({ key: String(toCreate.photoKey), newsId: String(news._id) });
      news.photoKey = moved.key;
      news.photoUrl = moved.fileUrl;
      await news.save();
    }
  } catch (err) {
    await News.findByIdAndDelete(news._id).catch(() => undefined);
    throw err;
  }

  return news;
};

export const updateNews = async (id, data) => {
  const news = await News.findById(id);
  if (!news) throw new AppError('News not found.', 404);

  Object.entries(data || {}).forEach(([k, v]) => {
    // don't overwrite with undefined
    if (typeof v === 'undefined') return;
    news.set(k, v);
  });

  if (String(news.photoKey || '').startsWith('temp/')) {
    const moved = await moveTempObjectToNews({ key: String(news.photoKey), newsId: String(news._id) });
    news.photoKey = moved.key;
    news.photoUrl = moved.fileUrl;
  }

  await news.save();
  return news;
};

export const deleteNews = async (id) => {
  const news = await News.findByIdAndDelete(id);
  if (!news) throw new AppError('News not found.', 404);
};
