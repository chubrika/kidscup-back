import { Season } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { moveTempObjectToSeason, moveTempObjectToSeasonAlbum } from './r2Service.js';

export const getSeasons = async (query = {}) => {
  const { ageCategory, isActive } = query;
  const filter = {};
  if (ageCategory) filter.ageCategory = ageCategory;
  if (typeof isActive === 'boolean' || isActive === 'true' || isActive === 'false') {
    filter.isActive = isActive === true || isActive === 'true';
  }
  return Season.find(filter)
    .populate('ageCategory')
    .sort({ startDate: -1 })
    .lean();
};

export const getSeasonById = async (id) => {
  const season = await Season.findById(id).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  return season;
};

export const createSeason = async (data) => {
  return Season.create(data);
};

export const updateSeason = async (id, data) => {
  const season = await Season.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  return season;
};

export const deleteSeason = async (id) => {
  const season = await Season.findByIdAndDelete(id);
  if (!season) throw new AppError('Season not found.', 404);
};

export const addSeasonPhoto = async (id, { key }) => {
  const season = await Season.findById(id).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  if (!key) throw new AppError('Missing key.', 400);

  // Backward compatible: if albums exist, attach to (or create) "Default" album.
  if (Array.isArray(season.albums)) {
    let defaultAlbum = season.albums.find((a) => String(a.title || '').toLowerCase() === 'default');
    if (!defaultAlbum) {
      season.albums.push({ title: 'Default', photos: [] });
      defaultAlbum = season.albums[season.albums.length - 1];
    }
    const albumId = String(defaultAlbum._id);
    const moved = await moveTempObjectToSeasonAlbum({
      key: String(key),
      seasonId: String(id),
      albumId,
    });
    defaultAlbum.photos = [
      ...(Array.isArray(defaultAlbum.photos) ? defaultAlbum.photos : []),
      { url: moved.fileUrl, key: moved.key, createdAt: new Date() },
    ];
  } else {
    // Fallback: old seasons still store in root photos.
    const moved = await moveTempObjectToSeason({ key: String(key), seasonId: String(id) });
    season.photos = [
      ...(Array.isArray(season.photos) ? season.photos : []),
      { url: moved.fileUrl, key: moved.key, createdAt: new Date() },
    ];
  }

  await season.save();
  return season;
};

export const createSeasonAlbum = async (seasonId, { title }) => {
  const season = await Season.findById(seasonId).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  const t = String(title || '').trim();
  if (!t) throw new AppError('Missing title.', 400);

  season.albums = Array.isArray(season.albums) ? season.albums : [];
  season.albums.push({ title: t, photos: [] });
  await season.save();
  return season;
};

export const addSeasonAlbumPhoto = async (seasonId, albumId, { key }) => {
  const season = await Season.findById(seasonId).populate('ageCategory');
  if (!season) throw new AppError('Season not found.', 404);
  if (!key) throw new AppError('Missing key.', 400);

  const albums = Array.isArray(season.albums) ? season.albums : [];
  const album = albums.find((a) => String(a._id) === String(albumId));
  if (!album) throw new AppError('Album not found.', 404);

  const moved = await moveTempObjectToSeasonAlbum({
    key: String(key),
    seasonId: String(seasonId),
    albumId: String(albumId),
  });

  album.photos = [
    ...(Array.isArray(album.photos) ? album.photos : []),
    { url: moved.fileUrl, key: moved.key, createdAt: new Date() },
  ];

  await season.save();
  return season;
};
