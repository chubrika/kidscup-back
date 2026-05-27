import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';

const required = (name, value) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const r2Client = () => {
  const accountId = required('CLOUDFLARE_ACCOUNT_ID', config.r2.accountId);
  const accessKeyId = required('R2_ACCESS_KEY_ID', config.r2.accessKeyId);
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY', config.r2.secretAccessKey);

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    // Cloudflare R2 default endpoints are path-style; bucket-as-subdomain will often fail TLS/DNS.
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const bucketName = () => required('R2_BUCKET_NAME', config.r2.bucketName);

const buildCopySource = (bucket, key) => {
  // R2 CopySource should be URL-encoded and passed without a leading slash.
  // Encode per segment so path separators remain intact.
  const encodedKey = String(key)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${bucket}/${encodedKey}`;
};

const extFromContentType = (contentType) => {
  const t = (contentType || '').toLowerCase().trim();
  // Content-Type can include parameters, e.g. "image/jpeg; charset=binary"
  const mime = t.split(';')[0]?.trim();
  if (!mime) return null;

  if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/heic') return 'heic';
  if (mime === 'image/heif') return 'heif';
  return null;
};

export const buildPublicFileUrl = (key) => {
  const base = config.r2.publicBaseUrl?.trim();
  if (base) return `${base.replace(/\/+$/, '')}/${key}`;
  // Fallback: S3-style URL (works if your bucket is publicly accessible via R2)
  return `https://${config.r2.accountId}.r2.cloudflarestorage.com/${bucketName()}/${key}`;
};

export const createTempKeyForUpload = (contentType) => {
  const ext = extFromContentType(contentType);
  if (!ext) {
    const err = new Error('Unsupported content type');
    err.statusCode = 400;
    throw err;
  }

  const ts = Date.now();
  const rand = crypto.randomBytes(8).toString('hex');
  return `temp/${ts}-${rand}.${ext}`;
};

export const createSignedPutUrl = async ({ key, contentType }) => {
  const client = r2Client();
  const Bucket = bucketName();

  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, cmd, {
    expiresIn: config.r2.signedUrlExpiresInSeconds,
  });

  return { uploadUrl };
};

export const deleteObject = async (key) => {
  const client = r2Client();
  const Bucket = bucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket,
      Key: key,
    }),
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isNotFoundError = (err) => {
  const name = err?.name || err?.Code;
  const http = err?.$metadata?.httpStatusCode;
  return name === 'NotFound' || name === 'NoSuchKey' || http === 404;
};

const headObjectExists = async ({ client, Bucket, Key }) => {
  try {
    await client.send(new HeadObjectCommand({ Bucket, Key }));
    return true;
  } catch (err) {
    if (isNotFoundError(err)) return false;
    throw err;
  }
};

const verifyObjectExistsWithRetry = async ({ client, Bucket, Key, attempts = 6 }) => {
  for (let i = 0; i < attempts; i += 1) {
    const exists = await headObjectExists({ client, Bucket, Key });
    if (exists) return true;
    // R2/S3-compatible storage can be briefly inconsistent immediately after CopyObject.
    // Use bounded exponential backoff.
    await sleep(Math.min(1500, 150 * 2 ** i));
  }
  return false;
};

const finalizeTempObject = async ({ tempKey, destKey, context }) => {
  const client = r2Client();
  const Bucket = bucketName();

  const logBase = {
    op: 'r2.finalizeTempObject',
    tempKey,
    destKey,
    ...(context || {}),
  };

  console.info({ ...logBase, step: 'copy.start' });
  await client.send(
    new CopyObjectCommand({
      Bucket,
      CopySource: buildCopySource(Bucket, tempKey),
      Key: destKey,
    }),
  );
  console.info({ ...logBase, step: 'copy.ok' });

  console.info({ ...logBase, step: 'verify.start' });
  const verified = await verifyObjectExistsWithRetry({ client, Bucket, Key: destKey });
  if (!verified) {
    const err = new Error('R2 copy verification failed: destination missing after copy');
    console.error({ ...logBase, step: 'verify.fail' }, err);
    err.code = 'R2_COPY_VERIFY_FAILED';
    throw err;
  }
  console.info({ ...logBase, step: 'verify.ok' });

  // IMPORTANT: only delete temp after destination is verified to exist.
  console.info({ ...logBase, step: 'tempDelete.start' });
  try {
    await client.send(new DeleteObjectCommand({ Bucket, Key: tempKey }));
    console.info({ ...logBase, step: 'tempDelete.ok' });
  } catch (err) {
    // Not fatal for durability: destination exists; temp cleanup can be retried later.
    console.error({ ...logBase, step: 'tempDelete.fail' }, err);
  }

  return { key: destKey, fileUrl: buildPublicFileUrl(destKey) };
};

export const moveTempObjectToTeam = async ({ key, teamId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `teams/${teamId}/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'team', teamId },
  });
};

export const moveTempObjectToPlayer = async ({ key, playerId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `players/${playerId}/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'player', playerId },
  });
};

export const moveTempObjectToPlayerIdDocument = async ({ key, playerId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `players/${playerId}/id-documents/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'playerIdDocument', playerId },
  });
};

export const moveTempObjectToNews = async ({ key, newsId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `news/${newsId}/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'news', newsId },
  });
};

export const moveTempObjectToSeason = async ({ key, seasonId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `seasons/${seasonId}/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'season', seasonId },
  });
};

export const moveTempObjectToSeasonAlbum = async ({ key, seasonId, albumId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };

  const filename = key.split('/').pop();
  const destKey = `seasons/${seasonId}/albums/${albumId}/${filename}`;

  return finalizeTempObject({
    tempKey: key,
    destKey,
    context: { entity: 'seasonAlbum', seasonId, albumId },
  });
};

export const cleanupOldTempObjects = async ({ olderThanHours = 24, maxKeys = 1000 } = {}) => {
  const client = r2Client();
  const Bucket = bucketName();
  const cutoff = Date.now() - Number(olderThanHours) * 60 * 60 * 1000;

  let ContinuationToken = undefined;
  let deleted = 0;
  let scanned = 0;

  // Simple paginated scan; safe to run periodically (e.g. cron).
  while (true) {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: 'temp/',
        MaxKeys: maxKeys,
        ContinuationToken,
      }),
    );

    const items = out.Contents || [];
    scanned += items.length;

    for (const obj of items) {
      const key = obj.Key;
      const lastModified = obj.LastModified?.getTime?.() ?? 0;
      if (!key) continue;
      if (lastModified && lastModified < cutoff) {
        await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
        deleted += 1;
      }
    }

    if (!out.IsTruncated) break;
    ContinuationToken = out.NextContinuationToken;
    if (!ContinuationToken) break;
  }

  return { scanned, deleted, olderThanHours: Number(olderThanHours) };
};

