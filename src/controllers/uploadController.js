import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPublicFileUrl, createSignedPutUrl, createTempKeyForUpload, deleteObject, moveTempObjectToTeam } from '../services/r2Service.js';

export const getUploadUrl = asyncHandler(async (req, res) => {
  const contentType = String(req.query.type || '').trim();
  const key = createTempKeyForUpload(contentType);
  const { uploadUrl } = await createSignedPutUrl({ key, contentType });

  res.json({
    uploadUrl,
    fileUrl: buildPublicFileUrl(key),
    key,
  });
});

export const deleteUpload = asyncHandler(async (req, res) => {
  const key = String(req.query.key || '').trim();
  if (!key) return res.status(400).json({ message: 'Missing key' });
  if (!key.startsWith('temp/')) return res.status(400).json({ message: 'Only temp uploads can be deleted' });
  await deleteObject(key);
  res.status(204).send();
});

export const moveUpload = asyncHandler(async (req, res) => {
  const { key, teamId } = req.body || {};
  if (!key || !teamId) return res.status(400).json({ message: 'Missing key or teamId' });

  const moved = await moveTempObjectToTeam({ key: String(key), teamId: String(teamId) });
  res.json(moved);
});

